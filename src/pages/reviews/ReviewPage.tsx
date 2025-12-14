import React, { useState } from 'react';
import styled from 'styled-components';
import { useGetAllReviewsQuery } from '@app/services/review.api';
import type { ReviewDto } from '@app/services/review.api';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  useGetShowingNowMoviesQuery,
  useGetComingSoonMoviesQuery,
} from '@/app/services/movie.api';
import { getMovieTitle } from '@utils/functionUtils';

const ReviewPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const { data, isLoading } = useGetAllReviewsQuery({ page: 1, limit: 1000 });
  const { data: showingMovies = [] } = useGetShowingNowMoviesQuery();
  const { data: comingSoonMovies = [] } = useGetComingSoonMoviesQuery();

  if (isLoading) return <p>{t('REVIEWS_LOADING')}</p>;

  /** Valid movie IDs (đang chiếu + sắp chiếu) */
  const validMovieIds = [
    ...showingMovies.map(m => m.id),
    ...comingSoonMovies.map(m => m.id),
  ];

  const movies = data?.content ?? [];

  const filteredMovies = movies.filter(movie =>
    validMovieIds.includes(movie.id)
  );

  const limitedReviewsPerMovie = filteredMovies.flatMap(movie => {
    const limited = movie.reviews.slice(0, 2);
    return limited.map(r => ({
      ...r,
      movie: {
        id: movie.id,
        name: movie.name,
        nameEn: movie.nameEn,
        slug: movie.slug,
        poster: movie.poster,
      },
    }));
  });

  const shuffle = <T,>(arr: T[]): T[] =>
    [...arr].sort(() => Math.random() - 0.5);

  const reviews: ReviewDto[] = shuffle(limitedReviewsPerMovie);

  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);

  const paginatedReviews = reviews.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');

    return `${hh}:${mi} ${dd}/${mm}/${yyyy}`;
  };

  return (
    <Container>
      <PageTitle>{t('REVIEWS_TITLE')}</PageTitle>

      <ReviewGrid>
        {paginatedReviews.map(review => (
          <ReviewCard
            key={review.id}
            onClick={() =>
              navigate(
                `/movies/${review.movie?.id}/${review.movie?.slug}#reviews`
              )
            }
          >
            {review.movie?.poster && (
              <PosterWrapper>
                <img
                  src={review.movie.poster}
                  alt={getMovieTitle(review.movie, i18n.language)}
                />
                <RatingBadge>⭐ {review.rating}/10</RatingBadge>
              </PosterWrapper>
            )}

            <InfoWrapper>
              <MovieName>
                {review.movie
                  ? getMovieTitle(review.movie, i18n.language)
                  : ''}
              </MovieName>

              <Comment>“{review.comment}”</Comment>

              <UserInfo>
                <img src={review.user?.avatar} alt={review.user?.name} />
                <span>{review.user?.name ?? t('REVIEWS_ANONYMOUS')}</span>
              </UserInfo>

              <ReviewDate>
                {t('REVIEWS_DATE_LOADED')} {formatDateTime(review.updatedAt)}
              </ReviewDate>
            </InfoWrapper>
          </ReviewCard>
        ))}
      </ReviewGrid>

      <Pagination>
        <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
          {t('REVIEWS_PREV')}
        </button>

        <span>
          {page} / {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(p => p + 1)}
        >
          {t('REVIEWS_NEXT')}
        </button>
      </Pagination>
    </Container>
  );
};

export default ReviewPage;

const Container = styled.div`
  padding: ${theme.spacing.xl};
  color: ${theme.colors.textLight};
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 24px;
  text-align: center;
  color: ${theme.colors.headingLight};
`;

const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.lg};

  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* mobile chỉ còn 1 cột */
  }
`;

const ReviewCard = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 16px;
  transition: 0.25s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const PosterWrapper = styled.div`
  width: 120px;
  height: 180px;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
  border-radius: 10px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RatingBadge = styled.div`
  position: absolute;
  bottom: 6px;
  right: 6px;
  background: rgba(0, 0, 0, 0.75);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 13px;
  color: #ffeb3b;
  font-weight: 700;
`;

const InfoWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const MovieName = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.white};
  margin: 0 0 6px;
`;

const Comment = styled.p`
  font-size: 15px;
  font-style: italic;
  opacity: 0.9;
  margin: 0 0 10px;

  /* multi-line ellipsis — max 3 lines */
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  img {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    object-fit: cover;
  }

  span {
    font-size: 15px;
    font-weight: 600;
    color: ${theme.colors.white};
  }
`;

const ReviewDate = styled.div`
  font-size: 12px;
  opacity: 0.6;
  margin-top: auto;
`;

const Pagination = styled.div`
  margin-top: ${theme.spacing.xl};
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};
  color: ${theme.colors.textLight};

  button {
    border: 1px solid ${theme.colors.white};
    padding: 6px 14px;
    background: transparent;
    border-radius: 6px;
    cursor: pointer;
    color: ${theme.colors.textLight};

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background: ${theme.colors.primaryHoverGradient};
      color: ${theme.colors.white};
    }
  }
`;

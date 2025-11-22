import { useState } from 'react';
import styled from 'styled-components';
import { useGetLatestBlogsQuery } from '@app/services/blog.api';
import type { BlogDto } from '@app/services/blog.api';
import { useGetAllReviewsQuery } from '@app/services/review.api';
import { theme } from '@theme/Theme';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useGetShowingNowMoviesQuery,
  useGetComingSoonMoviesQuery,
} from '@/app/services/movie.api';

enum CinemaCornerTab {
  BLOG = 'BLOG',
  REVIEW = 'REVIEW',
}

export default function CinemaCornerComponent() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: showingMovies = [] } = useGetShowingNowMoviesQuery();
  const { data: comingSoonMovies = [] } = useGetComingSoonMoviesQuery();
  const showingIds = showingMovies.map(m => m.id);
  const comingIds = comingSoonMovies.map(m => m.id);
  const validMovieIds = [...showingIds, ...comingIds];

  const [activeTab, setActiveTab] = useState<CinemaCornerTab>(
    CinemaCornerTab.BLOG
  );

  const { data: latestPage, isLoading: loadingLatest } = useGetLatestBlogsQuery(
    { limit: 4 }
  );

  const { data: reviewPage, isLoading: loadingReviews } = useGetAllReviewsQuery(
    { page: 1, limit: 1000 }
  );

  const latestBlogs: BlogDto[] = latestPage?.content ?? [];
  const raw = reviewPage?.content ?? [];

  const filteredMovies = raw.filter(movie => validMovieIds.includes(movie.id));

  const allReviews = filteredMovies.flatMap(movie =>
    movie.reviews.map(r => ({
      ...r,
      movie: {
        id: movie.id,
        name: movie.name,
        slug: movie.slug,
        poster: movie.poster,
      },
    }))
  );

  const shuffle = <T,>(arr: T[]): T[] =>
    [...arr].sort(() => Math.random() - 0.5);

  const reviews = shuffle(allReviews).slice(0, 4);

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    return `${hour}:${minute} ${day}/${month}/${year}`;
  };

  if (loadingLatest || loadingReviews)
    return <div>{t('CINEMACORNER_LOADING')}</div>;

  return (
    <Container>
      <Heading>{t('CINEMACORNER_CORNER')}</Heading>
      <Tabs>
        <div
          style={{
            color: activeTab === CinemaCornerTab.BLOG ? '#FFFFFF' : '#B0B0B0',
          }}
          onClick={() => setActiveTab(CinemaCornerTab.BLOG)}
        >
          {t('CINEMACORNER_TAB_BLOG')}
        </div>
        <div
          style={{
            color: activeTab === CinemaCornerTab.REVIEW ? '#FFFFFF' : '#B0B0B0',
          }}
          onClick={() => setActiveTab(CinemaCornerTab.REVIEW)}
        >
          {t('CINEMACORNER_TAB_REVIEW')}
        </div>
      </Tabs>

      <Content>
        {activeTab === CinemaCornerTab.BLOG && latestBlogs.length > 0 && (
          <>
            <MainReview>
              <ReviewCard
                onClick={() =>
                  navigate(`/blogs/${latestBlogs[0].id}/${latestBlogs[0].slug}`)
                }
              >
                <img
                  src={latestBlogs[0].thumbnail}
                  alt={latestBlogs[0].title}
                />
                <div className='title'>{latestBlogs[0].title}</div>
              </ReviewCard>
            </MainReview>

            <SideReviews>
              {latestBlogs.slice(1).map(blog => (
                <ReviewCard
                  key={blog.id}
                  onClick={() => navigate(`/blogs/${blog.id}/${blog.slug}`)}
                >
                  <img src={blog.thumbnail} alt={blog.title} />
                  <div className='title'>{blog.title}</div>
                </ReviewCard>
              ))}
            </SideReviews>
          </>
        )}

        {activeTab === CinemaCornerTab.REVIEW && reviews.length > 0 && (
          <ReviewGrid>
            {reviews.map(r => (
              <ReviewCardItem
                key={r.id}
                onClick={() =>
                  navigate(`/movies/${r.movie?.id}/${r.movie?.slug}#reviews`)
                }
              >
                <PosterWrapper>
                  <img src={r.movie?.poster} alt={r.movie?.name} />
                  <RatingBadge>⭐ {r.rating}/10</RatingBadge>
                </PosterWrapper>

                <InfoWrapper>
                  <MovieName>{r.movie?.name}</MovieName>

                  <ReviewComment>
                    {t('REVIEWS_COMMENT')}: “{r.comment}”
                  </ReviewComment>

                  <UserInfo>
                    <img src={r.user?.avatar} alt={r.user?.name} />
                    <span>{r.user?.name || t('REVIEWS_ANONYMOUS')}</span>
                  </UserInfo>

                  <ReviewDate>
                    {t('REVIEWS_DATE_LOADED')}{' '}
                    {formatDateTime(r.updatedAt)}
                  </ReviewDate>
                </InfoWrapper>
              </ReviewCardItem>
            ))}
          </ReviewGrid>
        )}
      </Content>

      {activeTab === CinemaCornerTab.REVIEW ? (
        <ButtonMore onClick={() => navigate('/reviews')}>
          {t('CINEMACORNER_ALL_REVIEWS')}
        </ButtonMore>
      ) : (
        <ButtonMore onClick={() => navigate('/blogs')}>
          {t('CINEMACORNER_SEE_MORE')}
        </ButtonMore>
      )}
    </Container>
  );
}

/* ------------------ styles ------------------ */
const Container = styled.div`
  margin: ${theme.spacing.xl} 0;
  text-align: center;
`;

const Heading = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: ${theme.colors.headingLight};
`;

const Tabs = styled.div`
  display: flex;
  gap: ${theme.spacing.xl};
  font-weight: 600;
  cursor: pointer;
  justify-content: center;
  color: ${theme.colors.textLight};
`;

const Content = styled.div`
  display: flex;
  margin-top: ${theme.spacing.md};
  gap: ${theme.spacing.md};
`;

const MainReview = styled.div`
  flex: 2;
`;

const SideReviews = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ReviewCard = styled.div`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  text-align: left;
  overflow: hidden;
  color: ${theme.colors.textLight};

  img {
    width: 100%;
    height: auto;
    object-fit: cover;
    border-radius: ${theme.borderRadius.medium};
    transition:
      transform 0.3s ease,
      filter 0.3s ease;
  }

  .title {
    margin-top: ${theme.spacing.sm};
    font-size: 15px;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  &:hover img {
    transform: scale(1.03);
    filter: brightness(0.5);
  }

  &:hover .title {
    color: #c3dcff;
  }
`;

const ReviewList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  text-align: left;
`;

const ReviewItem = styled.div`
  padding: ${theme.spacing.md};
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: ${theme.colors.textLight};

  .poster {
    width: 100%;
    height: 140px;
    object-fit: cover;
    border-radius: 4px;
    margin-bottom: 8px;
  }

  .content {
    font-style: italic;
    margin-bottom: 6px;
  }

  .meta {
    font-size: 13px;
    color: ${theme.colors.gray};
  }
`;

const ButtonMore = styled.button`
  margin-top: 12px;
  padding: 10px 48px;
  border: 1px solid ${theme.colors.white};
  border-radius: 6px;
  background-color: transparent;
  color: ${theme.colors.textLight};
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: ${theme.colors.primaryHoverGradient};
    color: ${theme.colors.white};
    font-weight: 700;
  }
`;

const ReviewGrid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.md};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ReviewCardItem = styled.div`
  display: flex;
  flex-direction: row;
  gap: 16px;

  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;

  padding: 16px;
  color: ${theme.colors.textLight};
  cursor: pointer;
  transition: 0.25s ease;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.1);
  }
`;

const PosterWrapper = styled.div`
  flex-shrink: 0;
  width: 110px; /* nhỏ gọn */
  height: 165px; /* đúng ratio 2:3 */
  border-radius: 8px;
  overflow: hidden;
  position: relative;

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
  color: #fff;
  margin: 0 0 6px;
  text-align: left;
`;

const ReviewComment = styled.p`
  font-size: 15px;
  font-style: italic;
  opacity: 0.9;
  line-height: 1.5;
  margin: 0 0 10px;
  text-align: left;

  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
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
    font-size: 16px;
    font-weight: bold;
  }
`;

const ReviewDate = styled.div`
  font-size: 12px;
  opacity: 0.6;
  text-align: left;
  margin-top: auto;
`;

export {
  Container,
  Heading,
  Tabs,
  Content,
  MainReview,
  SideReviews,
  ReviewCard,
  ReviewList,
  ReviewItem,
  ButtonMore,
};

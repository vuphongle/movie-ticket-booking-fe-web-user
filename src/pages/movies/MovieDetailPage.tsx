import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiChevronRight } from 'react-icons/fi';
import { theme } from '@theme/Theme';

import {
  useGetMovieDetailQuery,
  useGetShowingNowMoviesQuery,
} from '@app/services/movie.api';

import MovieItem from '@pages/movies/components/MovieItem';

import MovieContent from './components/MovieContent';
import MovieShowtimes from './components/MovieShowtimes';
import MovieReviews from './components/MovieReviews';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

const MovieDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();

  const movieId = Number(id);

  const {
    data: movie,
    isLoading,
    error,
  } = useGetMovieDetailQuery({
    id: movieId,
    slug: slug!,
  });

  const { data: movies = [] } = useGetShowingNowMoviesQuery();

  useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, [id]);

  if (isLoading) return <Message>{t('MOVIE_LOADING_DETAIL')}</Message>;
  if (error) return <Message>{t('MOVIE_ERROR_DETAIL')}</Message>;
  if (!movie) return <Message>{t('MOVIE_NOT_FOUND')}</Message>;

  return (
    <PageWrapper>
      <Banner>
        <iframe
          src={movie.trailer}
          allowFullScreen
          title={t('MOVIE_TRAILER')}
        />
      </Banner>

      <MovieContent movie={movie} />

      <MainLayout>
        <LeftColumn>
          <Block>
            <SectionTitle>{t('MOVIE_DESCRIPTION')}</SectionTitle>
            <Description>{movie.description}</Description>
          </Block>

          <MovieShowtimes movieId={movieId} slug={slug!} />

          <MovieReviews reviews={movie.reviews} movieId={movieId} />
        </LeftColumn>

        <RightColumn>
          <Block>
            <SectionTitle>{t('MOVIE_NOW_SHOWING')}</SectionTitle>
            <MovieListVertical>
              {movies.slice(0, 3).map(m => (
                <MovieItem
                  key={m.id}
                  title={m.name}
                  poster={m.poster}
                  age={m.age}
                  rating={m.rating}
                  graphics={m.graphics}
                  buttonText={t('MOVIE_BOOK')}
                  onAction={() => navigate(`/movies/${m.id}/${m.slug}`)}
                  compact
                />
              ))}
            </MovieListVertical>

            <ShowMoreButton onClick={() => navigate('/movies/now-showing')}>
              {t('MOVIE_VIEW_MORE')}
              <ArrowIcon />
            </ShowMoreButton>
          </Block>
        </RightColumn>
      </MainLayout>
    </PageWrapper>
  );
};

export default MovieDetailPage;

/* ---------------- STYLES cho PAGE ---------------- */
export const PageWrapper = styled.div`
  padding: ${theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
  color: ${theme.colors.darkTextPrimary};
`;

export const Banner = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background: ${theme.colors.backgroundFocus};
  margin-bottom: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
  box-shadow: ${theme.colors.darkShadow};

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

export const Block = styled.div`
  margin-top: 20px;
`;

export const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.darkTextPrimary};
  border-bottom: 2px solid ${theme.colors.darkBorder};
  padding-bottom: 4px;
  padding-left: 8px;
  border-left: 5px solid ${theme.colors.darkTitleBar};
`;

export const Description = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: ${theme.colors.darkTextPrimary};
  margin-bottom: ${theme.spacing.md};
`;

export const Message = styled.p`
  text-align: center;
  padding: 40px;
  font-size: 1.1rem;
  color: ${theme.colors.darkTextSecondary};
`;

export const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 4fr 1fr;
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.xl};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const MovieListVertical = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const ShowMoreButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 12px 16px;
  background: transparent;
  border: 1.5px solid #ffffff;
  color: #ffffff;
  font-weight: 600;
  font-size: 16px;
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${theme.colors.primary};
    color: ${theme.colors.white};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    border-color: ${theme.colors.primaryHoverGradient};
  }
`;

const ArrowIcon = styled(FiChevronRight)`
  font-size: 20px;
  stroke-width: 2;
  transition: transform 0.3s ease;

  ${ShowMoreButton}:hover & {
    transform: translateX(6px);
  }
`;
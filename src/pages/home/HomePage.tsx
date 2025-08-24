import React from 'react';
import styled from 'styled-components';
import { theme } from '@/theme/Theme';
import HomeSliderComponent from '@pages/home/components/HomeSliderComponent';
import QuickBookingComponent from '@pages/home/components/QuickBookingComponent';
import MovieComponent from '@pages/home/components/MovieComponent';
import CinemaCornerComponent from '@pages/home/components/CinemaCornerComponent';
import CouponComponent from '@pages/home/components/CouponComponent';
import { useNavigate } from 'react-router-dom';
import {
  useGetShowingNowMoviesQuery,
  useGetComingSoonMoviesQuery,
} from '@app/services/movie.api';
import { useTranslation } from 'react-i18next';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: nowShowing = [], isLoading: loadingNow } =
    useGetShowingNowMoviesQuery();
  const { data: comingSoon = [], isLoading: loadingSoon } =
    useGetComingSoonMoviesQuery();

  return (
    <PageContainer>
      {/* Banner */}
      <HomeSliderComponent
        slides={nowShowing.map(movie => ({
          id: movie.id,
          image: movie.poster,
          alt: movie.name,
        }))}
      />

      <QuickBookingComponent />

      {loadingNow ? (
        <p>{t('MOVIE_LOADING_NOW')}</p>
      ) : (
        <MovieComponent
          title={t('MOVIE_NOW_SHOWING')}
          movies={nowShowing}
          buttonText={t('MOVIE_BOOK')}
          onViewMore={() => navigate('/movies/now-showing')}
        />
      )}

      {loadingSoon ? (
        <p>{t('MOVIE_LOADING_SOON')}</p>
      ) : (
        <MovieComponent
          title={t('MOVIE_COMING_SOON')}
          movies={comingSoon}
          buttonText={t('MOVIE_LEARN_MORE')}
          onViewMore={() => navigate('/movies/coming-soon')}
        />
      )}

      {/* Khuyến mại */}
      <CouponComponent />

      {/* Góc điện ảnh */}
      <CinemaCornerComponent />
    </PageContainer>
  );
};

// Styled components
const PageContainer = styled.div`
  background: transparent;
  color: ${theme.colors.textPrimary};
  padding: ${theme.spacing.md};
  font-family: ${theme.fontFamily.primary};
  margin-bottom: ${theme.spacing.lg};
`;

export default HomePage;

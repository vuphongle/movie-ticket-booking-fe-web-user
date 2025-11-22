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
import banner5 from '@/assets/image/banners/banner5.png';
import banner2 from '@/assets/image/banners/banner2.png';
import banner3 from '@/assets/image/banners/banner3.png';
import banner4 from '@/assets/image/banners/banner4.png';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: nowShowing = [], isLoading: loadingNow } =
    useGetShowingNowMoviesQuery();
  const { data: comingSoon = [], isLoading: loadingSoon } =
    useGetComingSoonMoviesQuery();

  return (
    <PageContainer>
      <HomeSliderComponent
        slides={[
          { id: 1, image: banner2, alt: 'Ưu đãi combo bắp nước' },
          { id: 2, image: banner5, alt: 'Giảm giá bắp nước' },
          { id: 3, image: banner3, alt: 'Khuyến mãi combo' },
          { id: 4, image: banner4, alt: 'Giảm giá bắp nước' },
        ]}
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

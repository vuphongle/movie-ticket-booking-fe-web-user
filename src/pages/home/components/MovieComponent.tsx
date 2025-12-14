import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import MovieItem from '@/pages/movies/components/MovieItem';
import { theme } from '@theme/Theme';
import type { Movie } from '@app/services/movie.api';
import { useState } from 'react';
import { getMovieTitle } from '@utils/functionUtils';

interface Props {
  title: string;
  movies: Movie[];
  buttonText: string;
  onViewMore: () => void;
}

export default function MovieComponent({
  title,
  movies,
  buttonText,
  onViewMore,
}: Props) {
  const { t, i18n } = useTranslation();

  const navigate = useNavigate();

  const breakpoints = {
    0: { slidesPerView: 1.15, slidesPerGroup: 1, spaceBetween: 16 },
    640: { slidesPerView: 2, slidesPerGroup: 2, spaceBetween: 16 },
    900: { slidesPerView: 3, slidesPerGroup: 3, spaceBetween: 20 },
    1280: { slidesPerView: 4, slidesPerGroup: 4, spaceBetween: 24 },
  };

  const [activeTrailer, setActiveTrailer] = useState<string | null>(null);

  if (!movies || movies.length === 0) {
    return <NoMovies>{t('MOVIE_NO_MOVIES')}</NoMovies>;
  }

  const getEmbedUrl = (url: string) => {
    if (url.includes('youtube.com/watch')) {
      return url.replace('watch?v=', 'embed/');
    }
    return url;
  };

  return (
    <Section>
      <Heading>{title}</Heading>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={24}
        slidesPerView={1.15}
        slidesPerGroup={1}
        breakpoints={breakpoints}
        pagination={{ clickable: true }}
        navigation
      >
        {movies.map(movie => (
          <SwiperSlide key={movie.id}>
            <MovieItem
              title={getMovieTitle(movie, i18n.language)}
              poster={movie.poster}
              age={movie.age}
              rating={movie.rating ?? 0}
              graphics={movie.graphics ?? []}
              buttonText={buttonText}
              onTrailer={() => setActiveTrailer(getEmbedUrl(movie.trailer))}
              onAction={() => navigate(`/movies/${movie.id}/${movie.slug}`)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <MoreBtn onClick={onViewMore}>{t('MOVIE_VIEW_MORE')}</MoreBtn>

      {activeTrailer && (
        <TrailerModal onClick={() => setActiveTrailer(null)}>
          <iframe
            src={activeTrailer}
            allowFullScreen
            onClick={e => e.stopPropagation()}
          />
        </TrailerModal>
      )}
    </Section>
  );
}

/* Styled */
const Section = styled.section`
  margin: 40px 0;
  text-align: center;

  .swiper-button-prev,
  .swiper-button-next {
    color: ${theme.colors.white};
  }

  .swiper {
    padding-bottom: 24px; /* chừa chỗ cho pagination để không đè lên card */
  }

  .swiper-pagination {
    position: static;
    margin-top: 8px;
    display: flex;
    justify-content: center;
    gap: 6px;
    flex-wrap: nowrap;
  }

  .swiper-pagination-bullet {
    width: 7px;
    height: 7px;
    background: rgba(255, 255, 255, 0.6);
    opacity: 1;
  }

  .swiper-pagination-bullet-active {
    background: ${theme.colors.white};
  }

  @media (max-width: 767px) {
    margin: 32px 0;

    .swiper-button-prev,
    .swiper-button-next {
      display: none;
    }
  }
`;
const Heading = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: ${theme.colors.headingLight};

  @media (max-width: 768px) {
    font-size: 22px;
  }
`;
const MoreBtn = styled.button`
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

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const TrailerModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;

  iframe {
    width: 80%;
    height: 80%;
    border: none;
  }
`;

const NoMovies = styled.div`
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.textLight};
  font-size: 20px;
  font-weight: 600;
  text-align: center;
`;

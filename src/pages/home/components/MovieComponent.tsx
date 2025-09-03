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
  const { t } = useTranslation();

  const navigate = useNavigate();

  const slidesPerView = 4;
  const totalDots = Math.min(2, Math.ceil(movies.length / slidesPerView));
  const slidesPerGroup = Math.ceil(movies.length / totalDots);

  const [activeTrailer, setActiveTrailer] = useState<string | null>(null);

  if (!movies || movies.length === 0) {
    return <p>{t('MOVIE_NO_MOVIES')}</p>;
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
        spaceBetween={40}
        slidesPerView={slidesPerView}
        slidesPerGroup={slidesPerGroup}
        pagination={{ clickable: true }}
        navigation
      >
        {movies.map(movie => (
          <SwiperSlide key={movie.id}>
            <MovieItem
              title={movie.name}
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
`;
const Heading = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: ${theme.colors.headingLight};
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
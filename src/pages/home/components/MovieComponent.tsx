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

  return (
    <Section>
      <Heading>{title}</Heading>

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={20}
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
              onTrailer={() => console.log(t('MOVIE_TRAILER'), movie.name)}
              onAction={() => navigate(`/movies/${movie.id}/${movie.slug}`)}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <MoreBtn onClick={onViewMore}>{t('MOVIE_VIEW_MORE')}</MoreBtn>
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

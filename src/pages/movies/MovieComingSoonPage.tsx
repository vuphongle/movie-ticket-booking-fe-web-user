import styled from 'styled-components';
import MovieList from './components/MovieList';
import { theme } from '@theme/Theme';
import { useGetComingSoonMoviesQuery } from '@/app/services/movie.api';
import { useTranslation } from 'react-i18next';

export default function ComingSoon() {
  const { t } = useTranslation();

  const { data: movies, isLoading, error } = useGetComingSoonMoviesQuery();

   if (isLoading) return <Wrapper><Heading>{t('MOVIE_LOADING')}</Heading></Wrapper>;
  if (error) return <Wrapper><Heading>{t('MOVIE_ERROR_SOON')}</Heading></Wrapper>;

  return (
    <Wrapper>
      <Heading>{t('MOVIE_COMING_SOON')}</Heading>
      {movies && movies.length > 0 ? (
        <MovieList movies={movies} buttonText={t('MOVIE_LEARN_MORE')} />
      ) : (
        <p>{t('MOVIE_NO_COMING')}</p>
      )}
    </Wrapper>
  );
}

/* styled */
const Wrapper = styled.div`
  padding: 40px 20px;
`;

const Heading = styled.h1`
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
`;

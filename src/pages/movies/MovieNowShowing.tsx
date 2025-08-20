import styled from 'styled-components';
import MovieList from './MovieList';
import { theme } from '@theme/Theme';
import { useGetShowingNowMoviesQuery } from '@app/services/movie.api';
import { useTranslation } from 'react-i18next';

export default function NowShowing() {
  const { t } = useTranslation();

  const {
    data: movies = [],
    isLoading,
    isError,
  } = useGetShowingNowMoviesQuery();

  if (isLoading)
    return (
      <Wrapper>
        <Heading>{t('MOVIE_LOADING')}</Heading>
      </Wrapper>
    );
  if (isError)
    return (
      <Wrapper>
        <Heading>{t('MOVIE_ERROR')}</Heading>
      </Wrapper>
    );

  return (
    <Wrapper>
      <Heading>{t('MOVIE_NOW_SHOWING')}</Heading>
      <MovieList movies={movies} buttonText={t('MOVIE_BOOK')} />
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
  color: ${theme.colors.textPrimary};
`;

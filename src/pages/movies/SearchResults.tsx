import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import MovieList from '../movies/components/MovieList';
import { useTranslation } from 'react-i18next';
import { useSearchMoviesQuery } from '@app/services/movie.api';

export default function SearchResults() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const query = params.get('keyword') || '';

  const {
    data: movies = [],
    isLoading,
    isError,
  } = useSearchMoviesQuery(query, {
    skip: !query,
  });

  if (!query)
    return (
      <Wrapper>
        <Heading>{t('SEARCH_NO_QUERY')}</Heading>
      </Wrapper>
    );

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
      <Heading>
        {t('SEARCH_RESULTS_FOR')} “{query}”
      </Heading>
      {movies.length > 0 ? (
        <MovieList movies={movies} buttonText={t('MOVIE_BOOK')} />
      ) : (
        <StyledP>{t('SEARCH_NO_RESULT')}</StyledP>
      )}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 40px 20px;
`;

const Heading = styled.h1`
  font-size: 26px;
  font-weight: 700;
  color: #ffffff;
`;

const StyledP = styled.p`
  margin-top: 20px;
  font-size: 18px;
  color: #ccc;
  text-align: center;
`;

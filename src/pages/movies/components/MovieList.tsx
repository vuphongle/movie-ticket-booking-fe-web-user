import styled from 'styled-components';
import MovieItem from './MovieItem';
import type { Movie } from '@app/services/movie.api';
import { useTranslation } from "react-i18next";

interface Props {
  movies: Movie[];
  buttonText: string;
}

export default function MovieList({ movies, buttonText }: Props) {
  const { t } = useTranslation();
  return (
    <Grid>
      {movies.map(movie => (
        <MovieItem
          key={movie.id}
          title={movie.name}
          poster={movie.poster}
          age={movie.age}
          rating={movie.rating}
          graphics={movie.graphics}
          buttonText={buttonText}
          onTrailer={() => console.log(t('MOVIE_TRAILER'), movie.name)}
          onAction={() => console.log(buttonText, movie.name)}
        />
      ))}
    </Grid>
  );
}

/* styled */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

import styled from 'styled-components';
import MovieItem from './MovieItem';
import type { Movie } from '@app/services/movie.api';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface Props {
  movies: Movie[];
  buttonText: string;
}

export default function MovieList({ movies, buttonText }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    <>
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
            compact
            onTrailer={() => setActiveTrailer(getEmbedUrl(movie.trailer))}
            onAction={() => navigate(`/movies/${movie.id}/${movie.slug}`)}
          />
        ))}
      </Grid>

      {activeTrailer && (
        <TrailerModal onClick={() => setActiveTrailer(null)}>
          <iframe
            src={activeTrailer}
            allowFullScreen
            onClick={e => e.stopPropagation()}
          />
        </TrailerModal>
      )}
    </>
  );
}


/* styled */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;
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

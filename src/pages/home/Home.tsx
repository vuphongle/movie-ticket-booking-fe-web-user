import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Movie {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
}

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    axios
      .get('https://api.example.com/movies')
      .then(res => setMovies(res.data))
      .catch(err => console.error('Failed to load movies', err));
  }, []);

  return (
    <div style={styles.homePage}>
      <h1 style={styles.homeTitle}>{t('home.title')}</h1>
      <p style={styles.homeSubtitle}>{t('home.subtitle')}</p>

      <div style={styles.movieGrid}>
        {movies.map(movie => (
          <div key={movie.id} style={styles.movieCard}>
            <img
              src={movie.posterUrl}
              alt={movie.title}
              style={styles.moviePoster}
            />
            <h2 style={styles.movieTitle}>{movie.title}</h2>
            <p style={styles.movieDesc}>{movie.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  homePage: {
    padding: 24,
    backgroundColor: '#f8f8f8',
  },
  homeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  homeSubtitle: {
    fontSize: 18,
    color: '#777',
    marginBottom: 24,
  },
  movieGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 20,
  },
  movieCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    padding: 16,
    textAlign: 'center',
    transition: 'transform 0.2s ease',
  },
  moviePoster: {
    width: '100%',
    height: 'auto',
    borderRadius: 8,
  },
  movieTitle: {
    fontSize: 20,
    fontWeight: 600,
    marginTop: 12,
  },
  movieDesc: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
};

export default HomePage;

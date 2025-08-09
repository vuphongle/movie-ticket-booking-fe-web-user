import { theme } from '@/theme/Theme'; // lấy màu, spacing từ theme
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

interface Movie {
  id: number;
  title: string;
  description: string;
  posterUrl: string;
}

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_BASE_URL}/movies`)
      .then(res => setMovies(res.data))
      .catch(err => console.error('Failed to load movies', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading>{t('loading')}</Loading>;

  return (
    <Container>
      <Title>{t('home.title')}</Title>
      <Subtitle>{t('home.subtitle')}</Subtitle>

      <Grid>
        {movies.map(movie => (
          <Card key={movie.id}>
            <Poster src={movie.posterUrl} alt={movie.title} />
            <MovieTitle>{movie.title}</MovieTitle>
            <Description>{movie.description}</Description>
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

const Container = styled.div`
  padding: 24px;
  background-color: ${theme.colors.background};
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 24px;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
`;

const Card = styled.div`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px;
  text-align: center;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.02);
  }
`;

const Poster = styled.img`
  width: 100%;
  height: auto;
  border-radius: 8px;
`;

const MovieTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  margin-top: 12px;
`;

const Description = styled.p`
  font-size: 14px;
  color: #666;
  margin-top: 8px;
`;

const Loading = styled.p`
  text-align: center;
  font-size: 18px;
`;

export default HomePage;

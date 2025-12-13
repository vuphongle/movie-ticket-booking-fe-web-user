import React from 'react';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { Clock, Star, Film, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type Person = { id: number; name: string; avatar: string };
type Genre = { id: number; name: string };

export interface MovieContentProps {
  movie: {
    id: number;
    name: string;
    nameEn: string;
    poster: string;
    duration: number;
    rating: number;
    genres: Genre[];
    showDate: string | Date;
    directors: Person[];
    actors: Person[];
  };
}

const MovieContent: React.FC<MovieContentProps> = ({ movie }) => {
  const { t } = useTranslation();

  return (
    <ContentWrapper>
      <Poster>
        <img src={movie.poster} alt={movie.name} />
      </Poster>

      <Info>
        <Title>{movie.name}</Title>
        <SubTitle>{movie.nameEn}</SubTitle>

        <Meta>
          <MetaItem>
            <Clock className="icon duration" />
            <span>
              {movie.duration} {t('MOVIE_MINUTES')}
            </span>
          </MetaItem>
          <MetaItem>
            <Star className="icon rating" />
            <span>{movie.rating}</span>
          </MetaItem>
          <MetaItem>
            <Film className="icon genre" />
            <span>{movie.genres.map((g) => g.name).join(', ')}</span>
          </MetaItem>
          <MetaItem>
            <Calendar className="icon calendar" />
            <span>{new Date(movie.showDate).toLocaleDateString()}</span>
          </MetaItem>
        </Meta>

        <Section>
          <SectionTitle>{t('MOVIE_DIRECTORS')}</SectionTitle>
          <AvatarList>
            {movie.directors.map((d) => (
              <AvatarItem key={d.id}>
                <img src={d.avatar} alt={d.name} />
                <p>{d.name}</p>
              </AvatarItem>
            ))}
          </AvatarList>
        </Section>

        <Section>
          <SectionTitle>{t('MOVIE_ACTORS')}</SectionTitle>
          <AvatarList $horizontal>
            {movie.actors.map((a) => (
              <AvatarItem key={a.id}>
                <img src={a.avatar} alt={a.name} />
                <p>{a.name}</p>
              </AvatarItem>
            ))}
          </AvatarList>
        </Section>
      </Info>
    </ContentWrapper>
  );
};

export default MovieContent;

/* ---------------- STYLES ---------------- */
export const ContentWrapper = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  flex-wrap: wrap;
  align-items: flex-start;

  @media (max-width: 900px) {
    flex-direction: column;
    gap: ${theme.spacing.md};
  }
`;

export const Poster = styled.div`
  width: 320px;
  flex-shrink: 0;
  align-self: stretch;
  overflow: hidden;

  @media (max-width: 900px) {
    width: 260px;
  }

  @media (max-width: 640px) {
    width: 100%;
    align-self: auto;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
    border-radius: ${theme.borderRadius.medium};
    box-shadow: ${theme.colors.darkShadow};
  }
`;

export const Info = styled.div`
  flex: 1;
  background: ${theme.colors.darkCardBg};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  backdrop-filter: blur(6px);

  @media (max-width: 640px) {
    padding: ${theme.spacing.sm};
  }
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: ${theme.colors.darkTextPrimary};

  @media (max-width: 640px) {
    font-size: 1.6rem;
  }
`;

export const SubTitle = styled.p`
  font-size: 1.1rem;
  color: ${theme.colors.darkTextSecondary};
  margin-bottom: ${theme.spacing.sm};
  font-style: italic;

  @media (max-width: 640px) {
    font-size: 1rem;
  }
`;

export const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.lg};
  font-size: 0.95rem;
  margin-bottom: ${theme.spacing.md};

  @media (max-width: 640px) {
    gap: ${theme.spacing.sm};
    font-size: 0.9rem;
  }
`;

export const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: ${theme.colors.darkTextSecondary};
  font-weight: 500;
  transition:
    transform 0.25s ease,
    color 0.25s ease;

  &:hover {
    transform: translateY(-2px);
    color: ${theme.colors.textLight};

    .icon {
      transform: scale(1.15);
      filter: drop-shadow(0 0 6px rgba(255, 255, 255, 0.3));
    }
  }

  .icon {
    width: 18px;
    height: 18px;
    transition:
      transform 0.25s ease,
      color 0.25s ease;
  }

  @media (max-width: 640px) {
    gap: 4px;

    .icon {
      width: 16px;
      height: 16px;
    }
  }

  .duration {
    color: #38bdf8;
  }
  .rating {
    color: #38bdf8;
  }
  .genre {
    color: #38bdf8;
  }
  .calendar {
    color: #38bdf8;
  }
`;

export const Section = styled.div`
  margin-top: ${theme.spacing.lg};
`;

export const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.darkTextPrimary};
  border-bottom: 2px solid ${theme.colors.darkBorder};
  padding-bottom: 4px;

  @media (max-width: 640px) {
    font-size: 1.1rem;
  }
`;

export const AvatarList = styled.div<{ $horizontal?: boolean }>`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: ${({ $horizontal }) => ($horizontal ? 'nowrap' : 'wrap')};
  overflow-x: ${({ $horizontal }) => ($horizontal ? 'auto' : 'visible')};
  padding-bottom: ${({ $horizontal }) =>
    $horizontal ? theme.spacing.sm : '0'};

  @media (max-width: 640px) {
    gap: ${theme.spacing.sm};
  }
`;

export const AvatarItem = styled.div`
  text-align: center;
  cursor: pointer;
  transition: transform 0.25s ease;

  img {
    width: 72px;
    height: 108px;
    border-radius: 6px;
    object-fit: cover;
    margin: 0 auto 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
    transition:
      transform 0.25s ease,
      box-shadow 0.25s ease;
  }

  p {
    margin: 0;
    font-size: 0.8rem;
    color: ${theme.colors.darkTextSecondary};
    transition: color 0.25s ease;

    @media (max-width: 640px) {
      font-size: 0.75rem;
    }
  }

  &:hover {
    img {
      transform: scale(1.05);
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.6),
        0 0 6px rgba(255, 255, 255, 0.2);
    }

    p {
      color: ${theme.colors.textLight};
    }
  }
`;

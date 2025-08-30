import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { Clock, Star, Film, Calendar } from 'lucide-react';
import {
  useGetMovieDetailQuery,
  useGetShowingNowMoviesQuery,
} from '@app/services/movie.api';
import MovieItem from '@pages/movies/components/MovieItem';

const MovieDetailPage: React.FC = () => {
  const { id, slug } = useParams<{ id: string; slug: string }>();
  const navigate = useNavigate();

  const {
    data: movie,
    isLoading,
    error,
  } = useGetMovieDetailQuery({
    id: Number(id),
    slug: slug!,
  });

  const { data: movies = [] } = useGetShowingNowMoviesQuery();
  const [visibleReviews, setVisibleReviews] = useState(3);

  if (isLoading) return <Message>Đang tải...</Message>;
  if (error) return <Message>Có lỗi xảy ra!</Message>;
  if (!movie) return <Message>Không tìm thấy phim</Message>;

  return (
    <PageWrapper>
      {/* Banner */}
      <Banner>
        <iframe src={movie.trailer} allowFullScreen title='Trailer' />
      </Banner>

      <ContentWrapper>
        {/* Poster */}
        <Poster>
          <img src={movie.poster} alt={movie.name} />
        </Poster>

        {/* Info */}
        <Info>
          <Title>{movie.name}</Title>
          <SubTitle>{movie.nameEn}</SubTitle>

          <Meta>
            <MetaItem>
              <Clock className='icon duration' />
              <span>{movie.duration} phút</span>
            </MetaItem>
            <MetaItem>
              <Star className='icon rating' />
              <span>{movie.rating}</span>
            </MetaItem>
            <MetaItem>
              <Film className='icon genre' />
              <span>{movie.genres.map(g => g.name).join(', ')}</span>
            </MetaItem>
            <MetaItem>
              <Calendar className='icon calendar' />
              <span>{new Date(movie.showDate).toLocaleDateString()}</span>
            </MetaItem>
          </Meta>

          <Section>
            <SectionTitle>Đạo diễn</SectionTitle>
            <AvatarList>
              {movie.directors.map(d => (
                <AvatarItem key={d.id}>
                  <img src={d.avatar} alt={d.name} />
                  <p>{d.name}</p>
                </AvatarItem>
              ))}
            </AvatarList>
          </Section>

          <Section>
            <SectionTitle>Diễn viên</SectionTitle>
            <AvatarList horizontal>
              {movie.actors.map(a => (
                <AvatarItem key={a.id}>
                  <img src={a.avatar} alt={a.name} />
                  <p>{a.name}</p>
                </AvatarItem>
              ))}
            </AvatarList>
          </Section>
        </Info>
      </ContentWrapper>

      <MainLayout>
        <LeftColumn>
          <Block>
            <SectionTitle>Nội dung phim</SectionTitle>
            <Description>{movie.description}</Description>
          </Block>

          <Block>
            <SectionTitle>Đánh giá của khán giả</SectionTitle>
            <ReviewList>
              {movie.reviews.slice(0, visibleReviews).map(r => (
                <ReviewCard key={r.id}>
                  <ReviewHeader>
                    <img src={r.user.avatar} alt={r.user.name} />
                    <strong>{r.user.name}</strong>
                    <span>⭐ {r.rating}</span>
                  </ReviewHeader>
                  <p>{r.comment}</p>
                  {r.images.length > 0 && (
                    <ReviewImages>
                      {r.images.map((img, idx) => (
                        <img key={idx} src={img} alt='review' />
                      ))}
                    </ReviewImages>
                  )}
                </ReviewCard>
              ))}
            </ReviewList>

            {visibleReviews < movie.reviews.length && (
              <ShowMoreButton
                onClick={() => setVisibleReviews(prev => prev + 5)}
              >
                Xem thêm
              </ShowMoreButton>
            )}
          </Block>
        </LeftColumn>

        <RightColumn>
          <Block>
            <SectionTitle>PHIM ĐANG CHIẾU</SectionTitle>
            <MovieListVertical>
              {movies.slice(0, 3).map(m => (
                <MovieItem
                  key={m.id}
                  title={m.name}
                  poster={m.poster}
                  age={m.age}
                  rating={m.rating}
                  graphics={m.graphics}
                  buttonText='Đặt vé'
                  onAction={() => navigate(`/movies/${m.id}/${m.slug}`)}
                  compact
                />
              ))}
            </MovieListVertical>

            <ShowMoreButton onClick={() => navigate('/movies/now-showing')}>
              Xem thêm
            </ShowMoreButton>
          </Block>
        </RightColumn>
      </MainLayout>
    </PageWrapper>
  );
};

export default MovieDetailPage;

/* ---------------- STYLES ---------------- */
export const PageWrapper = styled.div`
  padding: ${theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
  color: ${theme.colors.darkTextPrimary};
`;

export const Banner = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  background: ${theme.colors.backgroundFocus};
  margin-bottom: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
  box-shadow: ${theme.colors.darkShadow};

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
`;

export const ContentWrapper = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  flex-wrap: wrap;
  align-items: flex-start;
`;

export const Poster = styled.div`
  width: 320px;
  flex-shrink: 0;
  align-self: stretch;
  overflow: hidden;

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
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 4px;
  color: ${theme.colors.darkTextPrimary};
`;

export const SubTitle = styled.p`
  font-size: 1.1rem;
  color: ${theme.colors.darkTextSecondary};
  margin-bottom: ${theme.spacing.sm};
  font-style: italic;
`;

export const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.lg};
  font-size: 0.95rem;
  margin-bottom: ${theme.spacing.md};
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

  .duration {
    color: #38bdf8;
  }
  .rating {
    color: ${theme.colors.rating};
  }
  .genre {
    color: #f87171;
  }
  .calendar {
    color: #34d399;
  }
`;

export const Description = styled.p`
  font-size: 1rem;
  line-height: 1.6;
  color: ${theme.colors.darkTextPrimary};
  margin-bottom: ${theme.spacing.md};
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
`;

export const AvatarList = styled.div<{ horizontal?: boolean }>`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: ${({ horizontal }) => (horizontal ? 'nowrap' : 'wrap')};
  overflow-x: ${({ horizontal }) => (horizontal ? 'auto' : 'visible')};
  padding-bottom: ${({ horizontal }) => (horizontal ? theme.spacing.sm : '0')};
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

export const Block = styled.div`
  margin-top: 40px;
`;

export const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

export const ReviewCard = styled.div`
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  background: ${theme.colors.darkCardBg};
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
`;

export const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};

  img {
    width: 32px;
    height: 32px;
    border-radius: 50%;
  }

  strong {
    flex: 1;
    color: ${theme.colors.darkTextPrimary};
  }

  span {
    color: ${theme.colors.rating};
    font-size: 0.9rem;
  }
`;

export const ReviewImages = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};

  img {
    width: 80px;
    height: 80px;
    border-radius: ${theme.borderRadius.small};
    object-fit: cover;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
  }
`;

export const ShowMoreButton = styled.button`
  margin-top: ${theme.spacing.md};
  padding: 10px 16px;
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  font-weight: 600;
  border: none;
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  transition: background 0.25s ease;

  &:hover {
    background: ${theme.colors.primaryHoverGradient};
  }
`;

export const MovieList = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.sm};
  overflow-x: auto;
  padding-bottom: ${theme.spacing.sm};
`;

export const Message = styled.p`
  text-align: center;
  padding: 40px;
  font-size: 1.1rem;
  color: ${theme.colors.darkTextSecondary};
`;

export const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 4fr 1fr;
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.xl};

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

export const MovieListVertical = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

export const MovieItemVertical = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};

  img {
    width: 80px;
    height: 110px;
    object-fit: cover;
    border-radius: ${theme.borderRadius.medium};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  }

  p {
    font-weight: 600;
    font-size: 0.95rem;
    color: ${theme.colors.darkTextPrimary};
  }
`;

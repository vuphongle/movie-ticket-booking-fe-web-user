import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { formatGraphicLabel } from '@utils/functionUtils';
import { MovieAge } from '@app/services/movie.api';

interface Props {
  title: string;
  poster: string;
  age: MovieAge;
  graphics: string[];
  cinema: string;
  auditorium: string;
  showtime: string;
}

export function BookingMovieInfo({
  title,
  poster,
  age,
  graphics,
  cinema,
  auditorium,
  showtime,
}: Props) {
  return (
    <Card>
      <PosterWrapper>
        <Poster src={poster} alt={title} />
        <TopLeft>
          {graphics.map((g, idx) => (
            <Badge key={idx}>{formatGraphicLabel(g)}</Badge>
          ))}
        </TopLeft>
        <TopRight>
          <AgeBadge>{age}</AgeBadge>
        </TopRight>
      </PosterWrapper>
      <Info>
        <Title>{title}</Title>
        <Detail>
          {cinema} - {auditorium}
        </Detail>
        <ShowtimeDetail>{showtime}</ShowtimeDetail>
      </Info>
    </Card>
  );
}

const Card = styled.div`
  display: flex;
  gap: 16px;
  border-radius: 8px;
  overflow: hidden;
  background: ${theme.colors.white};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  margin-top: 12px;

  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 16px;
    margin-top: 10px;
  }

  @media (max-width: 480px) {
    gap: 10px;
    margin-bottom: 12px;
    margin-top: 8px;
  }
`;

const PosterWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 180px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100px;
    height: 150px;
  }

  @media (max-width: 480px) {
    width: 80px;
    height: 120px;
  }
`;

const Poster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const TopLeft = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  display: flex;
  gap: 4px;
`;

const TopRight = styled.div`
  position: absolute;
  top: 4px;
  right: 8px;
`;

const Badge = styled.span`
  background: ${theme.colors.primary};
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
`;

const AgeBadge = styled(Badge)`
  background: red;

  @media (max-width: 768px) {
    padding: 6px 10px;
  }

  @media (max-width: 480px) {
    padding: 4px 8px;
  }
  font-size: 10px;
  border-radius: 4px;
  padding: 2px 6px;
`;

const Info = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 768px) {
    font-size: 16px;
    margin: 0 0 5px;
  }

  @media (max-width: 480px) {
    font-size: 14px;
    margin: 0 0 4px;
  }
  padding: 8px 12px;
`;

const Title = styled.h3`
  @media (max-width: 768px) {
    font-size: 13px;
  }

  @media (max-width: 480px) {
    font-size: 11px;
  }
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 6px;
  color: ${theme.colors.textPrimary};
`;

const Detail = styled.p`
  font-size: 14px;
  margin: 2px 0;
  color: ${theme.colors.textSecondary};
`;

const ShowtimeDetail = styled.p`
  font-size: 13px;
  margin: 6px 0 0;

  @media (max-width: 768px) {
    font-size: 12px;
    padding: 3px 7px;
    margin: 5px 0 0;
  }

  @media (max-width: 480px) {
    font-size: 10px;
    padding: 3px 6px;
    margin: 4px 0 0;
  }
  padding: 4px 8px;
  border-radius: 6px;
  background: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
  font-weight: 600;
  display: inline-block;
  transition: all 0.2s ease;
  text-align: center;
`;

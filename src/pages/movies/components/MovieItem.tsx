import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { MovieAge } from '@app/services/movie.api';
import { FaTicketAlt, FaPlay } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { formatGraphicLabel  } from '@utils/functionUtils';

interface Props {
  title: string;
  poster: string;
  age: MovieAge;
  rating: number;
  graphics: string[];
  buttonText: string;
  onTrailer?: () => void;
  onAction?: () => void;
}

export default function MovieItem({
  title,
  poster,
  age,
  rating,
  graphics,
  buttonText,
  onTrailer,
  onAction,
}: Props) {
    
  const { t } = useTranslation();

  return (
    <Card>
      <PosterWrapper>
        <Poster src={poster} alt={title} />
        <Overlay>
          {onTrailer && (
            <ActionButton>
              <FaPlay style={{ marginRight: 8 }} /> {t('MOVIE_TRAILER')}
            </ActionButton>
          )}
          {onAction && (
            <ActionButton primary>
              <FaTicketAlt style={{ marginRight: 8 }} /> {buttonText}
            </ActionButton>
          )}
        </Overlay>
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
        <Detail>⭐ {rating.toFixed(1)}</Detail>
      </Info>
    </Card>
  );
}

/* styled */
const Card = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  background: ${theme.colors.white};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  position: relative;
  margin-bottom: 36px;
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
`;

const PosterWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;

  &:hover ${Overlay} {
    opacity: 1;
  }

  &:hover img {
    filter: brightness(50%);
    transform: scale(1.05);
  }
`;

const Poster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'primary',
})<{ primary?: boolean }>`
  width: 190px;
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;

  background: ${({ primary }) =>
    primary ? theme.colors.primary : 'rgba(0,0,0,0.35)'};
  color: #fff;
  border: ${({ primary }) =>
    primary ? 'none' : '1px solid rgba(255,255,255,0.5)'};

  &:hover {
    background: ${({ primary }) =>
      primary ? theme.colors.primaryHoverGradient : 'rgba(0,0,0,0.25)'};
    color: #fff;
    font-weight: bold;
  }
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
  top: 8px;
  right: 8px;
`;

const Badge = styled.span`
  background: ${theme.colors.primary};
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
`;

const AgeBadge = styled(Badge)`
  background: red;
`;

const Info = styled.div`
  padding: 12px;
  text-align: center;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 6px;
  color: ${theme.colors.textPrimary};
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;


const Detail = styled.p`
  font-size: 14px;
  margin: 0;
  color: ${theme.colors.textSecondary};
`;

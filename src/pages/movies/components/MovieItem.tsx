import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { MovieAge } from '@app/services/movie.api';
import { FaTicketAlt, FaPlay } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { formatGraphicLabel } from '@utils/functionUtils';
import { useEffect } from 'react';

interface Props {
  title: string;
  poster: string;
  age: MovieAge;
  rating: number;
  graphics: string[];
  buttonText: string;
  onTrailer?: () => void;
  onAction?: () => void;
  compact?: boolean;
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
  compact = false,
}: Props) {
  const { t } = useTranslation();

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

  return (
    <Card compact={compact} onClick={onAction} style={{ cursor: onAction ? 'pointer' : 'default' }}>
      <PosterWrapper compact={compact}>
        <Poster src={poster} alt={title} />
        <Overlay>
          {onTrailer && (
            <ActionButton compact={compact} onClick={onTrailer}>
              <FaPlay style={{ marginRight: 8 }} /> {t('MOVIE_TRAILER')}
            </ActionButton>
          )}
          {onAction && (
            <ActionButton primary onClick={onAction}>
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
      <Info compact={compact}>
        <Title>{title}</Title>
        {!compact && <Detail>⭐ {rating.toFixed(1)}</Detail>}
      </Info>
    </Card>
  );
}

/* styled */
const Card = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact?: boolean }>`
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  background: ${theme.colors.white};
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  position: relative;
  margin-bottom: ${({ compact }) => (compact ? '0px' : '32px')};
  width: 100%;
  max-width: ${({ compact }) => (compact ? '240px' : '300px')};
  min-width: 220px;

  @media (max-width: 768px) {
    min-width: 0;
    max-width: 100%;
    margin-bottom: 24px;
  }
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

const PosterWrapper = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact?: boolean }>`
  position: relative;
  width: 100%;
  aspect-ratio: 2 / 3;
  min-height: ${({ compact }) => (compact ? '260px' : '320px')};
  overflow: hidden;

  &:hover ${Overlay} {
    opacity: 1;
    background: rgba(0, 0, 0, 0.5);
  }

  &:hover img {
    filter: ${({ compact }) => (compact ? 'none' : 'brightness(50%)')};
    transform: ${({ compact }) => (compact ? 'none' : 'scale(1.05)')};
  }
`;

const Poster = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
`;

const ActionButton = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'primary' && prop !== 'compact',
})<{ primary?: boolean; compact?: boolean }>`
  width: 170px;
  padding: 10px 24px;
  font-size: 14px;
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

const Info = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'compact',
})<{ compact?: boolean }>`
  padding: ${({ compact }) => (compact ? '8px' : '12px')};
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

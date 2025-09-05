import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';
import { FaChevronDown } from 'react-icons/fa';

type Review = {
  id: number;
  rating: number;
  comment: string;
  images: string[];
  user: { name: string; avatar: string };
};

export interface MovieReviewsProps {
  reviews: Review[];
}

const MovieReviews: React.FC<MovieReviewsProps> = ({ reviews }) => {
  const [visibleReviews, setVisibleReviews] = useState(3);
  const { t } = useTranslation();

  if (!reviews || reviews.length === 0) {
    return null;
  }

  return (
    <Block>
      <SectionTitle>{t('MOVIE_AUDIENCE_REVIEWS')}</SectionTitle>

      <ReviewList>
        {reviews.slice(0, visibleReviews).map((r) => (
          <ReviewCard key={r.id}>
            <ReviewHeader>
              <img src={r.user.avatar} alt={r.user.name} />
              <strong>{r.user.name}</strong>
              <span>⭐ {r.rating}</span>
            </ReviewHeader>
            <p>{r.comment}</p>
            {r.images?.length > 0 && (
              <ReviewImages>
                {r.images.map((img, idx) => (
                  <img key={idx} src={img} alt="review" />
                ))}
              </ReviewImages>
            )}
          </ReviewCard>
        ))}
      </ReviewList>

      {visibleReviews < reviews.length && (
        <ShowMoreButton onClick={() => setVisibleReviews((prev) => prev + 5)}>
          {t('MOVIE_VIEW_MORE')}
          <ArrowIcon />
        </ShowMoreButton>
      )}
    </Block>
  );
};

export default MovieReviews;

/* ---------------- STYLES ---------------- */
const Block = styled.div`
  margin-top: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.darkTextPrimary};
  border-bottom: 2px solid ${theme.colors.darkBorder};
  padding-bottom: 4px;
  padding-left: 8px;
  border-left: 5px solid ${theme.colors.darkTitleBar};
`;

const ReviewList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ReviewCard = styled.div`
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  background: ${theme.colors.darkCardBg};
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);

  p {
    margin: 0;
    color: ${theme.colors.darkTextPrimary};
    line-height: 1.6;
  }
`;

const ReviewHeader = styled.div`
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

const ReviewImages = styled.div`
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

const ShowMoreButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px; // khoảng cách text & icon
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

const ArrowIcon = styled(FaChevronDown)`
  font-size: 14px;
  transition: transform 0.3s ease;

  ${ShowMoreButton}:hover & {
    transform: translateY(4px); // hiệu ứng di chuyển xuống khi hover
  }
`;


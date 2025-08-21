import React, { useState } from "react";
import styled from "styled-components";
import { useGetAllReviewsQuery } from "@app/services/review.api";
import type { ReviewDto } from "@app/services/review.api";
import { theme } from "@theme/Theme";
import { useTranslation } from "react-i18next";

const ReviewPage: React.FC = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAllReviewsQuery({ page, limit: 6 });

  if (isLoading) return <p>{t("REVIEWS_LOADING")}</p>;

  const reviews: ReviewDto[] = data?.content ?? [];

  return (
    <Container>
      <h1>{t("REVIEWS_TITLE")}</h1>
      <ReviewGrid>
        {reviews.map((review) => (
          <ReviewCard key={review.id}>
            {/* Poster phim */}
            {review.movie?.poster && (
              <Poster src={review.movie.poster} alt={review.movie.name} />
            )}

            {/* Nội dung review */}
            <p className="content">“{review.comment}”</p>

            {/* Thông tin thêm */}
            <div className="meta">
              <span>{review.user?.name ?? t("REVIEWS_ANONYMOUS")}</span>
              <span>⭐ {review.rating}/10</span>
              <span>{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>
          </ReviewCard>
        ))}
      </ReviewGrid>

      {/* Phân trang */}
      <Pagination>
        <button
          disabled={page <= 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          {t("REVIEWS_PREV")}
        </button>
        <span>
          {page} / {data?.totalPages}
        </span>
        <button
          disabled={page >= (data?.totalPages ?? 1)}
          onClick={() => setPage((prev) => prev + 1)}
        >
          {t("REVIEWS_NEXT")}
        </button>
      </Pagination>
    </Container>
  );
};

export default ReviewPage;

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: ${theme.spacing.lg};
`;

const ReviewCard = styled.div`
  border: 1px solid #eee;
  padding: ${theme.spacing.md};
  border-radius: 8px;
  background: #fff;
  transition: transform 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .content {
    font-size: 15px;
    margin-bottom: 8px;
    font-style: italic;
  }

  .meta {
    font-size: 13px;
    color: #666;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const Poster = styled.img`
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 6px;
`;

const Pagination = styled.div`
  margin-top: ${theme.spacing.lg};
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.md};

  button {
    border: 1px solid ${theme.colors.primary};
    padding: 6px 12px;
    background: transparent;
    border-radius: 4px;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      background: ${theme.colors.primary};
      color: #fff;
    }
  }
`;

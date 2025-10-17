import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';
import { FaChevronDown } from 'react-icons/fa';
import { useCreateReviewMutation } from '@app/services/review.api';
import { useSelector } from 'react-redux';
import type { RootState } from '@app/Store';
import { useLoginModal } from '@/contexts/LoginContext';

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  images: string[];
  user: { name: string; avatar: string };
};

export interface MovieReviewsProps {
  reviews: Review[];
  movieId: number; // Thêm movieId để tạo review
}

const formatDateTime = (isoString: string) => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hour}:${minute}`;
};

const MovieReviews: React.FC<MovieReviewsProps> = ({ reviews, movieId }) => {
  const [visibleReviews, setVisibleReviews] = useState(3);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [files, setFiles] = useState<File[]>([]);
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { openLogin } = useLoginModal();

  const [createReview, { isLoading }] = useCreateReviewMutation();

  // Sắp xếp theo thời gian mới nhất
  const sortedReviews = useMemo(() => {
    return [...reviews].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [reviews]);

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    if (!commentText) return;

    const formData = new FormData();
    formData.append('comment', commentText);
    formData.append('rating', rating.toString());
    formData.append('movieId', movieId?.toString());
    files.forEach(file => formData.append('files', file));

    try {
      await createReview(formData).unwrap();
      setCommentText('');
      setRating(5);
      setFiles([]);
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(t('MOVIE_REVIEW_SUBMIT_FAILED'));
    }
  };

  return (
    <Block>
      <SectionTitle>{t('MOVIE_AUDIENCE_REVIEWS')}</SectionTitle>

      {/* Form thêm review */}
      <ReviewForm>
        <FormRow>
          <RatingLabel>{t('MOVIE_REVIEW_RATING')}:</RatingLabel>
          <RatingInput
            type='number'
            min={1}
            max={10}
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
          />
        </FormRow>

        <CommentTextarea
          placeholder={t('MOVIE_REVIEW_PLACEHOLDER')}
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
        />

        <FileInputWrapper>
          <FileInput
            type='file'
            multiple
            accept='.jpg,.jpeg,.png'
            onChange={e => {
              if (!e.target.files) return;

              const selectedFiles = Array.from(e.target.files);

              // Lọc chỉ các file hình hợp lệ
              const allowedTypes = ['image/jpeg', 'image/png'];
              const imageFiles = selectedFiles.filter(file =>
                allowedTypes.includes(file.type)
              );

              if (imageFiles.length < selectedFiles.length) {
                alert('Chỉ chấp nhận file hình: jpg, jpeg, png!');
              }

              setFiles(imageFiles);
            }}
          />
          {files.length > 0 && (
            <FilePreview>
              {files.map((file, idx) => (
                <FileItem key={idx}>{file.name}</FileItem>
              ))}
            </FilePreview>
          )}
        </FileInputWrapper>

        <SubmitButton
          disabled={isLoading || !commentText}
          onClick={handleSubmit}
        >
          {t('MOVIE_REVIEW_SUBMIT')}
        </SubmitButton>
      </ReviewForm>

      <ReviewList>
        {sortedReviews.slice(0, visibleReviews).map(r => (
          <ReviewCard key={r.id}>
            <ReviewHeader>
              <img src={r.user.avatar} alt={r.user.name} />
              <strong>{r.user.name}</strong>
              <span>⭐ {r.rating}</span>
            </ReviewHeader>
            <CommentTime>{formatDateTime(r.createdAt)}</CommentTime>
            <p>{r.comment}</p>
            {r.images?.length > 0 && (
              <ReviewImages>
                {r.images.map((img, idx) => (
                  <img key={idx} src={img} alt='review' />
                ))}
              </ReviewImages>
            )}
          </ReviewCard>
        ))}
      </ReviewList>

      {visibleReviews < sortedReviews.length && (
        <ShowMoreButton onClick={() => setVisibleReviews(prev => prev + 5)}>
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

const SubmitButton = styled.button`
  padding: 8px 16px;
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  font-weight: 600;
  border: none;
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  transition: background 0.25s ease;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &:hover:enabled {
    background: ${theme.colors.primaryHoverGradient};
  }
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
  margin-bottom: ${theme.spacing.xs};

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

const CommentTime = styled.span`
  display: block;
  font-size: 0.8rem;
  color: ${theme.colors.darkTextSecondary};
  margin-bottom: ${theme.spacing.xs};
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
  gap: 8px;
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
    transform: translateY(4px);
  }
`;

const ReviewForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  background: ${theme.colors.darkCardBg};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const RatingLabel = styled.span`
  font-weight: 500;
  color: ${theme.colors.darkTextPrimary};
`;

const RatingInput = styled.input`
  width: 40px;
  padding: 6px 8px;
  border-radius: ${theme.borderRadius.small};
  border: 1px solid rgba(255, 255, 255, 0.3); /* sáng hơn nền */
  background: ${theme.colors.darkCardBg};
  color: #f0f0f0; /* text sáng */
  font-size: 0.95rem;
  text-align: center;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

  &:focus {
    border-color: #3b82f6; /* màu xanh dương nổi bật */
    box-shadow: 0 0 6px 2px rgba(59, 130, 246, 0.5); /* glow xanh dương */
    outline: none;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5); /* placeholder nhẹ */
  }
`;

const CommentTextarea = styled.textarea`
  resize: vertical;
  min-height: 100px;
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  border: 1px solid rgba(255, 255, 255, 0.3); /* sáng hơn */
  background: ${theme.colors.darkCardBg};
  color: #f0f0f0;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 6px 2px rgba(59, 130, 246, 0.5);
    outline: none;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FileInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const FileInput = styled.input`
  margin-top: 4px;
`;

const FilePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
`;

const FileItem = styled.span`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  padding: 2px 6px;
  border-radius: ${theme.borderRadius.small};
  font-size: 0.8rem;
`;

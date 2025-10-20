import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';
import { FaChevronDown } from 'react-icons/fa';
import {
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} from '@app/services/review.api';
import { useSelector } from 'react-redux';
import type { RootState } from '@app/Store';
import { useLoginModal } from '@/contexts/LoginContext';
import ErrorModal from './ReviewModal/ErrorModal';
import ConfirmDeleteModal from './ReviewModal/ConfirmDeleteModal';
import EditReviewModal from './ReviewModal/EditReviewModal';
import { FiUpload } from 'react-icons/fi';

type Review = {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  images: string[];
  user: { id: number; name: string; avatar: string };
  feeling: string[];
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
  const { isAuthenticated, auth: user } = useSelector(
    (state: RootState) => state.auth
  );
  const currentUserId = user?.id;

  const [visibleReviews, setVisibleReviews] = useState(3);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [files, setFiles] = useState<File[]>([]);
  const { t } = useTranslation();
  const { openLogin } = useLoginModal();

  const [createReview, { isLoading }] = useCreateReviewMutation();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [reviewToEdit, setReviewToEdit] = useState<Review | null>(null);

  // Sắp xếp theo thời gian mới nhất
  const sortedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (
        String(a.user.id) === String(currentUserId) &&
        String(b.user.id) !== String(currentUserId)
      )
        return -1;
      if (
        String(b.user.id) === String(currentUserId) &&
        String(a.user.id) !== String(currentUserId)
      )
        return 1;

      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [reviews, currentUserId]);

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      openLogin();
      return;
    }

    if (!commentText) return;

    const formData = new FormData();
    formData.append('userId', String(currentUserId));
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
    } catch (err: any) {
      console.error(err);

      const message = err?.data?.message || t('MOVIE_REVIEW_SUBMIT_FAILED');
      setErrorMsg(message);
    }
  };

  const [updateReview] = useUpdateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const handleEdit = (review: Review) => {
    setReviewToEdit(review);
    setShowEditModal(true);
  };

  const handleDelete = (review: Review) => {
    setReviewToDelete(review);
    setShowDeleteModal(true);
  };

  const StarContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 5px;
    flex-wrap: wrap;
  `;

  const Star = styled.span<{ filled: boolean }>`
    font-size: 22px;
    cursor: pointer;
    color: ${({ filled }) => (filled ? '#facc15' : '#475569')};
    text-shadow: ${({ filled }) =>
      filled ? '0 0 8px rgba(250, 204, 21, 0.6)' : 'none'};
    transition: all 0.25s ease;

    &:hover {
      transform: scale(1.2);
      color: #fde047;
    }
  `;

  const RatingInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 6px;
  `;

  const RatingText = styled.span`
    font-size: 0.95rem;
    font-weight: 600;
    color: #f1f5f9;
  `;

  const FeelingText = styled.span`
    font-size: 0.9rem;
    color: #94a3b8;
  `;

  const StarRating: React.FC<{
    rating: number;
    setRating: (r: number) => void;
  }> = ({ rating, setRating }) => {
    const [hover, setHover] = useState(0);
    const labels = [
      t('REVIEW_LABEL_1'),
      t('REVIEW_LABEL_2'),
      t('REVIEW_LABEL_3'),
      t('REVIEW_LABEL_4'),
      t('REVIEW_LABEL_5'),
      t('REVIEW_LABEL_6'),
      t('REVIEW_LABEL_7'),
      t('REVIEW_LABEL_8'),
      t('REVIEW_LABEL_9'),
      t('REVIEW_LABEL_10'),
    ];

    return (
      <>
        <StarContainer>
          {Array.from({ length: 10 }, (_, i) => (
            <Star
              key={i}
              filled={i < (hover || rating)}
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHover(i + 1)}
              onMouseLeave={() => setHover(0)}
              title={labels[i]}
            >
              ★
            </Star>
          ))}
        </StarContainer>
        <RatingInfo>
          <RatingText>{rating}/10</RatingText>
          <FeelingText>
            {labels[(hover || rating) - 1] || 'Chưa đánh giá'}
          </FeelingText>
        </RatingInfo>
      </>
    );
  };

  return (
    <Block>
      <ErrorModal
        isOpen={!!errorMsg}
        message={errorMsg}
        onClose={() => setErrorMsg('')}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={async () => {
          if (!isAuthenticated) {
            openLogin();
            return;
          }

          try {
            const reviewId = reviewToDelete?.id;
            if (!reviewId) return;
            await deleteReview(reviewId).unwrap();
            setShowDeleteModal(false);
            window.location.reload();
          } catch (err: any) {
            console.error(err);
            setErrorMsg(err?.data?.message || t('MOVIE_REVIEW_DELETE_FAILED'));
          }
        }}
      />

      <EditReviewModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={async (newComment, newRating, newFiles) => {
          try {
            const formData = new FormData();
            formData.append('movieId', movieId.toString());
            formData.append('comment', newComment);
            formData.append('rating', newRating.toString());
            formData.append('feeling', JSON.stringify([]));

            if (newFiles && newFiles.length > 0) {
              newFiles.forEach((file: File) => formData.append('files', file));
            }

            await updateReview(formData).unwrap();
            window.location.reload();
          } catch {
            alert(t('MOVIE_REVIEW_UPDATE_FAILED'));
          }
        }}
        initialComment={reviewToEdit?.comment || ''}
        initialRating={reviewToEdit?.rating || 5}
      />

      <SectionTitle>{t('MOVIE_AUDIENCE_REVIEWS')}</SectionTitle>

      {/* Form thêm review */}
      <ReviewForm>
        <FormRow>
          <RatingLabel>{t('MOVIE_REVIEW_RATING')}:</RatingLabel>
          <StarRating rating={rating} setRating={setRating} />
        </FormRow>

        <CommentTextarea
          placeholder={t('MOVIE_REVIEW_PLACEHOLDER')}
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
        />

        <FileInputWrapper>
          <label htmlFor='reviewFile'>
            <FiUpload size={18} style={{ marginRight: 6 }} />
            {t('MOVIE_REVIEW_CHOOSE_FILE')}
          </label>

          <FileInput
            id='reviewFile'
            type='file'
            multiple
            accept='.jpg,.jpeg,.png'
            onChange={e => {
              if (!e.target.files) return;

              const selectedFiles = Array.from(e.target.files);
              const allowedTypes = ['image/jpeg', 'image/png'];
              const imageFiles = selectedFiles.filter(file =>
                allowedTypes.includes(file.type)
              );

              if (imageFiles.length < selectedFiles.length) {
                alert('Chỉ chấp nhận file hình: jpg, jpeg, png!');
              }

              setFiles(prev => {
                const names = new Set(prev.map(f => f.name));
                const merged = [
                  ...prev,
                  ...imageFiles.filter(f => !names.has(f.name)),
                ];
                return merged;
              });

              e.target.value = '';
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
            <CommentTime>{formatDateTime(r.updatedAt)}</CommentTime>
            <p>{r.comment}</p>
            {r.images?.length > 0 && (
              <ReviewImages>
                {r.images.map((img, idx) => (
                  <img key={idx} src={img} alt='review' />
                ))}
              </ReviewImages>
            )}
            {String(r.user.id) === String(currentUserId) && (
              <ActionButtons>
                <EditButton onClick={() => handleEdit(r)}>Edit</EditButton>
                <DeleteButton onClick={() => handleDelete(r)}>
                  Delete
                </DeleteButton>
              </ActionButtons>
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
  background: rgba(30, 41, 59, 0.75); /* nền tối mờ hơn */
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(6px);
`;

const FormRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const RatingLabel = styled.span`
  font-weight: 600;
  color: #e2e8f0;
`;

const CommentTextarea = styled.textarea`
  resize: vertical;
  min-height: 100px;
  padding: ${theme.spacing.sm};
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(15, 23, 42, 0.7);
  color: #f8fafc;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 6px rgba(59, 130, 246, 0.4);
    outline: none;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const FileInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;

  label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: rgba(51, 65, 85, 0.8);
    color: #cbd5e1;
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 8px 14px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    width: fit-content;
    transition: all 0.25s ease;

    &:hover {
      background: rgba(71, 85, 105, 0.9);
      color: #fff;
      transform: translateY(-1px);
    }

    svg {
      font-size: 16px;
    }
  }
`;

const FileInput = styled.input`
  display: none;
`;

const FilePreview = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
`;

const FileItem = styled.span`
  background: rgba(59, 130, 246, 0.25);
  color: #93c5fd;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  border: 1px solid rgba(59, 130, 246, 0.4);
`;

const SubmitButton = styled.button`
  align-self: flex-end;
  padding: 8px 16px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover:enabled {
    background: linear-gradient(90deg, #01274c, #2b4dad);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ActionButtons = styled.div`
  position: absolute;
  bottom: 10px;
  right: 12px;
  display: flex;
  gap: 8px;
`;

const EditButton = styled.button`
  padding: 6px 12px;
  background: rgba(59, 130, 246, 0.15); /* xanh lam mờ */
  color: #cbd5e1; /* xám sáng nhẹ */
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(59, 130, 246, 0.25);
    color: #e2e8f0;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  background: rgba(239, 68, 68, 0.15); /* đỏ rượu trầm mờ */
  color: #fca5a5; /* đỏ nhạt */
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.25);
    color: #fecaca;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }
`;

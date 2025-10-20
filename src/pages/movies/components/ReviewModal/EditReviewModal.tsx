import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiUpload } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

interface EditReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (comment: string, rating: number, files: File[]) => void;
  initialComment: string;
  initialRating: number;
}

const EditReviewModal: React.FC<EditReviewModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialComment,
  initialRating,
}) => {
  const { t } = useTranslation();
  const [comment, setComment] = useState(initialComment);
  const [rating, setRating] = useState(initialRating);
  const [files, setFiles] = useState<File[]>([]);
  const [hover, setHover] = useState(0);

  useEffect(() => {
    setComment(initialComment);
    setRating(initialRating);
  }, [initialComment, initialRating]);

  if (!isOpen) return null;

  return (
    <Backdrop>
      <Modal>
        <h3>{t('EDIT_REVIEW_TITLE')}</h3>

        <Label>{t('EDIT_REVIEW_RATING')}:</Label>
        <StarRating>
          {Array.from({ length: 10 }, (_, i) => (
            <Star
              key={i}
              filled={i < (hover || rating)}
              onClick={() => setRating(i + 1)}
              onMouseEnter={() => setHover(i + 1)}
              onMouseLeave={() => setHover(0)}
            >
              ★
            </Star>
          ))}
          <RatingText>{rating}/10</RatingText>
        </StarRating>

        <Label>{t('EDIT_REVIEW_COMMENT')}</Label>
        <Textarea value={comment} onChange={e => setComment(e.target.value)} />

        <FileInputWrapper>
          <label htmlFor='editFiles'>
            <FiUpload size={18} />
            {t('EDIT_REVIEW_ADD_IMAGES')}
          </label>
          <input
            id='editFiles'
            type='file'
            multiple
            accept='.jpg,.jpeg,.png'
            onChange={e => {
              if (!e.target.files) return;
              const selected = Array.from(e.target.files);
              const valid = selected.filter(f =>
                ['image/jpeg', 'image/png'].includes(f.type)
              );

              setFiles(prev => {
                const names = new Set(prev.map(f => f.name));
                const merged = [
                  ...prev,
                  ...valid.filter(f => !names.has(f.name)),
                ];
                return merged;
              });

              e.target.value = '';
            }}
          />
          {files.length > 0 && (
            <Preview>
              {files.map((f, i) => (
                <FileItem key={i}>
                  <span>{f.name}</span>
                  <RemoveButton
                    onClick={() =>
                      setFiles(files.filter((_, idx) => idx !== i))
                    }
                  >
                    ×
                  </RemoveButton>
                </FileItem>
              ))}
            </Preview>
          )}
        </FileInputWrapper>

        <ButtonRow>
          <CancelButton
            onClick={() => {
              setComment(initialComment);
              setRating(initialRating);
              setFiles([]);
              onClose();
            }}
          >
            {t('CANCEL')}
          </CancelButton>

          <SaveButton
            disabled={
              comment.trim() === '' ||
              (comment.trim() === initialComment.trim() &&
                rating === initialRating &&
                files.length === 0)
            }
            onClick={() => onSave(comment, rating, files)}
          >
            {t('SAVE_CHANGES')}
          </SaveButton>
        </ButtonRow>
      </Modal>
    </Backdrop>
  );
};

export default EditReviewModal;

// --- styles ---
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
`;

const Modal = styled.div`
  background: rgba(30, 41, 59, 0.95);
  padding: 24px;
  border-radius: 10px;
  width: 380px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);

  h3 {
    margin-top: 0;
    margin-bottom: 12px;
    color: #f1f5f9;
    text-align: center;
  }
`;

const Label = styled.label`
  display: block;
  color: #cbd5e1;
  margin: 8px 0 4px;
  font-size: 0.9rem;
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(15, 23, 42, 0.7);
  color: #f8fafc;
  padding: 8px;
  resize: vertical;
`;

const FileInputWrapper = styled.div`
  margin-top: 10px;

  label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(51, 65, 85, 0.8);
    color: #cbd5e1;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
  }

  input {
    display: none;
  }
`;

const ButtonRow = styled.div`
  margin-top: 14px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const CancelButton = styled.button`
  background: rgba(71, 85, 105, 0.8);
  border: none;
  color: #e2e8f0;
  border-radius: 6px;
  padding: 8px 14px;
  cursor: pointer;
  &:hover {
    background: rgba(100, 116, 139, 0.9);
  }
`;

const SaveButton = styled.button<{ disabled?: boolean }>`
  background: ${({ disabled }) =>
    disabled
      ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
      : 'linear-gradient(135deg, #3b82f6, #1d4ed8)'};
  border: none;
  color: white;
  border-radius: 6px;
  padding: 8px 14px;
  font-weight: 600;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ disabled }) => (disabled ? 0.85 : 1)};
  transition:
    background 0.25s ease,
    opacity 0.25s ease;

  &:hover {
    background: ${({ disabled }) =>
      disabled
        ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
        : 'linear-gradient(135deg, #60a5fa, #2563eb)'};
  }
`;
const Preview = styled.div`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 150px;
  overflow-y: auto;
`;

const FileItem = styled.div`
  background: rgba(51, 65, 85, 0.6);
  color: #93c5fd;
  font-size: 0.85rem;
  padding: 6px 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: #f87171;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  margin-left: 10px;
  &:hover {
    color: #ef4444;
  }
`;

const StarRating = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
  margin-bottom: 8px;
`;

const Star = styled.span<{ filled: boolean }>`
  font-size: 20px;
  cursor: pointer;
  color: ${({ filled }) => (filled ? '#facc15' : '#475569')};
  transition: color 0.2s ease;

  &:hover {
    color: #fde047;
    transform: scale(1.15);
  }
`;

const RatingText = styled.span`
  color: #cbd5e1;
  font-size: 0.9rem;
  margin-left: 8px;
`;

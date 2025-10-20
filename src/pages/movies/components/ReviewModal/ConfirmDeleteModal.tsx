import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <Backdrop>
      <Modal>
        <h3>{t('CONFIRM_DELETE_REVIEW_TITLE')}</h3>
        <p>{t('CONFIRM_DELETE_REVIEW_MESSAGE')}</p>
        <ButtonRow>
          <CancelButton onClick={onClose}>{t('CANCEL')}</CancelButton>
          <ConfirmButton onClick={onConfirm}>{t('DELETE')}</ConfirmButton>
        </ButtonRow>
      </Modal>
    </Backdrop>
  );
};

export default ConfirmDeleteModal;

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
  padding: 20px 24px;
  border-radius: 10px;
  width: 320px;
  text-align: center;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);

  h3 {
    margin-bottom: 8px;
    color: #f1f5f9;
  }

  p {
    color: #cbd5e1;
    margin-bottom: 16px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
`;

const CancelButton = styled.button`
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  background: rgba(71, 85, 105, 0.8);
  color: #e2e8f0;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(100, 116, 139, 0.9);
  }
`;

const ConfirmButton = styled.button`
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  background: linear-gradient(135deg, #dc2626, #991b1b);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(135deg, #ef4444, #b91c1c);
    transform: translateY(-1px);
  }
`;

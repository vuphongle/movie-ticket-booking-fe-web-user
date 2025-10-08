import React from 'react';
import styled from 'styled-components';
import ModalBase from '@components/base/ModalBase';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';

interface ExpireModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpireModal: React.FC<ExpireModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <ModalBase
      isOpen={isOpen}
      size="xs"
      onClose={onClose}
      hideCloseButton={true}
    >
      <ModalContent>
        <ModalTitle>{t('TIME_EXPIRED_TITLE', 'Hết thời gian giữ ghế')}</ModalTitle>
        <ModalBody>
          {t('TIME_EXPIRED_BODY', 'Rất tiếc, thời gian giữ ghế của bạn đã hết.')}
        </ModalBody>
        <ModalDescription>
          {t('TIME_EXPIRED_DESC', 'Vui lòng chọn lại ghế để tiếp tục đặt vé.')}
        </ModalDescription>
        <ModalFooter>
          <ConfirmButton onClick={onClose}>
            {t('CONFIRM', 'OK')}
          </ConfirmButton>
        </ModalFooter>
      </ModalContent>
    </ModalBase>
  );
};

/* ===== styled ===== */
const ModalContent = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
  background: red;
  padding: 5px 10px;
  border-radius: 4px;
`;

const ModalBody = styled.div`
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  font-weight: 500;
`;

const ModalDescription = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  margin-bottom: 12px;
  font-style: italic;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
`;

const ConfirmButton = styled.button`
  padding: 8px 16px;
  background: ${theme.colors.primaryHoverGradient};
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition:
    background 0.12s ease,
    transform 0.12s ease;
  &:hover {
    filter: brightness(1.05);
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(1px);
  }
`;

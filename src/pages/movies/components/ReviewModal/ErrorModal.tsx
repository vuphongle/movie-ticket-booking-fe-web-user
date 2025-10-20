import React from 'react';
import styled from 'styled-components';
import ModalBase from '@components/base/ModalBase';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';
import WarningIcon from '@assets/image/icons/warning-icon.png';

interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, message, onClose }) => {
  const { t } = useTranslation();

  return (
    <ModalBase
      isOpen={isOpen}
      size="xs"
      onClose={onClose}
      hideCloseButton={true}
    >
      <ModalContent>
        <Icon src={WarningIcon} alt="warning" />
        <ModalTitle>{t('NOTIFICATION') || 'Thông báo'}</ModalTitle>
        <ModalBody>{message}</ModalBody>
        <ModalFooter>
          <CloseButton onClick={onClose}>{t('CONFIRM') || 'Đóng'}</CloseButton>
        </ModalFooter>
      </ModalContent>
    </ModalBase>
  );
};

export default ErrorModal;

/* ===== styled ===== */

const ModalContent = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const ModalTitle = styled.h3`
  margin: 0;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  border-radius: 4px;
`;

const ModalBody = styled.div`
  font-size: 14px;
  color: ${theme.colors.textPrimary};
  line-height: 1.5;
  padding: 0 8px;
  font-weight: 500;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const CloseButton = styled.button`
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
    filter: brightness(1.03);
    transform: translateY(-1px);
    background: ${theme.colors.primaryHover};
  }

  &:active {
    transform: translateY(1px);
  }
`;

const Icon = styled.img`
  width: 48px;
  height: 48px;
`;

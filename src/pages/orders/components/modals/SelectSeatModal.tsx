import React from 'react';
import styled from 'styled-components';
import ModalBase from '@components/base/ModalBase';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';
import WarningIcon from '@assets/image/icons/warning-icon.png';

interface SelectSeatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SelectSeatModal: React.FC<SelectSeatModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();

  return (
    <ModalBase
      isOpen={isOpen}
      size='xs'
      onClose={onClose}
      hideCloseButton={true}
    >
      <ModalContent>
        <Icon src={WarningIcon} alt='warning' />
        <ModalTitle>{t('SELECT_SEAT_TITLE')}</ModalTitle>
        <ModalBody>{t('SELECT_SEAT_CONTENT')}</ModalBody>
        <ModalFooter>
          <CloseButton onClick={onClose}>{t('CLOSE')}</CloseButton>
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
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;

const ModalBody = styled.div`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  line-height: 1.5;
  padding: 0 8px;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: center;
`;

const CloseButton = styled.button`
  padding: 8px 16px;
  margin-top: 8px;
  background: ${theme.colors.primaryHoverGradient};
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.9;
  }
`;

const Icon = styled.img`
  width: 48px;
  height: 48px;
`;

import React from 'react';
import styled from 'styled-components';
import ModalBase from '@components/base/ModalBase';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';

interface AgeConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onReject: () => void;
  age: string;
}

export const AgeConfirmModal: React.FC<AgeConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onReject,
  age,
}) => {
  const { t } = useTranslation();

  const ageNumber = age.startsWith('T') ? age.slice(1) : '0';

  return (
    <ModalBase
      isOpen={isOpen}
      size='xs'
      onClose={onReject}
      hideCloseButton={true}
    >
      <ModalContent>
        <ModalTitle>{`${age}`}</ModalTitle>
        <ModalBody>{t('AGE_CONFIRM_BODY', { age })}</ModalBody>
        <ModalDescription>
          {t('AGE_CONFIRM_DESCRIPTION', { ageNumber })}
        </ModalDescription>
        <ModalFooter>
          <RejectButton onClick={onReject}>{t('DECLINE')}</RejectButton>
          <ConfirmButton onClick={onConfirm}>{t('CONFIRM')}</ConfirmButton>
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
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  background: red;
  padding: 5px 9px;
  border-radius: 4px;
`;

const ModalBody = styled.div`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  line-height: 1.5;
  padding: 0 8px;
  font-weight: bold;
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
    filter: brightness(1.03);
    transform: translateY(-1px);
    background: ${theme.colors.primaryHover};
  }
  &:active {
    transform: translateY(1px);
  }
`;

const RejectButton = styled.button`
  padding: 8px 16px;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.closeButtonBg};
  color: ${theme.colors.textPrimary};
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition:
    background 0.12s ease,
    transform 0.12s ease;
  &:hover {
    background: ${theme.colors.closeButtonBgHover};
    transform: translateY(-1px);
  }
  &:active {
    transform: translateY(1px);
  }
`;

const ModalDescription = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  line-height: 1.4;
  padding: 0;
  margin-bottom: 8px;
  font-style: italic;
`;

import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';

import ModalBase from '@components/base/ModalBase';
import { theme } from '@theme/Theme';

type ShowSuccessModalProps = {
  open: boolean;
  onClose: () => void;
  titleKey?: string;
  descriptionKey?: string;
};

const ShowSuccessModal: React.FC<ShowSuccessModalProps> = ({
  open,
  onClose,
  titleKey = 'MESSAGES_LOGIN_SUCCESS',
  descriptionKey,
}) => {
  const { t } = useTranslation();

  return (
    <ModalBase
      isOpen={open}
      onClose={onClose}
      size='xs'
      zIndex={1080}
    >
      <Wrapper>
        <IconWrapper>
          <SuccessIcon viewBox='0 0 120 120' aria-hidden>
            <circle className='circle' cx='60' cy='60' r='46' />
            <path className='check' d='M40 62 L54 74 L82 46' />
          </SuccessIcon>
        </IconWrapper>

        <Header>
          <Title>{t(titleKey)}</Title>
        </Header>

        {descriptionKey && <Description>{t(descriptionKey)}</Description>}

        <Actions>
          <ConfirmButton type='button' onClick={onClose}>
            {t('BUTTONS_SUBMIT')}
          </ConfirmButton>
        </Actions>
      </Wrapper>
    </ModalBase>
  );
};

export default ShowSuccessModal;

const Wrapper = styled.div`
  padding: ${theme.spacing.lg};
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${theme.spacing.md};
`;

const dashDraw = keyframes`
  0% { stroke-dashoffset: 280; }
  100% { stroke-dashoffset: 0; }
`;

const scaleIn = keyframes`
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const SuccessIcon = styled.svg`
  width: 60px;
  height: 60px;
  .circle {
    fill: none;
    stroke: #22c55e;
    stroke-width: 10;
    stroke-linecap: round;
    opacity: 0.2;
    animation: ${scaleIn} 900ms ease-out both;
  }
  .check {
    fill: none;
    stroke: #22c55e;
    stroke-width: 10;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 280;
    stroke-dashoffset: 280;
    animation: ${dashDraw} 600ms ease-out 120ms forwards;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  justify-content: center;
  margin-bottom: ${theme.spacing.md};
`;

const Title = styled.h2`
  margin: 0;
  color: ${theme.colors.textPrimary};
  font-size: ${theme.fontSize.xl};
  font-weight: 700;
  text-align: center;
`;

const Description = styled.p`
  margin: 0 0 ${theme.spacing.lg};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSize.sm};
  text-align: center;
`;

const Actions = styled.div`
  display: flex;
  justify-content: center;
`;

const ConfirmButton = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: none;
  border-radius: ${theme.borderRadius.large};
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  font-weight: 600;
  font-size: ${theme.fontSize.sm};
  cursor: pointer;

  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

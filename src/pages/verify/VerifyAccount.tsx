import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import styled, { keyframes } from 'styled-components';
import { theme } from '@theme/Theme';
import { useVerifyAccountMutation } from '@app/services/auth.api';
import { FaCheckCircle } from 'react-icons/fa';

const VerifyAccount: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [verifyAccount] = useVerifyAccountMutation();

  useEffect(() => {
    if (token) {
      verifyAccount(token)
        .unwrap()
        .catch((err) =>
          toast.error(err?.data?.message || t('messages.error'))
        );
    }
  }, [token, verifyAccount, t]);

  return (
    <PageWrapper>
      <Card>
        <IconWrapper>
          <FaCheckCircle size={70} color={theme.colors.success || '#4caf50'} />
        </IconWrapper>
        <Title>{t('verify_success_title')}</Title>
        <Message>{t('verify_success_message')}</Message>
        <BackButton onClick={() => navigate('/')}>
          {t('verify_back_home')}
        </BackButton>
      </Card>
    </PageWrapper>
  );
};

export default VerifyAccount;

// Animation
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background: linear-gradient(135deg, #6dd5ed, #2193b0);
`;

const Card = styled.div`
  max-width: 420px;
  width: 100%;
  padding: 32px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${fadeInUp} 0.6s ease-out;
`;

const IconWrapper = styled.div`
  margin-bottom: 16px;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 12px;
  font-weight: 700;
  font-size: 1.5rem;
  color: ${theme.colors.textPrimary || '#111'};
`;

const Message = styled.p`
  font-size: 1rem;
  color: ${theme.colors.textSecondary || '#555'};
  text-align: center;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  background-color: ${theme.colors.primary || '#2193b0'};
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.25s ease;

  &:hover {
    background-color: ${theme.colors.primaryHover || '#176b85'};
  }
`;

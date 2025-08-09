import { theme } from '@theme/Theme';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const VerifyAccountPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <PageWrapper>
      <Content>
        <Title>{t('verify.success_title')}</Title>
        <Message>{t('verify.success_message')}</Message>
      </Content>
    </PageWrapper>
  );
};

export default VerifyAccountPage;

const PageWrapper = styled.div`
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  background-color: ${theme.colors.background || '#f5f5f5'};
`;

const Content = styled.div`
  max-width: 400px;
  padding: 24px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 0 10px rgb(0 0 0 / 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 16px;
  font-weight: 700;
  font-size: 1.5rem;
  color: ${theme.colors.textPrimary || '#111'};
`;

const Message = styled.p`
  font-size: 1rem;
  color: ${theme.colors.textPrimary || '#111'};
  text-align: center;
`;

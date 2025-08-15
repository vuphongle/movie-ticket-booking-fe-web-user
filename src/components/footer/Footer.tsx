import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ContentWrapper from '@components/base/ContentWrapper';
import { theme } from '@theme/Theme';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <FooterContainer>
      <ContentWrapper>
        {/* Phần mới phía trên footer */}
        <TopContent>
          <Column>
            <Title>{t('footer_customer_care')}</Title>
            <div>{t('footer_address')}</div>
            <div>{t('footer_hotline')}</div>
            <div>{t('footer_email')}</div>
          </Column>

          <Column>
            <Title>{t('footer_buy_ticket')}</Title>
            <div>{t('footer_cinema')}</div>
            <div>{t('footer_movie')}</div>
            <div>{t('footer_review')}</div>
            <div>{t('footer_blog')}</div>
          </Column>

          <Column>
            <Title>{t('footer_terms')}</Title>
            <div>{t('footer_dmca')}</div>
            <div>{t('footer_contact')}</div>
            <div>{t('footer_privacy')}</div>
            <div>{t('footer_terms_of_service')}</div>
          </Column>

          <Column>
            <Title>{t('footer_connect')}</Title>
            <SocialIcons>
              <a href="#" target="_blank">FB</a>
              <a href="#" target="_blank">LinkedIn</a>
              <a href="#" target="_blank">YouTube</a>
            </SocialIcons>
          </Column>
        </TopContent>

        <Divider />

        {/* Footer gốc */}
        <FooterContent>
          <span>{t('footer_terms')}</span>
          <span>{t('footer_privacy')}</span>
          <span>{t('footer_copyright')}</span>
        </FooterContent>
      </ContentWrapper>
    </FooterContainer>
  );
}

const FooterContainer = styled.footer`
  width: 100%;
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  border-top: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.lg} 0;
`;

const TopContent = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 32px;
  margin-bottom: ${theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Title = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  color: ${theme.colors.white};
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 8px;

  a {
    text-decoration: none;
    color: ${theme.colors.white};
    font-weight: bold;
    transition: color 0.2s;

    &:hover {
      color: ${theme.colors.primaryHover};
    }
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${theme.colors.border};
  margin-bottom: ${theme.spacing.md};
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.md};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};

  span {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: ${theme.colors.textPrimaryHover};
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

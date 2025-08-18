import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ContentWrapper from '@components/base/ContentWrapper';
import { theme } from '@theme/Theme';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <FooterContainer>
      <ContentWrapper>
        <TopContent>
          <Column>
            <Title>{t('FOOTER_CUSTOMER_CARE')}</Title>
            <div>{t('FOOTER_ADDRESS')}</div>
            <div>{t('FOOTER_HOTLINE')}</div>
            <div>{t('FOOTER_EMAIL')}</div>
          </Column>

          <Column>
            <Title>{t('FOOTER_BUY_TICKET')}</Title>
            <div>{t('FOOTER_CINEMA')}</div>
            <div>{t('FOOTER_MOVIE')}</div>
            <div>{t('FOOTER_REVIEW')}</div>
            <div>{t('FOOTER_BLOG')}</div>
          </Column>

          <Column>
            <Title>{t('FOOTER_TERMS')}</Title>
            <div>{t('FOOTER_DMCA')}</div>
            <div>{t('FOOTER_CONTACT')}</div>
            <div>{t('FOOTER_PRIVACY')}</div>
            <div>{t('FOOTER_TERMS_OF_SERVICE')}</div>
          </Column>

          <Column>
            <Title>{t('FOOTER_CONNECT')}</Title>
            <SocialIcons>
              <a href='#' target='_blank'>
                FB
              </a>
              <a href='#' target='_blank'>
                LinkedIn
              </a>
              <a href='#' target='_blank'>
                YouTube
              </a>
            </SocialIcons>
          </Column>
        </TopContent>

        <Divider />
        <FooterContent>
          <span>{t('FOOTER_TERMS')}</span>
          <span>{t('FOOTER_PRIVACY')}</span>
          <span>{t('FOOTER_COPYRIGHT')}</span>
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
  padding: ${theme.spacing.sm};
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
  margin-left: ${theme.spacing.sm};
  margin-right: ${theme.spacing.sm};
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.md};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
  padding: ${theme.spacing.sm};

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

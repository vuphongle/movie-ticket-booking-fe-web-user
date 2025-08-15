import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import ContentWrapper from '@components/base/ContentWrapper';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <FooterContainer>
      <ContentWrapper>
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
  background: #fff;
  border-top: 1px solid #eee;
  padding: 23px 0;
`;

const FooterContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #6b7280;

  span {
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #111827;
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
  }
`;

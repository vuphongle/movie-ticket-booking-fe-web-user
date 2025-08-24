import styled from "styled-components";
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';

export default function QuickBookingComponent() {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <Title>{t('QUICKBOOKING_TITLE')}</Title>
      <Form>
        <Select>
          <option>1. {t('QUICKBOOKING_SELECT_CINEMA')}</option>
        </Select>
        <Select>
          <option>2. {t('QUICKBOOKING_SELECT_MOVIE')}</option>
        </Select>
        <Select>
          <option>3. {t('QUICKBOOKING_SELECT_DATE')}</option>
        </Select>
        <Select>
          <option>4. {t('QUICKBOOKING_SELECT_TIME')}</option>
        </Select>
        <Button>{t('QUICKBOOKING_BUTTON_BOOK')}</Button>
      </Form>
    </Wrapper>
  );
}

/* Styled */
const Wrapper = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  background: ${theme.colors.bgLight};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const Title = styled.h3`
  font-size: ${theme.fontSize.lg};
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  white-space: nowrap;
`;

const Form = styled.div`
  display: flex;
  flex: 1;
  min-width: 0; /* fix tràn ngang */
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;

  @media (max-width: 767px) {
    flex-direction: column;
  }
`;

const Select = styled.select`
  flex: 1;
  min-width: 0; /* fix tràn ngang khi co hẹp */
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textPrimary};
  background: ${theme.colors.white};
  outline: none;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: ${theme.colors.backgroundHover};
  }

  &:focus {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.white};
  }
`;

const Button = styled.button`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  font-weight: 600;
  font-size: ${theme.fontSize.md};
  border: none;
  border-radius: ${theme.borderRadius.small};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  cursor: pointer;
  min-width: 120px;
  transition: all 0.3s;

  &:hover {
    background: ${theme.colors.primaryHover};
  }

  &:active {
    background: ${theme.colors.primaryHoverGradient};
  }
`;

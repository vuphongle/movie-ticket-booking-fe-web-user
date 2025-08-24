import styled from "styled-components";
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';

export default function QuickBookingComponent() {
  const { t } = useTranslation();

  return (
    <Wrapper>
      <Form>
        <SelectWrapper>
          <StepBadge>1</StepBadge>
          <Select>
            <option>{t('QUICKBOOKING_SELECT_CINEMA')}</option>
          </Select>
        </SelectWrapper>

        <SelectWrapper>
          <StepBadge>2</StepBadge>
          <Select>
            <option>{t('QUICKBOOKING_SELECT_MOVIE')}</option>
          </Select>
        </SelectWrapper>

        <SelectWrapper>
          <StepBadge>3</StepBadge>
          <Select>
            <option>{t('QUICKBOOKING_SELECT_DATE')}</option>
          </Select>
        </SelectWrapper>

        <SelectWrapper>
          <StepBadge>4</StepBadge>
          <Select>
            <option>{t('QUICKBOOKING_SELECT_TIME')}</option>
          </Select>
        </SelectWrapper>

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

  background: linear-gradient(135deg, #6d5edc, #2193b0);
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

const Form = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;

  @media (max-width: 767px) {
    flex-direction: column;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

const StepBadge = styled.span`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #6d5edc, #2193b0);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Select = styled.select`
  flex: 1;
  min-width: 0;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  padding-left: 36px;\
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textPrimary};
  background: ${theme.colors.white};
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.backgroundHover};
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  }

  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(109, 94, 220, 0.25);
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
    background: ${theme.colors.primaryHoverGradient};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    background: ${theme.colors.primaryHoverGradient};
  }
`;

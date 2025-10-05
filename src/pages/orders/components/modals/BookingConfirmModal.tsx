// BookingConfirmModal.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ModalBase from '@components/base/ModalBase';
import TicketInfo from '../TicketInfo';
import { theme } from '@theme/Theme';

interface BookingConfirmModalProps {
  isOpen: boolean;
  bookingData: any;
  onConfirm: () => void;
  onCancel: () => void;
}

const BookingConfirmModal: React.FC<BookingConfirmModalProps> = ({
  isOpen,
  bookingData,
  onConfirm,
  onCancel,
}) => {
  const [isAgreed, setIsAgreed] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAgreed(false);
    }
  }, [isOpen]);

  if (!bookingData) return null;

  return (
    <ModalBase
      isOpen={isOpen}
      size='smm'
      onClose={onCancel}
      hideCloseButton={false}
    >
      <ModalContent>
        <Title>Xác nhận thông tin vé</Title>
        <Description>
          Vui lòng kiểm tra kỹ thông tin vé trước khi tiếp tục thanh toán.
        </Description>

        <TicketWrapper>
          <TicketInfo
            bookingData={bookingData}
            appliedCoupons={bookingData.appliedCoupons || []}
          />
        </TicketWrapper>

        <Agreement>
          <label>
            <input
              type='checkbox'
              checked={isAgreed}
              onChange={e => setIsAgreed(e.target.checked)}
            />
            <span>
              Tôi xác nhận các thông tin đặt vé đã chính xác và đồng ý với{' '}
              <a href='/terms' target='_blank'>
                Điều khoản dịch vụ
              </a>
              ,{' '}
              <a href='/privacy' target='_blank'>
                Chính sách bảo mật
              </a>{' '}
              &amp;{' '}
              của Go Cinema.
            </span>
          </label>
        </Agreement>

        <Footer>
          <CancelButton onClick={onCancel}>Quay lại</CancelButton>
          <ConfirmButton onClick={onConfirm} disabled={!isAgreed}>
            Xác nhận & Thanh toán
          </ConfirmButton>
        </Footer>
      </ModalContent>
    </ModalBase>
  );
};

export default BookingConfirmModal;

/* ==== styled ==== */
const ModalContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  text-align: center;
`;

const Description = styled.p`
  font-size: 14px;
  color: ${theme.colors.textSecondary};
  text-align: center;
  margin: 0;
`;

const TicketWrapper = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 12px;
`;

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const ConfirmButton = styled.button<{ disabled: boolean }>`
  padding: 10px 20px;
  background: ${({ disabled }) =>
    disabled ? theme.colors.border : theme.colors.primary};
  border: none;
  color: white;
  border-radius: 6px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ disabled }) =>
      disabled ? theme.colors.border : theme.colors.primaryHoverGradient};
    transform: ${({ disabled }) => (disabled ? 'none' : 'translateY(-1px)')};
  }
`;

const CancelButton = styled.button`
  padding: 10px 20px;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.closeButtonBg};
  color: ${theme.colors.textPrimary};
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  &:hover {
    background: ${theme.colors.closeButtonBgHover};
    transform: translateY(-1px);
  }
`;

const Agreement = styled.div`
  font-size: 12px;
  color: ${theme.colors.textSecondary};
  line-height: 1.5;
  text-align: left;
  margin: 0;

  label {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    cursor: pointer;
  }

  input[type='checkbox'] {
    margin-top: 2px;
    width: 16px;
    height: 16px;
    accent-color: ${theme.colors.primary};
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: underline;
    cursor: pointer;
  }
`;

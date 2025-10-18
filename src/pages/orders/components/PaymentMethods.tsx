import styled from 'styled-components';
import vnpayIcon from '@assets/image/icons/VNPAY-icon.png';
import payosIcon from '@assets/image/icons/payos-icon.svg';
import { theme } from '@theme/Theme';

interface PaymentMethodsProps {
  selected: string;
  onSelect: (method: string) => void;
}

export default function PaymentMethods({
  selected,
  onSelect,
}: PaymentMethodsProps) {
  return (
    <Section>
      <h3>Phương thức thanh toán</h3>
      <Option onClick={() => onSelect('PAYOS')}>
        <input
          type='radio'
          name='payment'
          checked={selected === 'PAYOS'}
          readOnly
        />
        <Icon src={payosIcon} alt='PayOS' />
        <span>Thanh toán Bằng QR</span>
      </Option>
      <Option onClick={() => onSelect('VNPAY')}>
        <input
          type='radio'
          name='payment'
          checked={selected === 'VNPAY'}
          readOnly
        />
        <Icon src={vnpayIcon} alt='VNPay' />
        <span>Ví điện tử VNPay</span>
      </Option>
      <Notice>
        <span className='highlight'>(*)</span> Bằng việc click/chạm vào{' '}
        <strong>THANH TOÁN</strong> bên phải, bạn đã xác nhận hiểu rõ các{' '}
        <u>Quy Định Giao Dịch Trực Tuyến</u> của Go Cinema.
      </Notice>
    </Section>
  );
}

const Section = styled.div`
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-top: 8px solid ${theme.colors.darkTitleBar};
`;

const Option = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
  cursor: pointer;
`;

const Icon = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
`;

const Notice = styled.p`
  font-size: 12px;
  color: #666;
  margin-top: 16px;
  line-height: 1.4;

  .highlight {
    color: red;
    font-weight: bold;
    margin-right: 4px;
  }

  strong {
    font-weight: 600;
  }

  u {
    cursor: pointer;
  }
`;

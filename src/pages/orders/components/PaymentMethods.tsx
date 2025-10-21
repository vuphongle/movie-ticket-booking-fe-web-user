import styled from 'styled-components';
import vnpayIcon from '@assets/image/icons/VNPAY-icon.png';
import payosIcon from '@assets/image/icons/payos-icon.svg';

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
      <Option selected={selected === 'PAYOS'} onClick={() => onSelect('PAYOS')}>
        <input
          type='radio'
          name='payment'
          checked={selected === 'PAYOS'}
          readOnly
        />
        <Icon src={payosIcon} alt='PayOS' />
        <span>Thanh toán Bằng QR</span>
      </Option>
      <Option selected={selected === 'VNPAY'} onClick={() => onSelect('VNPAY')}>
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
  background: rgba(30, 58, 138, 0.25);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top: 6px solid #439aaa;

  h3 {
    font-size: 18px;
    margin-bottom: 16px;
    color: #f1f5f9;
  }
`;

const Option = styled.label<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 10px;
  background: ${({ selected }) =>
    selected ? 'rgba(30, 58, 138, 0.65)' : 'rgba(15, 23, 42, 0.6)'};
  border: ${({ selected }) => (selected ? '3px solid #1e40af' : '1px solid rgba(37, 99, 235, 0.4)')};
  transition: all 0.25s ease;
  color: ${({ selected }) => (selected ? '#f1f5f9' : 'white')};

  &:hover {
    background: ${({ selected }) =>
      selected ? 'rgba(30, 58, 138, 0.65)' : 'rgba(37, 99, 235, 0.25)'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

  input {
    accent-color: #2563eb;
    width: 18px;
    height: 18px;
    cursor: pointer;
  }

  span {
    font-size: 14px;
    font-weight: 500;
  }
`;

const Icon = styled.img`
  width: 60px;
  height: 60px;
  object-fit: contain;
`;

const Notice = styled.p`
  font-size: 12px;
  color: white;
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
    text-decoration-color: #2563eb;
  }
`;

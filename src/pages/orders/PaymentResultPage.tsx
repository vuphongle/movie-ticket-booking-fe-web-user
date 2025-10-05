import { useSearchParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { theme } from '@theme/Theme';
import BookingFail from '@assets/image/icons/booking-fail.png';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status'); // "success" | "failed"
  const navigate = useNavigate();
  return (
    <Container>
      {status === 'success' ? (
        <Content>
          <IconWrapper>
            <SuccessIcon viewBox='0 0 120 120' aria-hidden>
              <circle className='circle' cx='60' cy='60' r='46' />
              <path className='check' d='M40 62 L54 74 L82 46' />
            </SuccessIcon>
          </IconWrapper>
          <h2>🎉 Thanh toán thành công!</h2>
          <p>Thông tin vé và QR code sẽ được gửi qua email bạn đã đăng ký.</p>
          <p>Cảm ơn bạn đã sử dụng dịch vụ của Go Cinema!</p>
          <PrimaryButton onClick={() => navigate('/')}>
            Quay về trang chủ
          </PrimaryButton>
        </Content>
      ) : (
        <Content>
          <img
            src={BookingFail}
            alt='Payment Failed'
            style={{ width: '100px' }}
          />
          <h2>Thanh toán thất bại</h2>
          <p>Giao dịch đã bị hủy, hết hạn hoặc không thành công.</p>
          <p>Vui lòng thử lại hoặc liên hệ hỗ trợ.</p>
          <PrimaryButton onClick={() => navigate('/')}>
            Quay về trang chủ
          </PrimaryButton>
        </Content>
      )}
    </Container>
  );
}

/* ==== styled ==== */
const Container = styled.div`
  max-width: 600px;
  margin: 60px auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const Content = styled.div`
  h2 {
    font-size: 28px;
    margin-bottom: 16px;
  }
  p {
    font-size: 16px;
    margin: 8px 0;
  }
`;

const PrimaryButton = styled.button`
  margin-top: 20px;
  padding: 12px 24px;
  background: ${theme.colors.primary};
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${theme.spacing.md};
`;

const dashDraw = keyframes`
  0% { stroke-dashoffset: 280; }
  100% { stroke-dashoffset: 0; }
`;

const scaleIn = keyframes`
  0% { transform: scale(0.9); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;


const SuccessIcon = styled.svg`
  width: 100px;
  height:100px;
  .circle {
    fill: none;
    stroke: #22c55e;
    stroke-width: 10;
    stroke-linecap: round;
    opacity: 0.2;
    animation: ${scaleIn} 900ms ease-out both;
  }
  .check {
    fill: none;
    stroke: #22c55e;
    stroke-width: 10;
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-dasharray: 280;
    stroke-dashoffset: 280;
    animation: ${dashDraw} 600ms ease-out 120ms forwards;
  }
`;

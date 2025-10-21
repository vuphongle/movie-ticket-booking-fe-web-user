import { useSearchParams, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { theme } from '@theme/Theme';
import BookingFail from '@assets/image/icons/booking-fail.png';
import { FileText } from 'lucide-react';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const pdfUrl = searchParams.get('pdfUrl');
  const navigate = useNavigate();

  return (
    <Container>
      {status === 'success' ? (
        <Content>
          <IconWrapper>
            <SuccessIcon viewBox="0 0 120 120" aria-hidden>
              <circle className="circle" cx="60" cy="60" r="46" />
              <path className="check" d="M40 62 L54 74 L82 46" />
            </SuccessIcon>
          </IconWrapper>

          <h2>Thanh toán thành công!</h2>
          <Text>
            Thông tin vé và QR code đã được gửi qua email.{' '}
            {pdfUrl && (
              <InlineDownloadButton
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                download={`order-${searchParams.get('orderCode') || 'ticket'}.pdf`}
              >
                <FileText size={16} style={{ marginRight: 4 }} />
                Xem vé
              </InlineDownloadButton>
            )}
          </Text>

          <PrimaryButton onClick={() => navigate('/')}>
            Quay về trang chủ
          </PrimaryButton>
        </Content>
      ) : (
        <Content>
          <img src={BookingFail} alt="Payment Failed" style={{ width: '100px', marginBottom: '16px' }} />
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

/* ==== styled-components ==== */

const Container = styled.div`
  max-width: 500px;
  margin: 60px auto;
  padding: 25px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0,0,0,0.12);
  text-align: center;
`;

const Content = styled.div`
  h2 {
    font-size: 26px;
    margin-bottom: 14px;
  }
  p {
    font-size: 16px;
    margin: 6px 0;
  }
`;

const Text = styled.p`
  font-size: 16px;
  margin: 12px 0;
  display: inline;
`;

const PrimaryButton = styled.button`
  margin-top: 24px;
  padding: 12px 28px;
  background: ${theme.colors.primary};
  color: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    background: #1e40af;
  }
`;

const IconWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
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
  height: 100px;

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

const InlineDownloadButton = styled.a`
  display: inline-flex;
  align-items: center;
  margin-left: 6px;
  padding: 4px 12px;
  background-color: #ff6b6b;
  color: #fff;
  font-weight: 600;
  border-radius: 24px;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #fa5252;
    color: #fff;
    font-weight: 700;
  }
`;

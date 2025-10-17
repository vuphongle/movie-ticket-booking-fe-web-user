import styled, { keyframes } from 'styled-components';
import { Spin } from 'antd';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const slowSpin = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const CustomSpin = styled(Spin)`
  .ant-spin-dot {
    animation: ${slowSpin} 2s linear infinite !important;
  }
  .ant-spin-dot i {
    background-color: #8b5cf6 !important;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 15, 15, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: ${fadeIn} 0.3s ease;
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  color: #fff;
  font-size: 15px;
  letter-spacing: 0.5px;
`;

const Dot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #8b5cf6;
  animation: pulse 1.2s infinite ease-in-out;

  @keyframes pulse {
    0%, 100% { opacity: 0.3; transform: scale(0.9); }
    50% { opacity: 1; transform: scale(1.1); }
  }
`;

export default function GlobalLoading() {
  return (
    <Overlay>
      <LoaderContainer>
        <CustomSpin size="large" />
        <div style={{ display: 'flex', gap: 6 }}>
          <Dot />
          <Dot style={{ animationDelay: '0.2s' }} />
          <Dot style={{ animationDelay: '0.4s' }} />
        </div>
        <span>Đang tải dữ liệu...</span>
      </LoaderContainer>
    </Overlay>
  );
}

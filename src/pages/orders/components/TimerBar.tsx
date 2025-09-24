import styled from 'styled-components';
import { theme } from '@theme/Theme';

interface TimerBarProps {
  timer: number; // đơn vị: giây
}

export default function TimerBar({ timer }: TimerBarProps) {
  if (!timer || timer <= 0) return null;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Danger khi còn dưới 2 phút
  const danger = timer <= 120;
  const maxTime = 900; // giả sử giữ chỗ tối đa 15 phút
  const progress = Math.max(0, (timer / maxTime) * 100);

  return (
    <Wrapper>
      <Bar danger={danger}>
        ⏳ Thời gian giữ ghế: <strong>{formatTime(timer)}</strong>
      </Bar>
      <ProgressContainer>
        <ProgressFill danger={danger} style={{ width: `${progress}%` }} />
      </ProgressContainer>
    </Wrapper>
  );
}

/* ==== styled ==== */
const Wrapper = styled.div`
  margin-bottom: 16px;
`;

const Bar = styled.div<{ danger?: boolean }>`
  background: ${({ danger }) =>
    danger ? theme.colors.error : theme.colors.primary};
  color: white;
  font-weight: bold;
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  font-size: 16px;
  letter-spacing: 0.5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);

  strong {
    font-size: 18px;
    ${({ danger }) =>
      danger &&
      `
      animation: blink 1s infinite;
    `}
  }

  @keyframes blink {
    0%, 100% { color: white; }
    50% { color: yellow; }
  }
`;

const ProgressContainer = styled.div`
  width: 100%;
  height: 6px;
  background: #eee;
  border-radius: 4px;
  margin-top: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ danger?: boolean }>`
  height: 100%;
  background: ${({ danger }) =>
    danger ? theme.colors.error : theme.colors.primary};
  transition: width 1s linear;
`;

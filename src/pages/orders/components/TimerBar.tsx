import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { Timer as TimerIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface TimerBarProps {
  timer: number; // đơn vị: giây
}

export default function TimerBar({ timer }: TimerBarProps) {
    const { t } = useTranslation();
  if (!timer || timer <= 0) return null;

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Danger khi còn dưới 2 phút
  const danger = timer <= 120;
  // Warning khi còn dưới 4 phút
  const warning = timer <= 240;
  const maxTime = 8 * 60;
  const progress = Math.max(0, (timer / maxTime) * 100);

  return (
    <Wrapper>
      <Bar danger={danger} warning={warning}>
        <IconWrapper>
          <TimerIcon size={20} />
        </IconWrapper>
        {t('TIME_HOLD_SEAT')}:<strong>{formatTime(timer)}</strong>
      </Bar>
      <ProgressContainer>
        <ProgressFill
          danger={danger}
          warning={warning}
          style={{ width: `${progress}%` }}
        />
      </ProgressContainer>
    </Wrapper>
  );
}

/* ==== styled ==== */
const Wrapper = styled.div`
  margin-bottom: 16px;
`;

const Bar = styled.div<{ danger?: boolean; warning?: boolean }>`
  background: ${({ danger, warning }) =>
    danger
      ? theme.colors.error
      : warning
        ? theme.colors.warning
        : theme.colors.primary};
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  text-align: center;
  justify-content: center;
  padding: 10px;
  border-radius: 8px;
  font-size: 16px;
  letter-spacing: 0.5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);

  strong {
    font-size: 18px;
    margin-left: 6px;
    ${({ danger }) =>
      danger &&
      `
      animation: blink 1s infinite;
    `}
    ${({ warning }) =>
      warning &&
      `
      animation: blink 2s infinite;
    `}
  }

  @keyframes blink {
    0%,
    100% {
      color: white;
    }
    50% {
      color: yellow;
    }
  }

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 9px;

    strong {
      font-size: 16px;
      margin-left: 5px;
    }
  }

  @media (max-width: 480px) {
    font-size: 13px;
    padding: 8px;
    flex-wrap: wrap;
    gap: 4px;

    strong {
      font-size: 15px;
      margin-left: 4px;
    }
  }
`;

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 8px;

  svg {
    stroke: white;
    stroke-width: 2.5;
  }

  @media (max-width: 768px) {
    margin-right: 6px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  @media (max-width: 480px) {
    margin-right: 4px;

    svg {
      width: 16px;
      height: 16px;
    }
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

const ProgressFill = styled.div<{ danger?: boolean; warning?: boolean }>`
  height: 100%;
  background: ${({ danger, warning }) =>
    danger
      ? theme.colors.error
      : warning
        ? theme.colors.warning
        : theme.colors.primary};
  transition: width 1s linear;
`;

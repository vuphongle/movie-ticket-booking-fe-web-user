import { theme } from '@theme/Theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';

const StyledToastContainer = styled(ToastContainer)`
  z-index: 3000;

  &.Toastify__toast-container--top-center {
    top: 80px;
  }

  .Toastify__toast {
    border-radius: ${theme.borderRadius.medium};
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    backdrop-filter: blur(4px);
    font-size: ${theme.fontSize.sm};
    min-height: auto;
    font-weight: 500;
    text-shadow: none;
  }

  .Toastify__toast--success {
    background: ${theme.colors.backgroundHover};
    color: #22c55e;
  }

  .Toastify__toast--error {
    background: #fef2f2;
    color: #dc2626;
  }

  .Toastify__toast--info {
    background: ${theme.colors.bgLight};
    background: linear-gradient(270deg, #93c5fd, #99f6e4, #c4b5fd);
    background-size: 400% 400%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradientShift 10s ease infinite;
    font-weight: 500;
  }

  .Toastify__close-button {
    color: ${theme.colors.textSecondary};
    opacity: 0.7;
  }

  .Toastify__progress-bar {
    background: linear-gradient(90deg, #60a5fa, #34d399, #a78bfa);
    height: 3px;
    border-radius: 2px;
  }

  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`;

export default function AppToastContainer() {
  return (
    <StyledToastContainer
      position="top-center"
      autoClose={3000}
      newestOnTop
      pauseOnHover={false}
      closeOnClick
      draggable={false}
      theme="colored"
    />
  );
}

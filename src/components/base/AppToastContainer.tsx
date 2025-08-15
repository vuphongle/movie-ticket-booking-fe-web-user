import { theme } from '@theme/Theme';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';

const StyledToastContainer = styled(ToastContainer)`
  z-index: 3000;
  .Toastify__toast {
    border-radius: ${theme.borderRadius.medium};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    backdrop-filter: blur(4px);
    font-size: ${theme.fontSize.sm};
    min-height: auto;
  }
  .Toastify__toast--success {
    background: ${theme.colors.backgroundHover};
    color: ${theme.colors.textPrimary};
  }
  .Toastify__toast--error {
    background: #fee2e2; /* đỏ nhạt */
    color: ${theme.colors.error};
  }
  .Toastify__toast--info {
    background: ${theme.colors.bgLight};
    color: ${theme.colors.primary};
  }
  .Toastify__close-button {
    color: ${theme.colors.textSecondary};
    opacity: 0.7;
  }
  .Toastify__progress-bar {
    background: ${theme.colors.primary};
    height: 2px;
  }
`;

export default function AppToastContainer() {
  return (
    <StyledToastContainer
      position='top-center'
      autoClose={3000}
      newestOnTop
      pauseOnHover={false}
      closeOnClick
      draggable={false}
      theme='colored'
    />
  );
}

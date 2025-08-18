import { theme } from '@theme/Theme';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  children: React.ReactNode;
  zIndex?: number;
  style?: React.CSSProperties;
}

const sizeMap: Record<ModalSize, string> = {
  xs: '20%',
  sm: '25%',
  md: '50%',
  lg: '75%',
  xl: '91.6667%',
};

const Overlay = styled.div<{ zIndex?: number }>`
  position: fixed;
  inset: 0;
  padding: 0;
  overflow-y: auto;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${({ zIndex }) => zIndex ?? 50};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalWrapper = styled.div<{ size: ModalSize; isOpen: boolean }>`
  position: relative;
  width: ${({ size }) => sizeMap[size] || sizeMap.md};
  background: #fff;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
  transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(100%)')};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
`;

const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: ${theme.colors.closeButtonBg};
  border: none;
  width: 32px;
  height: 32px;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  color: ${theme.colors.closeButtonText};
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background-color 0.2s ease;

  &:hover {
    background: ${theme.colors.closeButtonBgHover};
  }
`;

const ModalBase: React.FC<ModalBaseProps> = ({
  isOpen,
  onClose,
  size = 'md',
  children,
  zIndex,
  style,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mouseDownPos, setMouseDownPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  if (!isOpen) return null;

  const CLICK_THRESHOLD = 10;

  const handleOverlayMouseDown = (e: React.MouseEvent) => {
    setMouseDownPos({ x: e.clientX, y: e.clientY });
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (!mouseDownPos) return;

    const dx = Math.abs(e.clientX - mouseDownPos.x);
    const dy = Math.abs(e.clientY - mouseDownPos.y);

    if (dx < CLICK_THRESHOLD && dy < CLICK_THRESHOLD) {
      onClose();
    }

    setMouseDownPos(null);
  };

  return (
    <Overlay
      zIndex={zIndex}
      onMouseDown={handleOverlayMouseDown}
      onClick={handleOverlayClick}
    >
      <ModalWrapper
        ref={modalRef}
        size={size}
        isOpen={isOpen}
        onClick={e => e.stopPropagation()}
        style={style}
      >
        <CloseButton onClick={onClose} aria-label='Close modal'>
          &times;
        </CloseButton>
        {children}
      </ModalWrapper>
    </Overlay>
  );
};

export default ModalBase;

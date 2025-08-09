import type { ReactNode } from 'react';
import React, { useRef } from 'react';
import styled from 'styled-components';

type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ModalBaseProps {
  isOpen: boolean;
  onClose: () => void;
  size?: ModalSize;
  children: ReactNode;
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
`;

const ModalWrapper = styled.div<{ size: ModalSize; isOpen: boolean }>`
  position: relative;
  top: 20px;
  margin: 0 auto;
  width: ${({ size }) => sizeMap[size] || sizeMap.md};
  background: #fff;
  border-radius: 8px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease-in-out;
  transform: ${({ isOpen }) => (isOpen ? 'translateX(0)' : 'translateX(100%)')};
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
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

  if (!isOpen) return null;

  return (
    <Overlay zIndex={zIndex} onClick={onClose}>
      <ModalWrapper
        ref={modalRef}
        size={size}
        isOpen={isOpen}
        onClick={e => e.stopPropagation()}
        style={style}
      >
        {children}
      </ModalWrapper>
    </Overlay>
  );
};

export default ModalBase;

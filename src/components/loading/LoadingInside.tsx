//Loading hoạt động trong module cha

import React from 'react';

const LoadingInside: React.FC = () => {
  return (
    <div style={styles.container}>
      <div style={styles.spinner} />
      <span style={styles.srOnly}>Loading...</span>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '1rem',
    width: '100%',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '4px solid #3b82f6',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// Keyframe animation (hiệu ứng xoay cho module kết hợp css động)
const style = document.createElement('style');
style.innerHTML = `
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}`;
document.head.appendChild(style);

export default LoadingInside;

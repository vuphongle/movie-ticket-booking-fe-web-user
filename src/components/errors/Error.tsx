import React from 'react';

interface ErrorProps {
  error?: {
    data?: {
      message?: string;
      error?: string;
    };
  };
}

const Error: React.FC<ErrorProps> = ({ error }) => {
  return (
    <div style={styles.container}>
      <div style={styles.box} role='alert'>
        <h2 style={styles.title}>
          <span>Oops, something went wrong!</span>
        </h2>
        {error && (
          <p style={styles.message}>
            {error?.data?.message || error?.data?.error}
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1152px',
    margin: '0 auto',
    padding: '28px 0',
  },
  box: {
    padding: '16px',
    marginBottom: '16px',
    color: '#1f2937',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
  },
  title: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  message: {
    fontSize: '14px',
    color: '#6b7280',
  },
};

export default Error;

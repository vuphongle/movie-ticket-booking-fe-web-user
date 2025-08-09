export const theme = {
  colors: {
    primary: '#f97316',
    primaryHover: '#c2410c',
    backgroundHover: '#ffedd5',
    backgroundFocus: '#9a3412',
    textPrimary: '#1f2937',
    border: '#d1d5db',
    error: '#ef4444',
    white: '#ffffff',
    bgLight: '#f9fafb',
    gray: '#6b7280',
    background: '#f0f0f0',
    textSecondary: '#6b7280',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '9999px',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
  },
  fontSize: {
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
  },
} as const;

export type ThemeType = typeof theme;

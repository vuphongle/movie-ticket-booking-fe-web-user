export const theme = {
colors: {
  primary: '#01274c',
  primaryHover: '#2b4dad',
  primaryHoverGradient: 'linear-gradient(90deg, #01274c, #2b4dad)',
  backgroundHover: '#e1f3fe', 
  backgroundFocus: '#04132a', 
  textPrimary: '#01274c',
  textPrimaryHover: '#2b4dad',
  border: '#cbd5e1',
  error: '#ef4444',
  white: '#ffffff',
  bgLight: '#f8fafc',
  gray: '#64748b',
  background: '#f1f5f9',
  textSecondary: '#64748b',
  success: '#4caf50',
  closeButtonBg: '#f1f5f9',
  closeButtonBgHover: '#e2e8f0',
  closeButtonText: '#0b1e44', 
}
,

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

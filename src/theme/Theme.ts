export const theme = {
  colors: {
    primary: '#01274c',
    primaryHover: '#2b4dad',
    primaryHoverGradient: 'linear-gradient(90deg, #01274c, #2b4dad)',
    backgroundHover: '#e1f3fe',
    backgroundFocus: '#04132a',
    textPrimary: '#01274c',
    textPrimaryHover: '#2b4dad',
    textSecondary: '#64748b',
    textLight: '#f9fafb',
    headingLight: '#ffffff',
    border: '#cbd5e1',
    error: '#ef4444',
    white: '#ffffff',
    bgLight: '#f8fafc',
    gray: '#64748b',
    background: '#f1f5f9',
    success: '#4caf50',
    closeButtonBg: '#f1f5f9',
    closeButtonBgHover: '#e2e8f0',
    closeButtonText: '#0b1e44',

    /** 🎬 Bổ sung cho nền tối */
    darkTextPrimary: '#f9fafb',
    darkTextSecondary: '#cbd5e1',
    darkTextMuted: '#94a3b8',
    darkCardBg: 'rgba(255,255,255,0.05)',
    darkBorder: 'rgba(255,255,255,0.1)',
    darkShadow: '0 6px 16px rgba(0,0,0,0.6)',
    darkTitleBar: '#439aaa',
    darkTextTertiary: '#adb5bd',
    rating: '#facc15',

    red: '#ef4444',
    orange: '#ff9800',
    gold: '#ffd700',
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
    xl: '32px',
    xxl: '48px',
    xxxl: '105px',
  },
  fontSize: {
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
  },
  fontFamily: {
    primary:
      "'Inter', 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
    display:
      "'Inter', 'Noto Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', sans-serif",
  },
} as const;

export type ThemeType = typeof theme;

import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <div style={styles.footer}>
      <span>{t('footer.terms')}</span>
      <span>{t('footer.privacy')}</span>
      <span>{t('footer.copyright')}</span>
    </div>
  );
}

const styles = {
  footer: {
    fontSize: '14px',
    textAlign: 'center' as const,
    color: '#6B7280',
    display: 'flex',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '24px',
    marginBottom: '24px',
  },
};

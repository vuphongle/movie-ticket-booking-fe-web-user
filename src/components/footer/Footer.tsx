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
    justifyContent: 'space-between',
    gap: '16px',
    marginTop: '32px',
    marginBottom: '32px',
    padding: '16px',
    paddingTop: '23px',
    borderTop: '1px solid #eee',
    background: '#fff',
  },
};

import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Header() {
  const { t } = useTranslation();

  return (
    <nav style={styles.nav}>
      <Link to='/' style={styles.link}>
        {t('nav.home')}
      </Link>
      <Link to='/movies' style={styles.link}>
        {t('nav.movies')}
      </Link>
      <Link to='/cinemas' style={styles.link}>
        {t('nav.cinemas')}
      </Link>
      <Link to='/contact' style={styles.link}>
        {t('nav.contact')}
      </Link>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    cursor: 'pointer',
  },
};

const styleSheet = document.createElement('style');
styleSheet.innerText = `
  a:hover {
    text-decoration: underline;
  }
`;
document.head.appendChild(styleSheet);

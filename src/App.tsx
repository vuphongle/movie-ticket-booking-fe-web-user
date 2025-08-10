import VerifyAccount from '@/pages/verify/VerifyAccount';
import Footer from '@components/footer/Footer';
import Header from '@components/header/Header';
import LanguageSelector from '@components/language/LanguageSelector';
import HomePage from '@pages/home/Home';
import { Route, Routes } from 'react-router-dom';
import './i18n';

import AppToastContainer from '@components/base/AppToastContainer';

function App() {
  return (
    <div style={styles.container}>
      <AppToastContainer />

      <header style={styles.header}>
        <Header />
        <LanguageSelector />
      </header>

      <main style={styles.main}>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/xac-thuc-tai-khoan' element={<VerifyAccount />} />
        </Routes>
      </main>

      <footer style={styles.footer}>
        <Footer />
      </footer>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  header: {
    padding: '8px 16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    background: '#fff',
    zIndex: 100,
  },
  main: {
    flex: 1,
    padding: '16px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
  footer: {
    padding: '16px',
    borderTop: '1px solid #eee',
    marginTop: '32px',
    background: '#fff',
  },
};

export default App;

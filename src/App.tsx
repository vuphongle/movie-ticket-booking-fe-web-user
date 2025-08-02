import Footer from '@components/footer/Footer';
import Header from '@components/header/Header';
import LanguageSelector from '@components/language/LanguageSelector';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './i18n';
import HomePage from './pages/home/Home';

function App() {
  return (
    <Router>
      <div style={styles.container}>
        <header style={styles.header}>
          <Header />
          <LanguageSelector />
        </header>

        <main style={styles.main}>
          <Routes>
            <Route path='/' element={<HomePage />} />
            {/* các route con khác kkkk */}
          </Routes>
        </main>

        <footer style={styles.footer}>
          <Footer />
        </footer>
      </div>
    </Router>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  header: {
    padding: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  main: {
    flex: 1,
    padding: '16px',
    width: '100%',
    flexDirection: 'column',
  },

  footer: {
    padding: '16px',
    borderTop: '1px solid #ccc',
    marginTop: '32px',
  },
};

export default App;

import VerifyAccount from '@/pages/verify/VerifyAccount';
import Footer from '@components/footer/Footer';
import Header from '@components/header/Header';
import HomePage from '@pages/home/Home';
import { Route, Routes } from 'react-router-dom';
import './i18n';

import AppToastContainer from '@components/base/AppToastContainer';

function App() {
  return (
    <div style={styles.container}>
      <AppToastContainer />
      <Header />
      <main style={styles.main}>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/xac-thuc-tai-khoan' element={<VerifyAccount />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  main: {
    flex: 1,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxSizing: 'border-box',
  },
};

export default App;

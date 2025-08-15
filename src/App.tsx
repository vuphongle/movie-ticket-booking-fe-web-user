import VerifyAccount from '@pages/verify/VerifyAccount';
import Footer from '@components/footer/Footer';
import Header from '@components/header/Header';
import HomePage from '@pages/home/Home';
import { useLocation } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import './i18n/i18n';
import './index.css';
import ContentWrapper from '@components/base/ContentWrapper';
import ResetPasswordPage from '@/pages/verify/ResetPassword';
import ChangPasswordPage from '@/pages/verify/ChangePassword';

import AppToastContainer from '@components/base/AppToastContainer';

function App() {
    const location = useLocation();
    const hideLayout = location.pathname === '/xac-thuc-tai-khoan' || location.pathname === '/dat-lai-mat-khau' || location.pathname === '/doi-mat-khau';
  return (
    <div style={styles.container}>
      <AppToastContainer />

      {!hideLayout && <Header />}

      <main>
        <ContentWrapper>
          <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path='/xac-thuc-tai-khoan' element={<VerifyAccount />} />
            <Route path="/dat-lai-mat-khau" element={<ResetPasswordPage />} />
            <Route path="/doi-mat-khau" element={<ChangPasswordPage />} />
          </Routes>
        </ContentWrapper>
      </main>

      {!hideLayout && <Footer />}
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

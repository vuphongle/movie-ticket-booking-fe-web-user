import VerifyAccount from '@pages/verify/VerifyAccount';
import Footer from '@components/footer/Footer';
import Header from '@components/header/Header';
import HomePage from '@pages/home/HomePage';
import ProfilePage from '@pages/profile/Profile';
import { useLocation } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';
import './i18n/i18n';
import './index.css';
import { LoginProvider } from './contexts/LoginContext';
import ContentWrapper from '@components/base/ContentWrapper';
import ResetPasswordPage from '@pages/verify/ResetPassword';
import ComingSoon from '@pages/movies/MovieComingSoonPage';
import NowShowing from '@pages/movies/MovieNowShowingPage';
import MovieDetailPage from './pages/movies/MovieDetailPage';
import BlogPage from '@pages/blogs/BlogPage';
import ReviewPage from '@pages/reviews/ReviewPage';
import BookingPage from '@pages/orders/BookingPage';
import BookingConfirmPage from '@pages/orders/BookingConfirmPage';
import PaymentResultPage from '@pages/orders/PaymentResultPage';

import AppToastContainer from '@components/base/AppToastContainer';

function App() {
  const location = useLocation();
  const hideLayout =
    location.pathname === '/xac-thuc-tai-khoan' ||
    location.pathname === '/dat-lai-mat-khau';

  return (
    <LoginProvider>
      <div style={styles.container}>
        <AppToastContainer />

        {!hideLayout && <Header />}

        <main style={styles.main}>
          <ContentWrapper style={styles.contentWrapper}>
            <Routes>
              <Route path='/' element={<HomePage />} />
              <Route path='/xac-thuc-tai-khoan' element={<VerifyAccount />} />
              <Route path='/dat-lai-mat-khau' element={<ResetPasswordPage />} />
              <Route path='/profile' element={<ProfilePage />} />

              <Route path='/movies/now-showing' element={<NowShowing />} />
              <Route path='/movies/coming-soon' element={<ComingSoon />} />
              <Route path='/movies/:id/:slug' element={<MovieDetailPage />} />
              <Route path='/blogs' element={<BlogPage />} />
              <Route path='/reviews' element={<ReviewPage />} />
              <Route
                path='/booking/:slug/:showtimeId'
                element={<BookingPage />}
              />
              <Route path='/booking/confirm' element={<BookingConfirmPage />} />
              <Route path="/thanh-toan-don-hang/:id" element={<PaymentResultPage />} />
            </Routes>
          </ContentWrapper>
        </main>

        {!hideLayout && <Footer />}
      </div>
    </LoginProvider>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background:
      'linear-gradient(135deg, #0f172a 0%, #2d3748 40%, #1e3a8a 60%, #065f46 90%)',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  contentWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
};

export default App;

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginContextType {
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
  setPendingRoute: (route: string) => void;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export const LoginProvider = ({ children }: { children: ReactNode }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const navigate = useNavigate();

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  const setPendingRoute = (route: string) => {
    localStorage.setItem('pendingRoute', route);
    openLogin();
  };

  // Khi login thành công, redirect nếu có pendingRoute
  useEffect(() => {
    const pendingRoute = localStorage.getItem('pendingRoute');
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (isAuthenticated && pendingRoute) {
      navigate(pendingRoute);
      localStorage.removeItem('pendingRoute');
      closeLogin();
    }
  }, [navigate]);

  return (
    <LoginContext.Provider value={{ isLoginOpen, openLogin, closeLogin, setPendingRoute }}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLoginModal = () => {
  const ctx = useContext(LoginContext);
  if (!ctx) throw new Error('useLoginModal must be used within LoginProvider');
  return ctx;
};

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface LoginContextType {
  isLoginOpen: boolean;
  openLogin: () => void;
  closeLogin: () => void;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export const LoginProvider = ({ children }: { children: ReactNode }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  const openLogin = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  return (
    <LoginContext.Provider value={{ isLoginOpen, openLogin, closeLogin }}>
      {children}
    </LoginContext.Provider>
  );
};

export const useLoginModal = () => {
  const ctx = useContext(LoginContext);
  if (!ctx) throw new Error('useLoginModal must be used within LoginProvider');
  return ctx;
};
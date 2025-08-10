import LoginModal from '@components/modal/LoginModal';
import RegisterModal from '@components/modal/RegisterModal';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import LogoImg from '@/assets/image/logo.png';

import { theme } from '@theme/Theme';

export default function Header() {
  const { t } = useTranslation();

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const openLoginModal = () => setIsLoginOpen(true);
  const closeLoginModal = () => setIsLoginOpen(false);

  const openRegisterModal = () => setIsRegisterOpen(true);
  const closeRegisterModal = () => setIsRegisterOpen(false);

  const handleForgotPassword = () => {
    alert('Chuyển sang màn hình quên mật khẩu');
  };

  const handleRegister = () => {
    closeLoginModal();
    openRegisterModal();
  };

  const handleLogin = () => {
    closeRegisterModal();
    openLoginModal();
  };

  return (
    <>
      <Nav>
        <LeftGroup>
          <LogoArea>
            <Logo src={LogoImg} alt='GoCinema' />
          </LogoArea>

          <SearchBox>
            <SearchInput
              placeholder={t('search.placeholder') || 'Tìm phim, rạp'}
            />
            <SearchIcon />
          </SearchBox>
        </LeftGroup>

        <RightGroup>
          <Menu>
            <MenuItem>{t('nav.showtimes')} ▼</MenuItem>
            <MenuItem>{t('nav.movies')}</MenuItem>
            <MenuItem>{t('nav.reviews')}</MenuItem>
            <MenuItem>{t('nav.blog')} ▼</MenuItem>
          </Menu>

          <RightArea>
            <ButtonOutline onClick={openRegisterModal}>
              {t('auth.signup')}
            </ButtonOutline>
            <ButtonPrimary onClick={openLoginModal}>
              {t('auth.login')}
            </ButtonPrimary>
          </RightArea>
        </RightGroup>
      </Nav>

      <LoginModal
        open={isLoginOpen}
        handleClose={closeLoginModal}
        handleForgotPassword={handleForgotPassword}
        handleRegister={handleRegister}
      />

      <RegisterModal
        open={isRegisterOpen}
        handleClose={closeRegisterModal}
        handleLogin={handleLogin}
      />
    </>
  );
}

/* Styles */
const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${theme.colors.white};
  padding: 0px 20px;
  gap: 16px;
  width: 83%;
  max-width: 1200px;
  margin: 0 auto;
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px; /* cách xa logo và search */
  flex: 1; /* có thể cho nhóm trái rộng hơn */
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 20px; /* khoảng cách menu và nút */
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  width: 90px;
  height: 60px;
  border-radius: 6px;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border-radius: 20px;
  padding: 8px 10px;
  max-width: 260px;
  flex: 1; /* search box chiếm hết không gian còn lại */
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  flex: 1;
  font-size: 16px;
`;

const SearchIcon = styled(Search)`
  width: 16px;
  height: 16px;
  color: #888;
`;

const Menu = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const MenuItem = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: ${theme.colors.textPrimary};
  cursor: pointer;
  &:hover {
    color: ${theme.colors.primary};
  }
`;

const RightArea = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ButtonOutline = styled.button`
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.white};
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    border-color: ${theme.colors.gray};
  }
`;

const ButtonPrimary = styled.button`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  padding: 10px 24px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  &:hover {
    background: ${theme.colors.primaryHover};
  }
`;

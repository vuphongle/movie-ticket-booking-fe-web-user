import LoginModal from '@components/modal/LoginModal';
import RegisterModal from '@components/modal/RegisterModal';
import ForgotPassword from '@components/modal/ForgotPasswordModal';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import LogoImg from '@/assets/image/cinema-logo.png';
import { useSelector, useDispatch } from 'react-redux';
import { Menu as MenuIcon, X as CloseIcon } from 'lucide-react';
import { useState } from 'react';
import { theme } from '@theme/Theme';
import type { RootState } from '@app/Store';
import { logout } from '@/app/slices/auth.slice';
import UserMenu from '@components/menu/UserMenu';
import LanguageSelector from '@components/language/LanguageSelector';
import { useEffect, useRef } from 'react';
import ContentWrapper from '@components/base/ContentWrapper';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useLoginModal } from '@contexts/LoginContext';

export default function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );

  const [searchTerm, setSearchTerm] = useState('');
  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    navigate(`/search?keyword=${encodeURIComponent(searchTerm.trim())}`);
  };

  const { isLoginOpen, openLogin, closeLogin } = useLoginModal();

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);

  const openLoginModal = () => openLogin();
  const closeLoginModal = () => closeLogin();
  const openRegisterModal = () => setIsRegisterOpen(true);
  const closeRegisterModal = () => setIsRegisterOpen(false);
  const openForgotModal = () => setIsForgotOpen(true);
  const closeForgotModal = () => setIsForgotOpen(false);

  const toggleMobileMenu = () => setMobileMenuOpen(prev => !prev);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setHoveredMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 1450) {
        setMobileMenuOpen(false);
        setHoveredMenu(null);
      }
    }
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleForgotPassword = () => {
    closeLoginModal();
    openForgotModal();
  };
  const handleRegister = () => {
    closeLoginModal();
    openRegisterModal();
  };
  const handleLogin = () => {
    closeRegisterModal();
    openLoginModal();
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/';
  };

  return (
    <>
      <Container>
        <ContentWrapper>
          <HeaderContent>
            <Nav>
              <LeftGroup>
                <LogoArea>
                  <Link to='/'>
                    <Logo src={LogoImg} alt='GoCinema' />
                  </Link>
                </LogoArea>

                <SearchBox>
                  <SearchInput
                    placeholder={t('SEARCH_PLACEHOLDER') || 'Tìm phim, rạp'}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />
                  <SearchIcon
                    onClick={handleSearch}
                    style={{ cursor: 'pointer' }}
                  />
                </SearchBox>
              </LeftGroup>

              <RightGroup>
                <HamburgerButton
                  onClick={toggleMobileMenu}
                  aria-label='Toggle menu'
                >
                  {isMobileMenuOpen ? (
                    <CloseIcon size={24} />
                  ) : (
                    <MenuIcon size={24} />
                  )}
                </HamburgerButton>

                <Menu open={isMobileMenuOpen} ref={menuRef}>
                  <MenuItemWrapper
                    onMouseEnter={() => setHoveredMenu('movies')}
                    onMouseLeave={() => setHoveredMenu(null)}
                  >
                    <MenuItem>
                      {t('NAV_MOVIES')}
                      {hoveredMenu === 'movies' ? (
                        <FaChevronUp size={12} style={{ marginLeft: 4 }} />
                      ) : (
                        <FaChevronDown size={12} style={{ marginLeft: 4 }} />
                      )}
                    </MenuItem>
                    {hoveredMenu === 'movies' && (
                      <SubMenu>
                        <SubMenuItem
                          onClick={() => navigate('/movies/now-showing')}
                        >
                          {t('NAV_MOVIES_NOW_SHOWING')}
                        </SubMenuItem>
                        <SubMenuItem
                          onClick={() => navigate('/movies/coming-soon')}
                        >
                          {t('NAV_MOVIES_COMING_SOON')}
                        </SubMenuItem>
                      </SubMenu>
                    )}
                  </MenuItemWrapper>

                  <MenuItem onClick={() => navigate('/cinemas')}>
                    {t('NAV_CINEMAS')}
                  </MenuItem>
                  <MenuItem onClick={() => navigate('/coupons')}>
                    {t('NAV_PROMOTIONS')}
                  </MenuItem>

                  <MenuItemWrapper
                    onMouseEnter={() => setHoveredMenu('cinema_corner')}
                    onMouseLeave={() => setHoveredMenu(null)}
                  >
                    <MenuItem>
                      {t('NAV_CINEMA_CORNER')}
                      {hoveredMenu === 'cinema_corner' ? (
                        <FaChevronUp size={12} style={{ marginLeft: 4 }} />
                      ) : (
                        <FaChevronDown size={12} style={{ marginLeft: 4 }} />
                      )}
                    </MenuItem>
                    {hoveredMenu === 'cinema_corner' && (
                      <SubMenu>
                        <SubMenuItem onClick={() => navigate('/blogs')}>
                          {t('NAV_BLOG_MOVIES')}
                        </SubMenuItem>
                        <SubMenuItem onClick={() => navigate('/reviews')}>
                          {t('NAV_REVIEWS_MOVIES')}
                        </SubMenuItem>
                      </SubMenu>
                    )}
                  </MenuItemWrapper>
                </Menu>

                <RightArea>
                  {isAuthenticated && auth ? (
                    <UserMenu auth={auth} onLogout={handleLogout} />
                  ) : (
                    <>
                      <ButtonOutline onClick={openRegisterModal}>
                        {t('AUTH_SIGNUP')}
                      </ButtonOutline>
                      <ButtonPrimary onClick={openLoginModal}>
                        {t('AUTH_LOGIN')}
                      </ButtonPrimary>
                    </>
                  )}
                </RightArea>
              </RightGroup>
            </Nav>

            <LanguageSelectorWrapper>
              <LanguageSelector />
            </LanguageSelectorWrapper>
          </HeaderContent>
        </ContentWrapper>
      </Container>

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

      <ForgotPassword open={isForgotOpen} handleClose={closeForgotModal} />
    </>
  );
}

const Container = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  font-family: ${theme.fontFamily.primary};

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 100;

  & > div.language-selector {
    width: 200px;
    flex-shrink: 0;
  }

  & > nav {
    flex-grow: 1;
    min-width: 300px;
  }

  @media (max-width: 768px) {
    flex-direction: row;

    & > nav {
      min-width: unset;
      flex-grow: 1;
    }
  }
`;

const HeaderContent = styled.header`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${theme.colors.white};
  padding: 0 ${theme.spacing.md};
  padding-left: 0;
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  box-sizing: border-box;

  @media (max-width: 768px) {
    flex-wrap: wrap;
    justify-content: center;
    padding: ${theme.spacing.sm};
    gap: ${theme.spacing.sm};
  }

  @media (max-width: 1275px) and (min-width: 769px) {
    flex-wrap: nowrap;
    justify-content: space-between;
  }
`;

const LanguageSelectorWrapper = styled.div`
  width: 90px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 80px;
    display: flex;
    justify-content: flex-end;
    align-self: flex-end;
    margin-bottom: ${theme.spacing.sm};
    gap: ${theme.spacing.xs};
  }
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  flex: 1 1 0;
  min-width: 0;

  @media (max-width: 768px) {
    flex-basis: 100%;
    justify-content: flex-start;
  }
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: ${theme.spacing.lg};
  flex: 2 1 0;
  min-width: 0;

  @media (max-width: 768px) {
    flex-basis: 100%;
    justify-content: space-between;
    gap: ${theme.spacing.xs};
  }
`;

const LogoArea = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  width: 72px;
  height: 60px;
  border-radius: ${theme.borderRadius.medium};

  @media (max-width: 768px) {
    width: 48px;
    height: 40px;
  }
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  background: ${theme.colors.backgroundHover};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  max-width: 250px;
  flex: 1 1 auto;
  min-width: 0;
  border: 2px solid rgba(0, 120, 200, 0.4);
  transition: all 0.3s ease;

  &:hover {
    border-color: #3b82f6; /* xanh đậm nổi bật hơn */
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    background: #daf0fc; /* xanh nhạt hơn khi hover */
  }

  @media (max-width: 768px) {
    max-width: 180px;
    width: 100%;
  }
`;

const SearchInput = styled.input`
  border: none;
  outline: none;
  background: transparent;
  flex: 1 1 auto;
  min-width: 0;
  font-size: ${theme.fontSize.sm};
  color: #0f172a;

  &::placeholder {
    color: #4b5563;
    opacity: 0.8;
  }
`;

const SearchIcon = styled(Search)`
  width: 16px;
  height: 16px;
  color: ${theme.colors.gray};
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  background-color: ${theme.colors.backgroundHover};
  position: relative;

  @media (max-width: 1275px) {
    display: block;
  }

  @media (max-width: 768px) {
    display: block;
    svg {
      width: 14px;
      height: 14px;
    }
    padding: 6px 8px;
  }
`;

const Menu = styled.div<{ open?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};

  @media (min-width: 1251px) {
    display: flex !important;
  }

  @media (min-width: 769px) and (max-width: 1275px) {
    position: absolute;
    top: 100%;
    left: 0;
    width: 210px;
    background: ${theme.colors.white};
    flex-direction: column;
    padding: ${theme.spacing.sm} 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
    max-height: 300px;
    overflow-y: auto;
    gap: 0;
    display: ${({ open }) => (open ? 'flex' : 'none')};
    z-index: 10;
    text-align: left;
    align-items: flex-start;
  }

  @media (max-width: 768px) {
    display: ${({ open }) => (open ? 'flex' : 'none')};
    flex-direction: column;
    width: 220px;
    max-height: 300px;
    overflow-y: auto;
    background: ${theme.colors.white};
    position: absolute;
    top: 100%;
    left: 0;
    padding: ${theme.spacing.sm} 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    box-sizing: border-box;
    z-index: 10;
    text-align: left;
    align-items: flex-start;
  }
`;

const MenuItem = styled.div`
  font-size: ${theme.fontSize.md};
  font-weight: bold;
  color: ${theme.colors.textPrimary};
  cursor: pointer;
  white-space: nowrap;
  padding: 8px 3px;
  border-radius: 6px;
  transition:
    background-color 0.3s,
    color 0.3s;

  &:hover,
  &:focus {
    color: ${theme.colors.textPrimaryHover};
    background-color: ${theme.colors.backgroundHover};
    outline: none;
  }

  @media (min-width: 769px) and (max-width: 1275px), (max-width: 768px) {
    display: block;
  }
`;

const MenuItemWrapper = styled.div`
  position: relative;
  display: inline-block;

  @media (max-width: 768px) {
    display: block;
    position: static;
  }
`;

const SubMenu = styled.ul<{ nested?: boolean }>`
  list-style: none;
  margin: 0;
  padding: 0;
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.border};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: ${theme.borderRadius.medium};
  position: absolute;
  top: 100%;
  left: 0;
  top: calc(100%);
  min-width: 180px;
  z-index: 1000;

  ${props =>
    props.nested &&
    `
    left: 100%;
    top: 0;
  `}

  @media (min-width: 769px) and (max-width: 1275px) {
    position: static;
    box-shadow: none;
    border: none;
    padding-left: ${props => (props.nested ? '24px' : '16px')};
    min-width: auto;
  }

  @media (max-width: 768px) {
    position: static;
    box-shadow: none;
    border: none;
    padding-left: ${props => (props.nested ? '24px' : '16px')};
    min-width: auto;
  }
`;

const SubMenuItem = styled.li`
  padding: 8px 16px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;

  &:hover {
    background-color: ${theme.colors.backgroundHover};
    font-weight: 600;
  }
`;

const RightArea = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const ButtonOutline = styled.button`
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.white};
  padding: 10px 24px;
  border-radius: ${theme.borderRadius.large};
  font-size: ${theme.fontSize.sm};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    border-color: ${theme.colors.gray};
  }

  @media (max-width: 768px) {
    padding: 6px 8px;
  }
`;

const ButtonPrimary = styled.button`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  padding: 10px 24px;
  border-radius: ${theme.borderRadius.large};
  font-size: ${theme.fontSize.sm};
  cursor: pointer;
  white-space: nowrap;

  &:hover {
    background: ${theme.colors.primaryHover};
  }

  @media (max-width: 768px) {
    padding: 6px 8px;
  }
`;

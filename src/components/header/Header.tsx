import LoginModal from '@components/modal/LoginModal';
import RegisterModal from '@components/modal/RegisterModal';
import ForgotPassword from '@components/modal/ForgotPasswordModal';
import { Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import LogoImg from '@/assets/image/cinema-logo.png';
import { useSelector, useDispatch } from 'react-redux';
import { Menu as MenuIcon, X as CloseIcon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { theme } from '@theme/Theme';
import type { RootState } from '@app/Store';
import { logout } from '@/app/slices/auth.slice';
import UserMenu from '@components/menu/UserMenu';
import LanguageSelector from '@components/language/LanguageSelector';
import ContentWrapper from '@components/base/ContentWrapper';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { useLoginModal } from '@contexts/LoginContext';
import FlagVN from '@/assets/image/flags/vn.png';
import FlagUS from '@/assets/image/flags/us.png';

import SearchByImageModal from '@components/modal/SearchByImageModal';

export default function Header() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { auth, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [searchTerm, setSearchTerm] = useState('');

  const [isSearchImageOpen, setIsSearchImageOpen] = useState(false);

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    navigate(`/search?keyword=${encodeURIComponent(searchTerm.trim())}`);
  };

  const { isLoginOpen, openLogin, closeLogin } = useLoginModal();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1920
  );
  const [isLangMenuOpen, setLangMenuOpen] = useState(false);

  const isMobile = viewportWidth <= 767;
  const isTablet = viewportWidth >= 768 && viewportWidth <= 1023;

  const openLoginModal = () => openLogin();
  const closeLoginModal = () => closeLogin();
  const openRegisterModal = () => setIsRegisterOpen(true);
  const closeRegisterModal = () => setIsRegisterOpen(false);
  const openForgotModal = () => setIsForgotOpen(true);
  const closeForgotModal = () => setIsForgotOpen(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
    setLangMenuOpen(false);
    setHoveredMenu(null);
  };

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
      setViewportWidth(window.innerWidth);
      if (window.innerWidth > 767) {
        setMobileMenuOpen(false);
        setLangMenuOpen(false);
      }
      if (window.innerWidth > 1023) {
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

  type MenuItemConfig = {
    key: string;
    label: string;
    onClick?: () => void;
    subItems?: { key: string; label: string; onClick: () => void }[];
  };

  const menuItems: MenuItemConfig[] = [
    {
      key: 'movies',
      label: t('NAV_MOVIES'),
      subItems: [
        { key: 'movies-now', label: t('NAV_MOVIES_NOW_SHOWING'), onClick: () => navigate('/movies/now-showing') },
        { key: 'movies-soon', label: t('NAV_MOVIES_COMING_SOON'), onClick: () => navigate('/movies/coming-soon') },
      ],
    },
    { key: 'cinemas', label: t('NAV_CINEMAS'), onClick: () => navigate('/cinemas') },
    { key: 'coupons', label: t('NAV_PROMOTIONS'), onClick: () => navigate('/coupons') },
    {
      key: 'cinema_corner',
      label: t('NAV_CINEMA_CORNER'),
      subItems: [
        { key: 'blogs', label: t('NAV_BLOG_MOVIES'), onClick: () => navigate('/blogs') },
        { key: 'reviews', label: t('NAV_REVIEWS_MOVIES'), onClick: () => navigate('/reviews') },
      ],
    },
  ];

  const visibleTabletCount = 3;
  const visibleMenuItems = isTablet ? menuItems.slice(0, visibleTabletCount) : menuItems;
  const extraMenuItems = isTablet ? menuItems.slice(visibleTabletCount) : [];

  const currentLang = i18n.language?.startsWith('en') ? 'en' : 'vi';
  const currentFlag = currentLang === 'vi' ? FlagVN : FlagUS;

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  return (
    <>
      <Container>
        <ContentWrapper>
          <HeaderContent>
            <TopRow>
              {isMobile && (
                <MobileLeft>
                  <HamburgerButton onClick={toggleMobileMenu} aria-label="Toggle menu">
                    {isMobileMenuOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
                  </HamburgerButton>
                </MobileLeft>
              )}

              <LogoArea $centerMobile={isMobile}>
                <Link to="/">
                  <Logo src={LogoImg} alt="GoCinema" />
                </Link>
              </LogoArea>

              {!isMobile && (
                <DesktopSearch>
                  <SearchBox>
                    <SearchInput
                      placeholder={t('SEARCH_PLACEHOLDER') || 'Tìm phim, rạp'}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />

                    <SearchActions>
                      <IconButton
                        type="button"
                        onClick={() => setIsSearchImageOpen(true)}
                        aria-label="Search by image"
                        title={t('SEARCH_BY_IMAGE') || 'Tìm bằng hình ảnh'}
                      >
                        <ImageIcon size={18} />
                      </IconButton>
                    </SearchActions>
                  </SearchBox>
                </DesktopSearch>
              )}

              {!isMobile && (
                <Menu ref={menuRef} $isTablet={isTablet}>
                  {visibleMenuItems.map(item => (
                    <MenuItemWrapper
                      key={item.key}
                      onMouseEnter={() => !isMobile && setHoveredMenu(item.key)}
                      onMouseLeave={() => !isMobile && setHoveredMenu(null)}
                    >
                      <MenuItem
                        onClick={() => {
                          if (item.subItems) {
                            setHoveredMenu(prev => (prev === item.key ? null : item.key));
                          } else {
                            item.onClick?.();
                            setHoveredMenu(null);
                          }
                        }}
                      >
                        {item.label}
                        {item.subItems &&
                          (hoveredMenu === item.key ? (
                            <FaChevronUp size={12} style={{ marginLeft: 4 }} />
                          ) : (
                            <FaChevronDown size={12} style={{ marginLeft: 4 }} />
                          ))}
                      </MenuItem>

                      {item.subItems && hoveredMenu === item.key && (
                        <SubMenu>
                          {item.subItems.map(sub => (
                            <SubMenuItem
                              key={sub.key}
                              onClick={() => {
                                sub.onClick();
                                setHoveredMenu(null);
                              }}
                            >
                              {sub.label}
                            </SubMenuItem>
                          ))}
                        </SubMenu>
                      )}
                    </MenuItemWrapper>
                  ))}

                  {isTablet && extraMenuItems.length > 0 && (
                    <MenuItemWrapper onMouseEnter={() => setHoveredMenu('more')} onMouseLeave={() => setHoveredMenu(null)}>
                      <MenuItem>
                        Thêm
                        {hoveredMenu === 'more' ? (
                          <FaChevronUp size={12} style={{ marginLeft: 4 }} />
                        ) : (
                          <FaChevronDown size={12} style={{ marginLeft: 4 }} />
                        )}
                      </MenuItem>

                      {hoveredMenu === 'more' && (
                        <SubMenu>
                          {extraMenuItems.map(item => (
                            <div key={item.key}>
                              <SubMenuItem
                                onClick={() => {
                                  item.onClick?.();
                                  setHoveredMenu(null);
                                }}
                              >
                                {item.label}
                              </SubMenuItem>
                              {item.subItems?.map(sub => (
                                <NestedSubMenuItem
                                  key={sub.key}
                                  onClick={() => {
                                    sub.onClick();
                                    setHoveredMenu(null);
                                  }}
                                >
                                  {sub.label}
                                </NestedSubMenuItem>
                              ))}
                            </div>
                          ))}
                        </SubMenu>
                      )}
                    </MenuItemWrapper>
                  )}
                </Menu>
              )}

              {!isMobile && (
                <RightArea>
                  {isAuthenticated && auth ? (
                    <UserMenu auth={auth} onLogout={handleLogout} />
                  ) : (
                    <>
                      <ButtonOutline onClick={openRegisterModal}>{t('AUTH_SIGNUP')}</ButtonOutline>
                      <ButtonPrimary onClick={openLoginModal}>{t('AUTH_LOGIN')}</ButtonPrimary>
                    </>
                  )}
                  <LanguageSelectorWrapper>
                    <LanguageSelector />
                  </LanguageSelectorWrapper>
                </RightArea>
              )}

              {isMobile && (
                <RightCompact>
                  {isAuthenticated && auth ? (
                    <UserMenu auth={auth} onLogout={handleLogout} />
                  ) : (
                    <CompactLoginButton onClick={openLoginModal}>{t('AUTH_LOGIN')}</CompactLoginButton>
                  )}

                  <MobileLangButton onClick={() => setLangMenuOpen(p => !p)}>
                    <img src={currentFlag} alt="lang" />
                  </MobileLangButton>

                  {isLangMenuOpen && (
                    <MobileLangMenu>
                      <LangOption
                        onClick={() => {
                          changeLanguage('vi');
                          setLangMenuOpen(false);
                        }}
                      >
                        <img src={FlagVN} alt="VN" />
                        <span>VN</span>
                      </LangOption>
                      <LangOption
                        onClick={() => {
                          changeLanguage('en');
                          setLangMenuOpen(false);
                        }}
                      >
                        <img src={FlagUS} alt="EN" />
                        <span>EN</span>
                      </LangOption>
                    </MobileLangMenu>
                  )}
                </RightCompact>
              )}
            </TopRow>

            {isMobile && (
              <MobileSearchRow>
                <SearchBox>
                  <SearchInput
                    placeholder={t('SEARCH_PLACEHOLDER') || 'Tìm phim, rạp'}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  />

                  <SearchActions>
                    <IconButton
                      type="button"
                      onClick={() => setIsSearchImageOpen(true)}
                      aria-label="Search by image"
                      title={t('SEARCH_BY_IMAGE') || 'Tìm bằng hình ảnh'}
                    >
                      <ImageIcon size={18} />
                    </IconButton>

                  </SearchActions>
                </SearchBox>
              </MobileSearchRow>
            )}
          </HeaderContent>
        </ContentWrapper>

        {isMobile && isMobileMenuOpen && (
          <MobileDrawer>
            <DrawerOverlay onClick={() => setMobileMenuOpen(false)} />
            <DrawerPanel>
              <DrawerHeader>
                <span>{t('NAV_MENU') || 'Menu'}</span>
                <CloseSmall onClick={() => setMobileMenuOpen(false)}>
                  <CloseIcon size={18} />
                </CloseSmall>
              </DrawerHeader>

              <DrawerMenu>
                {menuItems.map(item => (
                  <DrawerItem key={item.key}>
                    <DrawerItemTitle
                      onClick={() => {
                        item.onClick?.();
                        setMobileMenuOpen(false);
                      }}
                    >
                      {item.label}
                    </DrawerItemTitle>

                    {item.subItems && (
                      <DrawerSubList>
                        {item.subItems.map(sub => (
                          <button
                            key={sub.key}
                            onClick={() => {
                              sub.onClick();
                              setMobileMenuOpen(false);
                            }}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </DrawerSubList>
                    )}
                  </DrawerItem>
                ))}
              </DrawerMenu>
            </DrawerPanel>
          </MobileDrawer>
        )}
      </Container>

      <SearchByImageModal
        isOpen={isSearchImageOpen}
        onClose={() => setIsSearchImageOpen(false)}
        // Nếu bạn muốn click item trong kết quả => điều hướng
        onSelectResult={(item: any) => {
          // Ví dụ: nếu backend trả { id } cho movie:
          if (item?.id) navigate(`/movies/${item.id}`);
          setIsSearchImageOpen(false);
        }}
      />

      <LoginModal
        open={isLoginOpen}
        handleClose={closeLoginModal}
        handleForgotPassword={handleForgotPassword}
        handleRegister={handleRegister}
      />
      <RegisterModal open={isRegisterOpen} handleClose={closeRegisterModal} handleLogin={handleLogin} />
      <ForgotPassword open={isForgotOpen} handleClose={closeForgotModal} />
    </>
  );
}

const Container = styled.header`
  width: 100%;
  font-family: ${theme.fontFamily.primary};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  background: #fff;
  z-index: 100;
`;

const HeaderContent = styled.header`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.sm};

  @media (max-width: 900px) {
    padding: ${theme.spacing.sm};
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.md};
`;

const DesktopSearch = styled.div`
  flex: 1 1 320px;
  display: flex;
  justify-content: center;
`;

const MobileLeft = styled.div`
  display: flex;
  align-items: center;
`;

const LogoArea = styled.div<{ $centerMobile?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $centerMobile }) =>
    $centerMobile ? 'center' : 'flex-start'};
  flex: ${({ $centerMobile }) => ($centerMobile ? '1 1 auto' : '0 0 auto')};
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

  background: rgba(248, 250, 252, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.18);
  border-radius: ${theme.borderRadius.large};

  padding: ${theme.spacing.xs} ${theme.spacing.md};
  max-width: 520px;
  width: 100%;
  flex: 1 1 auto;
  min-width: 0;

  transition: background 0.15s ease, border-color 0.15s ease;

  &:hover {
    background: rgba(241, 245, 249, 1);
    border-color: rgba(59, 130, 246, 0.28);
  }

  &:focus-within {
    background: rgba(59, 130, 246, 0.05);
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
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

  @media (max-width: 640px) {
    font-size: 13px;
  }
`;

const HamburgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  background-color: ${theme.colors.backgroundHover};
  padding: 8px;
  border-radius: ${theme.borderRadius.medium};

  @media (max-width: 767px) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
`;

const Menu = styled.div<{ $isTablet?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  flex-wrap: ${({ $isTablet }) => ($isTablet ? 'wrap' : 'nowrap')};

  @media (max-width: 1023px) {
    display: ${({ $isTablet }) => ($isTablet ? 'flex' : 'none')};
    justify-content: center;
    gap: ${theme.spacing.sm};
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const MenuItem = styled.div`
  font-size: ${theme.fontSize.md};
  font-weight: bold;
  color: ${theme.colors.textPrimary};
  cursor: pointer;
  white-space: nowrap;
  padding: 8px 6px;
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

  @media (max-width: 1023px) {
    font-size: 15px;
  }
`;

const MenuItemWrapper = styled.div`
  position: relative;
  display: inline-block;
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
  min-width: 200px;
  z-index: 1000;
`;

const SubMenuItem = styled.li`
  padding: 10px 16px;
  cursor: pointer;
  user-select: none;
  white-space: nowrap;

  &:hover {
    background-color: ${theme.colors.backgroundHover};
    font-weight: 600;
  }
`;

const NestedSubMenuItem = styled(SubMenuItem)`
  padding-left: 28px;
  font-size: 14px;
`;

const RightArea = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
  justify-content: flex-end;

  @media (max-width: 1023px) {
    gap: ${theme.spacing.sm};
  }
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
`;

const LanguageSelectorWrapper = styled.div`
  width: 90px;
  flex-shrink: 0;

  @media (max-width: 1023px) {
    width: 80px;
  }
`;

const RightCompact = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  position: relative;
`;

const CompactLoginButton = styled.button`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  border: none;
  padding: 8px 12px;
  border-radius: ${theme.borderRadius.medium};
  font-size: 13px;
  cursor: pointer;
`;

const MobileLangButton = styled.button`
  background: ${theme.colors.backgroundHover};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  img {
    width: 20px;
    height: 14px;
    display: block;
  }
`;

const MobileLangMenu = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  z-index: 20;
`;

const LangOption = styled.button`
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
  border-radius: ${theme.borderRadius.small};

  &:hover {
    background: ${theme.colors.backgroundHover};
  }

  img {
    width: 20px;
    height: 14px;
  }
`;

const MobileSearchRow = styled.div`
  margin-top: ${theme.spacing.sm};
`;

const MobileDrawer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
`;

const DrawerOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
`;

const DrawerPanel = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 82%;
  max-width: 320px;
  height: 100%;
  background: ${theme.colors.white};
  padding: ${theme.spacing.md};
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 700;
  font-size: 18px;
`;

const CloseSmall = styled.button`
  background: ${theme.colors.backgroundHover};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  padding: 6px;
  cursor: pointer;
`;

const DrawerMenu = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const DrawerItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const DrawerItemTitle = styled.div`
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  color: ${theme.colors.textPrimary};
`;

const DrawerSubList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  button {
    text-align: left;
    border: none;
    background: ${theme.colors.background};
    padding: 8px 10px;
    border-radius: ${theme.borderRadius.small};
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background: ${theme.colors.backgroundHover};
    }
  }
`;

const SearchActions = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
`;

const IconButton = styled.button`
  border: 1px solid rgba(59, 130, 246, 0.25);
  background: rgba(59, 130, 246, 0.10) !important;
  cursor: pointer;

  width: 34px;
  height: 34px;
  padding: 0;
  border-radius: 999px;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  color: #2563eb !important;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;

  svg { width: 18px; height: 18px; display: block; }
  svg, svg * {
    stroke: currentColor !important;
    fill: none !important;
    opacity: 1 !important;
    visibility: visible !important;
  }

  &:hover {
    background: rgba(59, 130, 246, 0.16) !important;
    box-shadow: 0 6px 16px rgba(59, 130, 246, 0.20);
    transform: translateY(-1px);
  }

  &:active { transform: scale(0.98); }
`;
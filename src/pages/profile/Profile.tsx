import React, { useState } from 'react';
import styled from 'styled-components';
import { useDispatch } from 'react-redux';
import ProfileSidebar from './ProfileSidebar';
import type { ProfileTab } from './ProfileSidebar';
import ProfileInfo from './components/ProfileInfo';
import History from './components/History';
import Member from './components/Member';
import { logout } from '@/app/slices/auth.slice';
import { theme } from '@/theme/Theme';
import { useTranslation } from 'react-i18next';

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = '/';
  };

  const handleTabChange = (tab: ProfileTab) => {
    setActiveTab(tab);
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileInfo />;
      case 'history':
        return <History />;
      case 'member':
        return <Member />;
      default:
        return <ProfileInfo />;
    }
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'profile':
        return t('INFO_PROFILE');
      case 'history':
        return t('PURCHASE_HISTORY');
      case 'member':
        return t('CINESTAR_MEMBER');
      default:
        return t('INFO_PROFILE');
    }
  };

  return (
    <PageWrapper>
      <SidebarArea>
        <ProfileSidebar
          onLogout={handleLogout}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      </SidebarArea>
      <MainArea>
        <Title>{getPageTitle()}</Title>
        {renderMainContent()}
      </MainArea>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  min-height: 70vh;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};

  @media (max-width: 1024px) {
    flex-direction: column;
    padding: ${theme.spacing.md};
    gap: ${theme.spacing.md};
  }
`;

const SidebarArea = styled.div`
  flex: 0 0 340px;
  position: sticky;
  top: ${theme.spacing.lg};
  z-index: 10;

  @media (max-width: 1024px) {
    flex: none;
    width: 100%;
    position: static;
  }
`;

const MainArea = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  position: relative;
  z-index: 1;
`;

const Title = styled.h1`
  color: ${theme.colors.bgLight};
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 ${theme.spacing.md} 0;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 24px;
    text-align: center;
  }
`;

export default ProfilePage;

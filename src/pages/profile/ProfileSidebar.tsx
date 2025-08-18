import React from 'react';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/Store';
import { FiUser, FiStar, FiClock, FiLogOut } from 'react-icons/fi';
import { theme } from '@/theme/Theme';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
  onLogout: () => void;
}

const ProfileSidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const user = useSelector((state: RootState) => state.auth.auth);
  const { t } = useTranslation();

  return (
    <SidebarContainer>
      <UserInfo>
        <UserAvatar>
          <FiUser size={48} />
        </UserAvatar>
        <UserName>{user?.name}</UserName>
        <ChangeAvatar>{t('CHANGE_AVATAR')}</ChangeAvatar>
      </UserInfo>
      <CFriendsButton>{t('C_FRIENDS')}</CFriendsButton>
      <Menu>
        <MenuItem active>
          <FiUser size={20} />
          <span>{t('CUSTOMER_INFO')}</span>
        </MenuItem>
        <MenuItem>
          <FiStar size={20} />
          <span>{t('CINESTAR_MEMBER')}</span>
        </MenuItem>
        <MenuItem>
          <FiClock size={20} />
          <span>{t('PURCHASE_HISTORY')}</span>
        </MenuItem>
      </Menu>
      <Logout onClick={onLogout}>
        <FiLogOut size={20} />
        <span>{t('LOGOUT')}</span>
      </Logout>
    </SidebarContainer>
  );
};

const SidebarContainer = styled.div`
  width: calc(100% - 40px);
  max-width: 340px;
  background: linear-gradient(135deg, #6d5edc, #2193b0);
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  margin-top: 80px;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: fit-content;
  position: relative;
  z-index: 10;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding-bottom: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
`;

const UserAvatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${theme.colors.bgLight};
  border: 2px solid ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${theme.spacing.sm};
  color: #fff;
`;

const UserName = styled.div`
  font-size: ${theme.fontSize.lg};
  font-weight: 600;
  color: #fff;
`;

const ChangeAvatar = styled.div`
  font-size: ${theme.fontSize.sm};
  color: #e0e0e0;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${theme.colors.primary};
  }
`;

const CFriendsButton = styled.div`
  background: linear-gradient(
    135deg,
    ${theme.colors.primary},
    ${theme.colors.primaryHover}
  );
  color: #fff;
  font-weight: 600;
  text-align: center;
  padding: ${theme.spacing.md} 0;
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.fontSize.lg};
  margin-top: ${theme.spacing.sm};
`;

const Menu = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
`;

const MenuItem = styled.div<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.fontSize.md};
  color: ${({ active }) => (active ? '#fff' : '#e0e0e0')};
  font-weight: ${({ active }) => (active ? '600' : '400')};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  cursor: pointer;
  border-radius: ${theme.borderRadius.small};
  background: ${({ active }) =>
    active ? 'rgba(255,255,255,0.12)' : 'transparent'};
  border-left: ${({ active }) =>
    active ? '3px solid #fff' : '3px solid transparent'};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
  }
`;

const Logout = styled.div`
  margin-top: ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.fontSize.md};
  color: #e0e0e0;
  cursor: pointer;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.small};
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.12);
  }
`;

export default ProfileSidebar;

import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/app/Store';
import { FiUser, FiStar, FiClock, FiLogOut } from 'react-icons/fi';
import { theme } from '@/theme/Theme';
import { useTranslation } from 'react-i18next';
import {
  useUploadAvatarMutation,
  useUpdateProfileMutation,
} from '@/app/services/user.api';
import { updateAuth } from '@/app/slices/auth.slice';
import { toast } from 'react-toastify';
import { resizeImage, validateImageFile } from '@/utils/imageUtils';

export type ProfileTab = 'profile' | 'history' | 'member';

interface SidebarProps {
  onLogout: () => void;
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}

const ProfileSidebar: React.FC<SidebarProps> = ({
  onLogout,
  activeTab,
  onTabChange,
}) => {
  const user = useSelector((state: RootState) => state.auth.auth);
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [uploadAvatar] = useUploadAvatarMutation();
  const [updateProfile] = useUpdateProfileMutation();

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Resize ảnh trước khi upload
      const resizedFile = await resizeImage(file, 400, 400, 0.8);

      // Upload ảnh
      const formData = new FormData();
      formData.append('file', resizedFile);

      const uploadResult = await uploadAvatar(formData).unwrap();
      console.log('Avatar uploaded:', uploadResult);

      // Cập nhật profile với avatar mới
      const updateData = {
        name: user.name,
        phone: user.phone,
        dob: user.dob,
        avatar: uploadResult.url,
      };

      const profileResult = await updateProfile(updateData).unwrap();

      console.log('Profile updated:', profileResult);
      // Cập nhật thông tin user trong Redux store
      dispatch(
        updateAuth({
          id: profileResult.id.toString(),
          name: profileResult.name,
          email: profileResult.email,
          phone: profileResult.phone,
          dob: profileResult.dob,
          avatar: profileResult.avatar,
          role: profileResult.role,
          enabled: profileResult.enabled,
          createdAt: profileResult.createdAt,
          updatedAt: profileResult.updatedAt,
        })
      );

      toast.success('Cập nhật avatar thành công!');
    } catch (error: any) {
      console.error('Upload avatar error:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi cập nhật avatar!');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  return (
    <SidebarContainer>
      <UserInfo>
        <UserAvatar onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <FiUser size={48} />
          )}
          {isUploadingAvatar && (
            <UploadOverlay>
              <div>Đang tải...</div>
            </UploadOverlay>
          )}
        </UserAvatar>
        <UserName>{user?.name}</UserName>
        <ChangeAvatar onClick={handleAvatarClick}>
          {t('CHANGE_AVATAR')}
        </ChangeAvatar>
        <HiddenFileInput
          ref={fileInputRef}
          type='file'
          accept='image/*'
          onChange={handleAvatarChange}
        />
      </UserInfo>
      <CFriendsButton>{t('C_FRIENDS')}</CFriendsButton>
      <Menu>
        <MenuItem
          active={activeTab === 'profile'}
          onClick={() => onTabChange('profile')}
        >
          <FiUser size={20} />
          <span>{t('CUSTOMER_INFO')}</span>
        </MenuItem>
        <MenuItem
          active={activeTab === 'member'}
          onClick={() => onTabChange('member')}
        >
          <FiStar size={20} />
          <span>{t('CINESTAR_MEMBER')}</span>
        </MenuItem>
        <MenuItem
          active={activeTab === 'history'}
          onClick={() => onTabChange('history')}
        >
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
  position: relative;
  overflow: hidden;
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
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

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  color: white;
  font-size: ${theme.fontSize.sm};
  font-weight: 500;
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

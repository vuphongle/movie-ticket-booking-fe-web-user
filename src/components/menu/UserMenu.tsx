import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  Menu as MuiMenu,
  MenuItem as MuiMenuItem,
  Avatar as MuiAvatar,
  Divider,
  ListItemIcon,
} from '@mui/material';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import LogoutIcon from '@mui/icons-material/Logout';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';

interface UserMenuProps {
  auth: {
    name?: string;
    avatar?: string;
  };
  onLogout: () => void;
}

export default function UserMenu({ auth, onLogout }: UserMenuProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    onLogout();
    handleClose();
  };

  const handleProfileClick = () => {
    navigate('/profile');
    handleClose();
  };

  return (
    <Wrapper>
      <Trigger onClick={handleClick}>
        <StyledAvatar src={auth?.avatar} alt={auth?.name} />
        <NameTitle title={auth?.name}>{auth?.name}</NameTitle>
      </Trigger>

      <StyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <StyledMenuItem onClick={handleProfileClick}>
          <ListItemIcon>
            <AccountBoxIcon fontSize='small' />
          </ListItemIcon>
          {t('USER_PROFILE')}
        </StyledMenuItem>

        <StyledDivider />

        <StyledMenuItem onClick={handleLogoutClick}>
          <ListItemIcon>
            <LogoutIcon fontSize='small' />
          </ListItemIcon>
          {t('USER_LOGOUT')}
        </StyledMenuItem>
      </StyledMenu>
    </Wrapper>
  );
}

/* Styled Components */
const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const Trigger = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

const NameTitle = styled.span`
  display: inline-block;
  max-width: 120px; /* adjust as needed */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
`;

const StyledAvatar = styled(MuiAvatar)`
  width: 32px;
  height: 32px;
`;

const StyledMenu = styled(MuiMenu)`
  .MuiPaper-root {
    margin-top: 12px;
    overflow: visible;
    filter: drop-shadow(0px 2px 8px rgba(0, 0, 0, 0.1));
    background-color: ${theme.colors.white};
    border-radius: 8px;
  }

  .MuiList-root {
    padding-top: 0;
    padding-bottom: 0;
  }
`;

const StyledMenuItem = styled(MuiMenuItem)`
  min-width: 160px;
  padding: 8px 16px;
  position: relative;
  color: ${theme.colors.textPrimary};
  font-size: 14px;

  .MuiListItemIcon-root {
    min-width: 20px !important;
    margin-right: 8px;
    color: inherit;
  }

  &:hover {
    color: ${theme.colors.primary};
    font-weight: bold;
    background-color: ${theme.colors.backgroundHover};
  }

  &:hover::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background-color: ${theme.colors.primary};
  }
`;

const StyledDivider = styled(Divider)`
  background-color: ${theme.colors.border};
  margin: 0;
  padding: 0;
`;

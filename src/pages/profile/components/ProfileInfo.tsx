import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/app/Store';
import ChangePassword from './ChangePassword';
import { theme } from '@/theme/Theme';
import { useTranslation } from 'react-i18next';
import { useUpdateProfileMutation } from '@/app/services/user.api';
import { updateAuth } from '@/app/slices/auth.slice';
import { toast } from 'react-toastify';

function toISODate(input?: string | number | Date | null): string {
  const defaultDate = new Date().toISOString().slice(0, 10);
  if (input === undefined || input === null) return defaultDate;

  if (input instanceof Date) {
    return input.toISOString().slice(0, 10);
  }

  if (typeof input === 'number' && !Number.isNaN(input)) {
    const fromMillis = new Date(input);
    return Number.isNaN(fromMillis.getTime())
      ? defaultDate
      : fromMillis.toISOString().slice(0, 10);
  }

  const s = String(input).trim();
  if (!s) {
    return defaultDate;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s;
  }

  if (/^\d+$/.test(s)) {
    const millis = Number(s);
    if (!Number.isNaN(millis)) {
      const fromMillis = new Date(millis);
      if (!Number.isNaN(fromMillis.getTime())) {
        return fromMillis.toISOString().slice(0, 10);
      }
    }
  }

  const parsed = new Date(s);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString().slice(0, 10);
  }

  return defaultDate;
}

function calcAge(date: string): number {
  const dob = new Date(date);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
  return age;
}

type FormState = {
  name: string;
  dob: string;
  phone: string;
  email: string;
};

const ProfileInfo: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.auth);
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const initialForm: FormState = useMemo(
    () => ({
      name: user?.name || '',
      dob: toISODate(user?.dob || null),
      phone: user?.phone || '',
      email: user?.email || '',
    }),
    [user]
  );

  const [form, setForm] = useState<FormState>(initialForm);

  React.useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  if (!user) {
    return <div>Không tìm thấy thông tin người dùng.</div>;
  }

  const validateForm = (data: FormState) => {
    const errs: Record<string, string> = {};
    if (!data.name.trim()) errs.name = t('NAME_REQUIRED');
    else if (data.name.trim().length < 2) errs.name = t('NAME_TOO_SHORT');
    if (!/^0[0-9]{9}$/.test(data.phone)) errs.phone = t('PHONE_INVALID');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      errs.email = t('EMAIL_INVALID');
    if (!data.dob) errs.dob = t('DOB_REQUIRED');
    else {
      const dobYear = new Date(data.dob).getFullYear();
      if (dobYear < 1900)
        errs.dob = t('DOB_YEAR_TOO_OLD') || 'Năm sinh không được nhỏ hơn 1900';
      else if (calcAge(data.dob) < 12) errs.dob = t('DOB_TOO_YOUNG');
      else if (data.dob > todayISO) errs.dob = t('DOB_INVALID_FUTURE');
    }
    return errs;
  };

  const errors = useMemo(() => validateForm(form), [form, t]);
  const isValid = Object.keys(errors).length === 0;

  const handleChange =
    (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setForm(prev => ({ ...prev, [key]: value }));
    };

  const handleSave = async () => {
    if (!isValid) return;

    try {
      const updateData = {
        name: form.name,
        phone: form.phone,
        dob: form.dob,
      };

      const result = await updateProfile(updateData).unwrap();

      // Cập nhật thông tin user trong Redux store
      dispatch(
        updateAuth({
          id: result.id.toString(),
          name: result.name,
          email: result.email,
          phone: result.phone,
          dob: result.dob,
          avatar: result.avatar,
          role: result.role,
          enabled: result.enabled,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
        })
      );

      toast.success(
        t('UPDATE_PROFILE_SUCCESS') || 'Cập nhật thông tin thành công!'
      );
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast.error(
        error?.data?.message ||
          t('UPDATE_PROFILE_ERROR') ||
          'Có lỗi xảy ra khi cập nhật thông tin!'
      );
    }
  };

  return (
    <ProfileInfoContainer>
      <FormCard>
        <FormTitle>{t('USER_INFO')}</FormTitle>
        <FormRow>
          <FormGroup>
            <Label>{t('FULL_NAME')}</Label>
            <Input value={form.name} onChange={handleChange('name')} />
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
          </FormGroup>
          <FormGroup>
            <Label>{t('BIRTHDAY')}</Label>
            <DateInput
              value={form.dob}
              onChange={handleChange('dob')}
              min='1900-01-01'
              max={todayISO}
            />
            {errors.dob && <ErrorText>{errors.dob}</ErrorText>}
          </FormGroup>
        </FormRow>
        <FormRow>
          <FormGroup>
            <Label>{t('PHONE_NUMBER')}</Label>
            <Input
              value={form.phone}
              onChange={handleChange('phone')}
              inputMode='numeric'
            />
            {errors.phone && <ErrorText>{errors.phone}</ErrorText>}
          </FormGroup>
          <FormGroup>
            <Label>{t('EMAIL')}</Label>
            <Input
              type='email'
              value={form.email}
              onChange={handleChange('email')}
              readOnly
              disabled
            />
            {errors.email && <ErrorText>{errors.email}</ErrorText>}
          </FormGroup>
        </FormRow>
        <SaveButton onClick={handleSave} disabled={!isValid || isLoading}>
          {isLoading ? t('SAVING') || 'Đang lưu...' : t('SAVE_INFO')}
        </SaveButton>
      </FormCard>
      <ChangePassword />
    </ProfileInfoContainer>
  );
};

const ProfileInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FormCard = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  box-shadow: 0 4px 20px rgba(23, 13, 13, 0.08);
  border: 1px solid ${theme.colors.border};
  position: relative;
  z-index: 1;
`;

const FormTitle = styled.h2`
  font-size: ${theme.fontSize.xl};
  font-weight: 600;
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${theme.colors.textPrimary};
`;

const FormRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
  }
`;

const FormGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${theme.fontSize.md};
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const Input = styled.input`
  padding: 12px ${theme.spacing.md};
  font-size: ${theme.fontSize.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  background: ${theme.colors.white};
  color: ${theme.colors.textPrimary};
  font-weight: 400;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}20;
  }

  &:disabled {
    background: #f5f5f5;
    color: #aaa;
    cursor: not-allowed;
    border: 1px solid ${theme.colors.border};
    opacity: 1;
  }
`;

const DateInput = styled(Input).attrs({ type: 'date' })`
  &::-webkit-calendar-picker-indicator {
    cursor: pointer;
  }
`;

const ErrorText = styled.span`
  color: red;
  font-size: ${theme.fontSize.sm};
`;

const SaveButton = styled.button<{ disabled?: boolean }>`
  margin-top: ${theme.spacing.md};
  padding: 12px ${theme.spacing.lg};
  font-size: ${theme.fontSize.md};
  font-weight: 600;
  background: ${({ disabled }) =>
    disabled
      ? theme.colors.border
      : 'linear-gradient(90deg, #6d5edc, #2193b0)'};
  background-size: 200% 100%;
  background-position: left;
  color: #fff;
  border: none;
  border-radius: ${theme.borderRadius.small};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition:
    background-position 0.5s,
    transform 0.2s;
  width: 100%;

  &:hover {
    background-position: right;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default ProfileInfo;

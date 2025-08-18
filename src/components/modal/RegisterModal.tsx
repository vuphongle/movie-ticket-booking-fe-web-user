import { yupResolver } from '@hookform/resolvers/yup';
import { theme } from '@theme/Theme';
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import * as yup from 'yup';

import { useRegisterAccountMutation } from '@app/services/auth.api';
import ModalBase from '@components/base/ModalBase';

interface RegisterModalProps {
  open: boolean;
  handleClose: () => void;
  handleLogin: () => void;
}

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  dob: string;
}

const RegisterModal: React.FC<RegisterModalProps> = ({
  open,
  handleClose,
  handleLogin,
}) => {
  const { t, i18n } = useTranslation();

  const schema = useMemo(
    () =>
      yup.object({
        name: yup.string().required(t('REGISTER_NAME_REQUIRED')),
        email: yup
          .string()
          .email(t('REGISTER_EMAIL_INVALID'))
          .required(t('REGISTER_EMAIL_REQUIRED')),
        phone: yup
          .string()
          .required(t('REGISTER_PHONE_REQUIRED'))
          .matches(
            /(03|05|07|08|09|01[2|6|8|9])+([0-9]{8})\b/,
            t('REGISTER_PHONE_INVALID')
          ),
        dob: yup
          .string()
          .required(t('REGISTER_DOB_REQUIRED'))
          .test('age', t('REGISTER_DOB_TOO_YOUNG'), value => {
            if (!value) return false;
            const dob = new Date(value);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
              age--;
            }
            return age >= 12;
          }),
        password: yup.string().required(t('REGISTER_PASSWORD_REQUIRED')),
        confirmPassword: yup
          .string()
          .oneOf(
            [yup.ref('password'), undefined],
            t('REGISTER_CONFIRM_PASSWORD_MATCH')
          )
          .required(t('REGISTER_CONFIRM_PASSWORD_REQUIRED')),
      }),
    [i18n.language]
  );

  const [registerAccount, { isLoading }] = useRegisterAccountMutation();

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const isFirstMount = useRef(true);

  useEffect(() => {
    if (open && isFirstMount.current) {
      reset();
      isFirstMount.current = false;
    }
  }, [open, reset]);

  useEffect(() => {
    if (!open) {
      clearErrors();
    }
  }, [open, clearErrors]);

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerAccount(data).unwrap();
      toast.success(t('REGISTER_SUCCESS_MESSAGE'));
      handleClose();
      reset();
    } catch (error: any) {
      if (error?.data?.code === 'EMAIL_ALREADY_EXISTS') {
        toast.error(t('EMAIL_ALREADY_EXISTS'));
      } else if (error?.data?.code === 'ACCOUNT_NOT_ACTIVATED') {
        toast.error(t('REGISTER_ACCOUNT_NOT_ACTIVATED'));
      } else {
        toast.error(error?.data?.message || t('MESSAGES_ERROR'));
      }
    }
  };

  return (
    <>
      <ModalBase
        isOpen={open}
        onClose={handleClose}
        size='sm'
        style={{ width: '550px' }}
        zIndex={1080}
      >
        <ContentWrapper>
          <Title>{t('REGISTER_TITLE')}</Title>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Field>
              <Label htmlFor='name'>{t('REGISTER_NAME')}</Label>
              <Input
                type='text'
                id='name'
                placeholder={t('REGISTER_NAME_PLACEHOLDER')}
                {...register('name')}
                error={!!errors.name}
              />
              {errors.name && <ErrorText>{errors.name.message}</ErrorText>}
            </Field>

            <GridTwoCols>
              <Field>
                <Label htmlFor='email'>{t('REGISTER_EMAIL')}</Label>
                <Input
                  type='email'
                  id='email'
                  placeholder={t('REGISTER_EMAIL_PLACEHOLDER')}
                  {...register('email')}
                  error={!!errors.email}
                />
                {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
              </Field>

              <Field>
                <Label htmlFor='phone'>{t('REGISTER_PHONE')}</Label>
                <Input
                  type='text'
                  id='phone'
                  placeholder={t('REGISTER_PHONE_PLACEHOLDER')}
                  {...register('phone')}
                  error={!!errors.phone}
                />
                {errors.phone && <ErrorText>{errors.phone.message}</ErrorText>}
              </Field>
            </GridTwoCols>

            <Field>
              <Label htmlFor='dob'>{t('REGISTER_DOB')}</Label>
              <Input
                type='date'
                id='dob'
                placeholder={t('REGISTER_DOB_PLACEHOLDER')}
                {...register('dob')}
                error={!!errors.dob}
              />
              {errors.dob && <ErrorText>{errors.dob.message}</ErrorText>}
            </Field>

            <Field>
              <Label htmlFor='password'>{t('REGISTER_PASSWORD')}</Label>
              <PasswordWrapper>
                <Input
                  type={showPassword.password ? 'text' : 'password'}
                  id='password'
                  placeholder={t('REGISTER_PASSWORD_PLACEHOLDER')}
                  {...register('password')}
                  error={!!errors.password}
                />
                <ToggleButton
                  type='button'
                  onClick={() => togglePasswordVisibility('password')}
                  title={t('REGISTER_SHOW_PASSWORD')}
                ></ToggleButton>
              </PasswordWrapper>
              {errors.password && (
                <ErrorText>{errors.password.message}</ErrorText>
              )}
            </Field>

            <Field>
              <Label htmlFor='confirmPassword'>
                {t('REGISTER_CONFIRM_PASSWORD')}
              </Label>
              <PasswordWrapper>
                <Input
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  id='confirmPassword'
                  placeholder={t('REGISTER_CONFIRM_PASSWORD_PLACEHOLDER')}
                  {...register('confirmPassword')}
                  error={!!errors.confirmPassword}
                />
                <ToggleButton
                  type='button'
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  title={t('REGISTER_SHOW_PASSWORD')}
                ></ToggleButton>
              </PasswordWrapper>
              {errors.confirmPassword && (
                <ErrorText>{errors.confirmPassword.message}</ErrorText>
              )}
            </Field>

            <SubmitButton type='submit' disabled={isLoading}>
              {isLoading && (
                <LoadingSpinner viewBox='0 0 24 24'>
                  <circle
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='white'
                    strokeWidth='4'
                    fill='none'
                    opacity='0.25'
                  />
                  <path
                    fill='white'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  />
                </LoadingSpinner>
              )}
              {t('REGISTER_SUBMIT')}
            </SubmitButton>

            <FooterText>
              {t('REGISTER_HAVE_ACCOUNT')}{' '}
              <LoginLink onClick={handleLogin}>
                {t('REGISTER_LOGIN_LINK')}
              </LoginLink>
            </FooterText>
          </form>
        </ContentWrapper>
      </ModalBase>
    </>
  );
};

export default RegisterModal;

// ===== styled components =====
const ContentWrapper = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.textPrimary};
  margin-bottom: 24px;
  text-align: center;
`;

const Field = styled.div`
  margin-top: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 6px;
  color: ${theme.colors.textPrimary};
`;

const Input = styled.input<{ error?: boolean }>`
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textPrimary};
  font-size: ${theme.fontSize.sm};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  width: 100%;
  box-sizing: border-box;

  &:focus {
    border-color: ${theme.colors.primary};
    outline: none;
  }
`;

const ErrorText = styled.p`
  margin-top: 4px;
  font-size: 0.75rem;
  color: ${theme.colors.error};
`;

const GridTwoCols = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const PasswordWrapper = styled.div`
  position: relative;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  color: ${theme.colors.textPrimary};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SubmitButton = styled.button`
  margin-top: 24px;
  width: 100%;
  padding: 12px 0;
  border-radius: 50px;
  background-color: ${theme.colors.primary};
  color: ${theme.colors.white};
  font-weight: 600;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover:not(:disabled) {
    background-color: ${theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.svg`
  animation: spin 1s linear infinite;
  margin-right: 8px;
  width: 20px;
  height: 20px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const FooterText = styled.p`
  margin-top: 16px;
  font-size: 0.875rem;
  color: ${theme.colors.textPrimary};
  text-align: center;
`;

const LoginLink = styled.span`
  font-weight: 600;
  color: ${theme.colors.primary};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

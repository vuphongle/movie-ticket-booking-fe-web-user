import { useLoginMutation } from '@/app/services/auth.api';
import ModalBase from '@components/base/ModalBase';
import ShowSuccessModal from '@components/modal/sub-modal/ShowSuccessModal';
import { yupResolver } from '@hookform/resolvers/yup';
import { theme } from '@theme/Theme';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import * as yup from 'yup';

interface LoginModalProps {
  open: boolean;
  handleClose: () => void;
  handleForgotPassword: () => void;
  handleRegister: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

const LoginModal: React.FC<LoginModalProps> = ({
  open,
  handleClose,
  handleForgotPassword,
  handleRegister,
}) => {
  const { t } = useTranslation();

  // modal state
  const [successOpen, setSuccessOpen] = useState(false);

  const [login, { isLoading }] = useLoginMutation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(
      yup
        .object({
          email: yup
            .string()
            .email(t('auth.email') + ' không đúng định dạng')
            .required(t('auth.email') + ' không được để trống'),
          password: yup
            .string()
            .required(t('auth.password') + ' không được để trống'),
        })
        .required()
    ),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data).unwrap();
      setSuccessOpen(true);
    } catch (error: any) {
      console.error('Login error**:', error);
      if (error?.data?.code === 'ACCOUNT_NOT_ACTIVATED') {
        toast.error(t('ACCOUNT_NOT_ACTIVATED'));
      } else if (error?.data?.code === 'INVALID_CREDENTIALS') {
        toast.error(t('INVALID_CREDENTIALS'));
      } else {
        toast.error(t('messages.error'));
      }
    }
  };

  return (
    <>
      <ModalBase
        isOpen={open}
        onClose={handleClose}
        size='sm'
        style={{ width: '400px' }}
        zIndex={1080}
      >
        <Wrapper>
          <Title>{t('login.title')}</Title>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Field>
              <Label htmlFor='email'>{t('auth.email')}</Label>
              <Input
                type='email'
                id='email'
                {...register('email')}
                placeholder={t('login.email_placeholder')}
              />
              {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
            </Field>

            <Field>
              <Label htmlFor='password'>{t('auth.password')}</Label>
              <PasswordWrapper>
                <Input
                  type='password'
                  id='password'
                  {...register('password')}
                  placeholder={t('login.password_placeholder')}
                />
              </PasswordWrapper>
              {errors.password && (
                <ErrorText>{errors.password.message}</ErrorText>
              )}
            </Field>

            <ForgotPasswordWrapper>
              <ForgotPassword onClick={handleForgotPassword}>
                {t('login.forgot_password')}
              </ForgotPassword>
            </ForgotPasswordWrapper>

            <SubmitButton type='submit' disabled={isLoading}>
              {isLoading && <LoadingSpinner />}
              {t('login.login_button')}
            </SubmitButton>

            <RegisterText>
              {t('login.register_prompt')}{' '}
              <RegisterLink onClick={handleRegister}>
                {t('login.register_link')}
              </RegisterLink>
            </RegisterText>
          </form>

          <Divider>
            <Line />
            {t('login.or') || 'HOẶC'}
            <Line />
          </Divider>

          <SocialLoginContainer>
            <GoogleButton>
              <GoogleIcon
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 90 92'
                fill='none'
              >
                {/* ...Google icon path */}
              </GoogleIcon>
              {t('login.google_login')}
            </GoogleButton>

            <FacebookButton>
              <FacebookIcon
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 24 24'
                fill='none'
              >
                {/* ...Facebook icon path */}
              </FacebookIcon>
              {t('login.facebook_login')}
            </FacebookButton>
          </SocialLoginContainer>
        </Wrapper>
      </ModalBase>

      <ShowSuccessModal
        open={successOpen}
        onClose={() => {
          setSuccessOpen(false);
          handleClose();
        }}
      />
    </>
  );
};

export default LoginModal;

const Wrapper = styled.div`
  padding: ${theme.spacing.lg};
`;

const Title = styled.h1`
  font-size: ${theme.fontSize.xl};
  font-weight: bold;
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
`;

const Field = styled.div`
  margin-top: ${theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  margin-bottom: ${theme.spacing.xs};
  font-size: ${theme.fontSize.sm};
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const Input = styled.input`
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
  color: ${theme.colors.error};
  font-size: 0.75rem;
  margin-top: ${theme.spacing.xs};
`;

const PasswordWrapper = styled.div`
  position: relative;
`;

const ForgotPasswordWrapper = styled.div`
  text-align: right;
  margin-top: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.md};
`;

const ForgotPassword = styled.span`
  display: inline-block;
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textPrimary};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  font-weight: 500;
  font-size: ${theme.fontSize.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: none;
  border-radius: ${theme.borderRadius.large};
  cursor: pointer;
  margin-bottom: ${theme.spacing.md};

  &:hover {
    background: ${theme.colors.primaryHover};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  margin-right: ${theme.spacing.xs};
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const RegisterText = styled.p`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textPrimary};
`;

const RegisterLink = styled.span`
  font-weight: 500;
  color: ${theme.colors.primary};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const GoogleButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  width: 100%;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.white};
  padding: ${theme.spacing.sm};
  font-size: ${theme.fontSize.sm};
  font-weight: 500;
  color: ${theme.colors.textPrimary};
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;

  &:hover {
    background: ${theme.colors.bgLight};
  }
`;

const FacebookButton = styled(GoogleButton)`
  background: #1877f2;
  color: white;
  border: none;

  &:hover {
    background: #145dbf;
  }
`;

const GoogleIcon = styled.svg`
  width: 18px;
  height: 18px;
`;

const FacebookIcon = styled.svg`
  width: 18px;
  height: 18px;
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.gray};
  font-size: ${theme.fontSize.sm};
  margin: ${theme.spacing.lg} 0;
`;

const Line = styled.div`
  flex: 1;
  height: 1px;
  background: ${theme.colors.border};
`;

const SocialLoginContainer = styled.div`
  display: flex;
  gap: 12px;
  flex-direction: column;
`;

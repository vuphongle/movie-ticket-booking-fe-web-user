import { useLoginMutation } from '@/app/services/auth.api';
import { yupResolver } from '@hookform/resolvers/yup';
import { theme } from '@theme/Theme';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import * as yup from 'yup';
import ModalBase from '../base/ModalBase';

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

  const onSubmit = (data: LoginFormData) => {
    login(data)
      .unwrap()
      .then(() => {
        toast.success(t('messages.login_success'));
        handleClose();
      })
      .catch(error => {
        console.error(error);
        toast.error(error.data.message || t('messages.error'));
      });
  };

  return (
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
              <path
                d='M90 47.1c0-3.1-.3-6.3-.8-9.3H45.9v17.7h24.8c-1 5.7-4.3 10.7-9.2 13.9l14.8 11.5C85 72.8 90 61 90 47.1z'
                fill='#4280ef'
              />
              <path
                d='M45.9 91.9c12.4 0 22.8-4.1 30.4-11.1L61.5 69.4c-4.1 2.8-9.4 4.4-15.6 4.4-12 0-22.1-8.1-25.8-18.9L4.9 66.6c7.8 15.5 23.6 25.3 41 25.3z'
                fill='#34a353'
              />
              <path
                d='M20.1 54.8c-1.9-5.7-1.9-11.9 0-17.6L4.9 25.4c-6.5 13-6.5 28.3 0 41.2l15.2-11.8z'
                fill='#f6b704'
              />
              <path
                d='M45.9 18.3c6.5-.1 12.9 2.4 17.6 6.9L76.6 12C68.3 4.2 57.3 0 45.9.1c-17.4 0-33.2 9.8-41 25.3l15.2 11.8c3.7-10.9 13.8-18.9 25.8-18.9z'
                fill='#e54335'
              />
            </GoogleIcon>
            {t('login.google_login')}
          </GoogleButton>

          <FacebookButton>
            <FacebookIcon
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 24 24'
              fill='none'
            >
              <path
                d='M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.406.593 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.466.099 2.797.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.588l-.467 3.622h-3.121V24h6.116c.73 0 1.324-.593 1.324-1.324V1.325C24 .593 23.406 0 22.675 0z'
                fill='#1877F2'
              />
              <path
                d='M16.671 24v-9.294h3.121l.467-3.622h-3.588v-2.312c0-1.048.29-1.763 1.795-1.763l1.918-.001v-3.24c-.331-.044-1.472-.143-2.797-.143-2.766 0-4.659 1.688-4.659 4.788v2.683h-3.129v3.622h3.129V24h3.129z'
                fill='#0F66E0'
              />
            </FacebookIcon>
            {t('login.facebook_login')}
          </FacebookButton>
        </SocialLoginContainer>
      </Wrapper>
    </ModalBase>
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

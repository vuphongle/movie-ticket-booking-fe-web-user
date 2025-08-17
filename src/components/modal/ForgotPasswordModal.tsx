import { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ModalBase from '@components/base/ModalBase';
import { theme } from '@theme/Theme';
import { useForgotPasswordMutation } from '@/app/services/auth.api';

interface ForgotPasswordModalProps {
  open: boolean;
  handleClose: () => void;
}

interface ForgotPasswordFormData {
  email: string;
}

export default function ForgotPasswordModal({
  open,
  handleClose,
}: ForgotPasswordModalProps) {
  const { t, i18n } = useTranslation();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  // Schema validation
  const schema = useMemo(
    () =>
      yup.object({
        email: yup
          .string()
          .required(t('FORGOT_PASSWORD_EMAIL_REQUIRED'))
          .email(t('LOGIN_EMAIL_INVALID')),
      }),
    [i18n.language]
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPassword({ email: data.email }).unwrap();
      toast.success(t('FORGOT_PASSWORD_SUCCESS'));
      handleClose();
    } catch (err: any) {
      if (err?.data?.code === 'USER_NOT_FOUND') {
        toast.error(t('USER_NOT_FOUND'));
      } else if (err?.data?.code === 'ACCOUNT_NOT_ACTIVATED') {
        toast.error(t('FORGOT_ACCOUNT_NOT_ACTIVATED'));
      } else {
        toast.error(err?.data?.message || t('MESSAGES_ERROR'));
      }
    }
  };

  useEffect(() => {
    if (open) {
      reset({ email: '' });
    }
  }, [open, reset]);

  return (
    <ModalBase isOpen={open} onClose={handleClose} size='sm' zIndex={2000}>
      <ModalContent>
        <ModalTitle>{t('FORGOT_PASSWORD_TITLE')}</ModalTitle>
        <StyledInput
          type='email'
          placeholder={t('FORGOT_PASSWORD_PLACEHOLDER')}
          {...register('email')}
          onKeyDown={e => e.key === 'Enter' && handleSubmit(onSubmit)()}
        />
        {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
        <StyledButton onClick={handleSubmit(onSubmit)} disabled={isLoading}>
          {isLoading
            ? t('FORGOT_PASSWORD_SENDING')
            : t('FORGOT_PASSWORD_SUBMIT')}
        </StyledButton>
      </ModalContent>
    </ModalBase>
  );
}
// ===== Styled Components =====
const ModalContent = styled.div`
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const ModalTitle = styled.h2`
  font-size: ${theme.fontSize.lg};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.sm};
`;

const StyledInput = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.fontSize.md};
  outline: none;

  &:focus {
    border-color: ${theme.colors.primary};
  }
`;

const StyledButton = styled.button<{ disabled?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: none;
  border-radius: ${theme.borderRadius.medium};
  background: ${({ disabled }) =>
    disabled ? theme.colors.gray : theme.colors.primary};
  color: ${theme.colors.white};
  font-size: ${theme.fontSize.md};
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background 0.2s ease;
  margin-top: ${theme.spacing.sm};

  &:hover {
    background: ${({ disabled }) =>
      disabled ? theme.colors.gray : theme.colors.primaryHover};
  }
`;

const ErrorText = styled.p`
  color: ${theme.colors.error};
  font-size: 0.75rem;
  margin: 0;
`;

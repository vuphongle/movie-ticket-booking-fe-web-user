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
          .required(t('forgot_password_email_required'))
          .email(t('login_email_invalid')),
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
      toast.success(t('forgot_password_success'));
      handleClose();
    } catch (err: any) {
      if (err?.data?.code === 'USER_NOT_FOUND') {
        toast.error(t('USER_NOT_FOUND'));
      } else if (err?.data?.code === 'ACCOUNT_NOT_ACTIVATED') {
        toast.error(t('FORGOT_ACCOUNT_NOT_ACTIVATED'));
      } else {
        toast.error(err?.data?.message || t('messages_error'));
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
        <ModalTitle>{t('forgot_password_title')}</ModalTitle>
        <StyledInput
          type='email'
          placeholder={t('forgot_password_placeholder')}
          {...register('email')}
          onKeyDown={e => e.key === 'Enter' && handleSubmit(onSubmit)()}
        />
        {errors.email && <ErrorText>{errors.email.message}</ErrorText>}
        <StyledButton onClick={handleSubmit(onSubmit)} disabled={isLoading}>
          {isLoading
            ? t('forgot_password_sending')
            : t('forgot_password_submit')}
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

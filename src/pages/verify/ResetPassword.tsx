import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input, Button, Spin, Modal, Typography, Space, Progress } from 'antd';
import { LockOutlined, CheckOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import styled from 'styled-components';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { Controller, useForm } from 'react-hook-form';
import {
  useCheckForgotPasswordTokenQuery,
  useResetPasswordMutation,
} from '@/app/services/auth.api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';

function scorePassword(pw: string) {
  if (!pw) return 0;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNum = /\d/.test(pw);
  const hasSym = /[^A-Za-z0-9]/.test(pw);
  const classes = [hasLower, hasUpper, hasNum, hasSym].filter(Boolean).length;

  let score = Math.min(10, pw.length) * 6;
  score += (classes - 1) * 20;
  return Math.min(100, score);
}

interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const { t, i18n } = useTranslation();

  const schema = useMemo(
    () =>
      yup.object({
        password: yup.string().required(t('RESET_PASSWORDS_REQUIRED')),
        confirmPassword: yup
          .string()
          .oneOf([yup.ref('password')], t('RESET_CONFIRM_PASSWORDS_NOT_MATCH'))
          .required(t('RESET_CONFIRM_PASSWORDS_REQUIRED')),
      }),
    [i18n.language]
  );

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const newPassword = watch('password');
  const strength = useMemo(() => scorePassword(newPassword), [newPassword]);

  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const { data, isLoading } = useCheckForgotPasswordTokenQuery(token, {
    skip: !token,
  });
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword({
        token,
        newPassword: data.password,
        confirmPassword: data.confirmPassword,
      }).unwrap();
      toast.success(t('RESET_PASSWORD_SUCCESS'));
      navigate('/');
    } catch (err: any) {
      const code = err?.data?.code;
      if (code) {
        toast.error(t(code));
      } else {
        toast.error(t('MESSAGES_ERROR'));
      }
    }
  };

  if (!token) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <Typography.Text type='danger'>
          {t('INVALID_TOKEN') || 'Token không hợp lệ'}
        </Typography.Text>
      </div>
    );
  }

  if (isLoading)
    return <Spin style={{ display: 'block', margin: '50px auto' }} />;

  if (!data?.success) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50 }}>
        <Typography.Text type='danger'>
          {data?.message || t('INVALID_TOKEN')}
        </Typography.Text>
      </div>
    );
  }

  return (
    <Modal
      open={true}
      title={t('RESET_PASSWORD_SUBMIT')}
      centered
      footer={null}
      closable={false}
      styles={{
        body: {
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.medium,
          backgroundColor: theme.colors.bgLight,
        },
      }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Space direction='vertical' size='small' style={{ width: '100%' }}>
          <Controller
            name='password'
            control={control}
            render={({ field }) => (
              <Input.Password
                {...field}
                size='large'
                placeholder={t('NEW_PASSWORD') || 'Mật khẩu mới'}
                prefix={
                  <LockOutlined style={{ color: theme.colors.primary }} />
                }
                style={{
                  borderRadius: theme.borderRadius.small,
                  borderColor: theme.colors.border,
                }}
              />
            )}
          />
          {errors.password && <ErrorText>{errors.password.message}</ErrorText>}

          {newPassword && (
            <>
              <Progress
                percent={strength}
                showInfo={false}
                strokeColor={
                  strength < 40
                    ? '#ef4444'
                    : strength < 70
                      ? '#f59e0b'
                      : '#4caf50'
                }
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography.Text
                  style={{
                    fontSize: 11,
                    color:
                      strength < 40
                        ? '#ef4444'
                        : strength < 70
                          ? '#f59e0b'
                          : '#4caf50',
                  }}
                >
                  {strength < 40
                    ? t('RESET_PASSWORD_STRENGTH_WEAK') || 'Weak password'
                    : strength < 70
                      ? t('RESET_PASSWORD_STRENGTH_MEDIUM') || 'Medium password'
                      : t('RESET_PASSWORD_STRENGTH_STRONG') ||
                        'Strong password'}
                </Typography.Text>
                <Typography.Text type='secondary' style={{ fontSize: 11 }}>
                  {t('RESET_PASSWORD_TIPS')}
                </Typography.Text>
              </div>
            </>
          )}

          <Controller
            name='confirmPassword'
            control={control}
            render={({ field }) => (
              <Input.Password
                {...field}
                size='large'
                placeholder={
                  t('CONFIRM_NEW_PASSWORD_PLACEHOLDER') || 'Xác nhận mật khẩu'
                }
                prefix={
                  <CheckOutlined style={{ color: theme.colors.primary }} />
                }
                style={{
                  borderRadius: theme.borderRadius.small,
                  borderColor: theme.colors.border,
                }}
              />
            )}
          />
          {errors.confirmPassword && (
            <ErrorText>{errors.confirmPassword.message}</ErrorText>
          )}

          <Button
            type='primary'
            htmlType='submit'
            block
            size='large'
            style={{
              backgroundColor: theme.colors.primary,
              borderColor: theme.colors.primary,
              borderRadius: theme.borderRadius.medium,
            }}
            loading={resetting}
          >
            {t('FORGOT_PASSWORD_SUBMIT')}
          </Button>
        </Space>
      </form>
    </Modal>
  );
}

const ErrorText = styled.p`
  margin-top: 4px;
  font-size: 0.75rem;
  color: ${theme.colors.error};
`;

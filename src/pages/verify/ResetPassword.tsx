import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input, Button, Spin, Modal, Typography, Space, Progress } from 'antd';
import { LockOutlined, CheckOutlined } from '@ant-design/icons';
import { useState, useMemo } from 'react';
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

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const { data, isLoading } = useCheckForgotPasswordTokenQuery(token, {
    skip: !token,
  });
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [visible, setVisible] = useState(true);

  const strength = useMemo(() => scorePassword(newPassword), [newPassword]);
  const strengthStatus =
    strength < 40 ? 'exception' : strength < 70 ? 'normal' : 'success';

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

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error(t('PASSWORDS_REQUIRED') || 'Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error(t('PASSWORDS_NOT_MATCH'));
      return;
    }

    try {
      await resetPassword({ token, newPassword, confirmPassword }).unwrap();
      toast.success(t('RESET_PASSWORD_SUCCESS'));
      navigate('/');
    } catch (err: any) {
      const code = err?.data?.code;
      if (code) {
        toast.error(t(code));
      } else {
        toast.error(t('messages_error'));
      }
    }
  };

  return (
    <Modal
      open={visible}
      title={t('reset_password_submit')}
      centered
      footer={null}
      closable={false}
      bodyStyle={{
        padding: theme.spacing.lg,
        borderRadius: theme.borderRadius.medium,
        backgroundColor: theme.colors.bgLight,
      }}
    >
      <Space direction='vertical' size='small' style={{ width: '100%' }}>
        <Input.Password
          size='large'
          placeholder={t('NEW_PASSWORD') || 'Mật khẩu mới'}
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          prefix={<LockOutlined style={{ color: theme.colors.primary }} />}
          style={{
            borderRadius: theme.borderRadius.small,
            borderColor: theme.colors.border,
          }}
        />

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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
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
                  ? t('reset_password_strength_weak') || 'Weak password'
                  : strength < 70
                    ? t('reset_password_strength_medium') || 'Medium password'
                    : t('reset_password_strength_strong') || 'Strong password'}
              </Typography.Text>
              <Typography.Text type='secondary' style={{ fontSize: 11 }}>
                {t('reset_password_tips')}
              </Typography.Text>
            </div>
          </>
        )}

        <Input.Password
          size='large'
          placeholder={
            t('CONFIRM_NEW_PASSWORD_PLACEHOLDER') || 'Xác nhận mật khẩu'
          }
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          prefix={<CheckOutlined style={{ color: theme.colors.primary }} />}
          style={{
            borderRadius: theme.borderRadius.small,
            borderColor: theme.colors.border,
          }}
        />

        <Button
          type='primary'
          block
          size='large'
          style={{
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
            borderRadius: theme.borderRadius.medium,
          }}
          loading={resetting}
          onClick={handleSubmit}
        >
          {t('forgot_password_submit')}
        </Button>
      </Space>
    </Modal>
  );
}

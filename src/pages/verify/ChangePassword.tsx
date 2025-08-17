import { useState, useMemo } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  Typography,
  Alert,
  Progress,
  Space,
} from 'antd';
import { LockOutlined, CheckOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useChangePasswordMutation } from '@app/services/user.api';
import { useNavigate } from 'react-router-dom';
import { logout } from '@app/slices/auth.slice';
import { useDispatch } from 'react-redux';
import { theme } from '@theme/Theme';

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

function scorePassword(pw: string) {
  let score = 0;
  if (!pw) return 0;
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNum = /\d/.test(pw);
  const hasSym = /[^A-Za-z0-9]/.test(pw);
  const classes = [hasLower, hasUpper, hasNum, hasSym].filter(Boolean).length;

  score += Math.min(10, pw.length) * 6;
  score += (classes - 1) * 20;
  return Math.min(100, score);
}

function ChangePassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const [loading, setLoading] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const newPasswordValue = Form.useWatch('newPassword', form);

  const strength = useMemo(
    () => scorePassword(newPasswordValue || ''),
    [newPasswordValue]
  );

  const [changePassword] = useChangePasswordMutation();

  const handleCaps = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsOn(e.getModifierState?.('CapsLock') || false);
  };

  const handleChangePassword = async (values: ChangePasswordFormValues) => {
    try {
      setLoading(true);
      await changePassword({
        currentPassword: values.oldPassword,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }).unwrap();

      toast.success(t('CHANGE_PASSWORD_SUCCESS'));
      form.resetFields();
      dispatch(logout());

      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error: any) {
      const code = error?.data?.code;
      if (code === 'INVALID_OLD_PASSWORD') {
        toast.error(t('INVALID_OLD_PASSWORD'));
      } else if (code === 'NEW_PASSWORD_SAME_AS_OLD') {
        toast.error(t('NEW_PASSWORD_SAME_AS_OLD'));
      } else {
        toast.error(t('MESSAGES_ERROR'));
      }
    } finally {
      setLoading(false);
    }
  };

  const strengthStatus =
    strength < 40 ? 'exception' : strength < 70 ? 'normal' : 'success';

  return (
    <div style={{ padding: '24px', maxWidth: '600px', margin: '0 auto' }}>
      <Card
        variant='outlined'
        style={{
          marginTop: theme.spacing.lg,
          borderRadius: theme.borderRadius.medium,
          borderColor: theme.colors.border,
          boxShadow: `0 4px 20px rgba(0,0,0,0.06)`,
        }}
        title={
          <div style={{ textAlign: 'center', margin: `${theme.spacing.md} 0` }}>
            <Typography.Title
              level={4}
              style={{ margin: 0, color: theme.colors.textPrimary }}
            >
              {t('CHANGE_PASSWORD')}
            </Typography.Title>
            <Typography.Text
              type='secondary'
              style={{ color: theme.colors.textSecondary }}
            >
              {t('CHANGE_PASSWORD_SUBTITLE') || t('ENTER_NEW_PASSWORD')}
            </Typography.Text>
          </div>
        }
      >
        <Space direction='vertical' size='large' style={{ width: '100%' }}>
          {capsOn && (
            <Alert type='warning' showIcon message={t('CAPSLOCK_ON')} />
          )}

          <Form
            form={form}
            layout='vertical'
            onFinish={handleChangePassword}
            requiredMark={false}
            size='large'
            validateTrigger={['onBlur', 'onSubmit']}
          >
            <Form.Item
              label={t('CURRENT_PASSWORD')}
              name='oldPassword'
              hasFeedback
              rules={[
                { required: true, message: t('CURRENT_PASSWORD_REQUIRED') },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('ENTER_CURRENT_PASSWORD')}
                onKeyUp={handleCaps}
                autoComplete='current-password'
              />
            </Form.Item>

            <Form.Item
              label={t('NEW_PASSWORD')}
              name='newPassword'
              hasFeedback
              rules={[
                { required: true, message: t('NEW_PASSWORD_REQUIRED') },
                { min: 8, message: t('PASSWORD_MIN_LENGTH') },
                {
                  pattern: /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
                  message: t('PASSWORD_COMPLEXITY'),
                },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder={t('ENTER_NEW_PASSWORD')}
                onKeyUp={handleCaps}
                autoComplete='new-password'
              />
            </Form.Item>

            <div style={{ marginTop: -8, marginBottom: 8 }}>
              <Typography.Text
                type='secondary'
                style={{ display: 'block', marginBottom: 6 }}
              >
                {t('PASSWORD_STRENGTH')}
              </Typography.Text>
              <Progress
                percent={strength}
                status={strengthStatus as any}
                showInfo={false}
              />
              <Typography.Text type='secondary' style={{ fontSize: 12 }}>
                {t('PASSWORD_TIPS')}
              </Typography.Text>
            </div>

            <Form.Item
              label={t('CONFIRM_NEW_PASSWORD')}
              name='confirmPassword'
              dependencies={['newPassword']}
              hasFeedback
              rules={[
                { required: true, message: t('CONFIRM_PASSWORD_REQUIRED') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value)
                      return Promise.resolve();
                    return Promise.reject(new Error(t('PASSWORDS_NOT_MATCH')));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<CheckOutlined />}
                placeholder={t('CONFIRM_NEW_PASSWORD_PLACEHOLDER')}
                onKeyUp={handleCaps}
                autoComplete='new-password'
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, marginTop: 8 }}>
              <Button
                type='primary'
                htmlType='submit'
                loading={loading}
                size='large'
                style={{
                  width: '100%',
                  backgroundColor: theme.colors.primary,
                  borderColor: theme.colors.primary,
                  color: theme.colors.white,
                  marginTop: 8,
                }}
              >
                {t('CHANGE_PASSWORD')}
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
}

export default ChangePassword;

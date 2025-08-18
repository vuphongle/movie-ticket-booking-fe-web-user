import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useChangePasswordMutation } from '@app/services/user.api';
import { logout } from '@app/slices/auth.slice';
import { useDispatch } from 'react-redux';
import { theme } from '@theme/Theme';

interface ChangePasswordFormValues {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
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
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [capsOn, setCapsOn] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState<ChangePasswordFormValues>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const strength = useMemo(
    () => scorePassword(formData.newPassword || ''),
    [formData.newPassword]
  );

  const [changePassword] = useChangePasswordMutation();

  const handleCaps = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsOn(e.getModifierState?.('CapsLock') || false);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.oldPassword) {
      newErrors.oldPassword = t('CURRENT_PASSWORD_REQUIRED');
    }

    if (!formData.newPassword) {
      newErrors.newPassword = t('NEW_PASSWORD_REQUIRED');
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t('PASSWORD_MIN_LENGTH');
    } else if (
      !/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/.test(formData.newPassword)
    ) {
      newErrors.newPassword = t('PASSWORD_COMPLEXITY');
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('CONFIRM_PASSWORD_REQUIRED');
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('PASSWORDS_NOT_MATCH');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await changePassword({
        currentPassword: formData.oldPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      }).unwrap();

      toast.success(t('CHANGE_PASSWORD_SUCCESS'));
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        dispatch(logout());
        window.location.href = '/';
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

  const handleInputChange =
    (field: keyof ChangePasswordFormValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({
        ...prev,
        [field]: e.target.value,
      }));

      // Clear error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({
          ...prev,
          [field]: '',
        }));
      }
    };

  const togglePasswordVisibility = (field: 'old' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getStrengthColor = () => {
    if (strength < 40) return theme.colors.error;
    if (strength < 70) return '#ffa726';
    return theme.colors.success;
  };

  const getStrengthText = () => {
    if (strength < 40) return t('WEAK');
    if (strength < 70) return t('MEDIUM');
    return t('STRONG');
  };

  return (
    <Container>
      <Card>
        <CardHeader>
          <CardTitle>{t('CHANGE_PASSWORD')}</CardTitle>
          <CardSubtitle>
            {t('CHANGE_PASSWORD_SUBTITLE') || t('ENTER_NEW_PASSWORD')}
          </CardSubtitle>
        </CardHeader>

        <CardContent>
          {capsOn && <Alert>⚠️ {t('CAPSLOCK_ON')}</Alert>}

          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label>{t('CURRENT_PASSWORD')}</Label>
              <PasswordInputWrapper>
                <PasswordInput
                  type={showPasswords.old ? 'text' : 'password'}
                  value={formData.oldPassword}
                  onChange={handleInputChange('oldPassword')}
                  onKeyUp={handleCaps}
                  placeholder={t('ENTER_CURRENT_PASSWORD')}
                  $hasError={!!errors.oldPassword}
                />
                <EyeButton
                  type='button'
                  onClick={() => togglePasswordVisibility('old')}
                >
                  {showPasswords.old ? '👁️' : '👁️‍🗨️'}
                </EyeButton>
              </PasswordInputWrapper>
              {errors.oldPassword && (
                <ErrorText>{errors.oldPassword}</ErrorText>
              )}
            </FormGroup>

            <FormGroup>
              <Label>{t('NEW_PASSWORD')}</Label>
              <PasswordInputWrapper>
                <PasswordInput
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={handleInputChange('newPassword')}
                  onKeyUp={handleCaps}
                  placeholder={t('ENTER_NEW_PASSWORD')}
                  $hasError={!!errors.newPassword}
                />
                <EyeButton
                  type='button'
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? '👁️' : '👁️‍🗨️'}
                </EyeButton>
              </PasswordInputWrapper>
              {errors.newPassword && (
                <ErrorText>{errors.newPassword}</ErrorText>
              )}

              {formData.newPassword && (
                <PasswordStrength>
                  <StrengthBar>
                    <StrengthFill
                      strength={strength}
                      color={getStrengthColor()}
                    />
                  </StrengthBar>
                  <StrengthText color={getStrengthColor()}>
                    {getStrengthText()} ({strength}%)
                  </StrengthText>
                  <PasswordTips>{t('PASSWORD_TIPS')}</PasswordTips>
                </PasswordStrength>
              )}
            </FormGroup>

            <FormGroup>
              <Label>{t('CONFIRM_NEW_PASSWORD')}</Label>
              <PasswordInputWrapper>
                <PasswordInput
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  onKeyUp={handleCaps}
                  placeholder={t('CONFIRM_NEW_PASSWORD_PLACEHOLDER')}
                  $hasError={!!errors.confirmPassword}
                />
                <EyeButton
                  type='button'
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? '👁️' : '👁️‍🗨️'}
                </EyeButton>
              </PasswordInputWrapper>
              {errors.confirmPassword && (
                <ErrorText>{errors.confirmPassword}</ErrorText>
              )}
            </FormGroup>

            <SubmitButton type='submit' disabled={loading}>
              {loading ? 'Đang xử lý...' : t('CHANGE_PASSWORD')}
            </SubmitButton>
          </Form>
        </CardContent>
      </Card>
    </Container>
  );
}

const Container = styled.div`
  width: 100%;
  position: relative;
  z-index: 1;
`;

const Card = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  position: relative;
  z-index: 1;
`;

const CardHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
`;

const CardTitle = styled.h3`
  font-size: ${theme.fontSize.xl};
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 ${theme.spacing.sm} 0;
`;

const CardSubtitle = styled.p`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

const CardContent = styled.div`
  padding: ${theme.spacing.lg};
`;

const Alert = styled.div`
  background: #fff3cd;
  color: #856404;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.small};
  margin-bottom: ${theme.spacing.md};
  border: 1px solid #ffeaa7;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-size: ${theme.fontSize.md};
  font-weight: 500;
  color: ${theme.colors.textPrimary};
`;

const PasswordInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const PasswordInput = styled.input<{ $hasError: boolean }>`
  width: 100%;
  padding: 12px ${theme.spacing.md};
  padding-right: 50px;
  font-size: ${theme.fontSize.md};
  border: 1px solid
    ${({ $hasError }) => ($hasError ? theme.colors.error : theme.colors.border)};
  border-radius: ${theme.borderRadius.small};
  background: ${theme.colors.white};
  color: ${theme.colors.textPrimary};
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${({ $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 2px
      ${({ $hasError }) =>
        $hasError ? theme.colors.error : theme.colors.primary}20;
  }
`;

const EyeButton = styled.button`
  position: absolute;
  right: ${theme.spacing.sm};
  background: none;
  border: none;
  cursor: pointer;
  padding: ${theme.spacing.xs};
  color: ${theme.colors.textSecondary};

  &:hover {
    color: ${theme.colors.textPrimary};
  }
`;

const ErrorText = styled.span`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.error};
`;

const PasswordStrength = styled.div`
  margin-top: ${theme.spacing.sm};
`;

const StrengthBar = styled.div`
  width: 100%;
  height: 6px;
  background: ${theme.colors.bgLight};
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: ${theme.spacing.xs};
`;

const StrengthFill = styled.div<{ strength: number; color: string }>`
  width: ${({ strength }) => strength}%;
  height: 100%;
  background: ${({ color }) => color};
  transition: all 0.3s ease;
`;

const StrengthText = styled.div<{ color: string }>`
  font-size: ${theme.fontSize.sm};
  color: ${({ color }) => color};
  font-weight: 500;
  margin-bottom: ${theme.spacing.xs};
`;

const PasswordTips = styled.div`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
  font-style: italic;
`;

const SubmitButton = styled.button`
  margin-top: ${theme.spacing.md};
  padding: 12px ${theme.spacing.lg};
  font-size: ${theme.fontSize.md};
  font-weight: 600;
  background: linear-gradient(90deg, #6d5edc, #2193b0);
  background-size: 200% 100%;
  background-position: left;
  color: #fff;
  border: none;
  border-radius: ${theme.borderRadius.small};
  cursor: pointer;
  transition:
    background-position 0.5s cubic-bezier(0.4, 0, 0.2, 1),
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

export default ChangePassword;

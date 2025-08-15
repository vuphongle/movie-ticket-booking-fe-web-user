import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input, Button, Spin } from 'antd';
import { useState } from 'react';
import { 
  useCheckForgotPasswordTokenQuery, 
  useResetPasswordMutation 
} from '@/app/services/auth.api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token') || '';

  const { data, isLoading } = useCheckForgotPasswordTokenQuery(token, { skip: !token });
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!token) {
    return <div>Token không hợp lệ</div>;
  }

  if (isLoading) return <Spin />;

  if (!data?.success) {
    return <div>{data?.message || 'Token không hợp lệ hoặc đã hết hạn'}</div>;
  }

  const handleSubmit = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    try {
      await resetPassword({ token, newPassword, confirmPassword }).unwrap();
      toast.success('Đặt lại mật khẩu thành công, vui lòng đăng nhập lại.');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <h2>Đặt lại mật khẩu</h2>
      <Input.Password
        placeholder="Mật khẩu mới"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
      />
      <Input.Password
        placeholder="Xác nhận mật khẩu"
        style={{ marginTop: 12 }}
        value={confirmPassword}
        onChange={e => setConfirmPassword(e.target.value)}
      />
      <Button
        type="primary"
        block
        style={{ marginTop: 16 }}
        loading={resetting}
        onClick={handleSubmit}
      >
        Đặt lại mật khẩu
      </Button>
    </div>
  );
}

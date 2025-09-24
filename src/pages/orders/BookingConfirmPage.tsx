import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import PromoSection from './components/PromoSection';
import PaymentMethods from './components/PaymentMethods';
import TicketInfo from './components/TicketInfo';
import TimerBar from './components/TimerBar';
import { useEffect, useState } from 'react';
import { useCreateOrderMutation } from '@app/services/payment.api';
import BookingConfirmModal from './components/modals/BookingConfirmModal';

export default function BookingConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { expireAt, bookingData } = location.state || {};
  const [timer, setTimer] = useState(
    Math.max(0, Math.floor((expireAt - Date.now()) / 1000))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(Math.max(0, Math.floor((expireAt - Date.now()) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [expireAt]);

  const [selectedPayment, setSelectedPayment] = useState('PAYOS');
  const [createOrder] = useCreateOrderMutation();

  const [appliedCoupons, setAppliedCoupons] = useState<
    { code: string; discount: number }[]
  >([]);

  const handleConfirmPayment = async () => {
    if (!bookingData) return;

    const expireSeconds = timer;

    const body = {
      showtimeId: bookingData.showtimeId,
      ticketItems: bookingData.seats.map((seat: any) => ({
        seatId: seat.id,
        price: seat.price,
      })),
      serviceItems: bookingData.combos?.map((combo: any) => ({
        additionalServiceId: combo.id,
        quantity: combo.qty,
        price: combo.price,
      })),
      paymentMethod: selectedPayment,
      expireSeconds,
    };

    try {
      const response = await createOrder(body).unwrap();
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Thanh toán thất bại', error);
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  const handleBack = () => {
    sessionStorage.setItem(
      'bookingPageState',
      JSON.stringify({
        seats: bookingData.seats,
        combos: bookingData.combos,
        remainingTime: timer,
        expireAt,
      })
    );
    navigate(-1);
  };

  return (
    <Page>
      <Main>
        <PromoSection
          bookingData={bookingData}
          onApplyCoupon={appliedData => {
            console.log('Voucher áp dụng:', appliedData);
            const discountSum = appliedData.previewResult.detailResults
              .filter((d: any) => d.applied)
              .reduce((sum: number, d: any) => sum + d.lineDiscount, 0);

            setAppliedCoupons(prev => [
              ...prev,
              { code: appliedData.idempotentToken, discount: discountSum },
            ]);
          }}
        />
        <PaymentMethods
          selected={selectedPayment}
          onSelect={setSelectedPayment}
        />
      </Main>
      <Aside>
        <TimerBar timer={timer} />
        <TicketInfo bookingData={bookingData} appliedCoupons={appliedCoupons} />
        <Actions>
          <GhostButton onClick={handleBack}>Quay lại</GhostButton>
          <PrimaryButton onClick={() => setIsConfirmModalOpen(true)}>
            Thanh toán
          </PrimaryButton>
        </Actions>
      </Aside>

      <BookingConfirmModal
        isOpen={isConfirmModalOpen}
        bookingData={{
          ...bookingData,
          appliedCoupons: appliedCoupons,
        }}
        onConfirm={handleConfirmPayment}
        onCancel={() => setIsConfirmModalOpen(false)}
      />
    </Page>
  );
}

/* ==== styled ==== */
const Page = styled.div`
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 ${theme.spacing.md};
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const Main = styled.div``;
const Aside = styled.div``;

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 12px;
`;

const GhostButton = styled.button`
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid ${theme.colors.gray};
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.08);
    border-color: ${theme.colors.textSecondary};
    transform: translateY(-1px);
    font-weight: 700;
  }

  &:active {
    transform: translateY(0);
    background: rgba(0, 0, 0, 0.12);
  }
`;

const PrimaryButton = styled.button`
  background: ${theme.colors.primary};
  color: #fff;
  border: none;
  padding: 10px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: ${theme.colors.primaryHoverGradient};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-weight: 700;
  }

  &:active {
    background: ${theme.colors.primary};
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

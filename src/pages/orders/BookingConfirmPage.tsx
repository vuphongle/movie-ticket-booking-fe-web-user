import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import PromoSection from './components/PromoSection';
import PaymentMethods from './components/PaymentMethods';
import TicketInfo from './components/TicketInfo';
import TimerBar from './components/TimerBar';
import { useState, useRef, useEffect } from 'react';
import { useCreateOrderMutation } from '@app/services/payment.api';
import BookingConfirmModal from './components/modals/BookingConfirmModal';
import { useBookingTimer } from '@/hooks/useBookingTimer';
import { useCancelSeatMutation, useCancelSeatMultiMutation } from '@/app/services/reservation.api';

export default function BookingConfirmPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const isProceedingRef = useRef(false);
  const isFirstRenderRef = useRef(true);
  const [cancelSeat] = useCancelSeatMutation();
  const [cancelSeatMulti] = useCancelSeatMultiMutation();
  const { timer, clearTimer } = useBookingTimer({
    autoCancel: true,
    onExpire: () => {},
  });

  const { bookingData } = location.state || {};

  const [selectedPayment, setSelectedPayment] = useState('PAYOS');
  const [createOrder] = useCreateOrderMutation();

  const [appliedCoupons, setAppliedCoupons] = useState<
    {
      detailId: number;
      type: string;
      code: string;
      discount: number;
      gifts: any[];
    }[]
  >([]);

  const handleConfirmPayment = async () => {
    if (!bookingData) return;

    const expireSeconds = timer;
    const totalDiscount = appliedCoupons.reduce(
      (sum, c) => sum + (c.discount ?? 0),
      0
    );
    const couponDetails = appliedCoupons.map(c => ({
      detailId: c.detailId,
      code: c.code,
      discount: c.discount,
      type: c.type,
      gifts:
        c.gifts?.map(g => ({
          serviceId: g.serviceId,
          serviceName: g.serviceName,
          quantity: g.quantity,
          thumbnail: g.thumbnail,
        })) || [],
    }));

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
      discounts: { totalDiscount, coupons: couponDetails },
      paymentMethod: selectedPayment,
      expireSeconds,
    };

    try {
      const response = await createOrder(body).unwrap();
      if (response.url) {
        isProceedingRef.current = true;
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Thanh toán thất bại', error);
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  const handleApplyVoucher = (appliedData: any) => {
    if (appliedData?.removedDetailId) {
      setAppliedCoupons(prev =>
        prev.filter(c => c.detailId !== appliedData.removedDetailId)
      );
      return;
    }

    const selectedDetail = appliedData.previewResult?.detailResults?.find(
      (d: any) => d.detailId === appliedData.couponDetailId && d.applied
    );

    if (!selectedDetail) return;

    const discountValue = selectedDetail.lineDiscount ?? 0;

    const matchedGift =
      appliedData.previewResult?.gifts?.find(
        (g: any) => g.serviceId === selectedDetail.giftServiceId
      ) ?? null;

    setAppliedCoupons(prev => {
      const exists = prev.some(c => c.detailId === selectedDetail.detailId);
      if (exists) return prev;
      return [
        ...prev,
        {
          code: appliedData.idempotentToken,
          type: 'voucher',
          discount: discountValue,
          detailId: selectedDetail.detailId,
          gifts: matchedGift ? [matchedGift] : [],
        },
      ];
    });
  };

  const handleApplyCoupon = (appliedData: any) => {
    if (appliedData?.removedDetailId) {
      setAppliedCoupons(prev =>
        prev.filter(
          c =>
            !(c.type === 'promo' && c.detailId === appliedData.removedDetailId)
        )
      );
      return;
    }

    const selectedDetail = appliedData.previewResult?.detailResults?.find(
      (d: any) => d.detailId === appliedData.couponDetailId && d.applied
    );

    if (!selectedDetail) return;

    const discountValue = selectedDetail.lineDiscount ?? 0;

    const matchedGift =
      appliedData.previewResult?.gifts?.find(
        (g: any) => g.serviceId === selectedDetail.giftServiceId
      ) ?? null;

    setAppliedCoupons(prev => {
      const newPromo = {
        type: 'promo',
        code: appliedData.idempotentToken,
        discount: discountValue,
        detailId: selectedDetail.detailId,
        gifts: matchedGift ? [matchedGift] : [],
      };

      const filtered = prev.filter(c => c.type !== 'promo');
      return [...filtered, newPromo];
    });
  };

  const handleBack = () => {
    isProceedingRef.current = true;
    sessionStorage.setItem(
      'bookingPageState',
      JSON.stringify({
        seats: bookingData.seats,
      })
    );
    navigate(-1);
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      const navEntries = performance.getEntriesByType('navigation');
      const isReload =
        navEntries.length > 0 &&
        (navEntries[0] as PerformanceNavigationTiming).type === 'reload';
      if (isReload || isProceedingRef.current) return;
      if (!isProceedingRef.current && bookingData?.seats?.length) {
        cancelSeatMulti({
          showtimeId: bookingData.showtimeId,
          seatIds: bookingData.seats.map((seat: { id: number }) => seat.id),
        });
        clearTimer?.();
      }
    };
    const handleRouteChange = () => {
      if (!isProceedingRef.current && bookingData?.seats) {
        bookingData.seats.forEach((seat: any) => {
          cancelSeat({ seatId: seat.id, showtimeId: bookingData.showtimeId });
        });
        clearTimer?.();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      if (!isFirstRenderRef.current) {
        if (!isProceedingRef.current && bookingData?.seats) {
          bookingData.seats.forEach((seat: any) => {
            cancelSeat({ seatId: seat.id, showtimeId: bookingData.showtimeId });
          });
          clearTimer?.();
        }
      } else {
        isFirstRenderRef.current = false;
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [bookingData, cancelSeat]);

  return (
    <Page>
      <Main>
        <PromoSection
          bookingData={bookingData}
          onApplyCoupon={handleApplyCoupon}
        />

        <PaymentMethods
          selected={selectedPayment}
          onSelect={setSelectedPayment}
        />
      </Main>
      <Aside>
        <TimerBar timer={timer} />
        <TicketInfo
          bookingData={bookingData}
          appliedCoupons={appliedCoupons}
          onApplyVoucher={handleApplyVoucher}
        />
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

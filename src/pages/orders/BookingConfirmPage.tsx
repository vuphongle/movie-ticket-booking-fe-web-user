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
import { Modal, Button } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { cancelSeatMultiBeacon } from '@utils/cancelSeatMultiBeacon';
import { useTranslation } from 'react-i18next';
import {
  useSeatHoldGuard,
  PAYMENT_REDIRECT_FLAG,
} from '@/hooks/useSeatHoldGuard';

export default function BookingConfirmPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const isProceedingRef = useRef(false);
  const { timer, clearTimer } = useBookingTimer({
    autoCancel: true,
    onExpire: () => {
      setShouldGuard(false);
    },
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

  useSeatHoldGuard({
    bookingData,
    clearTimer,
    isProceedingRef,
  });

  useEffect(() => {
    if (bookingData) {
      sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
    }
  }, [bookingData]);

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
        priceId: seat.priceId,
      })),
      serviceItems: bookingData.combos?.map((combo: any) => ({
        additionalServiceId: combo.id,
        quantity: combo.qty,
        price: combo.price,
        priceId: combo.priceId,
      })),
      discounts: { totalDiscount, coupons: couponDetails },
      paymentMethod: selectedPayment,
      expireSeconds,
      platform: 'web',
    };

    try {
      const response = await createOrder(body).unwrap();
      if (response.url) {
        sessionStorage.setItem(PAYMENT_REDIRECT_FLAG, '1');
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

  // Navigation guard
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [resolveFn, setResolveFn] = useState<((val: boolean) => void) | null>(
    null
  );

  const showConfirmModal = () =>
    new Promise<boolean>(resolve => {
      setResolveFn(() => resolve);
      setIsConfirmOpen(true);
    });

  const handleConfirm = (choice: boolean) => {
    setIsConfirmOpen(false);

    if (!choice) {
      sessionStorage.removeItem('bookingCancelled');
      resolveFn?.(false);
      return;
    }
    cancelSeatMultiBeacon(
      bookingData.showtimeId,
      bookingData.seats.map((s: any) => s.id)
    );
    clearTimer?.();

    sessionStorage.setItem('bookingCancelled', 'true');
    resolveFn?.(true);
  };

  const [shouldGuard, setShouldGuard] = useState(true);

  useNavigationGuard(shouldGuard && !isProceedingRef.current, showConfirmModal);

  useEffect(() => {
    const isCancelled = sessionStorage.getItem('bookingCancelled');
    if (isCancelled === 'true') {
      sessionStorage.removeItem('bookingCancelled');
      setShouldGuard(false);

      Modal.warning({
        title: t('BOOKING_FLOW_CANCELLED'),
        content: t('PLEASE_TRY_AGAIN'),
        onOk: () => {
          navigate('/');
        },
      });
    }
  }, [navigate]);

  return (
    <Page>
      <Modal
        centered
        open={isConfirmOpen}
        onCancel={() => handleConfirm(false)}
        footer={[
          <div
            key='buttons'
            style={{
              textAlign: 'center',
              gap: '8px',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Button key='cancel' onClick={() => handleConfirm(false)}>
              {t('STAY')}
            </Button>
            <Button
              key='ok'
              type='primary'
              danger
              onClick={() => handleConfirm(true)}
            >
              {t('EXIT')}
            </Button>
          </div>,
        ]}
      >
        <CenteredContent>
          <ExclamationCircleFilled className='warning-icon' />
          <h3>{t('EXIT_BOOKING_FLOW')}</h3>
          <p>{t('SEAT_AND_COMBO_DATA_WILL_BE_DELETED')}</p>
        </CenteredContent>
      </Modal>
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
          <GhostButton onClick={handleBack}>{t('BOOKING_BACK')}</GhostButton>
          <PrimaryButton onClick={() => setIsConfirmModalOpen(true)}>
            {t('BOOKING_CONFIRM_CONFIRM2')}
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

const CenteredContent = styled.div`
  text-align: center;

  .warning-icon {
    font-size: 36px;
    color: #faad14;
  }

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #222;
  }

  p {
    font-size: 16px;
    color: #555;
  }
`;

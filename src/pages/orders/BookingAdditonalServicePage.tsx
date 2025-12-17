import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import {
  useGetAllAdditionalServicesQuery,
  useLazyGetAdditionalServicePriceQuery,
} from '@app/services/additionalService.api';
import { BookingMovieInfo } from './components/BookingMovieInfo';
import TimerBar from './components/TimerBar';
import { useBookingTimer } from '@/hooks/useBookingTimer';
import GlobalLoading from '@components/loading/GlobalLoading';
import { Modal, Button } from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import { getMovieTitle } from '@utils/functionUtils';
import { useSeatHoldGuard } from '@/hooks/useSeatHoldGuard';
import { cancelSeatMultiBeacon } from '@utils/cancelSeatMultiBeacon';

export default function BookingAdditionalServicePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData } = location.state || {};
  const isProceedingRef = useRef(false);

  const {
    data: comboDtos = [],
    isLoading: isLoadingCombos,
    isError: isErrorCombos,
  } = useGetAllAdditionalServicesQuery();
  const [triggerPrice] = useLazyGetAdditionalServicePriceQuery();
  const [prices, setPrices] = useState<
    Record<number, { price: number; priceId: number | null }>
  >({});

  const [selectedCombos, setSelectedCombos] = useState<Record<number, number>>(
    {}
  );

  const [activeTab, setActiveTab] = useState<'COMBO' | 'SINGLE'>('COMBO');

  const { timer, expireAt, clearTimer } = useBookingTimer({
    autoCancel: true,
    onExpire: () => {
      setShouldGuard(false);
    },
  });

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

  useEffect(() => {
    comboDtos.forEach(combo => {
      if (combo.status) {
        triggerPrice(combo.id)
          .unwrap()
          .then(priceData => {
            setPrices(prev => ({
              ...prev,
              [combo.id]: priceData, // { price, priceId }
            }));
          })
          .catch(() => {
            setPrices(prev => ({
              ...prev,
              [combo.id]: { price: -1, priceId: null },
            }));
          });
      }
    });
  }, [comboDtos, triggerPrice]);

  const handleComboChange = (id: number, qty: number) => {
    const validQty = Math.min(Math.max(0, qty), 5);
    setSelectedCombos(prev => ({ ...prev, [id]: validQty }));
  };

  const combos = useMemo(
    () =>
      comboDtos
        .filter(c => c.status && c.type === 'COMBO')
        .map(c => ({
          id: c.id,
          name: c.name,
          thumbnail: c.thumbnail,
          description: c.description,
        })),
    [comboDtos]
  );

  const displayedItems = useMemo(() => {
    if (activeTab === 'COMBO') {
      return combos;
    } else {
      return comboDtos
        .filter(c => c.status && c.type === 'SINGLE')
        .map(c => ({
          id: c.id,
          name: c.name,
          thumbnail: c.thumbnail,
          description: c.description,
        }));
    }
  }, [activeTab, combos, comboDtos]);

  const selectedItemList = useMemo(
    () =>
      Object.entries(selectedCombos)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => {
          const item =
            combos.find(c => c.id === Number(id)) ||
            comboDtos.find(c => c.id === Number(id));
          return item ? { ...item, qty } : null;
        })
        .filter(Boolean),
    [selectedCombos, combos, comboDtos]
  );

  const itemTotal = selectedItemList.reduce((s, c: any) => {
    const priceData = prices[c.id];
    if (!priceData || priceData.price === -1) return s;
    return s + priceData.price * c.qty;
  }, 0);

  const total = (bookingData?.seatTotal || 0) + itemTotal;

  useEffect(() => {
    const stored = sessionStorage.getItem('bookingPageState');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.combos) {
        const comboMap: Record<number, number> = {};
        parsed.combos.forEach((c: any) => {
          comboMap[c.id] = c.qty;
        });
        setSelectedCombos(comboMap);
      }
    }
  }, []);

  const handleBack = async () => {
    sessionStorage.setItem(
      'bookingPageState',
      JSON.stringify({ seats: bookingData.seats })
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

  if (isLoadingCombos) {
    return <GlobalLoading />;
  }

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
              Ở lại
            </Button>
            <Button
              key='ok'
              type='primary'
              danger
              onClick={() => handleConfirm(true)}
            >
              Thoát
            </Button>
          </div>,
        ]}
      >
        <CenteredContent>
          <ExclamationCircleFilled className='warning-icon' />
          <h3>Bạn sắp thoát khỏi luồng đặt vé</h3>
          <p>
            Dữ liệu ghế và combo sẽ bị xóa. Bạn có chắc chắn muốn tiếp tục
            không?
          </p>
        </CenteredContent>
      </Modal>
      <Main>
        <Header>
          <h2>{t('BOOKING_ADDITIONAL_TITLE')}</h2>
          <p>{t('BOOKING_ADDITIONAL_SUB')}</p>
        </Header>

        <Card>
          {isLoadingCombos && <InfoLine>{t('BOOKING_LOADING_COMBO')}</InfoLine>}
          {isErrorCombos && <InfoLine>{t('BOOKING_ERROR_COMBO')}</InfoLine>}

          {/* === TAB HEADER === */}
          <TabHeader>
            <TabButton
              active={activeTab === 'COMBO'}
              onClick={() => setActiveTab('COMBO')}
            >
              {t('COMBO')}
            </TabButton>
            <TabButton
              active={activeTab === 'SINGLE'}
              onClick={() => setActiveTab('SINGLE')}
            >
              {t('SINGLE_PRODUCT')}
            </TabButton>
          </TabHeader>

          {/* === TAB CONTENT === */}
          <ComboList>
            {displayedItems.map(item => (
              <ComboItem key={item.id}>
                <ComboInfo>
                  <Thumbnail src={item.thumbnail} alt={item.name} />
                  <div>
                    <ComboName>
                      {item.name}{' '}
                      {item.description && (
                        <span className='desc'>({item.description})</span>
                      )}
                    </ComboName>
                    <ComboPrice>
                      {prices[item.id] !== undefined &&
                      prices[item.id].price !== -1
                        ? `${prices[item.id].price.toLocaleString()} đ`
                        : '...'}
                    </ComboPrice>
                  </div>
                </ComboInfo>
                <QtyInput
                  type='number'
                  min={0}
                  max={5}
                  value={selectedCombos[item.id] ?? 0}
                  onChange={e => {
                    let val = e.target.value;

                    if (val.length > 1 && val.startsWith('0')) {
                      val = val.replace(/^0+/, '');
                    }

                    const num = Math.min(Math.max(Number(val || 0), 0), 5);

                    handleComboChange(item.id, num);
                  }}
                />
              </ComboItem>
            ))}
          </ComboList>
        </Card>
      </Main>

      <Aside>
        <TimerBar timer={timer} />
        <SummaryCard>
          <SummaryTitle>{t('BOOKING_SUMMARY')}</SummaryTitle>
          <BookingMovieInfo
            title={getMovieTitle(bookingData.movie, i18n.language)}
            poster={bookingData.movie.poster}
            age={bookingData.movie.age}
            graphics={bookingData.movie.graphics}
            cinema={bookingData.cinema}
            auditorium={bookingData.auditorium}
            showtime={bookingData.showtime}
          />
          <Divider />
          <SummaryLine>
            {t('BOOKING_SEAT_CHOSEN')}
            <strong>
              {bookingData.seats.length
                ? ' ' +
                  bookingData.seats
                    .map(
                      (s: { row: string; number: number }) =>
                        `${s.row}${s.number}`
                    )
                    .join(', ')
                : t('BOOKING_SEAT_NONE')}
            </strong>
          </SummaryLine>
          <SummaryLine>
            {t('BOOKING_COMBO')}
            <strong
              style={{
                whiteSpace: 'pre-line',
                fontWeight: '500',
                fontSize: '14px',
              }}
            >
              {selectedItemList.length
                ? '\n' +
                  selectedItemList
                    .filter((c): c is NonNullable<typeof c> => c !== null)
                    .map(c => `• ${c.name} x${c.qty}`)
                    .join('\n')
                : t('BOOKING_COMBO_NONE')}
            </strong>
          </SummaryLine>
          <Divider />
          <Total>
            {t('BOOKING_TOTAL')}
            <span>{total.toLocaleString()} đ</span>
          </Total>
          <Actions>
            <GhostButton onClick={handleBack}>{t('BOOKING_BACK')}</GhostButton>
            <PrimaryButton
              onClick={async () => {
                isProceedingRef.current = true;
                sessionStorage.setItem('bookingCancelled', 'false');
                await new Promise(resolve => setTimeout(resolve, 1000));

                navigate('/booking/confirm', {
                  state: {
                    expireAt,
                    bookingData: {
                      ...bookingData,
                      combos: selectedItemList
                        .filter((c): c is NonNullable<typeof c> => c !== null)
                        .map(c => ({
                          ...c,
                          price: prices[c.id].price ?? -1,
                          priceId: prices[c.id].priceId,
                        })),
                      total,
                    },
                  },
                });
              }}
            >
              {t('BOOKING_CONTINUE')}
            </PrimaryButton>
          </Actions>
        </SummaryCard>
      </Aside>
    </Page>
  );
}

/* ==== styled giống BookingPage ==== */
const Page = styled.div`
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 ${theme.spacing.md};
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: ${theme.spacing.lg};

  @media (max-width: 1024px) {
    grid-template-columns: 1fr 320px;
    gap: ${theme.spacing.md};
    margin: 20px auto;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 0 ${theme.spacing.sm};
    margin: 16px auto;
    gap: ${theme.spacing.md};
  }

  @media (max-width: 480px) {
    padding: 0 12px;
    margin: 12px auto;
  }
`;

const Main = styled.div`
  display: grid;
  gap: ${theme.spacing.lg};
`;

const Aside = styled.aside`
  position: sticky;
  top: ${theme.spacing.xxxl};
  align-self: start;

  @media (max-width: 768px) {
    position: static;
    order: -1;
  }
`;

const Header = styled.div`
  background: ${theme.colors.primaryHoverGradient};
  padding: ${theme.spacing.md};
  color: white;
  border-radius: ${theme.borderRadius.medium};

  h2 {
    margin: 0 0 8px;
    font-size: 24px;

    @media (max-width: 768px) {
      font-size: 20px;
    }

    @media (max-width: 480px) {
      font-size: 18px;
    }
  }

  p {
    margin: 0;
    font-size: 14px;

    @media (max-width: 480px) {
      font-size: 13px;
    }
  }

  @media (max-width: 768px) {
    padding: ${theme.spacing.sm};
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const Card = styled.section`
  background: rgba(30, 58, 138, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.medium};
  box-shadow: 0 8px 24px rgba(2, 22, 46, 0.05);
  padding: ${theme.spacing.lg};

  @media (max-width: 768px) {
    padding: ${theme.spacing.md};
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const ComboList = styled.div`
  display: grid;
  gap: ${theme.spacing.sm};
`;

const ComboItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(8px);
  transition: all 0.25s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
    background: rgba(30, 58, 138, 0.35);
    border-color: rgba(255, 255, 255, 0.12);
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
  }

  @media (max-width: 480px) {
    padding: 8px 10px;
    flex-wrap: wrap;
    gap: 8px;
  }
`;

const ComboInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
`;

const Thumbnail = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  transition: all 0.4s ease;

  ${ComboItem}:hover & {
    transform: scale(1.08) rotate(2deg);
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 768px) {
    width: 55px;
    height: 55px;
  }

  @media (max-width: 480px) {
    width: 50px;
    height: 50px;
  }
`;

const ComboName = styled.div`
  color: ${theme.colors.white};
  font-weight: 600;
  font-size: ${theme.fontSize.md};

  .desc {
    display: block;
    font-weight: 400;
    font-size: ${theme.fontSize.sm};
    color: rgba(255, 255, 255, 0.6);
    margin-top: 2px;
  }

  @media (max-width: 768px) {
    font-size: ${theme.fontSize.sm};

    .desc {
      font-size: 12px;
    }
  }

  @media (max-width: 480px) {
    font-size: 13px;

    .desc {
      font-size: 11px;
    }
  }
`;

const ComboPrice = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: ${theme.fontSize.sm};
  margin-top: 6px;

  @media (max-width: 480px) {
    font-size: 12px;
    margin-top: 4px;
  }
`;

const QtyInput = styled.input`
  margin-left: 16px;
  width: 45px;
  padding: 8px 10px;
  border-radius: ${theme.borderRadius.small};
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  font-weight: 600;
  text-align: center;
  transition: all 0.25s ease;
  font-size: ${theme.fontSize.sm};

  &:hover {
    background: rgba(255, 255, 255, 0.12);
    border-color: rgba(255, 255, 255, 0.25);
  }

  &:focus {
    outline: none;
    border-color: #60a5fa;
    box-shadow: 0 0 6px rgba(96, 165, 250, 0.4);
    background: rgba(255, 255, 255, 0.15);
    color: #f8fafc;
  }

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    opacity: 0.4;
    cursor: pointer;
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 60px;
    margin-left: auto;
    padding: 10px;
    font-size: 14px;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.border};
  margin: ${theme.spacing.md} 0;
`;

const SummaryCard = styled(Card)`
  padding: ${theme.spacing.lg};
  background: white;

  @media (max-width: 768px) {
    padding: ${theme.spacing.md};
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const SummaryTitle = styled.h3`
  margin: 0 0 ${theme.spacing.sm};
  color: ${theme.colors.textPrimary};
  font-size: 18px;

  @media (max-width: 768px) {
    font-size: 16px;
  }

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const SummaryLine = styled.p`
  margin: 6px 0;
  color: ${theme.colors.textSecondary};
  font-size: 14px;

  strong {
    color: ${theme.colors.textPrimary};
  }

  @media (max-width: 768px) {
    font-size: 13px;
    margin: 5px 0;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    margin: 4px 0;
  }
`;

const Total = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: ${theme.fontSize.md};
  color: ${theme.colors.textSecondary};
  margin: ${theme.spacing.sm} 0 ${theme.spacing.md};

  span {
    font-size: 22px;
    color: ${theme.colors.textPrimary};
    font-weight: 800;
  }

  @media (max-width: 768px) {
    font-size: 14px;

    span {
      font-size: 20px;
    }
  }

  @media (max-width: 480px) {
    font-size: 13px;
    margin: 8px 0 12px;

    span {
      font-size: 18px;
    }
  }
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const PrimaryButton = styled.button`
  padding: 12px 16px;
  border-radius: ${theme.borderRadius.medium};
  border: none;
  color: ${theme.colors.white};
  background: ${theme.colors.primaryHoverGradient};
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    filter 0.12s ease;

  &:hover {
    filter: brightness(1.03);
    transform: translateY(-1px);
    background: ${theme.colors.primaryHover};
  }

  &:active {
    transform: translateY(1px);
  }

  @media (max-width: 480px) {
    padding: 14px 16px;
    font-size: 15px;
  }
`;

const GhostButton = styled.button`
  padding: 12px 16px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.closeButtonBg};
  color: ${theme.colors.textPrimary};
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition:
    background 0.12s ease,
    transform 0.12s ease;

  &:hover {
    background: ${theme.colors.closeButtonBgHover};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(1px);
  }

  @media (max-width: 480px) {
    padding: 14px 16px;
    font-size: 15px;
  }
`;

const InfoLine = styled.p`
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.md};
`;

const TabHeader = styled.div`
  display: inline-flex;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px;
  border-radius: ${theme.borderRadius.medium};
  margin-bottom: ${theme.spacing.md};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
`;

const TabButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: 8px 16px;
  min-width: 180px;
  border: none;
  border-radius: ${theme.borderRadius.small};
  background: ${({ active }) =>
    active ? theme.colors.primaryHoverGradient : 'rgba(255,255,255,0.03)'};
  color: ${({ active }) =>
    active ? theme.colors.white : 'rgba(255,255,255,0.8)'};
  font-weight: 600;
  font-size: ${theme.fontSize.md};
  cursor: pointer;
  transition: all 0.25s ease;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    background: ${({ active }) =>
      active ? theme.colors.primaryHover : 'rgba(255,255,255,0.06)'};
    color: ${({ active }) =>
      active ? theme.colors.white : 'rgba(255,255,255,0.95)'};
  }

  &:active {
    transform: scale(0.97);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.25);
  }

  @media (max-width: 768px) {
    min-width: 140px;
    font-size: ${theme.fontSize.sm};
  }

  @media (max-width: 480px) {
    min-width: 0;
    padding: 10px 12px;
    font-size: 13px;
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

import { useState, useMemo, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';
import {
  useGetAllAdditionalServicesQuery,
  useLazyGetAdditionalServicePriceQuery,
} from '@app/services/additionalService.api';
import { BookingMovieInfo } from './components/BookingMovieInfo';
import TimerBar from './components/TimerBar';
import { useBookingTimer } from '@/hooks/useBookingTimer';
import { useCancelSeatMultiMutation } from '@/app/services/reservation.api';
import GlobalLoading from '@components/loading/GlobalLoading';

export default function BookingAdditionalServicePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { bookingData } = location.state || {};
  const isProceedingRef = useRef(false);
  const isFirstRenderRef = useRef(true);

  const {
    data: comboDtos = [],
    isLoading: isLoadingCombos,
    isError: isErrorCombos,
  } = useGetAllAdditionalServicesQuery();
  const [triggerPrice] = useLazyGetAdditionalServicePriceQuery();
  const [prices, setPrices] = useState<Record<number, number>>({});
  const [selectedCombos, setSelectedCombos] = useState<Record<number, number>>(
    {}
  );

  const [activeTab, setActiveTab] = useState<'COMBO' | 'SINGLE'>('COMBO');
  const [cancelSeatMulti] = useCancelSeatMultiMutation();

  const { timer, expireAt, clearTimer } = useBookingTimer({
    autoCancel: true,
    onExpire: () => {},
  });

  useEffect(() => {
    comboDtos.forEach(combo => {
      if (combo.status) {
        triggerPrice(combo.id)
          .unwrap()
          .then(price => setPrices(prev => ({ ...prev, [combo.id]: price })))
          .catch(() => setPrices(prev => ({ ...prev, [combo.id]: -1 })));
      }
    });
  }, [comboDtos, triggerPrice]);

  const handleComboChange = (id: number, qty: number) => {
    setSelectedCombos(prev => ({ ...prev, [id]: Math.max(0, qty) }));
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
    const price = prices[c.id];
    if (price === undefined || price === -1) return s;
    return s + price * c.qty;
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

  useEffect(() => {
    const handleBeforeUnload = () => {
      const navEntries = performance.getEntriesByType('navigation');
      const isReload =
        navEntries.length > 0 &&
        (navEntries[0] as PerformanceNavigationTiming).type === 'reload';

      if (isReload) return;

      if (!isProceedingRef.current && bookingData?.seats?.length) {
        cancelSeatMulti({
          showtimeId: bookingData.showtimeId,
          seatIds: bookingData.seats.map((seat: { id: number }) => seat.id),
        });
        clearTimer?.();
      }
    };

    const handleRouteChange = () => {
      if (!isProceedingRef.current && bookingData?.seats?.length) {
        cancelSeatMulti({
          showtimeId: bookingData.showtimeId,
          seatIds: bookingData.seats.map((seat: { id: number }) => seat.id),
        });
        clearTimer?.();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      // Chỉ hủy ghế khi không phải lần render đầu tiên
      if (!isFirstRenderRef.current) {
        if (!isProceedingRef.current && bookingData?.seats?.length) {
          cancelSeatMulti({
            showtimeId: bookingData.showtimeId,
            seatIds: bookingData.seats.map((seat: { id: number }) => seat.id),
          });
          clearTimer?.();
        }
      } else {
        // Đánh dấu đã qua lần render đầu tiên
        isFirstRenderRef.current = false;
      }

      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [bookingData, cancelSeatMulti, clearTimer]);

  if (isLoadingCombos) {
    return <GlobalLoading />;
  }

  return (
    <Page>
      <Main>
        <Header>
          <h2>{t('BOOKING_ADDITIONAL_TITLE')}</h2>
          <p>{t('BOOKING_ADDITIONAL_SUB')}</p>
        </Header>

        <Card>
          <SectionTitle>{t('BOOKING_SELECT_COMBO')}</SectionTitle>
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
                      {prices[item.id] !== undefined && prices[item.id] !== -1
                        ? `${prices[item.id].toLocaleString()} đ`
                        : '...'}
                    </ComboPrice>
                  </div>
                </ComboInfo>
                <QtyInput
                  type='number'
                  min={0}
                  value={selectedCombos[item.id] || 0}
                  onChange={e =>
                    handleComboChange(item.id, Number(e.target.value))
                  }
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
            title={bookingData.movie.name}
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
              onClick={() => {
                isProceedingRef.current = true;
                navigate('/booking/confirm', {
                  state: {
                    expireAt,
                    bookingData: {
                      ...bookingData,
                      combos: selectedItemList
                        .filter((c): c is NonNullable<typeof c> => c !== null)
                        .map(c => ({ ...c, price: prices[c.id] ?? -1 })),
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
`;

const Main = styled.div`
  display: grid;
  gap: ${theme.spacing.lg};
`;

const Aside = styled.aside`
  position: sticky;
  top: ${theme.spacing.xxxl};
  align-self: start;
`;

const Header = styled.div`
  background: ${theme.colors.primaryHoverGradient};
  padding: ${theme.spacing.md};
  color: white;
  border-radius: ${theme.borderRadius.medium};
`;

const Card = styled.section`
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: 0 8px 24px rgba(2, 22, 46, 0.05);
  padding: ${theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${theme.spacing.md};
  font-size: ${theme.fontSize.xl};
  color: ${theme.colors.textPrimary};
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
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  background: ${theme.colors.bgLight};
`;

const ComboInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
`;

const Thumbnail = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
`;

const ComboName = styled.div`
  color: ${theme.colors.textPrimary};
  font-weight: 600;
  font-size: ${theme.fontSize.md};

  .desc {
    font-weight: 400;
    font-size: ${theme.fontSize.sm};
    color: ${theme.colors.textSecondary};
  }
`;

const ComboPrice = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSize.sm};
  margin-top: 4px;
`;

const QtyInput = styled.input`
  margin-left: 16px;
  width: 35px;
  padding: 8px 10px;
  border-radius: ${theme.borderRadius.small};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.white};
  color: ${theme.colors.textPrimary};
  font-weight: 600;
  &:focus {
    outline: none;
    box-shadow: var(--ring);
    border-color: ${theme.colors.primary};
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.border};
  margin: ${theme.spacing.md} 0;
`;

const SummaryCard = styled(Card)`
  padding: ${theme.spacing.lg};
`;

const SummaryTitle = styled.h3`
  margin: 0 0 ${theme.spacing.sm};
  color: ${theme.colors.textPrimary};
`;

const SummaryLine = styled.p`
  margin: 6px 0;
  color: ${theme.colors.textSecondary};
  strong {
    color: ${theme.colors.textPrimary};
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
`;

const Actions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};
`;

const PrimaryButton = styled.button`
  padding: 12px 16px;
  border-radius: ${theme.borderRadius.medium};
  border: none;
  color: ${theme.colors.white};
  background: ${theme.colors.primaryHoverGradient};
  font-weight: 700;
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
`;

const GhostButton = styled.button`
  padding: 12px 16px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.closeButtonBg};
  color: ${theme.colors.textPrimary};
  font-weight: 700;
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
`;

const InfoLine = styled.p`
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.md};
`;

const TabHeader = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 8px 12px;
  border-radius: ${theme.borderRadius.small};
  border: 1px solid
    ${({ active }) => (active ? theme.colors.primary : theme.colors.border)};
  background: ${({ active }) =>
    active ? theme.colors.primaryHoverGradient : theme.colors.white};
  color: ${({ active }) =>
    active ? theme.colors.white : theme.colors.textSecondary};
  font-weight: 600;
  cursor: pointer;
`;

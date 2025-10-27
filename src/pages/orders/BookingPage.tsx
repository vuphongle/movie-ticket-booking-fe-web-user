import { useMemo, useState, useEffect, useRef } from 'react';
import styled, { css } from 'styled-components';
import { theme } from '@theme/Theme';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetSeatsByAuditoriumAndShowtimeQuery } from '@app/services/auditorium.api';
import type { SeatDto } from '@app/services/auditorium.api';
import { useGetMovieByShowtimeQuery } from '@app/services/movie.api';
import { BookingMovieInfo } from './components/BookingMovieInfo';
import { formatDate } from '@utils/functionUtils';
import { useTranslation } from 'react-i18next';
import { useBookSeatMutation } from '@/app/services/reservation.api';
import { HeldSeatModal } from './components/modals/HeldSeatModal';
import { SelectSeatModal } from './components/modals/SelectSeatModal';
import { AgeConfirmModal } from './components/modals/AgeConfirmModal';
import { useLazyCheckSeatStatusQuery } from '@app/services/reservation.api';

/** ---- UI types ---- */
type SeatType = 'normal' | 'vip' | 'couple';
type SeatStatus = 'active' | 'inactive' | 'booked';
type ReservationStatus = 'booked' | 'held' | 'cancelled';

interface Seat {
  id: number;
  row: string;
  number: number;
  type: SeatType;
  status: SeatStatus;
  reservationStatus: ReservationStatus;
  price: number;
}

/** Utils */
const letterFromIndex = (idx: number) =>
  String.fromCharCode('A'.charCodeAt(0) + (idx - 1));

const mapSeatType = (t: SeatDto['type']): SeatType =>
  t === 'VIP' ? 'vip' : t === 'COUPLE' ? 'couple' : 'normal';

const mapSeatStatus = (
  status: boolean,
  reservation: SeatDto['reservationStatus']
): SeatStatus => {
  if (!status) return 'inactive';
  if (reservation === 'BOOKED') return 'booked';
  return 'active';
};

const mapReservationStatus = (
  reservation: SeatDto['reservationStatus']
): ReservationStatus => {
  switch (reservation) {
    case 'BOOKED':
      return 'booked';
    case 'HELD':
      return 'held';
    case 'CANCELLED':
      return 'cancelled';
    default:
      return 'cancelled';
  }
};

export default function BookingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectSeatModalVisible, setSelectSeatModalVisible] = useState(false);
  const [ageModalVisible, setAgeModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const location = useLocation();
  const { showtimeId, cinema, auditorium, time, date, format } =
    location.state || {};

  const {
    data: seatDtos = [],
    isLoading,
    isError,
    refetch,
  } = useGetSeatsByAuditoriumAndShowtimeQuery(
    {
      auditoriumId: Number(auditorium.id),
      showtimeId: Number(showtimeId),
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

  useEffect(() => {
    refetch();
  }, [refetch]);

  const { data: movie } = useGetMovieByShowtimeQuery(Number(showtimeId));

  const [seats, setSeats] = useState<Seat[]>([]);
  const selectedSeatsRef = useRef<Seat[]>([]);

  useEffect(() => {
    setSeats(
      seatDtos.map(d => {
        const row = d.code?.charAt(0) || letterFromIndex(d.rowIndex);
        const numFromCode = Number(d.code?.slice(1));
        const number = Number.isFinite(numFromCode) ? numFromCode : d.colIndex;
        return {
          id: d.id,
          row,
          number,
          type: mapSeatType(d.type),
          status: mapSeatStatus(d.status, d.reservationStatus),
          reservationStatus: mapReservationStatus(d.reservationStatus),
          price: d.price,
          priceId: d.priceId,
        };
      })
    );
  }, [seatDtos]);

  const rows = useMemo(
    () =>
      Array.from(new Set(seats.map(s => s.row))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [seats]
  );

  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);

  // ====== Timer hook (giữ nguyên khi quay lại trang) ======
  const [bookSeat] = useBookSeatMutation();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  const [triggerCheckSeatStatus] = useLazyCheckSeatStatusQuery();

  const toggleSeat = async (seat: Seat) => {
    if (seat.status === 'booked') return;

    if (seat.price === 0) {
      setModalContent('Ghế này chưa được định giá. Vui lòng chọn ghế khác.');
      setModalVisible(true);
      return;
    }

    try {
      const data = await triggerCheckSeatStatus({
        seatId: seat.id,
        showtimeId: Number(showtimeId),
      }).unwrap();

      if (data?.status === 'HELD') {
        setModalContent(t('HELD_SEAT_CONTENT'));
        setModalVisible(true);
        return;
      }

      const isSelected = selectedSeats.some(s => s.id === seat.id);
      if (isSelected) {
        setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
      } else {
        setSelectedSeats(prev => [...prev, seat]);
      }
    } catch (err) {
      console.error('Lỗi kiểm tra ghế:', err);
    }
  };

  const seatTotal = selectedSeats.reduce((s, x) => s + x.price, 0);
  const totalPrice = seatTotal;

  // ====== Restore từ sessionStorage ======
  useEffect(() => {
    const saved = sessionStorage.getItem('bookingPageState');
    if (saved) {
      const { seats } = JSON.parse(saved);

      setSelectedSeats(seats);
      sessionStorage.removeItem('bookingPageState');
    }
  }, []);

  useEffect(() => {
    sessionStorage.removeItem('bookingCancelled');
  }, []);

  return (
    <Page>
      <Main>
        <HeaderBar>
          <HeaderTitle>{t('BOOKING_SELECT_SEAT')}</HeaderTitle>
          <HeaderSub>{t('BOOKING_SELECT_SEAT_SUB')}</HeaderSub>
        </HeaderBar>

        <Card>
          <Screen>{t('BOOKING_SCREEN')}</Screen>

          {isLoading}
          {isError && <InfoLine>{t('BOOKING_ERROR_SEAT')}</InfoLine>}

          {!isLoading && !isError && (
            <>
              <SeatMap role='grid' aria-label={t('BOOKING_SCREEN')}>
                {rows.map(row => (
                  <Row key={row} role='row'>
                    <RowLabel aria-hidden>{row}</RowLabel>
                    <RowGrid>
                      {seats
                        .filter(s => s.row === row)
                        .sort((a, b) => a.number - b.number)
                        .map(seat => {
                          if (seat.status === 'inactive') {
                            return <SeatPlaceholder key={seat.id} />;
                          }
                          const isSelected = !!selectedSeats.find(
                            s => s.id === seat.id
                          );
                          return (
                            <SeatButton
                              key={seat.id}
                              aria-label={`Ghế ${seat.row}${seat.number}`}
                              aria-pressed={isSelected}
                              aria-disabled={seat.status === 'booked'}
                              $status={seat.status}
                              $reservationStatus={seat.reservationStatus}
                              $selected={isSelected}
                              $type={seat.type}
                              onClick={() => toggleSeat(seat)}
                              title={`${seat.row}${seat.number} • ${seat.price.toLocaleString()}đ (${seat.type})`}
                            >
                              {`${row}${seat.number}`}
                            </SeatButton>
                          );
                        })}
                    </RowGrid>
                  </Row>
                ))}
              </SeatMap>
              <SeatLegend>
                <LegendGroupLeft>
                  <LegendItem $color={theme.colors.red} $filled>
                    {t('BOOKING_SEAT_SOLD')}
                  </LegendItem>
                  <LegendItem
                    $color={theme.colors.primaryHoverGradient}
                    $filled
                  >
                    {t('BOOKING_SEAT_SELECTED')}
                  </LegendItem>
                </LegendGroupLeft>
                <LegendGroupRight>
                  <LegendItem
                    $color={
                      'radial-gradient(circle at center, #d8c4ff 0%, #b49aff 100%)'
                    }
                    $filled
                  >
                    {t('BOOKING_SEAT_NORMAL')}
                  </LegendItem>
                  <LegendItem
                    $color={
                      'radial-gradient(circle at center, #fff8e1 0%, #ffecb3 100%)'
                    }
                    $filled
                  >
                    {t('BOOKING_SEAT_VIP')}
                  </LegendItem>
                  <LegendItem
                    $color={
                      'radial-gradient(circle at center, #f6b8e3 0%, #ec7dcc 100%)'
                    }
                    $filled
                  >
                    {t('BOOKING_SEAT_COUPLE')}
                  </LegendItem>
                </LegendGroupRight>
              </SeatLegend>
            </>
          )}
        </Card>
      </Main>

      <Aside>
        <SummaryCard>
          <SummaryTitle>{t('BOOKING_SUMMARY')}</SummaryTitle>
          {movie && (
            <BookingMovieInfo
              title={movie.name}
              poster={movie.poster}
              age={movie.age}
              graphics={movie.graphics}
              cinema={cinema.name}
              auditorium={auditorium.name}
              showtime={`${time} - ${formatDate(date)}`}
            />
          )}
          <Divider />
          <SummaryLine>
            {t('BOOKING_SEAT_CHOSEN')}
            <strong>
              {selectedSeats.length
                ? ' ' + selectedSeats.map(s => `${s.row}${s.number}`).join(', ')
                : t('BOOKING_SEAT_NONE')}
            </strong>
          </SummaryLine>
          <Divider />
          <Total>
            {t('BOOKING_TOTAL')}
            <span>{totalPrice.toLocaleString()} đ</span>
          </Total>
          <Actions>
            <GhostButton
              type='button'
              onClick={() => {
                navigate(-1);
              }}
            >
              {t('BOOKING_BACK')}
            </GhostButton>
            <PrimaryButton
              type='button'
              onClick={async () => {
                if (selectedSeats.length === 0) {
                  setSelectSeatModalVisible(true);
                  return;
                }

                if (movie?.age && movie?.age !== 'P') {
                  setAgeModalVisible(true);
                  return;
                }

                try {
                  const seatStatusResults = await Promise.all(
                    selectedSeats.map(seat =>
                      triggerCheckSeatStatus({
                        seatId: seat.id,
                        showtimeId: Number(showtimeId),
                      }).unwrap()
                    )
                  );

                  const heldSeats = seatStatusResults.filter(
                    result => result.status === 'HELD'
                  );

                  if (heldSeats.length > 0) {
                    const heldSeatIds = heldSeats.map(h => h.seatId);
                    setSelectedSeats(prev =>
                      prev.filter(s => !heldSeatIds.includes(s.id))
                    );
                    setModalContent(t('HELD_SEAT_CONTENT'));
                    setModalVisible(true);
                    return;
                  }

                  const results = await Promise.allSettled(
                    selectedSeats.map(seat =>
                      bookSeat({
                        seatId: seat.id,
                        showtimeId: Number(showtimeId),
                      })
                    )
                  );

                  const failed = results.filter(r => r.status === 'rejected');
                  if (failed.length > 0) {
                    setModalContent(t('BOOKING_SEAT_HELD_FAILED'));
                    setModalVisible(true);
                    return;
                  }

                  const expireAt = Date.now() + 8 * 60 * 1000;
                  sessionStorage.setItem('expireAt', expireAt.toString());
                  sessionStorage.setItem(
                    'heldSeat',
                    JSON.stringify({
                      showtimeId,
                      seats: selectedSeats.map(s => ({ seatId: s.id })),
                    })
                  );

                  navigate('/booking/additional', {
                    state: {
                      expireAt,
                      bookingData: {
                        showtimeId,
                        format,
                        movie,
                        cinema: cinema.name,
                        auditorium: auditorium.name,
                        showtime: `${time} - ${formatDate(date)}`,
                        seats: selectedSeats,
                        seatTotal,
                      },
                    },
                  });
                } catch (err) {
                  console.error('Error creating hold:', err);
                  setModalContent(t('BOOKING_SEAT_HELD_FAILED'));
                  setModalVisible(true);
                }
              }}
            >
              {t('BOOKING_CONTINUE')}
            </PrimaryButton>
          </Actions>
        </SummaryCard>
      </Aside>
      <HeldSeatModal
        isOpen={modalVisible}
        onClose={() => setModalVisible(false)}
        content={modalContent}
      />
      <SelectSeatModal
        isOpen={selectSeatModalVisible}
        onClose={() => setSelectSeatModalVisible(false)}
      />

      <AgeConfirmModal
        isOpen={ageModalVisible}
        age={movie?.age ?? 'P'}
        onConfirm={async () => {
          setAgeModalVisible(false);
          try {
            const seatStatusResults = await Promise.all(
              selectedSeats.map(seat =>
                triggerCheckSeatStatus({
                  seatId: seat.id,
                  showtimeId: Number(showtimeId),
                }).unwrap()
              )
            );

            const heldSeats = seatStatusResults.filter(
              result => result.status === 'HELD'
            );

            if (heldSeats.length > 0) {
              const heldSeatIds = heldSeats.map(h => h.seatId);
              setSelectedSeats(prev =>
                prev.filter(s => !heldSeatIds.includes(s.id))
              );
              setModalContent(t('HELD_SEAT_CONTENT'));
              setModalVisible(true);
              return;
            }

            const results = await Promise.allSettled(
              selectedSeats.map(seat =>
                bookSeat({
                  seatId: seat.id,
                  showtimeId: Number(showtimeId),
                })
              )
            );

            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length > 0) {
              setModalContent(t('BOOKING_SEAT_HELD_FAILED'));
              setModalVisible(true);
              return;
            }

            const expireAt = Date.now() + 8 * 60 * 1000;
            sessionStorage.setItem('expireAt', expireAt.toString());
            sessionStorage.setItem(
              'heldSeat',
              JSON.stringify({
                showtimeId,
                seats: selectedSeats.map(s => ({ seatId: s.id })),
              })
            );

            navigate('/booking/additional', {
              state: {
                expireAt,
                bookingData: {
                  showtimeId,
                  format,
                  movie,
                  cinema: cinema.name,
                  auditorium: auditorium.name,
                  showtime: `${time} - ${formatDate(date)}`,
                  seats: selectedSeats,
                  seatTotal,
                },
              },
            });
          } catch (err) {
            console.error('Error creating hold:', err);
            setModalContent(t('BOOKING_SEAT_HELD_FAILED'));
            setModalVisible(true);
          }
        }}
        onReject={() => setAgeModalVisible(false)}
      />
    </Page>
  );
}

/* ===== styled ===== */
const Page = styled.div`
  --card-radius: ${theme.borderRadius.medium};
  --ring: 0 0 0 3px ${theme.colors.backgroundHover};
  max-width: 1200px;
  margin: 24px 0px;
  padding: 0 ${theme.spacing.md};
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: ${theme.spacing.lg};
  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
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
`;
const HeaderBar = styled.div`
  background: ${theme.colors.primaryHoverGradient};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  color: ${theme.colors.headingLight};
  box-shadow: ${theme.colors.darkShadow};
`;
const HeaderTitle = styled.h2`
  margin: 0 0 4px;
  font-family: ${theme.fontFamily.display};
  font-size: 22px;
  letter-spacing: 0.2px;
`;
const HeaderSub = styled.p`
  margin: 0;
  color: ${theme.colors.textLight};
  opacity: 0.95;
`;
const Card = styled.section`
  background: rgba(30, 58, 138, 0.2);
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 24px rgba(2, 22, 46, 0.05);
  padding: ${theme.spacing.lg};
  color: white;
  box-shadow: 0 8px 24px rgba(2, 22, 46, 0.05);
  padding: ${theme.spacing.lg};
`;
const Screen = styled.div`
  text-align: center;
  color: white;
  background: radial-gradient(circle at center, #4f8076 0%, #2e524c 50%);

  border-radius: 50% / 24%;
  padding: ${theme.spacing.md};
  margin: 0 auto ${theme.spacing.xxl};
  font-weight: 700;
  font-size: 16px;
  width: 70%;
  box-shadow:
    0 6px 18px rgba(0, 0, 0, 0.15),
    inset 0 -6px 12px rgba(0, 0, 0, 0.05);
  border: none;
`;
const InfoLine = styled.p`
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.md};
`;
const SeatLegend = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

const LegendGroupLeft = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

const LegendGroupRight = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;
const LegendItem = styled.span<{ $color: string; $filled?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: white;
  &:before {
    content: '';
    width: 16px;
    height: 16px;
    border-radius: ${theme.borderRadius.small};
    display: inline-block;
    background: ${({ $filled, $color }) => ($filled ? $color : 'white')};
    border: ${({ $filled, $color }) =>
      $filled ? 'none' : `2px solid ${$color}`};
  }
`;

const SeatMap = styled.div`
  display: grid;
  gap: ${theme.spacing.xs};
`;
const Row = styled.div`
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: center;
`;
const RowLabel = styled.span`
  color: white;
  font-weight: 600;
`;
const RowGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(0px, max-content));
  gap: 4px;
  justify-content: center;
  margin-right: 32px;
`;

const seatBase = css<{
  $type: SeatType;
}>`
  aspect-ratio: 1;
  border-radius: 5px;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.white};
  color: #555;
  font-weight: 600;
  text-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.2);
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  &:hover {
    filter: brightness(0.95);
    box-shadow: 0 4px 12px rgba(1, 39, 76, 0.15);
  }

  ${({ $type }) =>
    $type !== 'couple' &&
    css`
      max-width: 30px;
    `}
`;

const SeatButton = styled.button<{
  $status: SeatStatus;
  $reservationStatus: ReservationStatus;
  $selected: boolean;
  $type: SeatType;
}>`
  ${seatBase};

  ${({ $type }) =>
    $type === 'normal' &&
    css`
      color: ${theme.colors.textPrimary};
      background: radial-gradient(circle at center, #d8c4ff 0%, #b49aff 100%);
      border-color: #bbb;
    `}

  ${({ $type }) =>
    $type === 'vip' &&
    css`
      border-color: ${theme.colors.gold};
      box-shadow: inset 0 0 0 1px rgba(255, 215, 0, 0.35);
      background: radial-gradient(circle at center, #fff8e1 0%, #ffecb3 100%);
    `}

  ${({ $type }) =>
    $type === 'couple' &&
    css`
      background: radial-gradient(circle at center, #f6b8e3 0%, #ec7dcc 100%);
      border-color: #ff66b2;
      grid-column: span 2;
      width: 100%;
      aspect-ratio: 2 / 0.9;
      font-size: 12px;
      gap: 2px;
    `}

  ${({ $status }) =>
    $status === 'booked' &&
    css`
      background: ${theme.colors.red};
      border-color: ${theme.colors.red};
      color: ${theme.colors.white};
      cursor: not-allowed;
      opacity: 0.85;
      &:hover {
        background: ${theme.colors.red};
      }
    `}

    /* Ghế đang giữ */
  ${({ $reservationStatus }) =>
    $reservationStatus === 'held' &&
    css`
      background: #dddddd;
      color: #333;
      opacity: 0.85;
    `}

  ${({ $selected }) =>
    $selected &&
    css`
      background: ${theme.colors.primaryHoverGradient};
      color: ${theme.colors.white};
      border-color: transparent;
      transform: translateY(-1px);
      box-shadow: 0 6px 14px rgba(1, 39, 76, 0.25);
      opacity: 0.85;
    `}
`;
const SummaryCard = styled(Card)`
  padding: ${theme.spacing.lg};
  background: white;
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
const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${theme.colors.border};
  margin: ${theme.spacing.md} 0;
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

const SeatPlaceholder = styled.div`
  width: 100%;
  aspect-ratio: 1;
  visibility: hidden;
`;

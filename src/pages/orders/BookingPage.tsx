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
import {
  useBookSeatMutation,
  useCancelSeatMutation,
} from '@/app/services/reservation.api';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { HeldSeatModal } from './components/modals/HeldSeatModal';
import { SelectSeatModal } from './components/modals/SelectSeatModal';
import { AgeConfirmModal } from './components/modals/AgeConfirmModal';
import { useBookingTimer } from '@/hooks/useBookingTimer';
import GlobalLoading from '@components/loading/GlobalLoading';

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
  } = useGetSeatsByAuditoriumAndShowtimeQuery(
    {
      auditoriumId: Number(auditorium.id),
      showtimeId: Number(showtimeId),
    },
    {
      refetchOnMountOrArgChange: true,
    }
  );

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
  const [cancelSeat] = useCancelSeatMutation();

  const { timer, expireAt, startTimer, clearTimer } = useBookingTimer({
    autoCancel: true,
    onExpire: () => {
      // Xử lý huỷ ghế
      selectedSeatsRef.current.forEach(seat => {
        cancelSeat({ seatId: seat.id, showtimeId: Number(showtimeId) });
      });
      setSelectedSeats([]);
    },
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      client.subscribe('/topic/seatUpdate', message => {
        const data = JSON.parse(message.body);
        setSeats(prev =>
          prev.map(seat =>
            seat.id === data.seatId
              ? {
                  ...seat,
                  reservationStatus: data.status
                    ? data.status.toLowerCase()
                    : 'cancelled',
                }
              : seat
          )
        );
      });
    };

    client.activate();

    return () => {
      client.deactivate();
    };
  }, []);

  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  // ====== Hủy khi rời trang không thuộc luồng đặt vé ======
  useEffect(() => {
  return () => {
    const goingToConfirm =
      sessionStorage.getItem('navigatingToConfirm') === 'true';
    const goingBack =
      sessionStorage.getItem('navigatingToBack') === 'true';

    if (!goingToConfirm && !goingBack) {
      selectedSeatsRef.current.forEach(seat => {
        cancelSeat({ seatId: seat.id, showtimeId: Number(showtimeId) });
      });
      clearTimer();
    }

    // reset flags
    sessionStorage.removeItem('navigatingToConfirm');
    sessionStorage.removeItem('navigatingToBack');
  };
}, [showtimeId, cancelSeat]);


  // ====== Hủy khi reload/đóng tab ======
  useEffect(() => {
    const handleUnload = () => {
      if (selectedSeats.length > 0) {
        selectedSeats.forEach(seat => {
          cancelSeat({ seatId: seat.id, showtimeId: Number(showtimeId) });
        });
      }
      clearTimer();
    };

    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [selectedSeats, showtimeId, cancelSeat]);

  // ====== Seat toggle ======
  const toggleSeat = async (seat: Seat) => {
    if (seat.reservationStatus === 'booked') return;

    const isSelected = selectedSeats.find(s => s.id === seat.id);

    try {
      if (seat.reservationStatus === 'held') {
        if (isSelected) {
          // ghế đang held nhưng đã được chọn => hủy hold
          await cancelSeat({ seatId: seat.id, showtimeId: Number(showtimeId) });
          setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
        } else {
          // ghế held nhưng chưa được chọn => hiện modal
          setModalContent(t('HELD_SEAT_CONTENT'));
          setModalVisible(true);
        }
        return;
      }

      if (isSelected) {
        // ghế bình thường hoặc active, đã chọn => bỏ chọn
        await cancelSeat({ seatId: seat.id, showtimeId: Number(showtimeId) });
        setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
      } else {
        // ghế bình thường hoặc active, chưa chọn => chọn
        const bookPayload = { seatId: seat.id, showtimeId: Number(showtimeId) };
        const response = await bookSeat(bookPayload);
        if (response) {
          setSelectedSeats(prev => [...prev, seat]);
        }

        // bắt đầu timer nếu đây là ghế đầu tiên
        if (selectedSeats.length === 0) {
          startTimer(8 * 60);
        }
      }
    } catch (err) {
      console.error('Error booking/canceling seat:', err);
      alert(t('BOOKING_ERROR_SEAT'));
    }
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
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

  return (
    <Page>
      <Main>
        <HeaderBar>
          <HeaderTitle>{t('BOOKING_SELECT_SEAT')}</HeaderTitle>
          <HeaderSub>{t('BOOKING_SELECT_SEAT_SUB')}</HeaderSub>
        </HeaderBar>

        <Card>
          {timer > 0 && (
            <div
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                marginBottom: '10px',
                color: 'red',
              }}
            >
              {t('BOOKING_SEAT_HELD')} – {formatTimer(timer)}
            </div>
          )}
          <Screen>{t('BOOKING_SCREEN')}</Screen>

          {isLoading && <GlobalLoading/>}
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
                              title={`${seat.row}${seat.number} • ${seat.price.toLocaleString()}đ`}
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
                  <LegendItem $color={'radial-gradient(circle at center, #d8c4ff 0%, #b49aff 100%)'} $filled>
                    {t('BOOKING_SEAT_NORMAL')}
                  </LegendItem>
                  <LegendItem $color={'radial-gradient(circle at center, #fff8e1 0%, #ffecb3 100%)'} $filled>
                    {t('BOOKING_SEAT_VIP')}
                  </LegendItem>
                  <LegendItem $color={'radial-gradient(circle at center, #f6b8e3 0%, #ec7dcc 100%)'} $filled>
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
              onClick={async () => {
                for (const seat of selectedSeats) {
                  // chỉ cancel nếu ghế đang được mình giữ
                  if (selectedSeats.find(s => s.id === seat.id)) {
                    await cancelSeat({
                      seatId: seat.id,
                      showtimeId: Number(showtimeId),
                    });
                  }
                }
                navigate(-1);
              }}
            >
              {t('BOOKING_BACK')}
            </GhostButton>
            <PrimaryButton
              type='button'
              onClick={() => {
                if (selectedSeats.length === 0) {
                  setSelectSeatModalVisible(true);
                  return;
                }
                if (movie?.age && movie?.age !== 'P') {
                  setAgeModalVisible(true);
                  return;
                }

                // Đặt flag trước khi navigate
                sessionStorage.setItem('navigatingToConfirm', 'true');

                // Lưu danh sách ghế được giữ để hủy khi cần thiết
                sessionStorage.setItem(
                  'heldSeat',
                  JSON.stringify({
                    showtimeId,
                    seats: selectedSeats.map(s => ({ seatId: s.id })),
                  })
                );

                const currentExpireAt = expireAt || startTimer(8 * 60);

                navigate('/booking/additional', {
                  state: {
                    expireAt: currentExpireAt,
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
        onConfirm={() => {
          setAgeModalVisible(false);
          // Đặt flag trước khi navigate
          sessionStorage.setItem('navigatingToConfirm', 'true');

          // Lưu danh sách ghế được giữ để hủy khi cần thiết
          sessionStorage.setItem(
            'heldSeat',
            JSON.stringify({
              showtimeId,
              seats: selectedSeats.map(s => ({ seatId: s.id })),
            })
          );

          const currentExpireAt = expireAt || startTimer(8 * 60);

          navigate('/booking/additional', {
            state: {
              expireAt: currentExpireAt,
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
  background: ${theme.colors.white};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: 0 8px 24px rgba(2, 22, 46, 0.05);
  padding: ${theme.spacing.lg};
`;
const Screen = styled.div`
  text-align: center;
  color: ${theme.colors.textPrimary};
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
  color: ${theme.colors.textSecondary};

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
  color: ${theme.colors.textPrimary};
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
  border-radius: ${theme.borderRadius.small};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.white};
  color: #555;
  font-weight: 600;
  text-shadow: 0 0.5px 0 rgba(0, 0, 0, 0.2);
  font-size: 14px;
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
      max-width: 40px;
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
  visibility: hidden; /* để giữ chỗ nhưng không thấy */
`;

import { useMemo, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { theme } from '@theme/Theme';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGetSeatsByAuditoriumAndShowtimeQuery } from '@app/services/auditorium.api';
import type { SeatDto } from '@app/services/auditorium.api';
import { useGetMovieByShowtimeQuery } from '@app/services/movie.api';
import { BookingMovieInfo } from './components/BookingMovieInfo';
import { useGetAllAdditionalServicesQuery } from '@app/services/additionalService.api';
import { formatDate } from '@utils/functionUtils';
import { useTranslation } from 'react-i18next';

/** ---- UI types ---- */
type SeatType = 'normal' | 'vip' | 'double';
type SeatStatus = 'available' | 'booked';

interface Seat {
  id: number;
  row: string;
  number: number;
  type: SeatType;
  status: SeatStatus;
  price: number;
}

interface Combo {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  description: string;
}

/** Utils */
const letterFromIndex = (idx: number) =>
  String.fromCharCode('A'.charCodeAt(0) + (idx - 1));
const mapSeatType = (t: SeatDto['type']): SeatType =>
  t === 'VIP' ? 'vip' : t === 'DOUBLE' ? 'double' : 'normal';

export default function BookingPage() {
  const { t } = useTranslation();

  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const location = useLocation();
  const { showtimeId, cinema, auditorium, time, date } = location.state || {};

  const {
    data: seatDtos = [],
    isLoading,
    isError,
  } = useGetSeatsByAuditoriumAndShowtimeQuery({
    auditoriumId: Number(auditorium.id),
    showtimeId: Number(showtimeId),
  });

  const { data: movie } = useGetMovieByShowtimeQuery(Number(showtimeId));

  const {
    data: comboDtos = [],
    isLoading: isLoadingCombos,
    isError: isErrorCombos,
  } = useGetAllAdditionalServicesQuery();

  const combos: Combo[] = useMemo(
    () =>
      comboDtos
        .filter((c: any) => c.status) // chỉ lấy combo đang active
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          price: c.price,
          thumbnail: c.thumbnail,
          description: c.description,
        })),
    [comboDtos]
  );

  const seats: Seat[] = useMemo(() => {
    return seatDtos.map(d => {
      const row = d.code?.charAt(0) || letterFromIndex(d.rowIndex);
      const numFromCode = Number(d.code?.slice(1));
      const number = Number.isFinite(numFromCode) ? numFromCode : d.colIndex;

      const isBooked = !d.status || d.reservationStatus !== null;
      return {
        id: d.id,
        row,
        number,
        type: mapSeatType(d.type),
        status: isBooked ? 'booked' : 'available',
        price: d.price,
      };
    });
  }, [seatDtos]);

  const rows = useMemo(
    () =>
      Array.from(new Set(seats.map(s => s.row))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [seats]
  );

  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [selectedCombos, setSelectedCombos] = useState<Record<number, number>>(
    {}
  );

  const toggleSeat = (seat: Seat) => {
    if (seat.status === 'booked') return;
    setSelectedSeats(prev =>
      prev.find(s => s.id === seat.id)
        ? prev.filter(s => s.id !== seat.id)
        : [...prev, seat]
    );
  };

  const handleComboChange = (id: number, qty: number) => {
    setSelectedCombos(prev => ({ ...prev, [id]: Math.max(0, qty) }));
  };

  const selectedComboList = useMemo(
    () =>
      Object.entries(selectedCombos)
        .filter(([_, qty]) => qty > 0)
        .map(([id, qty]) => {
          const combo = combos.find(c => c.id === Number(id));
          return combo ? { ...combo, qty } : null;
        })
        .filter(Boolean) as (Combo & { qty: number })[],
    [selectedCombos, combos]
  );

  const seatTotal = selectedSeats.reduce((s, x) => s + x.price, 0);
  const comboTotal = selectedComboList.reduce((s, c) => s + c.price * c.qty, 0);
  const totalPrice = seatTotal + comboTotal;

 return (
    <Page>
      <Main>
        <HeaderBar>
          <HeaderTitle>{t('BOOKING_SELECT_SEAT')}</HeaderTitle>
          <HeaderSub>{t('BOOKING_SELECT_SEAT_SUB')}</HeaderSub>
        </HeaderBar>

        <Card>
          <Screen>{t('BOOKING_SCREEN')}</Screen>

          {isLoading && <InfoLine>{t('BOOKING_LOADING_SEAT')}</InfoLine>}
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
                              $selected={isSelected}
                              $type={seat.type}
                              onClick={() => toggleSeat(seat)}
                              title={`${seat.row}${seat.number} • ${seat.price.toLocaleString()}đ`}
                            >
                              {seat.number}
                            </SeatButton>
                          );
                        })}
                    </RowGrid>
                  </Row>
                ))}
              </SeatMap>
              <SeatLegend>
                <LegendItem $color={theme.colors.red} $filled>
                  {t('BOOKING_SEAT_SOLD')}
                </LegendItem>
                <LegendItem $color={theme.colors.primaryHoverGradient} $filled>
                  {t('BOOKING_SEAT_SELECTED')}
                </LegendItem>
                <LegendItem $color={theme.colors.gold}>
                  {t('BOOKING_SEAT_VIP')}
                </LegendItem>
                <LegendItem $color={theme.colors.gray}>
                  {t('BOOKING_SEAT_NORMAL')}
                </LegendItem>
              </SeatLegend>
            </>
          )}
        </Card>

        <Card>
          <SectionTitle>{t('BOOKING_SELECT_COMBO')}</SectionTitle>
          {isLoadingCombos && (
            <InfoLine>{t('BOOKING_LOADING_COMBO')}</InfoLine>
          )}
          {isErrorCombos && (
            <InfoLine>{t('BOOKING_ERROR_COMBO')}</InfoLine>
          )}

          <ComboList>
            {combos.map(combo => (
              <ComboItem key={combo.id}>
                <ComboInfo>
                  <Thumbnail src={combo.thumbnail} alt={combo.name} />
                  <div>
                    <ComboName>
                      {combo.name}{' '}
                      <span className='desc'>({combo.description})</span>
                    </ComboName>
                    <ComboPrice>{combo.price.toLocaleString()}đ</ComboPrice>
                  </div>
                </ComboInfo>
                <QtyInput
                  type='number'
                  min={0}
                  value={selectedCombos[combo.id] || 0}
                  onChange={e =>
                    handleComboChange(combo.id, Number(e.target.value))
                  }
                />
              </ComboItem>
            ))}
          </ComboList>
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
          <SummaryLine>
            {t('BOOKING_COMBO')}
            <strong
              style={{
                whiteSpace: 'pre-line',
                fontWeight: '500',
                fontSize: '14px',
              }}
            >
              {selectedComboList.length
                ? '\n' +
                  selectedComboList.map(c => `• ${c.name} x${c.qty}`).join('\n')
                : t('BOOKING_COMBO_NONE')}
            </strong>
          </SummaryLine>
          <Divider />
          <Total>
            {t('BOOKING_TOTAL')}
            <span>{totalPrice.toLocaleString()} đ</span>
          </Total>
          <Actions>
            <GhostButton type='button' onClick={() => navigate(-1)}>
              {t('BOOKING_BACK')}
            </GhostButton>
            <PrimaryButton type='button'>
              {t('BOOKING_CONTINUE')}
            </PrimaryButton>
          </Actions>
        </SummaryCard>
      </Aside>
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
  background: ${theme.colors.background};
  border: 1px dashed ${theme.colors.border};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  margin-bottom: ${theme.spacing.xxl};
  font-weight: 600;
`;
const InfoLine = styled.p`
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.md};
`;
const SeatLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
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
  gap: ${theme.spacing.sm};
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
  grid-template-columns: repeat(auto-fit, 44px);
  gap: 6.5px;
  justify-content: center;
`;
const seatBase = css`
  width: 44px;
  height: 44px;
  border-radius: ${theme.borderRadius.small};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.white};
  color: ${theme.colors.textPrimary};
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease,
    background 0.12s ease,
    border-color 0.12s ease,
    color 0.12s ease;
  outline: none;
  &:hover {
    background: ${theme.colors.backgroundHover};
    border-color: ${theme.colors.primary};
  }
  &:focus-visible {
    box-shadow: var(--ring);
  }
`;
const SeatButton = styled.button<{
  $status: SeatStatus;
  $selected: boolean;
  $type: SeatType;
}>`
  ${seatBase};
  ${({ $type }) =>
    $type === 'vip' &&
    css`
      border-color: ${theme.colors.gold};
      box-shadow: inset 0 0 0 1px rgba(255, 215, 0, 0.35);
    `}
  ${({ $status }) =>
    $status === 'booked' &&
    css`
      background: ${theme.colors.red};
      border-color: ${theme.colors.red};
      color: ${theme.colors.white};
      cursor: not-allowed;
      opacity: 0.9;
      &:hover {
        background: ${theme.colors.red};
      }
    `}
  ${({ $selected }) =>
    $selected &&
    css`
      background: ${theme.colors.primaryHoverGradient};
      color: ${theme.colors.white};
      border-color: transparent;
      transform: translateY(-1px);
      box-shadow: 0 6px 14px rgba(1, 39, 76, 0.25);
    `}
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
  gap: 12px; /* Khoảng cách thumbnail và text đều nhau */
  flex: 1; /* Đảm bảo chiếm hết khoảng trống còn lại */
`;

const Thumbnail = styled.img`
  width: 56px; /* tăng kích thước cho dễ nhìn */
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0; /* Giữ kích thước cố định */
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
  width: 72px;
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
    font-size: 28px;
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
  }
  &:active {
    transform: translateY(1px);
  }
`;

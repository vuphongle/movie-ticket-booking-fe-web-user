import { useState, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';
import { useGetAllCinemaNamesQuery } from '@app/services/cine.api';
import { useGetMoviesShowtimesByCinemaNameQuery } from '@app/services/showTime.api';
import { formatGraphicLabel } from '@utils/functionUtils';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@app/Store';
import { useLoginModal } from '@/contexts/LoginContext';
import { setDataToLocalStorage } from '@utils/localStorageUtils';

export default function QuickBookingComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { openLogin } = useLoginModal();

  // --- State ---
  const [selectedCinema, setSelectedCinema] = useState<string>('');
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(null);

  // --- Queries ---
  const { data: cinemaNames, isLoading: isCinemaLoading, isError } = useGetAllCinemaNamesQuery();
  const { data: movies, isFetching: isMovieLoading } = useGetMoviesShowtimesByCinemaNameQuery(selectedCinema, { skip: !selectedCinema });

  const selectedMovie = useMemo(() => movies?.find(m => m.id === selectedMovieId), [movies, selectedMovieId]);

  // --- Show dates ---
  const showDates = useMemo(() => {
    if (!selectedMovie) return [];
    const uniqueDates = new Set<string>();
    selectedMovie.showtimes.forEach(st => {
      if (st.date && Array.isArray(st.date)) {
        const dateStr = `${st.date[0]}-${String(st.date[1]).padStart(2, '0')}-${String(st.date[2]).padStart(2, '0')}`;
        uniqueDates.add(dateStr);
      }
    });
    return Array.from(uniqueDates).sort();
  }, [selectedMovie]);

  // --- Showtimes ---
  const showtimesForSelectedDate = useMemo(() => {
    if (!selectedMovie || !selectedDate) return [];
    return selectedMovie.showtimes.filter(st => {
      const dateStr = `${st.date[0]}-${String(st.date[1]).padStart(2, '0')}-${String(st.date[2]).padStart(2, '0')}`;
      return dateStr === selectedDate;
    });
  }, [selectedMovie, selectedDate]);

  // --- Format date hiển thị ---
  function formatShowDate(dateStr: string) {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);

    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const isToday = dateObj.toDateString() === today.toDateString();
    const isTomorrow = dateObj.toDateString() === tomorrow.toDateString();

    if (isToday) return `Hôm nay, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    if (isTomorrow) return `Ngày mai, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

    const weekdays = ['Chủ nhật','Thứ hai','Thứ ba','Thứ tư','Thứ năm','Thứ sáu','Thứ bảy'];
    const weekday = weekdays[dateObj.getDay()];
    return `${weekday}, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }

  // --- Xử lý đặt vé ngay ---
  const handleBooking = () => {
    if (!selectedCinema || !selectedMovie || !selectedDate || !selectedShowtimeId) return;

    const st = showtimesForSelectedDate.find(s => s.id === selectedShowtimeId);
    if (!st) return;

    const payload = {
      showtimeId: st.id,
      cinema: {
        id: st.cinemaId,
        name: st.cinemaName,
        location: st.cinemaLocation,
      },
      auditorium: {
        id: st.auditoriumId,
        name: st.auditoriumName,
        totalSeats: st.auditoriumTotalSeats,
        totalRows: st.auditoriumTotalRows,
        totalColumns: st.auditoriumTotalColumns,
        type: st.auditoriumType,
      },
      time: st.startTime,
      date: st.date,
      graphicsType: st.graphicsType,
      translationType: st.translationType,
      format: `${st.graphicsType} ${st.translationType === 'DUBBING' ? 'Lồng tiếng' : st.translationType === 'SUBTITLING' ? 'Phụ đề' : st.translationType}`,
      movieName: selectedMovie.name,
      movieSlug: selectedMovie.slug,
    };

    if (!isAuthenticated) {
      setDataToLocalStorage('pendingBooking', payload);
      openLogin();
      return;
    }

    navigate(`/booking/${selectedMovie.slug}/${st.id}`, { state: payload });
  };

  return (
    <Wrapper>
      <Form>
        {/* Step 1 - Chọn rạp */}
        <SelectWrapper>
          <StepBadge>1</StepBadge>
          <Select
            disabled={isCinemaLoading || isError}
            value={selectedCinema}
            onChange={e => {
              setSelectedCinema(e.target.value);
              setSelectedMovieId(null);
              setSelectedDate('');
              setSelectedShowtimeId(null);
            }}
          >
            <option value=''>{t('QUICKBOOKING_SELECT_CINEMA')}</option>
            {cinemaNames?.map((name, idx) => (
              <option key={idx} value={name}>
                {name}
              </option>
            ))}
          </Select>
        </SelectWrapper>

        {/* Step 2 - Chọn phim */}
        <SelectWrapper>
          <StepBadge>2</StepBadge>
          <Select
            disabled={!selectedCinema || isMovieLoading}
            value={selectedMovieId ?? ''}
            onChange={e => {
              const id = Number(e.target.value);
              setSelectedMovieId(id || null);
              setSelectedDate('');
              setSelectedShowtimeId(null);
            }}
          >
            <option value=''>{t('QUICKBOOKING_SELECT_MOVIE')}</option>
            {movies?.map(movie => (
              <option key={movie.id} value={movie.id}>
                {movie.name}
              </option>
            ))}
          </Select>
        </SelectWrapper>

        {/* Step 3 - Chọn ngày chiếu */}
        <SelectWrapper>
          <StepBadge>3</StepBadge>
          <Select
            disabled={!selectedMovie || showDates.length === 0}
            value={selectedDate}
            onChange={e => {
              setSelectedDate(e.target.value);
              setSelectedShowtimeId(null);
            }}
          >
            <option value=''>{t('QUICKBOOKING_SELECT_DATE')}</option>
            {showDates.map(date => (
              <option key={date} value={date}>
                {formatShowDate(date)}
              </option>
            ))}
          </Select>
        </SelectWrapper>

        {/* Step 4 - Chọn giờ chiếu */}
        <SelectWrapper>
          <StepBadge>4</StepBadge>
          <Select
            disabled={!selectedDate || showtimesForSelectedDate.length === 0}
            value={selectedShowtimeId ?? ''}
            onChange={e => setSelectedShowtimeId(Number(e.target.value))}
          >
            <option value=''>{t('QUICKBOOKING_SELECT_TIME')}</option>
            {showtimesForSelectedDate.map(st => (
              <option key={st.id} value={st.id}>
                {`${st.startTime} - ${st.auditoriumType} | ${formatGraphicLabel(st.graphicsType)} ${
                  st.translationType === 'DUBBING'
                    ? 'Lồng tiếng'
                    : st.translationType === 'SUBTITLING'
                      ? 'Phụ đề'
                      : st.translationType
                }`}
              </option>
            ))}
          </Select>
        </SelectWrapper>

        <Button
          disabled={
            !selectedCinema ||
            !selectedMovie ||
            !selectedDate ||
            !selectedShowtimeId
          }
          onClick={handleBooking}
        >
          {t('QUICKBOOKING_BUTTON_BOOK')}
        </Button>
      </Form>
    </Wrapper>
  );
}
/* Styled */
const Wrapper = styled.div`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  margin-top: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  background: linear-gradient(135deg, #6d5edc, #2193b0);
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const Form = styled.div`
  display: flex;
  flex: 1;
  min-width: 0;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;

  @media (max-width: 767px) {
    flex-direction: column;
  }
`;

const SelectWrapper = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
`;

const StepBadge = styled.span`
  position: absolute;
  left: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #6d5edc, #2193b0);
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Select = styled.select`
  width: 230px; 
  min-width: 0;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  padding-left: 36px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textPrimary};
  background: ${theme.colors.white};
  outline: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${theme.colors.backgroundHover};
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  }

  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(109, 94, 220, 0.25);
  }
/
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

const Button = styled.button`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  font-weight: 600;
  font-size: ${theme.fontSize.md};
  border: none;
  border-radius: ${theme.borderRadius.small};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  cursor: pointer;
  min-width: 120px;
  transition: all 0.3s;

  &:hover {
    background: ${theme.colors.primaryHoverGradient};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
    background: ${theme.colors.primaryHoverGradient};
  }
`;

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
import Select from 'react-select';
import type { GroupBase, StylesConfig } from 'react-select';

export default function QuickBookingComponent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { openLogin } = useLoginModal();

  // --- State ---
  const [selectedCinema, setSelectedCinema] = useState<string>('');
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedShowtimeId, setSelectedShowtimeId] = useState<number | null>(
    null
  );

  // --- Queries ---
  const {
    data: cinemaNames,
    isLoading: isCinemaLoading,
    isError,
  } = useGetAllCinemaNamesQuery();
  const { data: movies, isFetching: isMovieLoading } =
    useGetMoviesShowtimesByCinemaNameQuery(selectedCinema, {
      skip: !selectedCinema,
    });

  const selectedMovie = useMemo(
    () => movies?.find(m => m.id === selectedMovieId),
    [movies, selectedMovieId]
  );

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

    if (isToday)
      return `Hôm nay, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
    if (isTomorrow)
      return `Ngày mai, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;

    const weekdays = [
      'Chủ nhật',
      'Thứ hai',
      'Thứ ba',
      'Thứ tư',
      'Thứ năm',
      'Thứ sáu',
      'Thứ bảy',
    ];
    const weekday = weekdays[dateObj.getDay()];
    return `${weekday}, ${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
  }

  // --- Xử lý đặt vé ngay ---
  const handleBooking = () => {
    if (
      !selectedCinema ||
      !selectedMovie ||
      !selectedDate ||
      !selectedShowtimeId
    )
      return;

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

  const cinemaOptions =
    cinemaNames?.map(name => ({ value: name, label: name })) ?? [];

  return (
    <Wrapper>
      <Form>
        {/* Step 1 - Chọn rạp */}
        <SelectWrapper>
          <StepBadge>1</StepBadge>
          <Select
            options={cinemaOptions}
            value={
              cinemaOptions.find(opt => opt.value === selectedCinema) || null
            }
            onChange={option => {
              setSelectedCinema(option?.value || '');
              setSelectedMovieId(null);
              setSelectedDate('');
              setSelectedShowtimeId(null);
            }}
            isDisabled={isCinemaLoading || isError}
            placeholder={t('QUICKBOOKING_SELECT_CINEMA')}
            styles={customSelectStyles(1)}
          />
        </SelectWrapper>

        {/* Step 2 - Chọn phim */}
        <SelectWrapper>
          <StepBadge>2</StepBadge>
          <Select
            options={
              movies?.map(movie => ({
                value: movie.id,
                label: movie.name,
              })) || []
            }
            value={
              selectedMovieId
                ? {
                    value: selectedMovieId,
                    label:
                      movies?.find(m => m.id === selectedMovieId)?.name || '',
                  }
                : null
            }
            onChange={option => {
              const id = Number(option?.value);
              setSelectedMovieId(id || null);
              setSelectedDate('');
              setSelectedShowtimeId(null);
            }}
            isDisabled={!selectedCinema || isMovieLoading}
            placeholder={t('QUICKBOOKING_SELECT_MOVIE')}
            styles={customSelectStyles(2)}
          />
        </SelectWrapper>

        {/* Step 3 - Chọn ngày chiếu */}
        <SelectWrapper>
          <StepBadge>3</StepBadge>
          <Select
            options={showDates.map(date => ({
              value: date,
              label: formatShowDate(date),
            }))}
            value={
              selectedDate
                ? { value: selectedDate, label: formatShowDate(selectedDate) }
                : null
            }
            onChange={option => {
              setSelectedDate(option?.value || '');
              setSelectedShowtimeId(null);
            }}
            isDisabled={!selectedMovie || showDates.length === 0}
            placeholder={t('QUICKBOOKING_SELECT_DATE')}
            styles={customSelectStyles(3)}
          />
        </SelectWrapper>

        {/* Step 4 - Chọn giờ chiếu */}
        <SelectWrapper>
          <StepBadge>4</StepBadge>
          <Select
            options={showtimesForSelectedDate.map(st => ({
              value: st.id,
              label: `${st.startTime} - ${st.auditoriumType} | ${formatGraphicLabel(st.graphicsType)} ${
                st.translationType === 'DUBBING'
                  ? 'Lồng tiếng'
                  : st.translationType === 'SUBTITLING'
                    ? 'Phụ đề'
                    : st.translationType
              }`,
            }))}
            value={
              selectedShowtimeId
                ? {
                    value: selectedShowtimeId,
                    label:
                      showtimesForSelectedDate.find(
                        st => st.id === selectedShowtimeId
                      )?.startTime || '',
                  }
                : null
            }
            onChange={option => setSelectedShowtimeId(Number(option?.value))}
            isDisabled={!selectedDate || showtimesForSelectedDate.length === 0}
            placeholder={t('QUICKBOOKING_SELECT_TIME')}
            styles={customSelectStyles(4)}
          />
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

const customSelectStyles = (
  step: number
): StylesConfig<any, false, GroupBase<any>> => ({
  control: (base, state) => ({
    ...base,
    width: '230px',
    minWidth: '200px',
    background: 'white',
    borderColor: state.isFocused ? '#6d5edc' : '#ccc',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(109, 94, 220, 0.25)' : 'none',
    borderRadius: '12px',
    padding: '2px 4px 2px 28px',
    cursor: 'pointer',
    position: 'relative',
    '&::before': {
      content: `'${step}'`,
      position: 'absolute',
      left: '8px',
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: '#6d5edc',
      color: 'white',
      width: '22px',
      height: '22px',
      borderRadius: '50%',
      fontSize: '12px',
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 2px 4px rgba(109,94,220,0.3)',
    },
    '&:hover': { borderColor: '#6d5edc' },
  }),
  singleValue: base => ({
    ...base,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px',
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? 'rgba(109, 94, 220, 0.1)'
      : state.isSelected
        ? '#6d5edc'
        : 'white',
    color: state.isSelected ? 'white' : 'black',
    cursor: 'pointer',
    padding: '10px 14px',
    fontSize: '14px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  }),
  menu: base => ({
    ...base,
    width: step === 2 ? '310px' : step === 4 ? '270px' : '230px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    zIndex: 10,
  }),
  menuList: base => ({
    ...base,
    maxHeight: '230px',
  }),
  placeholder: base => ({
    ...base,
    color: '#888',
  }),
});

const Button = styled.button`
  background: ${theme.colors.primary};
  color: ${theme.colors.white};
  font-weight: 600;
  font-size: ${theme.fontSize.md};
  border: none;
  border-radius: ${theme.borderRadius.medium};
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

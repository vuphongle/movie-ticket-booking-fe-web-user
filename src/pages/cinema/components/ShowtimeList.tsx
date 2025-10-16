import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import GlobalLoading from '@components/loading/GlobalLoading';
import { Ticket } from 'lucide-react';
import { setDataToLocalStorage } from '@utils/localStorageUtils';
import MovieItem from '@pages/movies/components/MovieItem';
import { useGetMoviesShowtimesByCinemaQuery } from '@app/services/showTime.api';
import type {
  MovieWithShowtimesDto,
  ShowtimeDto2,
} from '@app/services/showTime.api';
import type { MovieAge } from '@/app/services/movie.api';
import type { RootState } from '@app/Store';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux/es/hooks/useSelector';
import { useLoginModal } from '@/contexts/LoginContext';

interface ShowtimeListProps {
  cinemaId: number;
}

interface ShowtimesByMovie {
  movie: MovieWithShowtimesDto;
  showtimes: ShowtimeDto2[];
}

const pad = (n: number) => n.toString().padStart(2, '0');

const translationMap: Record<string, string> = {
  SUBTITLING: 'Phụ đề',
  DUBBING: 'Lồng tiếng',
};

const weekdays = [
  'Chủ nhật',
  'Thứ 2',
  'Thứ 3',
  'Thứ 4',
  'Thứ 5',
  'Thứ 6',
  'Thứ 7',
];

const ShowtimeList = ({ cinemaId }: ShowtimeListProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { openLogin } = useLoginModal();

  const { data, isLoading } = useGetMoviesShowtimesByCinemaQuery(cinemaId);

  const today = useMemo(() => new Date(), []);
  const next10Days = useMemo(
    () =>
      Array.from({ length: 10 }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() + i);
        return d;
      }),
    [today]
  );

  const [selectedDate, setSelectedDate] = useState(next10Days[0]);

  const showtimesByMovie: ShowtimesByMovie[] = useMemo(() => {
    if (!data) return [];

    const now = new Date();
    const map = new Map<number, ShowtimesByMovie>();

    data.forEach((movie: MovieWithShowtimesDto) => {
      const filteredShowtimes = movie.showtimes.filter((st: ShowtimeDto2) => {
        const dt = new Date(st.date[0], st.date[1] - 1, st.date[2]);
        const isSameDate = dt.toDateString() === selectedDate.toDateString();

        if (!isSameDate) return false;

        if (dt.toDateString() === now.toDateString()) {
          const [hour, minute] = st.startTime.split(':').map(Number);
          const showtimeDate = new Date(
            dt.getFullYear(),
            dt.getMonth(),
            dt.getDate(),
            hour,
            minute
          );
          return showtimeDate > now;
        }

        return true;
      });

      if (filteredShowtimes.length)
        map.set(movie.id, { movie, showtimes: filteredShowtimes });
    });

    return Array.from(map.values());
  }, [data, selectedDate]);

  const handleTimeClick = (st: ShowtimeDto2, slug: string) => {
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
      format: `${st.graphicsType} ${translationMap[st.translationType] ?? st.translationType}`,
    };

    if (!isAuthenticated) {
      setDataToLocalStorage('pendingBooking', payload);
      openLogin();
      return;
    }

    navigate(`/booking/${slug}/${st.id}`, {
      state: payload,
    });
  };

  <GlobalLoading/>

  return (
    <Block>
      <DateFilter>
        {next10Days.map((d, i) => {
          const todayObj = new Date();
          const isToday = d.toDateString() === todayObj.toDateString();

          // tính ngày mai
          const tomorrowObj = new Date();
          tomorrowObj.setDate(todayObj.getDate() + 1);
          const isTomorrow = d.toDateString() === tomorrowObj.toDateString();

          let label = '';
          if (isToday)
            label = `Hôm nay\n${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
          else if (isTomorrow)
            label = `Ngày mai\n${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
          else
            label = `${weekdays[d.getDay()]}\n${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;

          return (
            <DateButton
              key={i}
              type='button'
              $active={selectedDate.toDateString() === d.toDateString()}
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                setSelectedDate(d);
              }}
            >
              {label}
            </DateButton>
          );
        })}
      </DateFilter>

      <MovieGrid>
        {showtimesByMovie.map(({ movie, showtimes }) => {
          const grouped = showtimes.reduce<Record<string, ShowtimeDto2[]>>(
            (acc, st) => {
              const translation =
                translationMap[st.translationType] ?? st.translationType;
              const key = `Phòng ${st.auditoriumType} | ${st.graphicsType} ${translation}`;
              if (!acc[key]) acc[key] = [];
              acc[key].push(st);
              return acc;
            },
            {}
          );

          return (
            <MovieBox key={movie.id}>
              <MovieLeft>
                <MovieItem
                  title={movie.name}
                  poster={movie.poster}
                  age={movie.age as MovieAge}
                  rating={movie.rating}
                  graphics={Array.isArray(movie.graphics) ? movie.graphics : []}
                  buttonText='Đặt vé'
                  compact={false}
                />
              </MovieLeft>
              <TimesList>
                {Object.entries(grouped).map(([groupName, sts]) => {
                  const formattedName = groupName
                    .replace(/_/g, ' ')
                    .replace(/\bSUBTITLING\b/, 'Phụ đề')
                    .replace(/\bDUBBING\b/, 'Lồng tiếng');
                  return (
                    <TimeGroup key={groupName}>
                      <GroupTitle>{formattedName}</GroupTitle>
                      <Times>
                        {sts.map(st => (
                          <Time
                            key={st.id}
                            onClick={() => handleTimeClick(st, movie.slug)}
                          >
                            {st.startTime}
                          </Time>
                        ))}
                      </Times>
                    </TimeGroup>
                  );
                })}
              </TimesList>
              <MovieFooter>
                <Ticket size={18} />
                Đặt vé ngay
              </MovieFooter>
            </MovieBox>
          );
        })}
      </MovieGrid>
    </Block>
  );
};

export default ShowtimeList;

/* ===== styled ===== */
const Block = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const DateFilter = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const DateButton = styled.button<{ $active?: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  white-space: pre-line;
  background: ${({ $active }) =>
    $active ? theme.colors.primary : theme.colors.darkCardBg};
  color: ${({ $active }) =>
    $active ? theme.colors.textLight : theme.colors.darkTextPrimary};
  &:hover {
    background: ${({ $active }) =>
      $active ? theme.colors.primaryHover : theme.colors.primaryHoverGradient};
  }
`;

const MovieGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: ${theme.spacing.md};
`;

const MovieBox = styled.div`
  position: relative;
  display: flex;
  background: linear-gradient(
    135deg,
    #0f172a 0%,
    #2d3748 40%,
    #1e3a8a 60%,
    #065f46 90%
  );
  border-radius: ${theme.borderRadius.small};
  padding: ${theme.spacing.sm};
  gap: ${theme.spacing.md};
  color: #fff;
  overflow: hidden;
`;

const MovieLeft = styled.div``;

const TimesList = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  color: #fff;
  margin-top: 16px;
`;

const TimeGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 8px;
`;

const GroupTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 0.95rem;
  color: #f0f0f0;
`;

const Times = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 8px;
`;

const Time = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 6px 12px;
  background: ${theme.colors.backgroundFocus};
  border: 1px solid ${theme.colors.darkBorder};
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.darkTextPrimary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: ${theme.colors.primary};
    color: ${theme.colors.white};
    border-color: ${theme.colors.primary};
    cursor: pointer;
  }
`;
const MovieFooter = styled.div`
  position: absolute;
  bottom: 10px;
  right: 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #d1d5db;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  gap: 6px;
  pointer-events: none;
  user-select: none;

  svg {
    width: 16px;
    height: 16px;
    color: #22c55e;
  }
`;

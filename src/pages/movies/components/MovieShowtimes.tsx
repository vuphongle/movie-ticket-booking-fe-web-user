import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { CalendarX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useGetShowtimesByMovieQuery,
  useCheckMovieHasShowtimesQuery,
} from '@app/services/showTime.api';
import {
  useGetAllCinemaNamesQuery,
  useGetAllCitiesQuery,
} from '@app/services/cine.api';
import { setDataToLocalStorage } from '@utils/localStorageUtils';
import { useSelector } from 'react-redux';
import type { RootState } from '@app/Store';
import { useNavigate } from 'react-router-dom';
import { useLoginModal } from '@contexts/LoginContext';

export interface MovieShowtimesProps {
  movieId: number;
}

const pad = (n: number) => n.toString().padStart(2, '0');

const WEEKDAYS = [
  'MOVIE_MONDAY',
  'MOVIE_TUESDAY',
  'MOVIE_WEDNESDAY',
  'MOVIE_THURSDAY',
  'MOVIE_FRIDAY',
  'MOVIE_SATURDAY',
  'MOVIE_SUNDAY',
];

const MovieShowtimes: React.FC<MovieShowtimesProps> = ({ movieId }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const { setPendingRoute } = useLoginModal();

  const handleTimeClick = (cinemaId: number, time: string) => {
    const targetRoute = `/booking/${movieId}?cinemaId=${cinemaId}&time=${time}`;

    if (!isAuthenticated) {
      setPendingRoute(targetRoute);
      return;
    }

    navigate(targetRoute);
  };

  const navigate = useNavigate();
  const { t } = useTranslation();

  const today = useMemo(() => new Date(), []);
  const next6Days = useMemo(
    () =>
      Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setDate(today.getDate() + i);
        return d;
      }),
    [today]
  );

  const [selectedDate, setSelectedDate] = useState(next6Days[0]);

  const { data: cities = [] } = useGetAllCitiesQuery();
  const { data: cinemaNames = [] } = useGetAllCinemaNamesQuery();
  const [location, setLocation] = useState('ALL_COUNTRY');
  const [cinema, setCinema] = useState('ALL_CINEMA');

  const showDateStr = useMemo(
    () =>
      `${pad(selectedDate.getDate())}/${pad(selectedDate.getMonth() + 1)}/${selectedDate.getFullYear()}`,
    [selectedDate]
  );

  const { data: hasShowtimes } = useCheckMovieHasShowtimesQuery(movieId);
  const { data: showtimes = [] } = useGetShowtimesByMovieQuery({
    movieId,
    showDate: showDateStr,
  });

  // Options rạp
  const cinemaOptions = useMemo(() => {
    if (location === 'ALL_COUNTRY') return cinemaNames;

    const names = new Set<string>();
    showtimes.forEach((st: any) => {
      if (!st.cinema.location) return;
      const city = st.cinema.location.split(',').pop()?.trim().toLowerCase();
      if (city === location.toLowerCase()) {
        names.add(st.cinema.name);
      }
    });
    return Array.from(names);
  }, [showtimes, location, cinemaNames]);

  // Gom nhóm showtimes theo rạp
  const groupedShowtimes = useMemo(() => {
    let filtered = [...showtimes];

    if (location !== 'ALL_COUNTRY') {
      filtered = filtered.filter((st: any) => {
        if (!st.cinema.location) return false;
        const city = st.cinema.location.split(',').pop()?.trim().toLowerCase();
        return city === location.toLowerCase();
      });
    }

    if (cinema !== 'ALL_CINEMA') {
      filtered = filtered.filter((st: any) => st.cinema.name === cinema);
    }

    const map = new Map<number, any>();
    filtered.forEach((st: any) => {
      if (!map.has(st.cinema.id)) {
        map.set(st.cinema.id, {
          cinema: st.cinema,
          formats: [],
        });
      }
      const group = map.get(st.cinema.id);
      let formatGroup = group.formats.find(
        (f: { format: string; times: string[] }) => f.format === st.format
      );
      if (!formatGroup) {
        formatGroup = { format: st.format, times: [] as string[] };
        group.formats.push(formatGroup);
      }
      formatGroup.times.push(st.startTime as string);
    });

    return Array.from(map.values());
  }, [showtimes, location, cinema]);

  return (
    <Block>
      <SectionTitle>{t('MOVIE_SHOWTIMES')}</SectionTitle>

      {hasShowtimes && !hasShowtimes.hasShowtimes ? (
        <EmptyState>
          <CalendarX size={40} className='icon' />
          <p>{t('MOVIE_NO_SHOWTIMES')}</p>
        </EmptyState>
      ) : (
        <>
          <FilterHeader>
            <DateFilter>
              {next6Days.map((d, i) => {
                const isToday = d.toDateString() === new Date().toDateString();
                const weekdayIndex = d.getDay(); // 0 = Chủ nhật
                const weekdayKey = WEEKDAYS[(weekdayIndex + 6) % 7]; // map 0 -> Chủ nhật cuối
                return (
                  <DateButton
                    key={i}
                    active={selectedDate.getDate() === d.getDate()}
                    onClick={() => setSelectedDate(d)}
                  >
                    {isToday ? (
                      <>
                        {t('MOVIE_TODAY')}
                        <br />
                        {`${pad(d.getDate())}/${pad(d.getMonth() + 1)}`}
                      </>
                    ) : (
                      <>
                        {t(weekdayKey)}
                        <br />
                        {`${pad(d.getDate())}/${pad(d.getMonth() + 1)}`}
                      </>
                    )}
                  </DateButton>
                );
              })}
            </DateFilter>

            <FilterRow>
              <Select
                value={location}
                onChange={e => setLocation(e.target.value)}
              >
                <option value='ALL_COUNTRY'>{t('MOVIE_ALL_COUNTRY')}</option>
                {cities.map(city => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </Select>

              <Select value={cinema} onChange={e => setCinema(e.target.value)}>
                <option value='ALL_CINEMA'>{t('MOVIE_ALL_CINEMA')}</option>
                {cinemaOptions.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </FilterRow>
          </FilterHeader>

          <ShowtimeWrapper>
            {groupedShowtimes.map((group: any) => (
              <CinemaBlock key={group.cinema.id}>
                <CinemaName>{group.cinema.name}</CinemaName>

                {group.formats.map((f: any, idx: number) => (
                  <FormatBlock key={idx}>
                    <FormatName>{f.format}</FormatName>
                    <Times>
                      {f.times.map((time: string, tIdx: number) => (
                        <TimeButton
                          key={tIdx}
                          onClick={() => handleTimeClick(group.cinema.id, time)}
                        >
                          {time}
                        </TimeButton>
                      ))}
                    </Times>
                  </FormatBlock>
                ))}
              </CinemaBlock>
            ))}
          </ShowtimeWrapper>
        </>
      )}
    </Block>
  );
};

export default MovieShowtimes;

/* ---------------- STYLES ---------------- */
const Block = styled.div`
  margin-top: 20px;
`;

const SectionTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.darkTextPrimary};
  border-bottom: 2px solid ${theme.colors.darkBorder};
  padding-bottom: 4px;
  padding-left: 8px;
  border-left: 5px solid ${theme.colors.darkTitleBar};
`;

const FilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const DateFilter = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const DateButton = styled.button<{ active?: boolean }>`
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ active }) =>
    active ? theme.colors.primary : theme.colors.darkCardBg};
  color: ${({ active }) =>
    active ? theme.colors.textLight : theme.colors.darkTextPrimary};

  &:hover {
    background: ${({ active }) =>
      active ? theme.colors.primaryHover : theme.colors.primaryHoverGradient};
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const Select = styled.select`
  width: 160px;
  padding: 8px 12px;
  border-radius: 8px;
  background: ${theme.colors.background};
  color: ${theme.colors.textPrimary};
  border: 1px solid ${theme.colors.border};
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  appearance: none;
  transition: all 0.2s ease;

  background-image: url("data:image/svg+xml;utf8,<svg fill='${encodeURIComponent(
    theme.colors.textPrimary
  )}' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
  padding-right: 32px;

  &:hover {
    border-color: ${theme.colors.primary};
    background: ${theme.colors.bgLight};
  }

  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(0, 150, 255, 0.3);
  }

  option {
    background: ${theme.colors.white};
    color: ${theme.colors.textPrimary};
  }

  option:hover,
  option:checked {
    background: ${theme.colors.primary};
    color: ${theme.colors.white};
  }
`;

const ShowtimeWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const CinemaBlock = styled.div`
  background: ${theme.colors.darkCardBg};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
`;

const CinemaName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${theme.colors.darkTextPrimary};
  margin-bottom: ${theme.spacing.sm};
`;

const FormatBlock = styled.div`
  margin-bottom: ${theme.spacing.md};
`;

const FormatName = styled.p`
  font-weight: 500;
  color: ${theme.colors.darkTextSecondary};
  margin-bottom: ${theme.spacing.sm};
`;

const Times = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const TimeButton = styled.button`
  padding: 6px 12px;
  background: ${theme.colors.backgroundFocus};
  border: 1px solid ${theme.colors.darkBorder};
  border-radius: ${theme.borderRadius.small};
  color: ${theme.colors.darkTextPrimary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover {
    background: ${theme.colors.primary};
    color: ${theme.colors.white};
    border-color: ${theme.colors.primary};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 400px;

  padding: 40px;
  margin: 20px 0;

  background: ${theme.colors.darkCardBg};
  border: 1px dashed ${theme.colors.darkBorder};
  border-radius: ${theme.borderRadius.medium};

  color: ${theme.colors.darkTextSecondary};

  .icon {
    color: ${theme.colors.darkTextTertiary};
  }
`;

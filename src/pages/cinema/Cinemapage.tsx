import { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Spin } from 'antd';
import { useGetAllCinemasQuery } from '@app/services/cine.api';
import CinemaCard from './components/CinemaCard';
import CinemaDetail from './components/CinemaDetail';

const CinemaPage = () => {
  const { data: cinemas, isLoading } = useGetAllCinemasQuery();
  const [search, setSearch] = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const filteredCinemas = cinemas?.filter((c: any) => {
    const name = c?.name?.toLowerCase() || '';
    const city = c?.city?.toLowerCase() || '';
    const keyword = search.toLowerCase();
    return name.includes(keyword) || city.includes(keyword);
  });

  const handleSelectCinema = (cinemaId: number) => {
    setSelectedCinemaId(cinemaId);
  };

  useEffect(() => {
    if (selectedCinemaId) {
      const timeout = setTimeout(() => {
        if (detailRef.current) {
          detailRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }
      }, 400);

      return () => clearTimeout(timeout);
    }
  }, [selectedCinemaId]);

  if (isLoading) return <Spin size='large' />;

  return (
    <PageContainer>
      <SearchWrapper>
        <SearchInput
          type='text'
          placeholder='Tìm rạp'
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </SearchWrapper>

      <CinemaGrid>
        {filteredCinemas?.map((cinema: any) => (
          <CinemaCard
            key={cinema.id}
            cinema={cinema}
            onSelect={() => handleSelectCinema(cinema.id)}
            isSelected={cinema.id === selectedCinemaId}
          />
        ))}
      </CinemaGrid>

      {selectedCinemaId && (
        <DetailWrapper ref={detailRef}>
          <CinemaDetail cinemaId={selectedCinemaId} />
        </DetailWrapper>
      )}
    </PageContainer>
  );
};

export default CinemaPage;

/* ===== styled ===== */
const PageContainer = styled.div`
  padding: 24px;
`;

const SearchWrapper = styled.div`
  margin-bottom: 24px;
  display: flex;
  justify-content: flex-start;
`;

const SearchInput = styled.input`
  width: 100%;
  max-width: 400px;
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  outline: none;
  font-size: 14px;
  background: rgba(255, 255, 255, 0.1);
  color: #f9fafb;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;

  &::placeholder {
    color: rgba(249, 250, 251, 0.6);
  }

  &:focus {
    background: rgba(255, 255, 255, 0.15);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
    transform: scale(1.02);
  }
`;

const CinemaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
`;

const DetailWrapper = styled.div`
  margin-top: 48px;
`;

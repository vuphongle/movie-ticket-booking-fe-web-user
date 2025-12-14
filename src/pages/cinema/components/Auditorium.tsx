import styled from "styled-components";
import { useTranslation } from 'react-i18next';

interface AuditoriumProps {
  auditorium: {
    id: number;
    name: string;
    totalRows: number;
    totalColumns: number;
    type: string;
  };
}

const Auditorium = ({ auditorium }: AuditoriumProps) => {
    
  const { t } = useTranslation();
  const { name, totalRows, totalColumns, type } = auditorium;

  return (
    <AuditoriumBox>
      <AuditoriumHeader>
        <RoomName>{name}</RoomName>
        <RoomType>{type}</RoomType>
      </AuditoriumHeader>
      <SeatInfo>{totalRows * totalColumns} {t('SEATS')}</SeatInfo>
    </AuditoriumBox>
  );
};

export default Auditorium;

/* ===== styled ===== */
const AuditoriumBox = styled.div`
  width: 160px;
  height: 90px;
  background: linear-gradient(145deg, #1e293b, #0f172a);
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.15);
  color: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
  transition: all 0.25s ease;
  box-shadow: 0 3px 8px rgba(0,0,0,0.2);

  &:hover {
    background: linear-gradient(145deg, #334155, #1e293b);
    transform: translateY(-2px);
  }
`;

const AuditoriumHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RoomName = styled.div`
  font-size: 0.95rem;
  font-weight: 600;
`;

const RoomType = styled.div`
  font-size: 0.8rem;
  opacity: 0.8;
`;

const SeatInfo = styled.div`
  text-align: right;
  font-size: 0.8rem;
  opacity: 0.7;
`;

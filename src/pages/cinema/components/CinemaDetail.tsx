import styled from "styled-components";
import { Spin } from "antd";
import {
  useGetCinemaByIdQuery,
  useGetAuditoriumsByCinemaIdQuery,
} from "@app/services/cine.api";
import ShowtimeList from "./ShowtimeList";
import Auditorium from "./Auditorium";
import CinemaMap from "./CinemaMap";

interface CinemaDetailProps {
  cinemaId: number;
}

const CinemaDetail = ({ cinemaId }: CinemaDetailProps) => {
  const { data: cinema, isLoading } = useGetCinemaByIdQuery({
    cinemaId: cinemaId.toString(),
  });
  const { data: auditoriums } = useGetAuditoriumsByCinemaIdQuery({
    cinemaId: cinemaId.toString(),
  });

  if (isLoading || !cinema) return <Spin size="large" />;

  return (
    <DetailContainer>
      <ShowtimeSection>
        <ShowtimeList cinemaId={cinemaId} />
      </ShowtimeSection>

      <BottomGrid>
        <AuditoriumBox>
          <BoxTitle>Phòng chiếu</BoxTitle>
          <AuditoriumList>
            {auditoriums?.map((a) => (
              <Auditorium key={a.id} auditorium={a} />
            ))}
          </AuditoriumList>
        </AuditoriumBox>

        <InfoBox>
          <BoxTitle>Vị trí rạp</BoxTitle>
          <CinemaMap mapLocation={cinema.mapLocation || ""} />
        </InfoBox>
      </BottomGrid>
    </DetailContainer>
  );
};

export default CinemaDetail;

/* ===== styled ===== */
const DetailContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
`;

const ShowtimeSection = styled.div`
  width: 100%;
`;

const BottomGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  align-items: stretch;
`;

const AuditoriumBox = styled.div`
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 95%;
`;

const AuditoriumList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  overflow-y: auto;
  margin-top: 8px;
  flex: 1;
  justify-content: center;
  align-items: center;   
`;

const InfoBox = styled.div`
  background: linear-gradient(145deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9));
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  height: 95%;
`;

const BoxTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 6px;
`;

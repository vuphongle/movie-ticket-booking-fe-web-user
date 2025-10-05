import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { formatGraphicLabel } from '@utils/functionUtils';
import { useTranslation } from 'react-i18next';

interface BookingData {
  showtimeId: string;
  format: string;
  movie: {
    name: string;
    poster: string;
    duration: number;
    age: string;
    graphics: string[];
  };
  cinema: string;
  auditorium: string;
  showtime: string;
  seats: { row: string; number: number; price: number }[];
  combos: { name: string; qty: number; price: number }[];
  total: number;
}

interface TicketInfoProps {
  bookingData: BookingData | null;
  appliedCoupons?: { code: string; discount: number }[];
}

export default function TicketInfo({
  bookingData,
  appliedCoupons = [],
}: TicketInfoProps) {
  if (!bookingData) return null;

  const { t } = useTranslation();

  const discountTotal = appliedCoupons.reduce((sum, c) => sum + c.discount, 0);
  const finalTotal = bookingData.total - discountTotal;

  if (!bookingData) return null;

  return (
    <Card>
      <TopRow>
        <PosterWrapper>
          <Poster src={bookingData.movie.poster} alt={bookingData.movie.name} />
          <TopLeft>
            {bookingData.movie.graphics.map((g, idx) => (
              <Badge key={idx}>{formatGraphicLabel(g)}</Badge>
            ))}
          </TopLeft>
          <TopRight>
            <AgeBadge>{bookingData.movie.age}</AgeBadge>
          </TopRight>
          <BottomLeft>
            <DurationBadge>{bookingData.movie.duration} phút</DurationBadge>
          </BottomLeft>
        </PosterWrapper>
        <MovieInfo>
          <MovieName>{bookingData.movie.name}</MovieName>
          <SubInfo>
            {bookingData.cinema} - {bookingData.auditorium}
          </SubInfo>
          <SubInfo>
            Định dạng:
            <FormatBadge>{t(bookingData.format)}</FormatBadge>
          </SubInfo>

          <SubInfo>
            Suất: <ShowtimeDetail>{bookingData.showtime}</ShowtimeDetail>
          </SubInfo>
        </MovieInfo>
      </TopRow>

      <Divider />

      {/* Danh sách vé */}
      <SectionTitle>Vé</SectionTitle>
      {bookingData.seats.map((s, idx) => (
        <Line key={idx}>
          <span>
            1x Ghế {s.row}
            {s.number}
          </span>
          <span>{s.price.toLocaleString()} đ</span>
        </Line>
      ))}

      {/* Danh sách combo */}
      {bookingData.combos.length > 0 && (
        <>
          <Divider />
          <SectionTitle>Combo</SectionTitle>
          {bookingData.combos.map((c, idx) => (
            <Line key={idx}>
              <span>
                {c.qty}x {c.name}
              </span>
              <span>{(c.price * c.qty).toLocaleString()} đ</span>
            </Line>
          ))}
        </>
      )}

      <Divider />

      {/* Khuyến mãi */}
      <SectionTitle>Khuyến mãi</SectionTitle>
      {appliedCoupons.length === 0 ? (
        <PromoNotice>Hiện tại chưa áp dụng voucher nào.</PromoNotice>
      ) : (
        appliedCoupons.map((c, idx) => (
          <Line key={idx}>
            <span>{c.code}</span>
            <span>-{c.discount.toLocaleString()} đ</span>
          </Line>
        ))
      )}

      <Divider />

      <Total>
        <span>Tổng giảm</span>
        <span>-{discountTotal.toLocaleString()} đ</span>
      </Total>
      <Total>
        <span>Tổng cộng</span>
        <span>{finalTotal.toLocaleString()} đ</span>
      </Total>
    </Card>
  );
}

// styled-components
const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-top: 8px solid ${theme.colors.darkTitleBar};
`;

const TopRow = styled.div`
  display: flex;
  gap: 12px;
`;

const PosterWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 180px;
  flex-shrink: 0;
`;

const Poster = styled.img`
  width: 120px;
  height: 180px;
  border-radius: 6px;
  object-fit: cover;
`;

const TopLeft = styled.div`
  position: absolute;
  top: 6px;
  left: 4px;
  display: flex;
  gap: 4px;
`;

const TopRight = styled.div`
  position: absolute;
  top: 2px;
  right: 4px;
`;

const BottomLeft = styled.div`
  position: absolute;
  bottom: 6px;
  left: 4px;
`;

const Badge = styled.span`
  background: ${theme.colors.primary};
  color: #fff;
  font-size: 10px;
  font-weight: 600;
  padding: 1px 3px;
  border-radius: 4px;
`;

const AgeBadge = styled(Badge)`
  background: red;
  font-size: 10px;
  border-radius: 4px;
  padding: 1px 3px;
`;

const DurationBadge = styled.div`
  background: rgba(0, 0, 0, 0.7);
  color: #fff;
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
`;

const FormatBadge = styled.span`
  background: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 6px;
`;

const MovieInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const MovieName = styled.h4`
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  margin-top: 0;
`;

const SubInfo = styled.div`
  font-size: 13px;
  color: #666;
  margin-bottom: 2px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px dashed #ddd;
  margin: 12px 0;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
`;

const Line = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  margin-bottom: 4px;
`;

const PromoNotice = styled.div`
  font-size: 12px;
  color: #888;
  line-height: 1.4;
`;

const Total = styled.div`
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 15px;
  color: #e53935;
`;

const ShowtimeDetail = styled.p`
  font-size: 13px;
  margin: 6px 0 0;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${theme.colors.primary}20;
  color: ${theme.colors.primary};
  font-weight: 600;
  display: inline-block;
  transition: all 0.2s ease;
  text-align: center;
`;

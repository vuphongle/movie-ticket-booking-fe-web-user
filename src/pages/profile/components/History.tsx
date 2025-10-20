import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';
import { useGetAllOrdersQuery } from '@app/services/Order.api';
import type { OrderDto } from '@app/services/Order.api';
import { FileText } from 'lucide-react';

const History: React.FC = () => {
  const { t } = useTranslation();
  const { data: purchaseHistory, isLoading, error } = useGetAllOrdersQuery();
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(3); // Hiển thị 3 đơn ban đầu

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const handleViewPdf = (qrPath: string) => {
    const pdfUrl = `${window.location.origin}${qrPath}`;
    window.open(pdfUrl, '_blank');
  };

  const filteredHistory = useMemo(() => {
    if (!purchaseHistory) return [];
    return purchaseHistory.filter(order => {
      const movieName = order.showtime?.movie?.name?.toLowerCase() || '';
      const cinemaName = order.showtime?.auditorium?.cinema?.name?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return movieName.includes(term) || cinemaName.includes(term);
    });
  }, [purchaseHistory, searchTerm]);

  const visibleOrders = filteredHistory.slice(0, visibleCount);

  if (isLoading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi khi tải dữ liệu!</p>;
  if (!purchaseHistory || purchaseHistory.length === 0) return <p>Không có lịch sử mua vé</p>;

  return (
    <HistoryContainer>
      <HistoryTitle>{t('PURCHASE_HISTORY')}</HistoryTitle>

      <SearchInput
        type="text"
        placeholder="Tìm kiếm phim hoặc rạp..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      <HistoryList>
        {visibleOrders.map((order: OrderDto) => (
          <HistoryItem key={order.id}>
            <MovieSection>
              <Poster src={order.showtime?.movie?.poster} alt={order.showtime?.movie?.name} />
              <MovieDetails>
                <MovieTitle>{order.showtime?.movie?.name}</MovieTitle>
                <CinemaInfo>{order.showtime?.auditorium?.cinema?.name} - Phòng {order.showtime?.auditorium?.name}</CinemaInfo>
                <DateTime>
                  {order.showtime?.startTime} - {order.showtime?.endTime} | {order.showtime?.date}
                </DateTime>
                <SmallText>
                  Hình thức: {order.showtime?.graphicsType} | {order.showtime?.translationType}
                </SmallText>
              </MovieDetails>
            </MovieSection>

            <TicketDetails>
              <DetailRow>
                <Label>Ghế:</Label>
                <Value>{order.ticketItems?.map(t => t.seat?.code).join(', ')}</Value>
              </DetailRow>
              {order.serviceItems?.length > 0 && (
                <DetailRow>
                  <Label>Dịch vụ:</Label>
                  <Value>
                    {order.serviceItems
                      .map(
                        s =>
                          `${s.additionalService?.name} x${s.quantity} (${formatCurrency(s.price)})`
                      )
                      .join(', ')}
                  </Value>
                </DetailRow>
              )}
              <DetailRow>
                <Label>Giảm giá:</Label>
                <Value>{formatCurrency(order.discount || 0)}</Value>
              </DetailRow>
              <DetailRow>
                <Label>Tổng tiền:</Label>
                <TotalPrice>{formatCurrency(order.totalPrice)}</TotalPrice>
              </DetailRow>
              <DetailRow>
                <Label>Thanh toán:</Label>
                <Value>
                  {JSON.parse(order.requestSnapshot || '{}')?.paymentMethod || 'Không rõ'}
                </Value>
              </DetailRow>
              <DetailRow>
                <Label>Ngày mua:</Label>
                <Value>
                  {order.createdAt
                    ? `${order.createdAt[2]}/${order.createdAt[1]}/${order.createdAt[0]} ${order.createdAt[3]}:${order.createdAt[4]}`
                    : ''}
                </Value>
              </DetailRow>
            </TicketDetails>

            <RightSection>
              <Status status={order.status}>
                {order.status === 'CONFIRMED' ? 'Hoàn thành' : 'Đã hủy'}
              </Status>
              {order.qrCodePath && (
                <ButtonStyled onClick={() => handleViewPdf(order.qrCodePath)}>
                  <FileText size={16} /> Xem đơn (PDF)
                </ButtonStyled>
              )}
            </RightSection>
          </HistoryItem>
        ))}
      </HistoryList>

      {visibleCount < filteredHistory.length && (
        <LoadMoreButton onClick={() => setVisibleCount(prev => prev + 3)}>
          Xem thêm
        </LoadMoreButton>
      )}
    </HistoryContainer>
  );
};

/* --- Styled Components --- */
const HistoryContainer = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  box-shadow: 0 4px 20px rgba(23, 13, 13, 0.08);
  border: 1px solid ${theme.colors.border};
`;

const HistoryTitle = styled.h2`
  font-size: ${theme.fontSize.xl};
  font-weight: 600;
  margin-bottom: ${theme.spacing.lg};
  color: ${theme.colors.textPrimary};
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const HistoryItem = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  transition: box-shadow 0.2s ease;
  background: #fafafa;

  &:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
  }
`;

const MovieSection = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex: 1;
`;

const Poster = styled.img`
  width: 80px;
  height: 110px;
  object-fit: cover;
  border-radius: ${theme.borderRadius.small};
`;

const MovieDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const MovieTitle = styled.h3`
  font-size: ${theme.fontSize.lg};
  font-weight: 600;
  color: ${theme.colors.textPrimary};
`;

const CinemaInfo = styled.p`
  font-size: ${theme.fontSize.md};
  color: ${theme.colors.textSecondary};
  margin: 2px 0;
`;

const DateTime = styled.p`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin: 2px 0;
`;

const SmallText = styled.p`
  font-size: ${theme.fontSize.xl};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

const TicketDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Label = styled.span`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
  font-weight: 500;
  min-width: 90px;
`;

const Value = styled.span`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textPrimary};
`;

const TotalPrice = styled.span`
  font-size: ${theme.fontSize.md};
  color: ${theme.colors.primary};
  font-weight: 700;
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
`;

const Status = styled.div<{ status: string }>`
  padding: 6px 10px;
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.fontSize.sm};
  font-weight: 600;
  width: fit-content;

  ${({ status }) =>
    status === 'CONFIRMED'
      ? `
      background: #e3fcef;
      color: #0b8043;
    `
      : `
      background: #ffebee;
      color: #c62828;
    `}
`;

const ButtonStyled = styled.button`
  background: ${theme.colors.primary};
  color: white;
  font-size: ${theme.fontSize.sm};
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: none;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.primaryHoverGradient};
  }
`;

const SearchInput = styled.input`
  width: auto;
  padding: 6px 12px;
  margin-bottom: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.small};
  border: 1px solid ${theme.colors.border};
  font-size: ${theme.fontSize.sm};
  background: '#f9f9f9';
`;

const LoadMoreButton = styled.button`
  margin-top: ${theme.spacing.md};
  padding: 8px 12px;
  font-size: ${theme.fontSize.sm};
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: ${theme.colors.primaryHoverGradient};
  }
`;

export default History;

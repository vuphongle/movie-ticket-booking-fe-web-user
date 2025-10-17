import React from 'react';
import styled from 'styled-components';
import { theme } from '@/theme/Theme';
import { useTranslation } from 'react-i18next';
import { useGetAllOrdersQuery } from '@app/services/Order.api';
import type { OrderDto } from '@app/services/Order.api';

const History: React.FC = () => {
  const { t } = useTranslation();

  // Lấy tất cả đơn
  const { data: purchaseHistory, isLoading, error } = useGetAllOrdersQuery();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  if (isLoading) return <p>Đang tải...</p>;
  if (error) return <p>Lỗi khi tải dữ liệu!</p>;
  if (!purchaseHistory || purchaseHistory.length === 0) return <p>Không có lịch sử mua vé</p>;

  return (
    <HistoryContainer>
      <HistoryTitle>{t('PURCHASE_HISTORY')}</HistoryTitle>

      <HistoryList>
        {purchaseHistory.map((order: OrderDto) => (
          <HistoryItem key={order.id}>
            <MovieInfo>
              <MovieTitle>{order.movieTitle}</MovieTitle>
              <CinemaInfo>{order.cinema}</CinemaInfo>
              <DateTime>
                {order.date} - {order.time}
              </DateTime>
            </MovieInfo>

            <TicketDetails>
              <SeatsInfo>
                <Label>Ghế:</Label>
                <SeatsText>{order.seats?.length ? order.seats.join(', ') : 'Chưa có ghế'}</SeatsText>
              </SeatsInfo>
              <PriceInfo>
                <Label>Tổng tiền:</Label>
                <Price>{formatCurrency(order.totalAmount)}</Price>
              </PriceInfo>
            </TicketDetails>

            <Status status={order.status}>
              {order.status === 'confirmed' ? 'Hoàn thành' : 'Đã hủy'}
            </Status>
          </HistoryItem>
        ))}
      </HistoryList>
    </HistoryContainer>
  );
};

// styled-components giữ nguyên như trước
const HistoryContainer = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  box-shadow: 0 4px 20px rgba(23, 13, 13, 0.08);
  border: 1px solid ${theme.colors.border};
  position: relative;
  z-index: 1;
`;

const HistoryTitle = styled.h2`
  font-size: ${theme.fontSize.xl};
  font-weight: 600;
  margin: 0 0 ${theme.spacing.lg} 0;
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

  &:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  @media (min-width: 768px) {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
`;

const MovieInfo = styled.div`flex: 1;`;
const MovieTitle = styled.h3`
  font-size: ${theme.fontSize.lg};
  font-weight: 600;
  color: ${theme.colors.textPrimary};
  margin: 0 0 ${theme.spacing.xs} 0;
`;
const CinemaInfo = styled.p`
  font-size: ${theme.fontSize.md};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.xs} 0;
`;
const DateTime = styled.p`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin: 0;
`;

const TicketDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};

  @media (min-width: 768px) {
    flex-direction: row;
    gap: ${theme.spacing.md};
  }
`;

const SeatsInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const PriceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const Label = styled.span`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textSecondary};
  font-weight: 500;
`;

const SeatsText = styled.span`
  font-size: ${theme.fontSize.sm};
  color: ${theme.colors.textPrimary};
  font-weight: 600;
`;

const Price = styled.span`
  font-size: ${theme.fontSize.md};
  color: ${theme.colors.primary};
  font-weight: 600;
`;

const Status = styled.div<{ status: string }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.fontSize.sm};
  font-weight: 500;
  text-align: center;
  width: fit-content;

  ${({ status }) =>
    status === 'confirmed'
      ? `
      background: #e8f5e8;
      color: #2e7d32;
    `
      : `
      background: #ffebee;
      color: #c62828;
    `}

  @media (min-width: 768px) {
    align-self: center;
  }
`;

export default History;

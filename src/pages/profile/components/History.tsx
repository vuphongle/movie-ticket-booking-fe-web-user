import React from 'react';
import styled from 'styled-components';
import { theme } from '@/theme/Theme';
import { useTranslation } from 'react-i18next';

const History: React.FC = () => {
  const { t } = useTranslation();

  const purchaseHistory = [
    {
      id: 1,
      movieTitle: 'Avengers: Endgame',
      cinema: 'CGV Vincom Center',
      date: '2024-12-15',
      time: '19:30',
      seats: ['A1', 'A2'],
      totalAmount: 200000,
      status: 'completed',
    },
    {
      id: 2,
      movieTitle: 'Spider-Man: No Way Home',
      cinema: 'Lotte Cinema',
      date: '2024-12-10',
      time: '21:00',
      seats: ['B5'],
      totalAmount: 120000,
      status: 'completed',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  return (
    <HistoryContainer>
      <HistoryTitle>{t('PURCHASE_HISTORY')}</HistoryTitle>

      {purchaseHistory.length === 0 ? (
        <EmptyState>
          <EmptyMessage>Bạn chưa có lịch sử mua vé nào</EmptyMessage>
        </EmptyState>
      ) : (
        <HistoryList>
          {purchaseHistory.map(item => (
            <HistoryItem key={item.id}>
              <MovieInfo>
                <MovieTitle>{item.movieTitle}</MovieTitle>
                <CinemaInfo>{item.cinema}</CinemaInfo>
                <DateTime>
                  {item.date} - {item.time}
                </DateTime>
              </MovieInfo>

              <TicketDetails>
                <SeatsInfo>
                  <Label>Ghế:</Label>
                  <SeatsText>{item.seats.join(', ')}</SeatsText>
                </SeatsInfo>
                <PriceInfo>
                  <Label>Tổng tiền:</Label>
                  <Price>{formatCurrency(item.totalAmount)}</Price>
                </PriceInfo>
              </TicketDetails>

              <Status status={item.status}>
                {item.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
              </Status>
            </HistoryItem>
          ))}
        </HistoryList>
      )}
    </HistoryContainer>
  );
};

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

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.lg} 0;
`;

const EmptyMessage = styled.p`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.fontSize.md};
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

const MovieInfo = styled.div`
  flex: 1;
`;

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
    status === 'completed'
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

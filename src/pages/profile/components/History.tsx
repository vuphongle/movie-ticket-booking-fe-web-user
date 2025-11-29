import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { useTranslation } from 'react-i18next';
import {
  useGetAllOrdersQuery,
  useDownloadPdfMutation,
} from '@app/services/Order.api';
import type { OrderDto } from '@app/services/Order.api';
import { FileText, TicketX } from 'lucide-react';
import { formatDate, formatGraphicLabel } from '@utils/functionUtils';

const ORDER_STATUS_FILTERS = [
  { key: 'UPCOMING', label: 'Sắp tới' },
  { key: 'WATCHED', label: 'Đã xem' },
  { key: 'ALL', label: 'Tất cả' },
  { key: 'CONFIRMED', label: 'Đã thanh toán' },
  { key: 'PENDING', label: 'Chờ thanh toán' },
  { key: 'CANCELLED', label: 'Đã hủy' },
  { key: 'RETURNED', label: 'Đã trả vé' },
];

const History: React.FC = () => {
  const { t } = useTranslation();
  const { data: purchaseHistory, isLoading, error } = useGetAllOrdersQuery();

  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(3);

  /** trạng thái đang chọn */
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);

  const [downloadPdf] = useDownloadPdfMutation();

  // Helper function to check if showtime is in the future
  const isUpcoming = (showtimeDate?: string | number[], startTime?: string) => {
    if (!showtimeDate || !startTime) return false;

    let showtimeDateTime: Date;

    // Handle array format [year, month, day]
    if (Array.isArray(showtimeDate)) {
      if (showtimeDate.length < 3) return false;
      const [year, month, day] = showtimeDate;
      const [hours, minutes] = startTime.split(':').map(Number);
      showtimeDateTime = new Date(year, month - 1, day, hours, minutes);
    } else {
      // Handle string format
      const [hours, minutes] = startTime.split(':').map(Number);
      const dateObj = new Date(showtimeDate);
      showtimeDateTime = new Date(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate(),
        hours,
        minutes
      );
    }

    const now = new Date();
    return showtimeDateTime > now;
  };

  // Helper function to check if showtime has passed
  const isWatched = (showtimeDate?: string | number[], endTime?: string) => {
    if (!showtimeDate || !endTime) return false;

    let showtimeDateTime: Date;

    // Handle array format [year, month, day]
    if (Array.isArray(showtimeDate)) {
      if (showtimeDate.length < 3) return false;
      const [year, month, day] = showtimeDate;
      const [hours, minutes] = endTime.split(':').map(Number);
      showtimeDateTime = new Date(year, month - 1, day, hours, minutes);
    } else {
      // Handle string format
      const [hours, minutes] = endTime.split(':').map(Number);
      const dateObj = new Date(showtimeDate);
      showtimeDateTime = new Date(
        dateObj.getFullYear(),
        dateObj.getMonth(),
        dateObj.getDate(),
        hours,
        minutes
      );
    }

    const now = new Date();
    return showtimeDateTime <= now;
  };

  const handleViewPdf = async (orderId: number) => {
    try {
      const pdfUrl = await downloadPdf(orderId).unwrap();
      window.open(pdfUrl, '_blank');
    } catch (err) {
      console.error(err);
      alert('PDF không có sẵn');
    }
  };

  const filteredSearch = useMemo(() => {
    if (!purchaseHistory) return [];
    return purchaseHistory.filter(order => {
      const movieName = order.showtime?.movie?.name?.toLowerCase() || '';
      const cinemaName =
        order.showtime?.auditorium?.cinema?.name?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return movieName.includes(term) || cinemaName.includes(term);
    });
  }, [purchaseHistory, searchTerm]);

  const filteredByStatus = useMemo(() => {
    return filteredSearch.filter(order => {
      if (selectedStatus === 'ALL') return true;

      // Handle UPCOMING filter
      if (selectedStatus === 'UPCOMING') {
        return (
          order.status === 'CONFIRMED' &&
          isUpcoming(order.showtime?.date, order.showtime?.startTime)
        );
      }

      // Handle WATCHED filter
      if (selectedStatus === 'WATCHED') {
        return (
          order.status === 'CONFIRMED' &&
          isWatched(order.showtime?.date, order.showtime?.endTime)
        );
      }

      // Handle other status filters
      return order.status === selectedStatus;
    });
  }, [filteredSearch, selectedStatus]);

  const visibleOrders = filteredByStatus.slice(0, visibleCount);

  if (isLoading) return <p>{t('LOADING')}</p>;
  if (error) return <p>{t('ERROR_LOADING')}</p>;

  return (
    <HistoryContainer>
      <SearchInput
        type='text'
        placeholder={t('SEARCH_PLACEHOLDER_HISTORY')}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />

      <TabContainer>
        {ORDER_STATUS_FILTERS.map(tab => (
          <TabItem
            key={tab.key}
            active={selectedStatus === tab.key}
            onClick={() => setSelectedStatus(tab.key)}
          >
            {tab.label}
          </TabItem>
        ))}
      </TabContainer>

      <HistoryList>
        {visibleOrders.length > 0 ? (
          visibleOrders.map((order: OrderDto) => (
            <HistoryItem key={order.id}>
              {/* movie section */}
              <MovieSection>
                <Poster
                  src={order.showtime?.movie?.poster}
                  alt={order.showtime?.movie?.name}
                />
                <MovieDetails>
                  <MovieTitle>{order.showtime?.movie?.name}</MovieTitle>

                  <CinemaInfo>
                    {order.showtime?.auditorium?.cinema?.name} – {t('ROOM')}{' '}
                    {order.showtime?.auditorium?.name}
                  </CinemaInfo>

                  <SmallText>
                    {t('FORMAT')}:{' '}
                    {formatGraphicLabel(order.showtime?.graphicsType)} |{' '}
                    {order.showtime?.translationType === 'DUBBING'
                      ? t('DUBBING')
                      : t('SUBTITLE')}
                  </SmallText>

                  <DateTime>
                    {order.showtime?.startTime} - {order.showtime?.endTime} |{' '}
                    {formatDate(order.showtime?.date)}
                  </DateTime>
                </MovieDetails>
              </MovieSection>

              <TicketDetails>
                <DetailRow>
                  <Label>{t('SEATS')}:</Label>
                  <SeatsContainer>
                    {order.ticketItems?.map(t => (
                      <SeatBox key={t.seat?.code}>{t.seat?.code}</SeatBox>
                    ))}
                  </SeatsContainer>
                </DetailRow>

                {order.serviceItems?.length > 0 && (
                  <DetailRow>
                    <Label>{t('SERVICES')}:</Label>
                    <ServicesContainer>
                      {order.serviceItems.map(s => (
                        <ServiceBox key={s.additionalService?.id}>
                          {s.additionalService?.name} x{s.quantity}
                        </ServiceBox>
                      ))}
                    </ServicesContainer>
                  </DetailRow>
                )}

                <DetailRow>
                  <Label>{t('DISCOUNT')}:</Label>
                  <Value>{formatCurrency(order.discount || 0)}</Value>
                </DetailRow>

                <DetailRow>
                  <Label>{t('TOTAL')}:</Label>
                  <TotalPrice>{formatCurrency(order.totalPrice)}</TotalPrice>
                </DetailRow>

                <DetailRow>
                  <Label>{t('PURCHASE_DATE')}:</Label>
                  <Value>
                    {order.createdAt
                      ? `${order.createdAt[2]}/${order.createdAt[1]}/${order.createdAt[0]} ${order.createdAt[3]}:${order.createdAt[4]}`
                      : ''}
                  </Value>
                </DetailRow>
              </TicketDetails>

              <RightSection>
                <Status status={order.status}>
                  {order.status === 'CONFIRMED'
                    ? t('COMPLETED')
                    : t('CANCELLED')}
                </Status>

                {order.qrCodePath && (
                  <ButtonStyled onClick={() => handleViewPdf(order.id)}>
                    <FileText size={16} /> {t('VIEW_ORDER')}
                  </ButtonStyled>
                )}
              </RightSection>
            </HistoryItem>
          ))
        ) : (
          <HistoryItemEmpty>
            <EmptyIcon />
            <EmptyText>{t('NO_ORDERS')}</EmptyText>
          </HistoryItemEmpty>
        )}
      </HistoryList>

      {visibleCount < filteredByStatus.length && (
        <LoadMoreButton onClick={() => setVisibleCount(prev => prev + 3)}>
          {t('VIEW_MORE')}
        </LoadMoreButton>
      )}
    </HistoryContainer>
  );
};

const HistoryContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e0e0e0;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const TabItem = styled.div<{ active: boolean }>`
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: 0.2s;

  ${({ active }) =>
    active
      ? `
    background: ${theme.colors.primary};
    color: white;
  `
      : `
    background: #eeeeee;
    color: #444;
  `}

  &:hover {
    opacity: 0.9;
  }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const HistoryItem = styled.div`
  border-radius: 10px;
  padding: 16px;
  background: #f0f0f0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }
`;

const HistoryItemEmpty = styled(HistoryItem)`
  background: #fafafa;
  border: 1px dashed #ccc;
  justify-content: center;
  align-items: center;
  min-height: 380px;
  flex-direction: column;
`;

const EmptyText = styled.span`
  color: #999;
  font-size: 16px;
  font-weight: 500;
`;

const MovieSection = styled.div`
  display: flex;
  gap: 16px;
  flex: 1;
`;

const Poster = styled.img`
  width: 80px;
  height: 110px;
  object-fit: cover;
  border-radius: 6px;
  background: #f0f0f0;
`;

const MovieDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const MovieTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0 0 6px 0;
`;

const CinemaInfo = styled.p`
  font-size: 14px;
  color: #555555;
  margin: 2px 0;
`;

const DateTime = styled.p`
  background: #d0e8ff;
  color: #0d47b6;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid #90caf9;
  margin: 4px 0;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
`;

const SmallText = styled.p`
  font-size: 13px;
  color: #e65100;
  font-weight: 600;
  background: #fff3e0;
  border: 1px solid #ffcc80;
  border-radius: 6px;
  padding: 2px 6px;
  border-radius: 6px;
  margin: 0;
`;

const TicketDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.span`
  font-size: 14px;
  color: #777777;
  font-weight: 500;
  min-width: 90px;
`;

const Value = styled.span`
  font-size: 14px;
  color: #1c1c1c;
`;

const TotalPrice = styled.span`
  font-size: 15px;
  color: #4a90e2; /* xanh nổi bật */
  font-weight: 700;
`;

const RightSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
`;

const Status = styled.div<{ status: string }>`
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 13px;
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
  margin-bottom: 16px;
  border-radius: 8px;
  border: 1px solid #cccccc;
  font-size: 14px;
  background: #f9f9f9; /* nền sáng dễ nhìn */
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
const SeatsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const SeatBox = styled.div`
  background: #e0f7fa;
  color: #006064;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 600;
`;

const ServicesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const ServiceBox = styled.div`
  background: #fff8e1;
  color: #f57f17;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const EmptyIcon = styled(TicketX)`
  width: 64px;
  height: 64px;
  color: #bdbdbd;
`;

export default History;

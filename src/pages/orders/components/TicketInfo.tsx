import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { formatGraphicLabel, formatDate } from '@utils/functionUtils';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import {
  usePreviewCouponMutation,
  useApplyCouponMutation,
  useGetCouponByCodeQuery,
} from '@app/services/coupon.api';

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
  seats: { id: number; row: string; number: number; price: number }[];
  combos: { id: number; name: string; qty: number; price: number }[];
  total: number;
}

interface TicketInfoProps {
  bookingData: BookingData | null;
  appliedCoupons?: {
    detailId: number;
    type: string;
    code: string;
    discount: number;
    gifts?: any[];
  }[];
  hideVoucherInput?: boolean;
  onApplyVoucher?: (appliedData: any) => void;
}

export default function TicketInfo({
  bookingData,
  appliedCoupons = [],
  onApplyVoucher,
  hideVoucherInput = false,
}: TicketInfoProps) {
  if (!bookingData) return null;

  const { t } = useTranslation();
  const [code, setCode] = useState('');

  const discountTotal = appliedCoupons.reduce((sum, c) => sum + c.discount, 0);
  const finalTotal = bookingData.total - discountTotal;

  const [previewCoupon, { data: previewData }] = usePreviewCouponMutation();
  const [applyCoupon, { isLoading: applying }] = useApplyCouponMutation();
  const { data: couponInfo } = useGetCouponByCodeQuery(code, {
    skip: !code,
  });
  const [appliedItems, setAppliedItems] = useState<number[]>([]);

  const handleCheckVoucher = async () => {
    if (!code || !bookingData || !couponInfo) return;

    // Lọc ra các vé hợp lệ
    const tickets =
      bookingData.seats
        ?.filter(
          s => s && typeof s.id === 'number' && typeof s.price === 'number'
        )
        .map(s => ({
          seatTypeId: s.id,
          qty: 1,
          unitPrice: s.price,
        })) || [];

    // Lọc ra các combo hợp lệ
    const services =
      bookingData.combos
        ?.filter(
          c =>
            c &&
            typeof c.id === 'number' &&
            typeof c.price === 'number' &&
            typeof c.qty === 'number'
        )
        .map(c => ({
          serviceId: c.id,
          qty: c.qty,
          unitPrice: c.price,
        })) || [];

    if (tickets.length === 0 && services.length === 0) {
      console.warn('Không có vé hoặc combo hợp lệ để gửi lên API');
      return;
    }

    const payload = { tickets, services };
    console.log('PreviewCoupon payload:', payload);

    try {
      await previewCoupon({
        id: couponInfo.id,
        body: payload,
      });
    } catch (err) {
      console.error('Lỗi khi preview coupon:', err);
    }
  };

  const handleApply = async (detailId: number) => {
    if (!code || !bookingData) return;

    const res = await applyCoupon({
      orderId: 123,
      couponId: detailId || 0,
      couponCode: code,
      cart: {
        tickets: bookingData.seats.map(s => ({
          seatTypeId: s.id,
          qty: 1,
          unitPrice: s.price,
        })),
        services: bookingData.combos.map(c => ({
          serviceId: c.id,
          qty: c.qty,
          unitPrice: c.price,
        })),
      },
    }).unwrap();

    onApplyVoucher?.(res);
  };

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

      <Divider style={{ marginBottom: '4px' }} />

      <span
        style={{
          display: 'block',
          fontSize: '13px',
          marginBottom: '4px',
          textAlign: 'right',
        }}
      >
        Tổng: {bookingData.total.toLocaleString()} đ
      </span>
      {!hideVoucherInput && (
        <VoucherContainer>
          <VoucherInput
            type='text'
            placeholder='Nhập mã voucher...'
            value={code}
            onChange={e => setCode(e.target.value)}
          />
          <ApplyButton onClick={handleCheckVoucher}>Áp dụng</ApplyButton>
        </VoucherContainer>
      )}

      {couponInfo && (
        <CouponInfoBox>
          <h4>{couponInfo.name}</h4>
          <p>Mô tả: {couponInfo.description}</p>
          <small>
            Thời gian áp dụng:{' '}
            {formatDate(new Date(couponInfo.startDate).toLocaleDateString())} -{' '}
            {formatDate(new Date(couponInfo.endDate).toLocaleDateString())}
          </small>
        </CouponInfoBox>
      )}

      {previewData && (
        <PreviewBox>
          {previewData.detailResults.map((dr, index) => {
            const relatedGifts =
              previewData.gifts?.filter(
                (g: any) => g.serviceId === dr.giftServiceId
              ) ?? [];

            return (
              <PreviewItem key={dr.detailId} applied={dr.applied}>
                <div>
                  <strong>#{index + 1}</strong>
                </div>
                <div>
                  {dr.applied ? (
                    <>
                      {dr.lineDiscount > 0 && (
                        <span>Giảm {dr.lineDiscount.toLocaleString()}đ</span>
                      )}

                      {relatedGifts.length > 0 && (
                        <GiftBox>
                          <Thumbnail
                            src={relatedGifts[0].thumbnail}
                            alt={relatedGifts[0].name}
                          />
                          {relatedGifts
                            .map(
                              (g: any) => `${g.serviceName} (x${g.quantity})`
                            )
                            .join(', ')}
                        </GiftBox>
                      )}
                    </>
                  ) : (
                    <span>{dr.reason}</span>
                  )}

                  {dr.applied && (
                    <button
                      onClick={async () => {
                        if (appliedItems.includes(dr.detailId)) {
                          // nếu đã áp dụng -> bỏ chọn
                          setAppliedItems(prev =>
                            prev.filter(id => id !== dr.detailId)
                          );
                          onApplyVoucher?.({
                            removedDetailId: dr.detailId,
                            discount: dr.lineDiscount,
                          });
                        } else {
                          // nếu chưa áp dụng -> áp dụng
                          const res = await handleApply(dr.detailId);
                          setAppliedItems(prev => [...prev, dr.detailId]);
                          onApplyVoucher?.(res);
                        }
                      }}
                      disabled={applying}
                    >
                      {appliedItems.includes(dr.detailId) ? 'Bỏ chọn' : 'Chọn'}
                    </button>
                  )}
                </div>
              </PreviewItem>
            );
          })}
        </PreviewBox>
      )}

      <SectionTitle>Khuyến mãi</SectionTitle>
      {appliedCoupons.length === 0 ? (
        <PromoNotice>Hiện tại chưa áp dụng voucher nào.</PromoNotice>
      ) : (
        appliedCoupons.map((c, idx) => (
          <PromoItem key={idx}>
            <PromoLeft>
              <PromoLabel>
                {c.type === 'voucher' ? 'Voucher' : 'Khuyến mãi'}
              </PromoLabel>
              <PromoCode title={c.code}>
                {c.code?.split('_').pop() ?? ''}
              </PromoCode>
            </PromoLeft>
            {c.gifts && c.gifts.length > 0 ? (
              <GiftBox2>
                <Thumbnail src={c.gifts[0].thumbnail} alt={c.gifts[0].name} />{' '}
                {c.gifts
                  .map((g: any) => `${g.serviceName} (x${g.quantity})`)
                  .join(', ')}
              </GiftBox2>
            ) : (
              <PromoDiscount>-{c.discount.toLocaleString()} đ</PromoDiscount>
            )}
          </PromoItem>
        ))
      )}

      <Divider />

      <Total style={{ marginBottom: '5px' }}>
        <span style={{ color: theme.colors.primary }}>Giảm giá</span>
        <span style={{ color: theme.colors.primary }}>
          -{discountTotal.toLocaleString()} đ
        </span>
      </Total>
      <Total>
        <span>Thanh Toán</span>
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

/* 💅 Voucher input + button */
const VoucherContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const VoucherInput = styled.input`
  flex: 1;
  padding: 5px 8px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  transition: 0.2s;
  &:focus {
    border-color: ${theme.colors.primary};
    box-shadow: 0 0 0 2px ${theme.colors.primary}30;
  }
`;

const ApplyButton = styled.button`
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  &:hover {
    background: ${theme.colors.primaryHoverGradient || '#1976d2'};
    transform: translateY(-1px);
  }
`;

const CouponInfoBox = styled.div`
  background-color: rgba(255, 255, 255, 0.5);
  border-left: 4px solid #ff7f50;
  padding: 12px;
  margin: 12px 0;
  border-radius: 8px;
  color: #000;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  h4 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
  }
  p {
    margin: 0 0 6px 0;
    font-size: 14px;
  }
  small {
    font-size: 12px;
    color: #333;
  }
`;
const PreviewBox = styled.div`
  margin-top: 12px;
  margin-bottom: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  padding: 8px;
  background: #f9f9f9;
  max-height: 200px;
  overflow-y: auto;
`;

const PreviewItem = styled.div<{ applied: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 8px;
  background: ${props =>
    props.applied ? '#e0f7fa' : '#fff9c4'}; /* màu sáng hơn */
  margin-bottom: 8px;
  border: 1px solid ${props => (props.applied ? '#26a69a' : '#ffeb3b')};
  box-shadow: ${props =>
    props.applied
      ? '0 2px 6px rgba(38,166,154,0.2)'
      : '0 1px 3px rgba(255,235,59,0.2)'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    background: ${props => (props.applied ? '#b2dfdb' : '#fff176')};
  }

  div {
    display: flex;
    align-items: center;
    gap: 8px;

    strong {
      font-size: 14px;
      background: ${theme.colors.primary};
      color: white;
      padding: 2px 4px;
      border-radius: 6px;
      min-width: 30px;
      text-align: center;
    }

    span {
      font-size: 14px;
      color: ${props => (props.applied ? '#00796b' : '#666')};
      font-weight: ${props => (props.applied ? 600 : 400)};
    }

    button {
      padding: 5px 10px;
      border: none;
      border-radius: 6px;
      background: ${props => (props.applied ? '#9e9e9e' : '#ffd54f')};
      color: ${props => (props.applied ? 'white' : '#333')};
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: ${props => (props.applied ? '#757575' : '#ffca28')};
        transform: translateY(-1px);
      }

      &:disabled {
        background: #ccc;
        cursor: not-allowed;
        transform: none;
        color: #666;
      }
    }
  }
`;

const PromoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  align-items: flex-start;
  flex-wrap: wrap;
  padding: 10px 12px;
  margin-bottom: 8px;
  border-radius: 10px;
  background: #f4f8ff;
  border: 1px solid #d6e4ff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.25s ease;

  &:hover {
    background: #e8f1ff;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
  }

  span {
    &:first-child {
      font-weight: 600;
      color: #0d47a1;
    }
    &:last-child {
      color: #007e33;
      font-weight: 600;
    }
  }
`;

const PromoLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
`;

const PromoLabel = styled.span`
  background: #d0e8ff;
  color: white;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
`;

const PromoCode = styled.span`
  color: #1e293b;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
`;

const PromoDiscount = styled.span`
  color: #007e33;
  font-weight: 600;
`;

const GiftBox = styled.div`
  width: 135px;
  font-size: 13px;
  color: #e65100;
  font-weight: 600;
  background: #fff3e0;
  border: 1px solid #ffcc80;
  border-radius: 6px;
  padding: 6px 8px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  max-width: 100%;
  text-align: left;
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
  margin-top: 6px;
  margin-left: auto;
`;

const GiftBox2 = styled.div`
  font-size: 13px;
  color: #e65100;
  font-weight: 600;
  background: #fff3e0;
  border: 1px solid #ffcc80;
  border-radius: 6px;
  padding: 6px 8px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  max-width: 100%;
  text-align: left;
  white-space: normal;
  word-break: break-word;
  line-height: 1.4;
  margin-top: 6px;
  margin-left: auto;
`;

const Thumbnail = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  object-fit: cover;
  flex-shrink: 0;
  margin-top: 2px;
`;

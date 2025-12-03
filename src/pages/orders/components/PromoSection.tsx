import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import {
  useGetAllCouponDetailsQuery,
  usePreviewAllCouponDisplayMutation,
  useApplyCouponDisplayMutation,
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

interface PromoSectionProps {
  bookingData: BookingData | null;
  onApplyCoupon: (appliedData: any) => void;
}

export default function PromoSection({
  bookingData,
  onApplyCoupon,
}: PromoSectionProps) {
  // ----- hooks (top-level only) -----
  const {
    data: couponDetails = [],
    isLoading,
    error,
  } = useGetAllCouponDetailsQuery();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [applyCoupon] = useApplyCouponDisplayMutation();
  const [previewAllTrigger, previewResult] =
    usePreviewAllCouponDisplayMutation();
  const previewData = previewResult?.data;

  // ----- trigger preview khi bookingData thay đổi -----
  useEffect(() => {
    if (!bookingData) return;
    previewAllTrigger({
      body: {
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
    }).catch(() => {
      /* ignore preview errors for display */
    });
  }, [bookingData, previewAllTrigger]);

  // ----- prepare quick lookup maps from previewData -----
  const previewMap = useMemo(() => {
    const map = new Map<number, any>();
    if (previewData?.detailResults) {
      previewData.detailResults.forEach((r: any) => {
        map.set(r.detailId, r);
      });
    }
    return map;
  }, [previewData]);

  const giftsByServiceId = useMemo(() => {
    const map = new Map<number, any[]>();
    if (Array.isArray(previewData?.gifts)) {
      previewData!.gifts.forEach((g: any) => {
        const arr = map.get(g.serviceId) ?? [];
        arr.push(g);
        map.set(g.serviceId, arr);
      });
    }
    return map;
  }, [previewData]);

  const displayCoupons = useMemo(() => {
    if (!Array.isArray(couponDetails)) return [];

    return couponDetails
      .map((c: any) => {
        const res = previewMap.get(c.id);
        const lineDiscount = res?.lineDiscount ?? 0;
        const applied = !!(
          res &&
          res.applied &&
          res.reason?.includes('Áp dụng thành công')
        );

        return {
          ...c,
          lineDiscount,
          previewDetail: res,
          applied,
          errorMessage: res?.errorMessage ?? null,
        };
      })
      .filter((c: any) => c.applied && c.errorMessage === null)
      .sort((a: any, b: any) => {
        const aUsedUp = a.detailUsedCount >= a.limitQuantityApplied;
        const bUsedUp = b.detailUsedCount >= b.limitQuantityApplied;

        if (aUsedUp && !bUsedUp) return 1;
        if (!aUsedUp && bUsedUp) return -1;
        return (b.lineDiscount || 0) - (a.lineDiscount || 0);
      });
  }, [couponDetails, previewMap]);

  const handleSelect = async (coupon: any) => {
    if (!bookingData) return;
    setSelectedId(coupon.id);

    const requestData = {
      orderId: 123,
      couponId: coupon.id,
      couponCode: coupon.code || 'null',
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
    };

    // 👉 In ra console để kiểm tra
    console.log('🧾 Dữ liệu request gửi đi:', requestData);

    try {
      const res = await applyCoupon(requestData).unwrap();

      onApplyCoupon(res);
    } catch (err) {
      console.error('Lỗi áp dụng coupon:', err);
    }
  };

  const handleNoPromo = () => {
    setSelectedId(null);
    onApplyCoupon({
      finalAmount: bookingData?.total || 0,
      discount: 0,
      gifts: [],
    });
  };

  // ----- loading / error UI -----
  if (isLoading || previewResult.isLoading)
    return <Section>Đang tải khuyến mãi...</Section>;
  if (error) return <Section>Lỗi tải dữ liệu khuyến mãi.</Section>;

  // ----- render -----
  return (
    <Section>
      <h2>Khuyến mãi dành cho đơn của bạn</h2>

      <CouponList>
        <CouponRow selected={selectedId === null} onClick={handleNoPromo}>
          <LeftPart>
            <RadioInput
              type='radio'
              name='coupon'
              checked={selectedId === null}
              onChange={handleNoPromo}
            />
            <ImageWrapper>
              <img
                src='https://cdn-icons-png.flaticon.com/512/1828/1828843.png'
                alt='no promo'
                loading='lazy'
              />
            </ImageWrapper>
          </LeftPart>

          <Info>
            <h4>Không sử dụng khuyến mãi</h4>
            <p>Thanh toán với giá gốc</p>
            <small>Bạn có thể chọn khuyến mãi bên dưới nếu muốn</small>
          </Info>

          <DiscountBox>0₫</DiscountBox>
        </CouponRow>

        {displayCoupons.map((c: any, index: number) => {
          const isUnlimited = c.limitQuantityApplied === null;
          const isUsedUp =
            !isUnlimited && c.detailUsedCount >= c.limitQuantityApplied;
          const previewResult = c.previewDetail;
          const isGift = c.benefitType === 'FREE_PRODUCT';
          const gifts = c.giftServiceId
            ? (giftsByServiceId.get(c.giftServiceId) ?? [])
            : [];
          const isBestChoice = index === 0 && (c.lineDiscount ?? 0) > 0;

          return (
            <CouponRow
              key={c.id}
              selected={selectedId === c.id}
              $disabled={isUsedUp}
              onClick={() => {
                if (!isUsedUp) handleSelect(c);
                return false;
              }}
            >
              {isBestChoice && <BestChoiceTag>Lựa chọn tốt nhất</BestChoiceTag>}
              {isUsedUp && <UsedUpTag>Đã hết lượt sử dụng</UsedUpTag>}

              <LeftPart>
                <RadioInput
                  type='radio'
                  name='coupon'
                  checked={selectedId === c.id}
                  disabled={isUsedUp}
                  onChange={() => !isUsedUp && handleSelect(c)}
                />
                <ImageWrapper>
                  <img
                    src={
                      c.imageUrl ||
                      'https://cdn-icons-png.flaticon.com/512/888/888879.png'
                    }
                    alt='coupon'
                    loading='lazy'
                  />
                </ImageWrapper>
              </LeftPart>

              <Info>
                <h4>
                  {c.targetType === 'TICKET'
                    ? 'Ưu đãi giá vé'
                    : c.targetType === 'ADDITIONAL_SERVICE'
                      ? 'Ưu đãi dịch vụ đi kèm'
                      : c.targetType === 'PRODUCT'
                        ? 'Ưu đãi sản phẩm'
                        : 'Ưu đãi khác'}
                </h4>

                <p>
                  {c.benefitType === 'FREE_PRODUCT'
                    ? 'Tặng sản phẩm'
                    : c.benefitType === 'DISCOUNT_PERCENT'
                      ? `Giảm ${c.percent}%`
                      : c.benefitType === 'DISCOUNT_AMOUNT'
                        ? `Giảm ${c.amount?.toLocaleString() ?? 0}đ`
                        : 'Ưu đãi đặc biệt'}
                </p>

                {isUnlimited ? (
                  <small>Không giới hạn</small>
                ) : (
                  <>
                    <small>
                      Giới hạn: {c.limitQuantityApplied} | Đã dùng:{' '}
                      {c.detailUsedCount}
                    </small>
                    <ProgressBarContainer>
                      <ProgressFill
                        $percent={
                          (c.detailUsedCount / c.limitQuantityApplied) * 100
                        }
                      />
                    </ProgressBarContainer>
                  </>
                )}
              </Info>

              {isGift ? (
                previewResult?.giftServiceId ? (
                  (() => {
                    const matchedGift = gifts.find(
                      (g: any) => g.serviceId === previewResult.giftServiceId
                    );

                    return matchedGift ? (
                      <GiftBox>
                        <Thumbnail
                          src={matchedGift.thumbnail || '/placeholder.png'}
                          alt={matchedGift.serviceName}
                        />
                        {matchedGift.serviceName} (x{matchedGift.quantity})
                      </GiftBox>
                    ) : null;
                  })()
                ) : null
              ) : previewResult && previewResult.applied ? (
                <DiscountBox>
                  -{(previewResult.lineDiscount ?? 0).toLocaleString()}₫
                </DiscountBox>
              ) : null}
            </CouponRow>
          );
        })}
      </CouponList>
    </Section>
  );
}
const Section = styled.div`
  margin-bottom: 20px;
  background: rgba(30, 58, 138, 0.25);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-top: 6px solid #439aaa;

  h2 {
    font-size: 20px;
    margin-bottom: 16px;
    color: #f1f5f9;
  }
`;

const CouponList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CouponRow = styled.div<{ selected?: boolean; $disabled?: boolean }>`
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  background: ${({ selected }) =>
    selected ? 'rgba(30, 58, 138, 0.65)' : 'rgba(15, 23, 42, 0.6)'};
  border: ${({ selected }) =>
    selected ? '3px solid #1e40af' : '1px solid rgba(255, 255, 255, 0.08)'};
  border-radius: 10px;
  padding: 10px 14px;
  transition: all 0.25s ease;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  color: #f1f5f9;
  cursor: ${({ $disabled }) => ($disabled ? 'default' : 'pointer')};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(4px);

  &:hover {
    background: ${({ selected, $disabled }) =>
      $disabled
        ? 'rgba(30, 58, 138, 0.25)'
        : selected
          ? 'rgba(30, 58, 138, 0.65)'
          : 'rgba(30, 58, 138, 0.35)'};
    border-color: ${({ $disabled }) =>
      $disabled ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.12)'};
    box-shadow: ${({ $disabled }) =>
      $disabled ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.35)'};
    transform: ${({ $disabled }) => ($disabled ? 'none' : 'translateY(-3px)')};
  }
`;

const LeftPart = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
`;

const ImageWrapper = styled.div`
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;

  img {
    width: 50px;
    height: 50px;
    object-fit: contain;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }
`;

const BestChoiceTag = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  background: ${theme.colors.primary};
  border: 2px solid rgba(255, 255, 255, 0.12);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
`;

const UsedUpTag = styled.div`
  position: absolute;
  bottom: 8px;
  right: 10px;
  background: #f44336;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
`;

const RadioInput = styled.input`
  accent-color: ${theme.colors.primary};
  width: 18px;
  height: 18px;
  cursor: pointer;
`;

const Info = styled.div`
  flex: 1;
  margin-left: 10px;

  h4 {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 4px;
    color: #e0e7ff;
  }

  p {
    font-size: 14px;
    color: #c7d2fe;
    margin-bottom: 2px;
  }

  small {
    font-size: 12px;
    color: #a5b4fc;
  }
`;

const DiscountBox = styled.div`
  background: linear-gradient(135deg, #1e40af, #2563eb);
  color: #f1f5f9;
  font-weight: 600;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;
  flex-shrink: 0;
  text-align: center;
  min-width: 90px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(30, 58, 138, 0.4);
  }
`;

const GiftBox = styled.div`
  margin-top: 12px;
  font-size: 13px;
  color: #facc15;
  font-weight: 600;
  background: rgba(250, 204, 21, 0.1);
  border: 1px solid rgba(250, 204, 21, 0.3);
  border-radius: 6px;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  max-width: 220px;
`;

const Thumbnail = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 6px;
`;

const ProgressBarContainer = styled.div`
  width: 40%;
  height: 6px;
  background: rgba(15, 23, 42, 0.3);
  border-radius: 6px;
  overflow: hidden;
  margin-top: 6px;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  height: 100%;
  width: ${({ $percent }) => Math.min($percent, 100)}%;
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  transition: width 0.4s ease;
  border-radius: 6px;
`;

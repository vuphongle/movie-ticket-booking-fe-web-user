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
      .sort((a: any, b: any) => (b.lineDiscount || 0) - (a.lineDiscount || 0));
  }, [couponDetails, previewMap]);

  useEffect(() => {
    if (displayCoupons.length > 0 && selectedId === null) {
      const bestCoupon = displayCoupons[0];
      setSelectedId(bestCoupon.id);
      handleSelect(bestCoupon);
    }
  }, [displayCoupons, selectedId]);

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

  // ----- loading / error UI -----
  if (isLoading || previewResult.isLoading)
    return <Section>Đang tải khuyến mãi...</Section>;
  if (error) return <Section>Lỗi tải dữ liệu khuyến mãi.</Section>;

  // ----- render -----
  return (
    <Section>
      <h2>Khuyến mãi dành cho đơn của bạn</h2>

      <CouponList>
        {displayCoupons.map((c: any, index: number) => {
          const previewResult = c.previewDetail;
          const isGift = c.benefitType === 'FREE_PRODUCT';
          const gifts = c.giftServiceId
            ? (giftsByServiceId.get(c.giftServiceId) ?? [])
            : [];
          const isBestChoice = index === 0 && (c.lineDiscount ?? 0) > 0;

          return (
            <CouponRow key={c.id} selected={selectedId === c.id}>
              {isBestChoice && <BestChoiceTag>Lựa chọn tốt nhất</BestChoiceTag>}

              <LeftPart>
                <RadioInput
                  type='radio'
                  name='coupon'
                  checked={selectedId === c.id}
                  onChange={() => handleSelect(c)}
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

                <small>
                  Giới hạn áp dụng:{' '}
                  {c.limitQuantityApplied
                    ? c.targetType === 'TICKET'
                      ? `${c.limitQuantityApplied} ghế`
                      : c.targetType === 'PRODUCT'
                        ? `${c.limitQuantityApplied} sản phẩm`
                        : c.targetType === 'ADDITIONAL_SERVICE'
                          ? `${c.limitQuantityApplied} dịch vụ`
                          : `${c.limitQuantityApplied} lần`
                    : 'Không giới hạn'}
                </small>
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
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-top: 6px solid ${theme.colors.primary};
`;

const CouponList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CouponRow = styled.div<{ selected?: boolean }>`
  display: flex;
  position: relative;
  justify-content: space-between;
  align-items: center;
  background: ${({ selected }) => (selected ? '#e8f1ff' : '#f8fafb')};
  border: ${({ selected }) =>
    selected ? '1px solid #007bff' : '1px solid #e0e0e0'};
  border-radius: 10px;
  padding: 10px 14px;
  transition: all 0.25s ease;

  &:hover {
    background: #eef5ff;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
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
  background: #eeeeee;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 50px;
    height: 50px;
    object-fit: contain;
  }
`;

const BestChoiceTag = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  background: ${theme.colors.primary};
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
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
  }

  p {
    font-size: 14px;
    color: #333;
    margin-bottom: 2px;
  }

  small {
    font-size: 12px;
    color: #777;
  }
`;

const DiscountBox = styled.div`
  background: #4caf50;
  color: white;
  font-weight: 600;
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 13px;
  flex-shrink: 0;
  text-align: center;
  min-width: 90px;
`;

const GiftBox = styled.div`
  margin-top: 12px;
  font-size: 13px;
  color: #e65100;
  font-weight: 600;
  background: #fff3e0;
  border: 1px solid #ffcc80;
  border-radius: 6px;
  padding: 4px 8px;
  display: inline-flex;
  align-items: center;
  max-width: 220px;
  text-align: left;
`;

const Thumbnail = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 6px;
`;


import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
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

interface PromoSectionProps {
  bookingData: BookingData | null;
  onApplyCoupon: (appliedData: any) => void;
}

export default function PromoSection({
  bookingData,
  onApplyCoupon,
}: PromoSectionProps) {
  const [code, setCode] = useState('');
  const [previewCoupon, { data: previewData, isLoading }] =
    usePreviewCouponMutation();
  const [applyCoupon, { isLoading: applying }] = useApplyCouponMutation();
  const [appliedItems, setAppliedItems] = useState<number[]>([]);

  const { data: couponInfo } = useGetCouponByCodeQuery(code, {
    skip: !code,
  });

  const handleCheck = async () => {
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

    onApplyCoupon(res);
  };

  return (
    <Section>
      <h3>Khuyến mãi</h3>

      <InputRow>
        <input
          type='text'
          placeholder='Nhập mã voucher'
          value={code}
          onChange={e => setCode(e.target.value)}
        />
        <button onClick={handleCheck} disabled={isLoading || !couponInfo}>
          {isLoading ? 'Đang kiểm tra...' : 'Kiểm tra'}
        </button>
      </InputRow>

      {couponInfo && (
        <CouponInfoBox>
          <h4>{couponInfo.name}</h4>
          <p>Mô tả: {couponInfo.description}</p>
          <small>
            Thời gian áp dụng:{' '}
            {new Date(couponInfo.startDate).toLocaleDateString()} -{' '}
            {new Date(couponInfo.endDate).toLocaleDateString()}
          </small>
        </CouponInfoBox>
      )}

      {previewData && (
        <PreviewBox>
          {previewData.detailResults.map((dr, index) => (
            <PreviewItem key={dr.detailId} applied={dr.applied}>
              <div>
                <strong>Khuyến mại {index + 1}</strong>
              </div>
              <div>
                <span>
                  {dr.applied ? `Giảm ${dr.lineDiscount}đ` : dr.reason}
                </span>
                {dr.applied && (
                  <button
                    onClick={async () => {
                      if (appliedItems.includes(dr.detailId)) {
                        // nếu đã áp dụng -> bỏ chọn
                        setAppliedItems(prev =>
                          prev.filter(id => id !== dr.detailId)
                        );
                        onApplyCoupon({
                          removedDetailId: dr.detailId,
                          discount: dr.lineDiscount,
                        });
                      } else {
                        // nếu chưa áp dụng -> áp dụng
                        const res = await handleApply(dr.detailId);
                        setAppliedItems(prev => [...prev, dr.detailId]);
                        onApplyCoupon(res);
                      }
                    }}
                    disabled={applying}
                  >
                    {appliedItems.includes(dr.detailId) ? 'Bỏ chọn' : 'Áp dụng'}
                  </button>
                )}
              </div>
            </PreviewItem>
          ))}
        </PreviewBox>
      )}

      <CheckboxRow>
        <input type='checkbox' id='cinePoints' />
        <label htmlFor='cinePoints'>Sử dụng điểm Go Cine</label>
      </CheckboxRow>
      <Notice>
        💡 Lưu ý: Điểm Go Cine không áp dụng đồng thời với một số voucher khuyến
        mãi.
      </Notice>
    </Section>
  );
}

const Section = styled.div`
  margin-bottom: 20px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  border-top: 8px solid ${theme.colors.darkTitleBar};

  h3 {
    margin-bottom: 12px;
    font-size: 16px;
    font-weight: 600;
  }
`;

const InputRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 6px;

  input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
  }
  button {
    padding: 8px 14px;
    border: none;
    border-radius: 6px;
    background: #444; /* xám đậm hơn */
    color: white;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #333;
    }
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

  small {
    display: inline-block;
    color: #000; /* chữ nổi hơn */
    font-size: 12px;
    background: rgba(255, 255, 255, 0.8);
    padding: 2px 6px;
    border-radius: 4px;
    margin-top: 4px;
  }
`;

const PreviewBox = styled.div`
  margin-top: 12px;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 8px;
`;

interface PreviewItemProps {
  applied?: boolean;
}

const PreviewItem = styled.div<PreviewItemProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s;

  /* màu nền theo trạng thái */
  background-color: ${({ applied }) => (applied ? '#e0f7e9' : '#fff3e0')};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  div:first-child {
    font-weight: 500;
  }

  button {
    margin-left: 8px;
    padding: 4px 10px;
    background: #ff7f50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #ff6333;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 12px 0 6px 0;

  input {
    accent-color: #444; /* đổi màu checkbox */
  }

  label {
    font-size: 14px;
  }
`;

const Notice = styled.p`
  font-size: 12px;
  color: #888;
  margin: 4px 0 12px 0;
  line-height: 1.4;
`;

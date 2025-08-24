import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { theme } from '@theme/Theme';
import { useGetAllCouponsQuery } from '@app/services/coupon.api';
import { useTranslation } from 'react-i18next';
import { formatDate } from "@utils/functionUtils";

export default function CouponComponent() {
  const { t } = useTranslation();
  const { data: coupons = [], isLoading } = useGetAllCouponsQuery();

  if (isLoading) return <div>{t('COUPON_LOADING') ?? 'Loading...'}</div>;
  if (!coupons.length) return <div>{t('COUPON_EMPTY') ?? 'No coupons available'}</div>;

  return (
    <Section>
      <Heading>{t('COUPON_TITLE')}</Heading>
      <Swiper
        modules={[Autoplay]}
        grabCursor={true}
        slidesPerView={3}
        spaceBetween={20}
        loop={true}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        breakpoints={{
          0: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
      >
        {coupons.map(coupon => (
          <SwiperSlide key={coupon.id}>
            <CouponCard poster={`https://picsum.photos/400/200?random=${coupon.id}`}>
              <div className='code'>{coupon.code}</div>
              <div className='discount'>
                {coupon.discount}% {t('COUPON_DISCOUNT')}
              </div>
              <div className='valid'>
                {formatDate(coupon.start_date)} - {formatDate(coupon.end_date)}
              </div>
              <Status active={coupon.status}>
                {coupon.status ? t('COUPON_ACTIVE') : t('COUPON_INACTIVE')}
              </Status>
            </CouponCard>
          </SwiperSlide>
        ))}
      </Swiper>
    </Section>
  );
}

/* Styled component giữ nguyên như trước */
const Section = styled.section`
  margin: 40px 0;
  text-align: center;
`;
const Heading = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: ${theme.colors.headingLight};
`;
const CouponCard = styled.div<{ poster: string }>`
  padding: 20px 25px;
  background: url(${props => props.poster}) center/cover no-repeat;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.2);
  color: ${theme.colors.textLight};
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.6);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  &:hover { transform: translateY(-5px) scale(1.05); box-shadow: 0 8px 20px rgba(0,0,0,0.2); }
  .code { font-size: 24px; font-weight: 700; color: #ffd740; letter-spacing: 1px; }
  .discount { font-size: 18px; color: #69f0ae; }
  .valid { font-size: 14px; color: #e0f7fa; opacity: 0.9; }
`;
const Status = styled.div<{ active: boolean }>`
  font-size: 14px;
  margin-top: 4px;
  font-weight: 600;
  color: ${props => (props.active ? '#69f0ae' : '#ff5252')};
`;
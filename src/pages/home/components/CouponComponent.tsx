import styled from 'styled-components';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCards } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-cards';
import { theme } from '@theme/Theme';
import { useGetAllCouponsQuery } from '@app/services/coupon.api';
import { useTranslation } from 'react-i18next';

export default function CouponComponent() {
  const { t } = useTranslation();
  const { data: coupons = [], isLoading } = useGetAllCouponsQuery();

  if (isLoading) return <div>{t('COUPON_LOADING') ?? 'Loading...'}</div>;
  if (!coupons.length) return <div>{t('COUPON_EMPTY') ?? 'No coupons available'}</div>;

  return (
    <Section>
      <Heading>{t('COUPON_TITLE')}</Heading>
      <Swiper
        modules={[Autoplay, EffectCards]}
        effect="cards"
        grabCursor={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={true}
      >
        {coupons.map(coupon => (
          <SwiperSlide key={coupon.id}>
            <CouponCard>
              <div className="code">{coupon.code}</div>
              <div className="discount">{coupon.discount}% {t('COUPON_DISCOUNT')}</div>
              <div className="valid">
                {new Date(coupon.start_date).toLocaleDateString()} -{' '}
                {new Date(coupon.end_date).toLocaleDateString()}
              </div>
              <div className="status">
                {coupon.status ? t('COUPON_ACTIVE') : t('COUPON_INACTIVE')}
              </div>
            </CouponCard>
          </SwiperSlide>
        ))}
      </Swiper>
    </Section>
  );
}

/* Styled */
const Section = styled.section`
  margin: 40px 0;
  text-align: center;
`;

const Heading = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 20px;
  color: ${theme.colors.textPrimary};
`;

const CouponCard = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #1e3c72, #2a5298); /* gradient 2 tông đậm, sang */
  border-radius: 16px;
  color: #fff;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px) scale(1.05);
    box-shadow: 0 12px 24px rgba(0,0,0,0.25);
  }

  .code {
    font-size: 24px;
    font-weight: 700;
  }

  .discount {
    font-size: 18px;
  }

  .valid {
    font-size: 14px;
    opacity: 0.9;
  }

  .status {
    font-size: 14px;
    margin-top: 4px;
    opacity: 0.85;
  }
`;

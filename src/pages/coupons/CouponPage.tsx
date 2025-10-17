import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
import { useGetAllCouponsQuery } from '@app/services/coupon.api';
import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CouponDetailTerms {
  id: number;
  percent?: number | null;
  amount?: number | null;
  giftServiceId?: number | null;
  giftQuantity?: number | null;
  limitQuantityApplied?: number;
  detailUsedCount?: number;
}

interface CouponDetail {
  id: number;
  enabled: boolean;
  benefitType: string;
  terms: CouponDetailTerms;
}

interface Coupon {
  id: number;
  code: string | null;
  name: string;
  description: string;
  startDate: number;
  endDate: number;
  status: boolean;
  terms?: string;
  imageUrl?: string;
  details?: CouponDetail[];
}

const PAGE_SIZE = 6;

const CouponPage: React.FC = () => {
  const { t } = useTranslation();
  const { data: coupons, isLoading, isError } = useGetAllCouponsQuery();
  const [activeTab, setActiveTab] = useState<'DISPLAY' | 'VOUCHER'>('DISPLAY');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalCoupon, setModalCoupon] = useState<Coupon | null>(null);

  const activeCoupons =
    coupons?.filter(
      c =>
        c.status &&
        ((activeTab === 'DISPLAY' && !c.code) ||
          (activeTab === 'VOUCHER' && c.code))
    ) || [];

  const totalPages = Math.ceil(activeCoupons.length / PAGE_SIZE);
  const paginatedCoupons = activeCoupons.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

return (
  <PageContainer>
    <PageTitle>{t('COUPON_TITLE_LINE')}</PageTitle>

    <TabContainer>
      <TabButton
        active={activeTab === 'DISPLAY'}
        onClick={() => {
          setActiveTab('DISPLAY');
          setCurrentPage(1);
        }}
      >
        {t('COUPON_PROMO')}
      </TabButton>
      <TabButton
        active={activeTab === 'VOUCHER'}
        onClick={() => {
          setActiveTab('VOUCHER');
          setCurrentPage(1);
        }}
      >
        {t('COUPON_VOUCHER')}
      </TabButton>
    </TabContainer>

    {isLoading && <Message>{t('COUPON_LOADING')}</Message>}
    {isError && <Message>{t('COUPON_EMPTY')}</Message>}

    {!isLoading && !isError && (
      <>
        <CouponGrid>
          {paginatedCoupons.map(c => (
            <CouponCard
              key={c.id}
              kind={activeTab}
              onClick={() => setModalCoupon(c)}
            >
              <CouponTitle>{c.name}</CouponTitle>
              {c.description && <CouponDesc>{c.description}</CouponDesc>}
              <CouponDates>
                {t('COUPON_VALID')}: {new Date(c.startDate).toLocaleDateString()} -{' '}
                {new Date(c.endDate).toLocaleDateString()}
              </CouponDates>
              {c.code && <CouponCode>{t('COUPON_DISCOUNT')}: {c.code}</CouponCode>}
              <InfoIcon>
                <Info size={18} />
              </InfoIcon>
              {c.details?.length > 0 && (
                <BenefitList>
                  {c.details.map(d =>
                    d.enabled ? (
                      <BenefitLabel key={d.id} type={d.benefitType}>
                        {d.benefitType === 'DISCOUNT_PERCENT'
                          ? t('COUPON_DISCOUNT') + ' %'
                          : d.benefitType === 'DISCOUNT_AMOUNT'
                          ? t('COUPON_DISCOUNT') + ' tiền'
                          : d.benefitType === 'FREE_PRODUCT'
                          ? 'Quà tặng'
                          : d.benefitType}
                      </BenefitLabel>
                    ) : null
                  )}
                </BenefitList>
              )}
            </CouponCard>
          ))}
        </CouponGrid>

        {totalPages > 1 && (
          <Pagination>
            <PageBtn
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              {t('PREV')}
            </PageBtn>
            <PageInfo>
              {currentPage} / {totalPages}
            </PageInfo>
            <PageBtn
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              {t('NEXT')}
            </PageBtn>
          </Pagination>
        )}

        {modalCoupon && (
          <ModalOverlay onClick={() => setModalCoupon(null)}>
            <ModalContent onClick={e => e.stopPropagation()}>
              <ModalTitle>{modalCoupon.name}</ModalTitle>
              <ModalDesc>
                {modalCoupon.description || t('COUPON_EMPTY')}
              </ModalDesc>
              {modalCoupon.details && modalCoupon.details.length > 0 ? (
                modalCoupon.details.map(d =>
                  d.enabled ? (
                    <ModalTerms key={d.id}>
                      <BenefitLabel type={d.benefitType}>
                        {d.benefitType === 'DISCOUNT_PERCENT'
                          ? t('COUPON_DISCOUNT') + ' %'
                          : d.benefitType === 'DISCOUNT_AMOUNT'
                          ? t('COUPON_DISCOUNT') + ' tiền'
                          : d.benefitType === 'FREE_PRODUCT'
                          ? 'Quà tặng'
                          : d.benefitType}
                      </BenefitLabel>
                      {d.terms?.percent && <div>{t('COUPON_DISCOUNT')}: {d.terms.percent}%</div>}
                      {d.terms?.amount && <div>{t('COUPON_DISCOUNT')}: {d.terms.amount.toLocaleString()}₫</div>}
                      {d.terms?.giftServiceId && (
                        <div>
                          Quà tặng: {d.terms.giftQuantity} sản phẩm (ID {d.terms.giftServiceId})
                        </div>
                      )}
                      <div>Số lần áp dụng tối đa: {d.terms?.limitQuantityApplied}</div>
                      <div>Số lượt sử dụng: {d.terms?.detailUsedCount}</div>
                    </ModalTerms>
                  ) : null
                )
              ) : (
                <ModalTerms>{t('COUPON_EMPTY')}</ModalTerms>
              )}
              <CloseBtn onClick={() => setModalCoupon(null)}>{t('CLOSE')}</CloseBtn>
            </ModalContent>
          </ModalOverlay>
        )}
      </>
    )}
  </PageContainer>
);

};

export default CouponPage;

// Styled Components
const PageContainer = styled.div`
  padding: 30px;
  background-color: transparent;
  min-height: 100vh;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  margin-bottom: 16px;
  color: #fff;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
`;

const TabButton = styled.button<{ active?: boolean }>`
  padding: 8px 20px;
  border-radius: 20px;
  border: none;
  background-color: ${props => (props.active ? theme.colors.primary : '#555')};
  color: ${props => (props.active ? '#fff' : '#ccc')};
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s;

  &:hover {
    opacity: 0.85;
  }
`;

const CouponGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const CouponCard = styled.div<{ kind: 'DISPLAY' | 'VOUCHER'; imageUrl?: string }>`
  position: relative;
  background: ${props =>
    props.imageUrl
      ? `url(${props.imageUrl}) center/cover no-repeat`
      : props.kind === 'VOUCHER'
      ? 'linear-gradient(135deg, #6a11cb, #2575fc)'
      : 'linear-gradient(135deg, #4e54c8, #8f94fb)'};
  border-radius: 16px;
  padding: 16px;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;

  &:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.25);
  }
`;

const CouponTitle = styled.h3`
  font-size: 20px;
  margin-bottom: 8px;
  font-weight: bold;
`;

const CouponDesc = styled.p`
  font-size: 14px;
  margin-bottom: 8px;
`;

const CouponDates = styled.p`
  font-size: 12px;
  margin-top: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 8px;
`;

const CouponCode = styled.div`
  margin-top: 12px;
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6px 10px;
  border-radius: 10px;
  text-align: center;
`;

const InfoIcon = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  color: #fff;
`;

const BenefitList = styled.div`
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`;

const BenefitLabel = styled.div<{ type: string }>`
  display: block;
  padding: 4px 8px;
  border-radius: 4px;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #fff;
  background-color: ${props =>
    props.type === 'DISCOUNT_PERCENT'
      ? '#ff6b6b'
      : props.type === 'DISCOUNT_AMOUNT'
      ? '#1dd1a1'
      : props.type === 'FREE_PRODUCT'
      ? '#54a0ff'
      : '#ccc'};
`;


const Message = styled.div`
  text-align: center;
  color: #ccc;
  font-size: 16px;
  margin-top: 20px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
`;

const PageBtn = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-weight: bold;
  color: #fff;
`;
const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 24px;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  max-height: 60%;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  z-index: 10000;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  margin-bottom: 12px;
`;

const ModalDesc = styled.p`
  font-size: 14px;
  margin-bottom: 12px;
`;

const ModalTerms = styled.div`
  font-size: 13px;
  color: #333;
  background-color: #f1f1f1;
  padding: 10px;
  border-radius: 8px;
  margin-bottom: 12px;
`;

const CloseBtn = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background-color: ${theme.colors.primary};
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  position: sticky;
  top: 16px;
  right: 16px;
`;

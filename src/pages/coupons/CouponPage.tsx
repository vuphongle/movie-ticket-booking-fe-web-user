import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGetAllCouponsQuery } from '@app/services/coupon.api';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [modalCoupon, setModalCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const activeCoupons =
    coupons?.filter(c => c.status && !c.code) || [];

  const totalPages = Math.ceil(activeCoupons.length / PAGE_SIZE);
  const paginatedCoupons = activeCoupons.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <PageContainer>
      <PageTitle>{t('COUPON_TITLE_LINE')}</PageTitle>

      {isLoading && <Message>{t('COUPON_LOADING')}</Message>}
      {isError && <Message>{t('COUPON_EMPTY')}</Message>}

      {!isLoading && !isError && (
        <>
          <CouponGrid>
            {paginatedCoupons.map(c => (
              <CouponCard
                key={c.id}
                onClick={() => setModalCoupon(c)}
              >
                <CouponTitle>{c.name}</CouponTitle>
                {c.description && <CouponDesc>{c.description}</CouponDesc>}

                <CouponDates>
                  {t('COUPON_VALID')}: {new Date(c.startDate).toLocaleDateString()} -{' '}
                  {new Date(c.endDate).toLocaleDateString()}
                </CouponDates>

                {c.details?.length > 0 && (
                  <BenefitList>
                    {Array.from(
                      new Map(
                        c.details
                          .filter(d => d.enabled)
                          .map(d => [d.benefitType, d])
                      ).values()
                    ).map(d => (
                      <BenefitLabel key={d.id} type={d.benefitType}>
                        {d.benefitType === 'DISCOUNT_PERCENT'
                          ? t('COUPON_DISCOUNT') + ' %'
                          : d.benefitType === 'DISCOUNT_AMOUNT'
                            ? t('COUPON_DISCOUNT') + ' tiền'
                            : d.benefitType === 'FREE_PRODUCT'
                              ? 'Quà tặng'
                              : d.benefitType}
                      </BenefitLabel>
                    ))}
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
                <ModalHeader>
                  <ModalTitle>{modalCoupon.name}</ModalTitle>
                  <CloseBtn onClick={() => setModalCoupon(null)}>×</CloseBtn>
                </ModalHeader>

                {modalCoupon.description && (
                  <ModalDesc>{modalCoupon.description}</ModalDesc>
                )}

                {modalCoupon.details && modalCoupon.details.length > 0 ? (
                  modalCoupon.details
                    .filter(d => d.enabled)
                    .map(d => (
                      <ModalTerms key={d.id}>
                        <BenefitLabel type={d.benefitType}>
                          Loại lợi ích:{' '}
                          {d.benefitType === 'DISCOUNT_PERCENT'
                            ? t('COUPON_DISCOUNT') + ' %'
                            : d.benefitType === 'DISCOUNT_AMOUNT'
                              ? t('COUPON_DISCOUNT') + ' tiền'
                              : d.benefitType === 'FREE_PRODUCT'
                                ? 'Quà tặng'
                                : d.benefitType}
                        </BenefitLabel>

                        {d.terms?.percent && (
                          <TermRow>
                            <span>{t('COUPON_DISCOUNT')}: </span>
                            <strong>{d.terms.percent}%</strong>
                          </TermRow>
                        )}

                        {d.terms?.amount && (
                          <TermRow>
                            <span>{t('COUPON_DISCOUNT')}: </span>
                            <strong>{d.terms.amount.toLocaleString()}₫</strong>
                          </TermRow>
                        )}

                        {d.terms?.giftServiceId && (
                          <TermRow>
                            <span>Quà tặng: </span>
                            <strong>
                              {d.terms.giftQuantity} sản phẩm (ID{' '}
                              {d.terms.giftServiceId})
                            </strong>
                          </TermRow>
                        )}
                      </ModalTerms>
                    ))
                ) : (
                  <ModalTerms>{t('COUPON_EMPTY')}</ModalTerms>
                )}
              </ModalContent>
            </ModalOverlay>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default CouponPage;

// =================== Styled ===================
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

const CouponGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const CouponCard = styled.div`
  background: linear-gradient(135deg, #6a11cb, #2575fc);
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
  color: #fff;
`;

const BenefitList = styled.div`
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
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
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
`;

const ModalContent = styled.div`
  background-color: #fff;
  padding: 24px 20px;
  border-radius: 16px;
  width: 90%;
  max-width: 450px;
  max-height: 70%;
  overflow-y: auto;
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.35);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
`;

const ModalDesc = styled.p`
  font-size: 14px;
  margin-bottom: 16px;
  color: #333;
`;

const ModalTerms = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  border-radius: 12px;
  background-color: #f8f8f8;
`;

const TermRow = styled.div`
  display: flex;
  justify-content: flex-start;
  font-size: 13px;
  margin: 4px 0;
  span {
    color: #555;
  }
  strong {
    color: #222;
    margin-left: 4px;
  }
`;

const CloseBtn = styled.button`
  font-size: 20px;
  font-weight: bold;
  color: #888;
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    color: #333;
  }
`;

const BenefitLabel = styled.div<{ type: string }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
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
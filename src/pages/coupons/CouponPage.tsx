import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@theme/Theme';
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
  const [activeTab, setActiveTab] = useState<'DISPLAY' | 'VOUCHER'>('DISPLAY');
  const [currentPage, setCurrentPage] = useState(1);
  const [modalCoupon, setModalCoupon] = useState<Coupon | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

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
                onClick={() => activeTab === 'DISPLAY' && setModalCoupon(c)}
              >
                <CouponTitle>{c.name}</CouponTitle>
                {c.description && <CouponDesc>{c.description}</CouponDesc>}
                {activeTab === 'VOUCHER' && (
                  <CouponDesc>{t('COUPON_VALID')}:</CouponDesc>
                )}
                <CouponDates kind={activeTab}>
                  {t('COUPON_VALID')}:{' '}
                  {new Date(c.startDate).toLocaleDateString()} -{' '}
                  {new Date(c.endDate).toLocaleDateString()}
                </CouponDates>

                {activeTab === 'DISPLAY' && c.code && (
                  <CouponCode>
                    {t('COUPON_DISCOUNT')}: {c.code}
                  </CouponCode>
                )}

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
                          {' '}
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
                            <strong style={{ marginLeft: '4px' }}>
                              {d.terms.percent}%
                            </strong>
                          </TermRow>
                        )}

                        {d.terms?.amount && (
                          <TermRow>
                            <span>{t('COUPON_DISCOUNT')}: </span>
                            <strong style={{ marginLeft: '4px' }}>
                              {d.terms.amount.toLocaleString()}₫
                            </strong>
                          </TermRow>
                        )}

                        {d.terms?.giftServiceId && (
                          <TermRow>
                            <span>Quà tặng: </span>
                            <strong style={{ marginLeft: '4px' }}>
                              {d.terms.giftQuantity} sản phẩm (ID{' '}
                              {d.terms.giftServiceId})
                            </strong>
                          </TermRow>
                        )}

                        {d.terms?.limitQuantityApplied &&
                          d.terms?.detailUsedCount !== undefined && (
                            <ProgressContainer>
                              <ProgressLabel>
                                Số lượt sử dụng: {d.terms.detailUsedCount} /{' '}
                                {d.terms.limitQuantityApplied}
                              </ProgressLabel>
                              <ProgressBar>
                                <ProgressFill
                                  style={{
                                    width: `${Math.min(
                                      (d.terms.detailUsedCount /
                                        d.terms.limitQuantityApplied) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </ProgressBar>
                            </ProgressContainer>
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

const CouponCard = styled.div<{
  kind: 'DISPLAY' | 'VOUCHER';
  imageUrl?: string;
}>`
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
const CouponCode = styled.div`
  margin-top: 12px;
  font-weight: bold;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 6px 10px;
  border-radius: 10px;
  text-align: center;
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
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 12px;
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
  }
`;

const ProgressContainer = styled.div`
  margin-top: 8px;
`;

const ProgressLabel = styled.div`
  font-size: 12px;
  margin-bottom: 4px;
  color: #444;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 10px;
  background: #ddd;
  border-radius: 6px;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #6a11cb, #2575fc);
  border-radius: 6px 0 0 6px;
  transition: width 0.3s ease;
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
  margin-bottom: 6px;
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

const CouponDates = styled.p<{ kind: 'DISPLAY' | 'VOUCHER' }>`
  font-size: 12px;
  margin-top: 4px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 8px;

  color: ${props => (props.kind === 'VOUCHER' ? 'transparent' : '#fff')};
  text-shadow: ${props =>
    props.kind === 'VOUCHER' ? '0 0 8px rgba(0,0,0,0.3)' : 'none'};
  user-select: ${props => (props.kind === 'VOUCHER' ? 'none' : 'auto')};
`;

import React from 'react';
import styled from 'styled-components';
import { theme } from '@/theme/Theme';
import { useTranslation } from 'react-i18next';
import { FiStar, FiGift, FiTrendingUp } from 'react-icons/fi';

const Member: React.FC = () => {
  const { t } = useTranslation();

  // Mock member data
  const memberData = {
    level: 'Silver',
    points: 2450,
    nextLevelPoints: 5000,
    benefits: [
      'Giảm giá 5% cho tất cả vé phim',
      'Ưu tiên đặt chỗ sớm',
      'Tích điểm mỗi lần mua vé',
      'Quà tặng sinh nhật',
    ],
  };

  const pointsProgress = (memberData.points / memberData.nextLevelPoints) * 100;

  return (
    <MemberContainer>
      <MemberTitle>{t('CINESTAR_MEMBER')}</MemberTitle>

      <MemberCard>
        <MemberHeader>
          <MemberBadge>
            <FiStar size={24} />
            <BadgeText>
              <MemberLevel>{memberData.level} Member</MemberLevel>
              <MemberSubtext>Thành viên Cinestar</MemberSubtext>
            </BadgeText>
          </MemberBadge>
        </MemberHeader>

        <PointsSection>
          <PointsHeader>
            <PointsTitle>Điểm tích lũy</PointsTitle>
            <PointsValue>{memberData.points.toLocaleString()} điểm</PointsValue>
          </PointsHeader>

          <ProgressContainer>
            <ProgressBar>
              <ProgressFill width={pointsProgress} />
            </ProgressBar>
            <ProgressText>
              Còn{' '}
              {(
                memberData.nextLevelPoints - memberData.points
              ).toLocaleString()}{' '}
              điểm để thăng hạng Gold
            </ProgressText>
          </ProgressContainer>
        </PointsSection>

        <BenefitsSection>
          <BenefitsTitle>
            <FiGift size={20} />
            Quyền lợi thành viên
          </BenefitsTitle>
          <BenefitsList>
            {memberData.benefits.map((benefit, index) => (
              <BenefitItem key={index}>
                <BenefitDot />
                <BenefitText>{benefit}</BenefitText>
              </BenefitItem>
            ))}
          </BenefitsList>
        </BenefitsSection>

        <ActionButtons>
          <ActionButton primary>
            <FiTrendingUp size={16} />
            Xem cách tích điểm
          </ActionButton>
          <ActionButton>
            <FiGift size={16} />
            Đổi quà
          </ActionButton>
        </ActionButtons>
      </MemberCard>
    </MemberContainer>
  );
};

const MemberContainer = styled.div`
  background: ${theme.colors.white};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  box-shadow: 0 4px 20px rgba(23, 13, 13, 0.08);
  border: 1px solid ${theme.colors.border};
  position: relative;
  z-index: 1;
`;

const MemberTitle = styled.h2`
  font-size: ${theme.fontSize.xl};
  font-weight: 600;
  margin: 0 0 ${theme.spacing.lg} 0;
  color: ${theme.colors.textPrimary};
`;

const MemberCard = styled.div`
  background: linear-gradient(135deg, #6d5edc, #2193b0);
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  color: white;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const MemberHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const MemberBadge = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const BadgeText = styled.div`
  display: flex;
  flex-direction: column;
`;

const MemberLevel = styled.h3`
  font-size: ${theme.fontSize.lg};
  font-weight: 600;
  margin: 0;
`;

const MemberSubtext = styled.p`
  font-size: ${theme.fontSize.sm};
  margin: 0;
  opacity: 0.8;
`;

const PointsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const PointsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PointsTitle = styled.h4`
  font-size: ${theme.fontSize.md};
  margin: 0;
  opacity: 0.9;
`;

const PointsValue = styled.span`
  font-size: ${theme.fontSize.lg};
  font-weight: 600;
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: ${theme.borderRadius.small};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: number }>`
  width: ${({ width }) => width}%;
  height: 100%;
  background: linear-gradient(90deg, #ffd700, #ffed4e);
  transition: width 0.3s ease;
`;

const ProgressText = styled.p`
  font-size: ${theme.fontSize.sm};
  margin: 0;
  opacity: 0.8;
`;

const BenefitsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const BenefitsTitle = styled.h4`
  font-size: ${theme.fontSize.md};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const BenefitDot = styled.div`
  width: 6px;
  height: 6px;
  background: #ffd700;
  border-radius: 50%;
  flex-shrink: 0;
`;

const BenefitText = styled.span`
  font-size: ${theme.fontSize.sm};
  opacity: 0.9;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const ActionButton = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: ${({ primary }) =>
    primary ? 'none' : '1px solid rgba(255, 255, 255, 0.3)'};
  background: ${({ primary }) =>
    primary ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: white;
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.fontSize.sm};
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }
`;

export default Member;

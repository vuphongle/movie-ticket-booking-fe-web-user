import React from 'react';
import styled, { css } from 'styled-components';

interface CinemaCardProps {
  cinema: any;
  onSelect?: () => void;
  isSelected: boolean;
}

const CinemaCard: React.FC<CinemaCardProps> = ({ cinema, onSelect, isSelected }) => {
  return (
    <CardContainer onClick={onSelect} $active={isSelected}>
      <CardTitle>
        {cinema.name}
        <TitleLine />
      </CardTitle>
      <CardText>{cinema.address}</CardText>
      <CardText>{cinema.city}</CardText>
    </CardContainer>
  );
};

export default CinemaCard;

/* ===== styled ===== */
const CardContainer = styled.div<{ $active: boolean }>`
  cursor: pointer;
  height: 150px;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: linear-gradient(135deg, #1f2937 0%, #4b5563 100%);
  border: 2px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  color: #f9fafb;
  transition: all 0.3s ease;
  background-image: linear-gradient(
    45deg,
    rgba(255,255,255,0.02) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255,255,255,0.02) 50%,
    rgba(255,255,255,0.02) 75%,
    transparent 75%,
    transparent
  );
  background-size: 20px 20px;

  &:hover {
    transform: translateY(-5px) scale(1.03);
    box-shadow: 0 12px 24px rgba(0,0,0,0.3), 0 0 12px rgba(255,255,255,0.1) inset;
    filter: brightness(1.1);
  }

  ${({ $active }) =>
    $active &&
    css`
      border: 2px solid #3b82f6;
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.6);
      transform: scale(1.03);
    `}
`;

const CardTitle = styled.h3`
  position: relative;
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 6px;
  background: rgba(59, 130, 246, 0.8);
  color: #f9fafb;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.6);
  overflow: hidden;
`;

const TitleLine = styled.span`
  display: block;
  height: 2px;
  width: 50%;
  background: rgba(255,255,255,0.6);
  margin: 4px auto 0 auto;
  border-radius: 2px;
`;

const CardText = styled.p`
  margin: 2px 0;
  font-size: 14px;
  font-weight: 500;
  color: #d1d5db;
`;

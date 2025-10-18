// src/components/module/GiftBoxIcon.jsx
import React from 'react';

const GiftBoxIcon = ({
  size = 24,
  color = '#8B5CF6',
  ribbonColor = '#EC4899',
  className = '',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 선물상자 본체 */}
      <rect
        x="4"
        y="10"
        width="16"
        height="10"
        rx="1"
        fill={color}
        stroke={color}
        strokeWidth="1"
      />

      {/* 상자 뚜껑 */}
      <rect
        x="3"
        y="8"
        width="18"
        height="3"
        rx="1"
        fill={color}
        stroke={color}
        strokeWidth="1"
      />

      {/* 세로 리본 */}
      <rect x="11" y="8" width="2" height="12" fill={ribbonColor} />

      {/* 가로 리본 */}
      <rect x="3" y="11" width="18" height="2" fill={ribbonColor} />

      {/* 리본 매듭 - 왼쪽 */}
      <ellipse
        cx="9"
        cy="6"
        rx="2.5"
        ry="1.5"
        fill={ribbonColor}
        transform="rotate(-15 9 6)"
      />

      {/* 리본 매듭 - 오른쪽 */}
      <ellipse
        cx="15"
        cy="6"
        rx="2.5"
        ry="1.5"
        fill={ribbonColor}
        transform="rotate(15 15 6)"
      />

      {/* 리본 매듭 중앙 */}
      <circle cx="12" cy="6.5" r="1" fill={ribbonColor} />

      {/* 반짝이 효과 */}
      <circle cx="7" cy="14" r="0.5" fill="white" opacity="0.8" />
      <circle cx="16" cy="16" r="0.3" fill="white" opacity="0.6" />
    </svg>
  );
};
export default GiftBoxIcon;

{/* 색상 조합 10가지 */}
{/* <GiftBoxIcon color="#8B5CF6" ribbonColor="#EC4899" /> */}  {/* 보라 & 핑크 (기본) */}
{/* <GiftBoxIcon color="#EF4444" ribbonColor="#FBBF24" /> */}  {/* 빨강 & 골드 */}
{/* <GiftBoxIcon color="#10B981" ribbonColor="#F59E0B" /> */}  {/* 그린 & 오렌지 */}
{/* <GiftBoxIcon color="#3B82F6" ribbonColor="#EF4444" /> */}  {/* 블루 & 레드 */}
{/* <GiftBoxIcon color="#F97316" ribbonColor="#A855F7" /> */}  {/* 오렌지 & 퍼플 */}
{/* <GiftBoxIcon color="#14B8A6" ribbonColor="#F472B6" /> */}  {/* 틸 & 핑크 */}
{/* <GiftBoxIcon color="#6366F1" ribbonColor="#FCD34D" /> */}  {/* 인디고 & 옐로우 */}
{/* <GiftBoxIcon color="#EC4899" ribbonColor="#10B981" /> */}  {/* 핑크 & 민트 */}
{/* <GiftBoxIcon color="#8B5CF6" ribbonColor="#84CC16" /> */}  {/* 퍼플 & 라임 */}
{/* <GiftBoxIcon color="#F43F5E" ribbonColor="#38BDF8" /> */}  {/* 로즈 & 스카이블루 */}
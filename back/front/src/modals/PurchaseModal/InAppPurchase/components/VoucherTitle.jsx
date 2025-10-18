import React from 'react';
import { useTranslation } from 'react-i18next';
import GiftBoxIcon from './GiftBoxIcon';

export const VoucherTitle = ({ product, browserLanguage, styles }) => {
  const { t } = useTranslation();

  // 카드 개수에 따른 스타일과 아이콘 매핑을 객체로 관리합니다
  const cardInfoMap = {
    [import.meta.env.VITE_COSMOS_VOUCHERS_1]: { style: 'one-card', icon: 'I' },
    [import.meta.env.VITE_COSMOS_VOUCHERS_2]: {
      style: 'two-cards',
      icon: 'II',
    },
    [import.meta.env.VITE_COSMOS_VOUCHER_3]: {
      style: 'three-cards',
      icon: 'III',
    },
    [import.meta.env.VITE_COSMOS_VOUCHERS_4]: {
      style: 'four-cards',
      icon: 'IV',
    },
    [import.meta.env.VITE_COSMOS_VOUCHERS_5]: {
      style: 'five-cards',
      icon: 'V',
    },
    [import.meta.env.VITE_COSMOS_VOUCHERS_6]: {
      style: 'six-cards',
      icon: 'VI',
    },
    [import.meta.env.VITE_COSMOS_VOUCHERS_7]: {
      style: 'seven-cards',
      icon: 'VII',
    },
    [import.meta.env.VITE_COSMOS_VOUCHERS_8]: {
      style: 'eight-cards',
      icon: 'VIII',
    },
    [import.meta.env.VITE_COSMOS_VOUCHERS_9]: {
      style: 'nine-cards',
      icon: 'IX',
    },
    [import.meta.env.VITE_COSMOS_VOUCHER_10]: { style: 'ten-cards', icon: 'X' },
    [import.meta.env.VITE_COSMOS_VOUCHERS_11]: {
      style: 'eleven-cards',
      icon: 'XI',
    },
    [import.meta.env.VITE_COSMOS_VOUCHERS_13]: {
      style: 'thirteen-cards',
      icon: 'XIII',
    },
  };

  // 언어에 따른 폰트 스타일을 결정하는 함수입니다
  const getFontStyle = language => {
    switch (language) {
      case 'ja':
        return 'japanese-font-title';
      case 'ko':
      case 'en':
      default:
        return '';
    }
  };

  // 클래스네임을 구성하는 함수입니다
  const getClassNames = () => {
    const baseClass = styles['voucher-title'];
    const cardInfo = product?.id ? cardInfoMap[product.id] : null;
    const cardClass = cardInfo ? styles[cardInfo.style] : '';
    const fontClass = getFontStyle(browserLanguage);

    return [baseClass, cardClass, fontClass]?.filter(Boolean).join(' ');
  };

  // 타이틀 텍스트를 가져오는 함수
  const getTitleText = () => {
    const cardInfo = product?.id ? cardInfoMap[product.id] : null;
    if (cardInfo) {
      // _title translation key 생성
      const titleKey = `product.${product.id}_title`;
      const titleText = t(titleKey);
      // _title이 있으면 사용, 없으면 product title 사용
      return titleText !== titleKey
        ? titleText
        : product?.title || 'Unknown Product';
    }
    return product?.title || 'Unknown Product';
  };

  // 아이콘이 있는 경우 (일반 이용권)
  const cardInfo = product?.id ? cardInfoMap[product.id] : null;
  if (cardInfo) {
    return <h2 className={getClassNames()}>{cardInfo.icon}</h2>;
  }

  // 아이콘이 없는 경우 (번들 패키지 등)
  return <h2 className={getClassNames()}>{getTitleText()}</h2>;
};

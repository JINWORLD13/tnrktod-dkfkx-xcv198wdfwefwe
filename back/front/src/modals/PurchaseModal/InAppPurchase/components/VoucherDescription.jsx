import React from 'react';
import fontStyles from '../../../../styles/scss/Font.module.scss';

export const VoucherDescription = ({ product, styles, t, browserLanguage }) => {
  // voucherIds는 모든 바우처 ID를 관리하는 배열입니다.
  // 각 바우처의 ID 패턴을 체계적으로 관리하여 실수를 방지합니다.
  const voucherIds = [
    // 1-13까지의 바우처를 생성하되, 3번과 10번은 특별한 형식을 가집니다
    ...Array.from({ length: 13 }, (_, index) => {
      const number = index + 1;
      // 3번과 10번은 단수형('voucher')을 사용하고,
      // 나머지는 복수형('vouchers')을 사용합니다
      const suffix = number === 3 || number === 10 ? 'voucher' : 'vouchers';
      return `cosmos_${suffix}_${number}`;
    }),
  ];

  // 현재 제품이 유효한 바우처 ID를 가지고 있는지 확인합니다
  const matchingId = voucherIds.find(id => id === product?.id);

  // 매칭되는 ID가 없다면 아무것도 렌더링하지 않습니다
  if (!matchingId) {
    return null;
  }

  // 타이틀과 설명을 가져옵니다
  const titleKey = `product.${matchingId}_title`;
  const descriptionKey = `product.${matchingId}`;

  const title = t(titleKey);
  const description = t(descriptionKey);

  const hasTitleTranslation = title !== titleKey;

  // 매칭되는 ID가 있다면 타이틀과 설명을 렌더링합니다
  return (
    <div className={styles['voucher-description']}>
      {hasTitleTranslation && (
        <>
          <p
            className={`${
              browserLanguage === 'ja'
                ? fontStyles['japanese-font-small-title']
                : fontStyles['korean-font-small-title']
            }`}
          >
            {title}
          </p>
          <br />
        </>
      )}
      <p
        className={`${
          browserLanguage === 'ja'
            ? fontStyles['japanese-font-content']
            : fontStyles['korean-font-content-iap']
        }`}
      >
        {description || 'No description available'}
      </p>
    </div>
  );
};

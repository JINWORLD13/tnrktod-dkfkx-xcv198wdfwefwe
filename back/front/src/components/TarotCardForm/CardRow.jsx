import React from 'react';
import styles from './TarotCardChoiceForm.module.scss';
import { backImagePath } from '../../data/images/images.jsx';

/**
 * 타로 카드 행(row) 컴포넌트
 * @param {Array} cards - 표시할 카드 배열
 * @param {number} startIndex - 시작 인덱스 (전체 덱에서의 위치)
 * @param {Array} selectedIndexes - 선택된 카드 인덱스 목록
 * @param {Function} onCardClick - 카드 클릭 핸들러
 */
const CardRow = ({ cards, startIndex, selectedIndexes, onCardClick }) => {
  return (
    <div className={styles['choice-spread']}>
      {cards?.map((card, i) => {
        const actualIndex = startIndex + i;
        const isSelected = selectedIndexes?.includes(actualIndex);

        return (
          <div
            key={actualIndex}
            className={`${styles['choice-card']} ${
              isSelected ? styles['invisible'] : ''
            }`}
            onClick={e => onCardClick(e, card, actualIndex)}
          >
            <img src={backImagePath} alt="back" draggable={false} />
          </div>
        );
      })}
    </div>
  );
};

export default CardRow;

import React from 'react';
import styles from './FourCardsSpreadForm.module.scss';
import {
  tarotCardImageFilesList,
  tarotCardImageFilesPathList,
} from '../../../data/images/images.jsx';
import {
  useSelectedTarotCards,
  useTotalCardsNumber,
} from '@/hooks';

const FourCardsSpreadForm = props => {
  const selectedTarotCards = useSelectedTarotCards();
  const totalCardsNumber = useTotalCardsNumber();
  const imagePath = index => {
    if (selectedTarotCards?.length !== 0) {
      const foundIndex = tarotCardImageFilesList.findIndex(elem => {
        return elem === selectedTarotCards[index]['file_name'];
      });
      return tarotCardImageFilesPathList[foundIndex];
    }
  };

  const handleFlip = selectedCardIndex => {
    props.updateCardForm({
      ...props.cardForm,
      flippedIndex: [...props.cardForm.flippedIndex, selectedCardIndex],
    });
  };

  const isCardClicked = selectedCardIndex =>
    props.cardForm.flippedIndex.includes(selectedCardIndex) &&
    selectedTarotCards?.length === totalCardsNumber;

  let totalCardsNumberList = [];

  for (let i = 0; i < totalCardsNumber; i++) {
    totalCardsNumberList.push(i);
  }

  // console.log('FourCardsSpreadForm.jsx에서 역방향 카드 중 렌더되지 않은 카드 알아보기 위해 테스트 ', selectedTarotCards)
  // console.log('FourCardsSpreadForm.jsx에서 역방향 카드 중 렌더되지 않은 카드 알아보기 위해 테스트 ', imagePath(0))
  // console.log('FourCardsSpreadForm.jsx에서 역방향 카드 중 렌더되지 않은 카드 알아보기 위해 테스트 ', imagePath(1))
  // console.log('FourCardsSpreadForm.jsx에서 역방향 카드 중 렌더되지 않은 카드 알아보기 위해 테스트 ', imagePath(2))
  // console.log('FourCardsSpreadForm.jsx에서 역방향 카드 중 렌더되지 않은 카드 알아보기 위해 테스트 ', imagePath(3))
  return (
    <>
      <div className={styles['linear-spread-container']}>
        {totalCardsNumberList.map((elem, i) => {
          return (
            <>
              <div
                className={`${styles['flip']} ${
                  isCardClicked(selectedTarotCards[elem]?.index)
                    ? styles['flip-click']
                    : ''
                }`}
                onClick={() => {
                  if (selectedTarotCards.length === totalCardsNumber) {
                    handleFlip(selectedTarotCards[elem]?.index);
                  }
                }}
              >
                {selectedTarotCards?.length >= elem + 1 ? (
                  <>
                    <div
                      className={`${styles['front']} ${
                        selectedTarotCards[elem].reversed
                          ? styles['front-reversed']
                          : ''
                      }`}
                      onClick={e => {
                        props?.setWhichCardPosition(prev => {
                          return { isClicked: true, position: i+1 };
                        });
                      }}
                    >
                      <img
                        src={imagePath(elem)}
                        alt="front"
                        draggable={false}
                      />
                    </div>
                    <div className={styles['back']}>
                      <img
                        src={'/assets/images/tarot_card_back.jpg'}
                        alt="back"
                        draggable={false}
                      />
                    </div>
                  </>
                ) : null}
              </div>
            </>
          );
        })}
      </div>
    </>
  );
};

export default FourCardsSpreadForm;


import React, { useEffect, useState } from 'react';
import styles from './TarotCardChoiceForm.module.scss';
import { backImagePath } from '../../data/images/images.jsx';
import { useTranslation } from 'react-i18next';
import {
  useResetTarotCards,
  useTarotCardDeck,
  useTotalCardsNumber,
} from '@/hooks';
import { useDispatch } from 'react-redux';
import {
  drawCard,
  resetAllTarotCards,
  resetAllTarotCardsWithoutReverse,
} from '../../store/tarotCardStore.jsx';
import { setIsWaiting } from '../../store/booleanStore.jsx';
import Button from '../common/Button.jsx';
import CancelButton from '../common/CancelButton.jsx';
import { useLanguageChange } from '@/hooks';
import { useWindowSizeState } from '@/hooks';
import {
  getTodayCard,
  setTodayCard,
} from '../../utils/storage/tokenLocalStorage.jsx';
import {
  getTodayCardForNative,
  setTodayCardForNative,
} from '../../utils/storage/tokenPreference.jsx';
import { Capacitor } from '@capacitor/core';
import { tarotDeck } from '../../data/TarotCardDeck/TarotCardDeck.jsx';
import { isDevelopmentMode } from '@/utils/constants';
import CardRow from './CardRow.jsx';
const isNative = Capacitor.isNativePlatform();

// 타로 카드 선택: 셔플, 카드 뽑기, 오늘의 카드
// Tarot card selection: shuffle, draw cards, card of the day
// タロットカード選択：シャッフル、カード引き、今日のカード
const TarotCardChoiceForm = props => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  let tarotCardDeck = useTarotCardDeck();
  const totalCardsNumber = useTotalCardsNumber();
  const browserLanguage = useLanguageChange();

  const {
    answerForm,
    cardForm,
    questionForm,
    modalForm,
    whichTarot,
    cssInvisible,
    country,
    ...restOfStateGroup
  } = props?.stateGroup;

  const {
    updateAnswerForm,
    updateCardForm,
    updateQuestionForm,
    updateModalForm,
    updateWhichTarot,
    updateCSSInvisible,
    updateCountry,
    setWhichCardPosition,
    ...restOfSetStateGroup
  } = props?.setStateGroup;

  const {
    toggleSpreadModal = () => {},
    toggleTarotModal = () => {},
    ...restOfToggleModalGroup
  } = props?.toggleModalGroup || {};
  const {
    handleAnsweredState,
    handleCardForm,
    handleQuestionForm,
    handleResetAll,
    handleResetDeck,
    handleReadyToShuffleValue,
    handleSpreadValue,
    handleWhichTarot,
    ...restOfHandleStateGroup
  } = props?.handleStateGroup;

  const [todayCardIndexInLocalStorage, setTodayCardIndexInLocalStorage] =
    useState(() => {
      if (props?.todayCardIndex) return props?.todayCardIndex;
      if (!isNative) return getTodayCard(props?.userInfo);
      if (isNative) return null;
    });
  useEffect(() => {
    const fetchTodayCard = async () => {
      try {
        const index = await getTodayCardForNative(props?.userInfo);
        if (cardForm?.selectedCardIndexList.length !== 0) {
          setTodayCardIndexInLocalStorage(cardForm?.selectedCardIndexList[0]);
        } else if (index) {
          setTodayCardIndexInLocalStorage(index);
        }
      } catch (error) {
        console.error("Error fetching today's card:", error);
      }
    };

    if (
      props?.from === 1 &&
      props?.isClickedForTodayCard &&
      isNative &&
      props?.userInfo?.email !== '' &&
      props?.userInfo?.email !== undefined
    ) {
      fetchTodayCard();
    }
    if (
      props?.from === 1 &&
      props?.isClickedForTodayCard &&
      !isNative &&
      props?.userInfo?.email !== '' &&
      props?.userInfo?.email !== undefined
    ) {
      setTodayCardIndexInLocalStorage(getTodayCard(props?.userInfo));
    }
  }, [
    isNative,
    props?.isClickedForTodayCard,
    props?.userInfo?.email,
    props?.userInfo,
    cardForm?.selectedCardIndexList?.length,
  ]);

  if (props?.from === 1) {
    const shuffleArray = array => {
      const newArray = [...array];
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
      }
      return newArray;
    };
    tarotCardDeck = shuffleArray(tarotDeck);
  }

  const handleOnSubmit = (e, card) => {
    // cardForm.selectedCardIndexList로부터 카드 배열 구성 (Redux 구독 없이)
    const currentIndexes = [...cardForm?.selectedCardIndexList, card.index];

    if (totalCardsNumber === currentIndexes?.length) {
      if (whichTarot === 2 || whichTarot === 3 || whichTarot === 4) {
        // 인덱스로부터 실제 카드 객체 배열 생성
        const updatedSelectedTarotCards = currentIndexes.map(index => {
          // tarotCardDeck 또는 원본 tarotDeck에서 카드 찾기
          const foundCard = tarotCardDeck.find(c => c.index === index);
          return foundCard || tarotDeck.find(c => c.index === index);
        });
        closeAllModals();
        props?.onSubmit(e, updatedSelectedTarotCards, props?.onSubmitParam);
      }
    }
  };

  const [isClicked, setClicked] = useState(false);

  const handleDrawCard = i => {
    try {
      if (isClicked) return;
      setClicked(true);
      if (props?.from === 1) {
        // userInfoForTodayCard가 유효한지 먼저 확인
        if (!props?.userInfo?.email) {
          if (isDevelopmentMode) {
            console.log('userInfo is invalid');
          }
          return;
        }

        if (todayCardIndexInLocalStorage === null) {
          if (isDevelopmentMode) {
            console.log('Setting today card...');
          }
          if (isNative) setTodayCardForNative(i, props?.userInfo);
          if (!isNative) setTodayCard(i, props?.userInfo);
        }

        if (cardForm?.selectedCardIndexList?.length >= 1) {
          return;
        }
      }

      updateCardForm({
        ...cardForm,
        selectedCardIndexList: [...cardForm?.selectedCardIndexList, i],
      });
      dispatch(
        drawCard({ cardNumber: totalCardsNumber, shuffledCardIndex: i })
      );
    } catch (error) {
      console.error(error);
    } finally {
      setClicked(false);
    }
  };
  const closeAllModals = () => {
    toggleSpreadModal &&
      toggleSpreadModal(false, questionForm?.spreadListNumber, '', 0);
    updateAnswerForm(prev => {
      return { ...prev, isWaiting: true };
    });
    toggleTarotModal &&
      toggleTarotModal(false, questionForm?.spreadListNumber, '', 0);
    dispatch(setIsWaiting(true));
  };

  const { windowWidth, windowHeight } = useWindowSizeState();

  // Unified card click handler
  const handleCardClick = (e, card, actualIndex) => {
    if (props?.from !== 1) {
      if (cardForm?.selectedCardIndexList?.includes(actualIndex)) return;
      if (cardForm?.selectedCardIndexList?.length === totalCardsNumber) {
        updateCSSInvisible(true);
        return;
      }
      handleDrawCard(actualIndex);
      handleOnSubmit(e, card);
      setWhichCardPosition(prev => {
        return {
          ...prev,
          isClicked: false,
          position: -1,
        };
      });
    } else {
      if (cardForm?.selectedCardIndexList?.includes(actualIndex)) return;
      handleDrawCard(card.index);
      setWhichCardPosition(prev => {
        return {
          ...prev,
          isClicked: false,
          position: -1,
        };
      });
    }
  };

  // Cancel button click handler
  const handleCancelClick = (e = null) => {
    handleResetDeck();
    if (props?.from !== 1) {
      if (whichTarot !== 1) {
        updateCardForm({
          ...cardForm,
          isShuffleFinished: false,
          selectedCardIndexList: [],
        });
        updateAnswerForm(prev => {
          return {
            ...prev,
            isSubmitted: true,
          };
        });
        handleReadyToShuffleValue(true);
      }
      if (whichTarot === 1) {
        handleSpreadValue(false);
        // handleResetDeck();
        updateCSSInvisible(false);
        updateAnswerForm(prev => {
          return {
            ...prev,
            isSubmitted: false,
            isWaiting: false,
            isAnswered: false,
          };
        });
      }
      setWhichCardPosition(prev => {
        return {
          isClicked: false,
          position: -1,
        };
      });
    }
  };

  // Portrait mode: 6 rows of 13 cards each
  const portraitCardRows = [
    { start: 0, end: 13 },
    { start: 13, end: 26 },
    { start: 26, end: 39 },
    { start: 39, end: 52 },
    { start: 52, end: 65 },
    { start: 65, end: 78 },
  ];

  // Landscape mode: 3 rows of 26 cards each
  const landscapeCardRows = [
    { start: 0, end: 26 },
    { start: 26, end: 52 },
    { start: 52, end: 78 },
  ];

  return (
    <>
      {window !== 'undefined' && window.screen.width <= window.screen.height ? (
        <div className={styles['choice-box']}>
          <div className={styles['flex-grow3']} />
          {portraitCardRows.map(({ start, end }, index) => (
            <CardRow
              key={`portrait-row-${index}`}
              cards={tarotCardDeck?.slice(start, end)}
              startIndex={start}
              selectedIndexes={cardForm?.selectedCardIndexList}
              onCardClick={handleCardClick}
            />
          ))}
          <div className={styles['flex-grow2']} />
          <div className={styles['btn-box']}>
            {props?.from !== 1 && (
              <CancelButton
                className={`${
                  browserLanguage === 'ja'
                    ? styles['btn-japanese']
                    : styles['btn']
                }`}
                onClick={handleCancelClick}
              >
                {t(`button.cancel`)}
              </CancelButton>
            )}
          </div>
        </div>
      ) : (
        <div className={styles['choice-box']}>
          <div className={styles['flex-grow3']} />
          {landscapeCardRows.map(({ start, end }, index) => (
            <CardRow
              key={`landscape-row-${index}`}
              cards={tarotCardDeck?.slice(start, end)}
              startIndex={start}
              selectedIndexes={cardForm?.selectedCardIndexList}
              onCardClick={handleCardClick}
            />
          ))}
          <div className={styles['flex-grow2']} />
          <div className={styles['btn-box']}>
            {props?.from !== 1 && (
              <CancelButton
                className={`${
                  browserLanguage === 'ja'
                    ? styles['btn-japanese']
                    : styles['btn']
                }`}
                onClick={handleCancelClick}
              >
                {t(`button.cancel`)}
              </CancelButton>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TarotCardChoiceForm;

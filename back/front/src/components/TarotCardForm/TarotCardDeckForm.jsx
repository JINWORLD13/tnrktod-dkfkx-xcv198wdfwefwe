import React, { useState, useEffect } from 'react';
import styles from './TarotCardDeckForm.module.scss';
import TarotCardShuffleForm from './TarotCardDeckShuffleForm.jsx';
import { backImagePath } from '../../data/images/images.jsx';
import {
  useSelectedTarotCards,
  useTarotCardDeck,
} from '@/hooks';
import { useDispatch } from 'react-redux';
import { shuffleTarotCardDeck } from '../../store/tarotCardStore.jsx';

const TarotCardDeckForm = props => {
  const dispatch = useDispatch();
  const [isClickable, setIsClickable] = useState(true);
  const [isDeckClicked, setIsDeckClicked] = useState(false);
  const tarotCardDeck = useTarotCardDeck();
  const selectedTarotCards = useSelectedTarotCards();
  const {
    answerForm,
    cardForm,
    questionForm,
    modalForm,
    whichTarot,
    cssInvisible,
    country,
  } = props.stateGroup;

  const {
    updateAnswerForm,
    updateCardForm,
    updateQuestionForm,
    updateModalForm,
    updateWhichTarot,
    updateCSSInvisible,
    updateCountry,
    setWhichCardPosition,
    ...rest
  } = props.setStateGroup;

  const { toggleSpreadModal, toggleTarotModal } = props.toggleModalGroup;
  const {
    handleAnsweredState,
    handleCardForm,
    handleQuestionForm,
    handleResetAll,
    handleResetDeck,
    handleSpreadValue,
    handleSuffleFinishValue,
    handleWhichTarot,
    ...rest3
  } = props.handleStateGroup;

  const handleShuffleDeck = () => {
    dispatch(shuffleTarotCardDeck);
    updateCardForm({ ...cardForm, shuffle: cardForm?.shuffle + 1 });
  };

  const [timeoutId, setTimeoutId] = useState(null);

  const handleDeckClick = () => {
    if (isClickable) {
      setIsClickable(false);
      setIsDeckClicked(true);
      const id = setTimeout(() => {
        setIsClickable(true);
        setIsDeckClicked(false);
      }, 300);
      setTimeoutId(id);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return (
    <>
      <div
        className={`${styles.deck}`}
        onClick={() => {
          // 질문타로면 submitted 상태, 스피드타로면 바로 섞게 함
          if (answerForm?.isSubmitted === true || whichTarot === 1) {
            handleShuffleDeck();
            // e.preventDefault();
            handleDeckClick();
          }
        }}
        onDragEnd={() => {
          if (answerForm?.isSubmitted === true || whichTarot === 1) {
            handleSpreadValue(true);
            handleSuffleFinishValue(true);
            updateCSSInvisible(true);
          }
        }}
      >
        {/* 선택된 카드 없이 덱이 클릭될때 셔플 모션 그게 아니면 덱 표시*/}
        {isDeckClicked === true && selectedTarotCards?.length === 0 ? (
          <TarotCardShuffleForm />
        ) : (
          tarotCardDeck.slice(0, 40).map((elem, i) => {
            return (
              <div
                className={`${styles.card}`}
                draggable={
                  answerForm?.isSubmitted === false &&
                  (whichTarot === 2 || whichTarot === 3 || whichTarot === 4)
                    ? false
                    : true
                }
              >
                <img src={backImagePath} alt="back" draggable={false} />
              </div>
            );
          })
        )}
      </div>
      {/* <div>
        <div className={styles['button-container']}>
          {selectedTarotCards?.length === 0 ? null : (
            <button onClick={handleResetDeck}>Reset Cards</button>
          )}
          {form.spread === false &&
          form.shuffle > 0 &&
          totalCardsNumber > 0 ? (
            <>
              <button onClick={()=>{handleSpreadValue(false)}}>Spread Cards</button>
            </>
          ) : null}
        </div>
      </div> */}
    </>
  );
};

export default TarotCardDeckForm;

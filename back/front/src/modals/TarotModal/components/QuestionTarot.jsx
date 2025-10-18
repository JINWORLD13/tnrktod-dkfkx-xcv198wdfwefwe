import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTotalCardsNumber } from '@/hooks';
import { useLanguageChange } from '@/hooks';
import { TarotModalCard } from './TarotModalCard';
import TarotCardChoiceForm from '../../../components/TarotCardForm/TarotCardChoiceForm';
import TarotCardDeckForm from '../../../components/TarotCardForm/TarotCardDeckForm';
import { detectComputer } from '../../../utils/device/detectComputer';
import { QuestionContainer } from './QuestionContainer';
import { DeepTarotBtnBox } from './DeepTarotBtnBox';
import { Capacitor } from '@capacitor/core';
import { SpeedTarotBtnBox } from './SpeedTarotBtnBox';
import { GuidanceBox } from './GuidanceBox';
import Button from '../../../components/common/Button';
import { useState, useTransition } from 'react';
import fontStyles from '../../../styles/scss/Font.module.scss';
import { useQuestionFormState } from '../../../hooks';
const isNative = Capacitor.isNativePlatform();

export const QuestionTarot = ({
  styles,
  stateGroup,
  setStateGroup,
  toggleModalGroup,
  handleStateGroup,
  onSubmit,
  onSubmitParam,
  isInstructionOpen,
  setInstructionOpen,
  setQuestionKind,
  ...props
}) => {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition(); //! useTransition 인스턴스를 여러 자식 컴포넌트에 전달하면, 마지막으로 전달된 컴포넌트에서의 상태 업데이트가 이전 컴포넌트들의 업데이트를 취소시킬 수 있습니다. 그래서 입력한 내용들 중간과정이 날라가고 마지막 입력값만 나옴. 써야 할 곳에서 선언해야 함.
  // console.log(isPending);

  const {
    answerForm,
    cardForm,
    questionForm,
    modalForm,
    whichTarot,
    cssInvisible,
    country,
    questionMode,
    ...rest
  } = stateGroup;
  const [isSimpleClicked, setIsSimpleClicked] = useState(() => {
    if (questionMode === 1) {
      return true;
    } else {
      return false;
    }
  });
  const [isDetailClicked, setIsDetailClicked] = useState(() => {
    if (questionMode === 2) {
      return true;
    } else {
      return false;
    }
  });
  const {
    updateAnswerForm,
    updateCardForm,
    updateQuestionForm,
    updateModalForm,
    updateWhichTarot,
    updateCSSInvisible,
    updateCountry,
    updateTarotManualModalOpen,
    setFilledInTheQuestion,
    setQuestionMode,
    ...rest2
  } = setStateGroup;

  const { toggleSpreadModal, toggleTarotModal } = toggleModalGroup;
  const {
    handleAnsweredState,
    handleCardForm,
    handleQuestionForm,
    handleResetAll,
    handleResetDeck,
    handleSpreadValue,
    handleWhichTarot,
    ...rest3
  } = handleStateGroup;
  const totalCardsNumber = useTotalCardsNumber();
  const [questionFormInTarotModal, updateQuestionFormInTarotModal] =
    useQuestionFormState();

  const browserLanguage = useLanguageChange();

  return (
    <>
      <TarotModalCard
        className={`${
          !(
            cardForm?.spread === true && cardForm?.isShuffleFinished === true
          ) &&
          answerForm?.isSubmitted &&
          cardForm?.isReadyToShuffle === true
            ? null
            : styles['question-tarot-modal-card']
        }`}
        styles={styles}
      >
        {cardForm?.spread === true && cardForm?.isShuffleFinished === true ? (
          <>
            {cardForm?.selectedCardIndexList?.length !== totalCardsNumber && (
              <>
                <div className={styles['flex-grow3']}></div>
                <div className={styles['question-tarot-choice-form']}>
                  <TarotCardChoiceForm
                    stateGroup={stateGroup}
                    setStateGroup={setStateGroup}
                    toggleModalGroup={toggleModalGroup}
                    handleStateGroup={handleStateGroup}
                    onSubmit={onSubmit}
                    onSubmitParam={onSubmitParam}
                  />
                </div>
              </>
            )}
          </>
        ) : (
          <>
            {answerForm?.isSubmitted === true &&
            cardForm?.isReadyToShuffle === true ? (
              <>
                <div className={styles['flex-grow4']}></div>
                <div className={styles['deck-form']}>
                  <TarotCardDeckForm
                    stateGroup={stateGroup}
                    setStateGroup={setStateGroup}
                    toggleModalGroup={toggleModalGroup}
                    handleStateGroup={handleStateGroup}
                  />
                </div>
                <div className={styles['flex-grow']}></div>
                <GuidanceBox
                  styles={styles}
                  cssInvisible={cssInvisible}
                  whichTarot={whichTarot}
                />
                <div className={styles['flex-grow2']}></div>
                <SpeedTarotBtnBox
                  styles={styles}
                  stateGroup={stateGroup}
                  setStateGroup={setStateGroup}
                  toggleModalGroup={toggleModalGroup}
                  handleStateGroup={handleStateGroup}
                />
              </>
            ) : (
              <>
                <div className={styles['flex-grow']}></div>
                {/* <div className={styles['flex-grow3']}></div> */}
                {/* <div className={styles['question-tarot-deck-form']}>
              <TarotCardDeckForm
                stateGroup={stateGroup}
                setStateGroup={setStateGroup}
                toggleModalGroup={toggleModalGroup}
                handleStateGroup={handleStateGroup}
              />
            </div>
            <div className={styles['flex-grow']}></div> */}
                {cssInvisible === true && answerForm?.isSubmitted === true ? (
                  <div className={styles['guidance-box']}>
                    <h2
                      className={` ${
                        browserLanguage === 'ja'
                          ? fontStyles['japanese-font-small-title']
                          : fontStyles['korean-font-small-title']
                      } ${cardForm?.spread ? styles['invisible'] : null}`}
                    >
                      {isNative || !detectComputer()
                        ? t(
                            `instruction.tarot_modal_question_card_not_computer`
                          )
                        : t(`instruction.tarot_modal_question_card`)}
                      {/* {isNative || !detectComputer() ? <br /> : <br />}
                      {isNative || !detectComputer()
                        ? t(
                            `instruction.tarot_modal_question_card_not_computer2`
                          )
                        : t(`instruction.tarot_modal_question_card2`)}
                      {isNative || !detectComputer() ? <br /> : <br />}
                      {isNative || !detectComputer()
                        ? t(
                            `instruction.tarot_modal_question_card_not_computer3`
                          )
                        : t(`instruction.tarot_modal_question_card3`)}
                      {isNative || !detectComputer() ? <br /> : <br />}
                      {isNative || !detectComputer()
                        ? t(`instruction.tarot_modal_statics`)
                        : t(`instruction.tarot_modal_statics`)} */}
                    </h2>
                  </div>
                ) : (
                  <div className={styles['guidance-box']}>
                    <h2
                      className={`${
                        browserLanguage === 'ja'
                          ? fontStyles['japanese-font-small-title']
                          : fontStyles['korean-font-small-title']
                      }`}
                    >
                      {t(`instruction.tarot_modal_question`)}
                      {/* {<br />}
                      {t(`instruction.tarot_modal_question2`)}
                      {<br />}
                      {t(`instruction.tarot_modal_question3`)}
                      {<br />}
                      {t(`instruction.tarot_modal_statics`)} */}
                    </h2>
                  </div>
                )}
                {/* <div className={styles['flex-grow']}></div> */}
                <div className={styles['input-mode-button-box']}>
                  <Button
                    className={`${
                      browserLanguage === 'ja'
                        ? styles['input-mode-button-japanese']
                        : styles['input-mode-button']
                    } ${
                      isSimpleClicked
                        ? styles['selected-color']
                        : styles['normal-color']
                    }`}
                    onClick={e => {
                      e.preventDefault();
                      setQuestionMode(prev => {
                        setIsSimpleClicked(true);
                        setIsDetailClicked(false);
                        return 1;
                      });
                    }}
                  >
                    {t(`button.simple-input`)}
                  </Button>
                  <Button
                    className={`${
                      browserLanguage === 'ja'
                        ? styles['input-mode-button-japanese']
                        : styles['input-mode-button']
                    } ${
                      isDetailClicked
                        ? styles['selected-color']
                        : styles['normal-color']
                    }`}
                    onClick={e => {
                      e.preventDefault();
                      setQuestionMode(prev => {
                        setIsSimpleClicked(false);
                        setIsDetailClicked(true);
                        return 2;
                      });
                    }}
                  >
                    {t(`button.detailed-input`)}
                  </Button>
                </div>
                <div className={styles['flex-grow']}></div>
                {cardForm?.spread === true ? null : (
                  <QuestionContainer
                    styles={styles}
                    stateGroup={stateGroup}
                    setStateGroup={setStateGroup}
                    toggleModalGroup={toggleModalGroup}
                    handleStateGroup={handleStateGroup}
                    questionFormInTarotModal={questionFormInTarotModal}
                    updateQuestionFormInTarotModal={
                      updateQuestionFormInTarotModal
                    }
                    questionMode={questionMode}
                    startTransition={startTransition}
                    setInstructionOpen={setInstructionOpen}
                    setQuestionKind={setQuestionKind}
                  />
                )}
                <div className={styles['flex-grow']}></div>
                <DeepTarotBtnBox
                  styles={styles}
                  stateGroup={stateGroup}
                  setStateGroup={setStateGroup}
                  toggleModalGroup={toggleModalGroup}
                  handleStateGroup={handleStateGroup}
                  questionFormInTarotModal={questionFormInTarotModal}
                  isPending={isPending}
                  isInstructionOpen={isInstructionOpen}
                  setInstructionOpen={setInstructionOpen}
                />
              </>
            )}
          </>
        )}
        {/* <div className={styles['flex-grow']}></div>
          {cssInvisible === true ? (
            <h2 className={`${cardForm?.spread ? styles['invisible'] : null}`}>
              {t(`instruction.tarot_modal_question_card`)}
            </h2>
          ) : (
            <h2>{t(`instruction.tarot_modal_question`)}</h2>
          )}
          <div className={styles['flex-grow']}></div>
          {answerForm?.isSubmitted === true ? (
            <>
              {cardForm?.spread === true ? null : (
                <SubmittedContainer
                  stateGroup={stateGroup}
                  setStateGroup={setStateGroup}
                  toggleModalGroup={toggleModalGroup}
                  handleStateGroup={handleStateGroup}
                />
              )}
            </>
          ) : (
            <QuestionContainer
              stateGroup={stateGroup}
              setStateGroup={setStateGroup}
              toggleModalGroup={toggleModalGroup}
              handleStateGroup={handleStateGroup}
            />
          )}
          <div className={styles['flex-grow']}></div>
          <DeepTarotBtnBox
          styles={styles}
            stateGroup={stateGroup}
            setStateGroup={setStateGroup}
            toggleModalGroup={toggleModalGroup}
            handleStateGroup={handleStateGroup}
          /> */}
      </TarotModalCard>
    </>
  );
};

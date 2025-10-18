import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageChange } from '@/hooks';
import { useCallback, useTransition } from 'react';
import { detectComputer } from '../../../utils/device/detectComputer';
import { Capacitor } from '@capacitor/core';
import { InstructionButton } from '../../../components/common/InstructionButton';
import { ThemeBox } from '../components/ThemeBox';
import { RelationshipBox } from '../components/RelationshipBox';
import { TargetAndCounterpartBox } from '../components/TargetAndCounterpartBox';
import { SituationBox } from '../components/SituationBox';
import { QuestionBox } from '../components/QuestionBox';
import { OptionBox } from '../components/OptionBox';
import { TopicBox } from '../components/TopicBox';
const isNative = Capacitor.isNativePlatform();

export const QuestionContainer = ({
  styles,
  stateGroup,
  setStateGroup,
  toggleModalGroup,
  handleStateGroup,
  questionFormInTarotModal,
  updateQuestionFormInTarotModal,
  questionMode,
  startTransition,
  setInstructionOpen,
  setQuestionKind,
  ...props
}) => {
  const { t } = useTranslation();
  const {
    answerForm,
    cardForm,
    questionForm,
    modalForm,
    whichTarot,
    cssInvisible,
    country,
    // isPending,
    ...rest
  } = stateGroup;

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
    // startTransition,
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

  const browserLanguage = useLanguageChange();

  const handleQuestionFormInTarotModal = useCallback(e => {
    // e.preventDefault(); // ❌ onInput 이벤트에서 preventDefault는 백스페이스 등 모든 입력을 막음!
    // e.stopPropagation(); //& 이벤트 버블링 방지 (webGLContext Error 방지) - 주석 처리: 키보드 입력(backspace 등)을 막는 문제 해결
    // // 조합 중인 상태라면 리턴
    // if (e.nativeEvent.isComposing) {
    //   console.log(e.target.value)
    //   return;
    // }
    const { name, value } = e.target;
    updateQuestionFormInTarotModal(prev => ({
      ...prev,
      [name]: value,
    }));
  });

  return (
    <div
      className={
        answerForm?.isSubmitted
          ? styles['submitted-container']
          : styles['question-container']
      }
    >
      {questionMode === 2 && (
        <>
          <div
            className={
              answerForm?.isSubmitted
                ? styles['submitted-container-compartment']
                : styles['question-container-compartment']
            }
          >
            {/* 이 부분은 scss에서 display:block, none으로 처리 */}
            <ThemeBox
              styles={styles}
              isSubmittedMode={answerForm?.isSubmitted}
            />
            <TopicBox
              styles={styles}
              setInstructionOpen={setInstructionOpen}
              setQuestionKind={setQuestionKind}
              questionFormInTarotModal={questionFormInTarotModal}
              handleQuestionFormInTarotModal={handleQuestionFormInTarotModal}
              questionForm={questionForm}
              isSubmittedMode={answerForm?.isSubmitted}
            />
            <TargetAndCounterpartBox
              styles={styles}
              setInstructionOpen={setInstructionOpen}
              setQuestionKind={setQuestionKind}
              questionFormInTarotModal={questionFormInTarotModal}
              handleQuestionFormInTarotModal={handleQuestionFormInTarotModal}
              questionForm={questionForm}
              isSubmittedMode={answerForm?.isSubmitted}
            />
            <RelationshipBox
              styles={styles}
              setInstructionOpen={setInstructionOpen}
              setQuestionKind={setQuestionKind}
              questionFormInTarotModal={questionFormInTarotModal}
              handleQuestionFormInTarotModal={handleQuestionFormInTarotModal}
              questionForm={questionForm}
              isSubmittedMode={answerForm?.isSubmitted}
            />
          </div>
        </>
      )}
      <div
        className={
          answerForm?.isSubmitted
            ? styles['submitted-container-compartment']
            : styles['question-container-compartment']
        }
      >
        {questionMode === 1 && (
          <ThemeBox styles={styles} isSubmittedMode={answerForm?.isSubmitted} />
        )}
        {questionMode === 2 &&
          questionForm?.spreadListNumber !== 201 &&
          questionForm?.spreadListNumber !== 304 && (
            <SituationBox
              styles={styles}
              setInstructionOpen={setInstructionOpen}
              setQuestionKind={setQuestionKind}
              questionFormInTarotModal={questionFormInTarotModal}
              handleQuestionFormInTarotModal={handleQuestionFormInTarotModal}
              questionForm={questionForm}
              isSubmittedMode={answerForm?.isSubmitted}
            />
          )}
        {(questionMode === 1 || questionMode === 2) &&
          (questionForm?.spreadListNumber === 201 ||
            questionForm?.spreadListNumber === 304) && (
            <OptionBox
              styles={styles}
              setInstructionOpen={setInstructionOpen}
              setQuestionKind={setQuestionKind}
              questionFormInTarotModal={questionFormInTarotModal}
              handleQuestionFormInTarotModal={handleQuestionFormInTarotModal}
              questionForm={questionForm}
              isSubmittedMode={answerForm?.isSubmitted}
            />
          )}
        <div className={styles['flex-grow']}></div>
        <QuestionBox
          styles={styles}
          setInstructionOpen={setInstructionOpen}
          setQuestionKind={setQuestionKind}
          questionFormInTarotModal={questionFormInTarotModal}
          handleQuestionFormInTarotModal={handleQuestionFormInTarotModal}
          isSubmittedMode={answerForm?.isSubmitted}
          questionForm={questionForm}
        />
      </div>
    </div>
  );
};

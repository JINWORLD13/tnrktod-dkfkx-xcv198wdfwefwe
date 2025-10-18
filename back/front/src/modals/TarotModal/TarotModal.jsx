import React, { useEffect } from 'react';
import styles from './TarotModal.module.scss';
import { tarotApi } from '../../api/tarotApi.jsx';
import {
  useSetTotalCardsNumber,
  useTarotCardDeck,
  useTotalCardsNumber,
} from '@/hooks';
import { useDispatch } from 'react-redux';
import {
  setIsAnswered,
  setIsDoneAnimationOfBackground,
  setIsReadyToShowDurumagi,
  setIsWaiting,
} from '../../store/booleanStore.jsx';
import { useLanguageChange } from '@/hooks';
import { QuestionTarot } from './components/QuestionTarot.jsx';
import { SpeedTarot } from './components/SpeedTarot.jsx';
import { useRewardFromPreference } from '../../components/GoogleAd/hooks/useRewardFromPreference.jsx';
import { isAdsFreePassValid } from '../../lib/user/isAdsFreePassValid.jsx';
import { onSubmit } from './lib/onSubmit.jsx';

const TarotModal = ({
  stateGroup,
  setStateGroup,
  toggleModalGroup,
  handleStateGroup,
  userInfo,
  setAdmobReward,
  isInstructionOpen,
  setInstructionOpen,
  setQuestionKind,
  ...props
}) => {
  const {
    answerForm,
    cardForm,
    questionForm,
    modalForm,
    whichTarot,
    cssInvisible,
    country,
    tarotSpreadPricePoint,
    tarotSpreadVoucherPrice,
    whichCardPosition,
    isVoucherModeOn,
    isPending,
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
    setWhichAds,
    setAdsWatched,
    setFilledInTheQuestion,
    setWhichCardPosition,
    ...rest2
  } = setStateGroup;

  const browserLanguage = useLanguageChange();
  const dispatch = useDispatch();
  const tarotCardDeck = useTarotCardDeck();
  const totalCardsNumber = useTotalCardsNumber();
  const setTotalCardsNumber = useSetTotalCardsNumber();

  useEffect(() => {
    setTotalCardsNumber(questionForm?.cardCount);
  }, [questionForm?.cardCount, setTotalCardsNumber]);

  useEffect(() => {
    if (tarotCardDeck?.length === 78) {
      updateCardForm({
        ...cardForm,
        selectedCardIndexList: [],
      });
    }
    return () => {};
  }, [tarotCardDeck]);

  useEffect(() => {
    updateCardForm({ ...cardForm, spread: false, shuffle: 0 });
    return () => {};
  }, [totalCardsNumber]);

  return (
    <>
      {whichTarot === 1 ? (
        <SpeedTarot
          styles={styles}
          stateGroup={stateGroup}
          setStateGroup={setStateGroup}
          toggleModalGroup={toggleModalGroup}
          handleStateGroup={handleStateGroup}
          userInfo={userInfo}
        />
      ) : null}
      {whichTarot === 2 || whichTarot === 3 || whichTarot === 4 ? (
        <QuestionTarot
          styles={styles}
          stateGroup={stateGroup}
          setStateGroup={setStateGroup}
          toggleModalGroup={toggleModalGroup}
          onSubmit={onSubmit}
          onSubmitParam={{
            // State setters
            setWhichAds,
            updateQuestionForm,
            updateAnswerForm,
            setWhichCardPosition,
            setAdsWatched,

            // Redux dispatch
            dispatch,

            // Redux actions
            setIsWaiting,
            setIsAnswered,
            setIsDoneAnimationOfBackground,
            setIsReadyToShowDurumagi,

            // Form data
            questionForm,

            // User and app state
            userInfo,
            whichTarot,
            isVoucherModeOn,
            tarotSpreadVoucherPrice,
            browserLanguage,

            // Props
            props,

            // APIs and utilities
            tarotApi,
            isAdsFreePassValid,
          }}
          handleStateGroup={handleStateGroup}
          isInstructionOpen={isInstructionOpen}
          setInstructionOpen={setInstructionOpen}
          setQuestionKind={setQuestionKind}
        />
      ) : null}
    </>
  );
};

export default TarotModal;

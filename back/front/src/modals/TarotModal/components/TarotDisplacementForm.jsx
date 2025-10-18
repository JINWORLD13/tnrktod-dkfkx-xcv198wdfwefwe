import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  useResetTarotCards,
  useTotalCardsNumber,
} from '@/hooks';
import { useLanguageChange } from '@/hooks';
import TarotCardSpreadForm from '../../../components/TarotCardForm/TarotCardSpreadForm';
import Button from '../../../components/common/Button';
import CancelButton from '../../../components/common/CancelButton';
import { BtnBox } from './BtnBox';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
const isNative = Capacitor.isNativePlatform();
import { isAdsFreePassValid } from '../../../lib/user/isAdsFreePassValid';
import AdLoadingComponent from '../../../components/GoogleAd/components/AdLoadingComponent';

export const TarotDisplacementForm = ({
  styles,
  stateGroup,
  setStateGroup,
  toggleModalGroup,
  handleStateGroup,
  userInfo,
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
    whichCardPosition,
    whichAds,
    isAdsWatched,
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
    setWhichCardPosition,
    setWhichAds,
    setAdsWatched,
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
  const browswerLanguage = useLanguageChange();
  useEffect(() => {
    if (whichTarot === 1 && isNative && !isAdsFreePassValid(userInfo)) {
      setWhichAds(1);
      setAdsWatched(false);
    }
  }, []);

  if (
    isNative &&
    whichTarot === 1 &&
    (!isAdsWatched || (whichAds !== 0 && isAdsWatched)) &&
    !isAdsFreePassValid(userInfo)
  )
    return (
      <AdLoadingComponent
        setWhichAds={setWhichAds}
        setAdsWatched={setAdsWatched}
        // updateModalForm={updateModalForm} //! 다른 상태값 고려해야 해서 주석
      />
    );
  return (
    <>
      <div className={styles['displacement-box']}>
        <div className={styles['flex-grow']}></div>
        <div
          className={`${styles['displacement']} ${
            questionForm?.spreadListNumber === 501
              ? styles['width-for-five-cards-relationship-spread']
              : ''
          }`}
        >
          <TarotCardSpreadForm
            cardForm={cardForm}
            updateCardForm={updateCardForm}
            questionForm={questionForm}
            whichCardPosition={whichCardPosition}
            setWhichCardPosition={setWhichCardPosition}
          />
        </div>
        <div className={styles['flex-grow']}></div>
        <BtnBox styles={styles}>
          <CancelButton
            className={`${
              browswerLanguage === 'ja' ? styles['btn-japanese'] : styles['btn']
            }`}
            onClick={(e = null) => {
              if (
                isNative &&
                whichTarot === 1 &&
                (!isAdsWatched || (whichAds !== 0 && isAdsWatched)) &&
                !isAdsFreePassValid(userInfo)
              )
                return;
              handleResetDeck();
              handleSpreadValue(false);
              updateCSSInvisible(false);
              updateAnswerForm(prev => {
                return {
                  ...prev,
                  isWaiting: false,
                  isAnswered: false,
                  isSubmitted: false,
                };
              });
              toggleTarotModal(
                true,
                questionForm?.spreadListNumber,
                questionForm?.spreadTitle,
                totalCardsNumber
              );
              setWhichCardPosition(prev => {
                return {
                  isClicked: false,
                  position: -1,
                };
              });
              if (isNative && whichTarot === 1) {
                setWhichAds(0);
                setAdsWatched(false);
              }
            }}
          >
            {t(`button.cancel`)}
          </CancelButton>
        </BtnBox>
      </div>
    </>
  );
};

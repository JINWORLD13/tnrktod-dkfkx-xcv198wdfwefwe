import React from 'react';
import { useEffect, useState, useCallback } from 'react';
import Card from '../../components/common/Card.jsx';
import styles from './SpreadModal.module.scss';
import { useTranslation } from 'react-i18next';
import {
  CelticCross,
  CelticCrossForModal,
  FourCards,
  FourCardsForModal,
  SingleCard,
  SingleCardForModal,
  ThreeCards,
  ThreeCardsForModal,
  ThreeCardsTime,
  ThreeCardsTimeForModal,
  TwoCards,
  TwoCardsForModal,
} from '../../components/TarotCardForm/TarotCardTableForm.jsx';
// import { hasAccessToken } from '../../utils/storage/tokenLocalStorage.jsx';
import { hasAccessToken } from '../../../utils/storage/tokenCookie.jsx';
import Button from '../../components/common/Button.jsx';
import { useLanguageChange } from '@/hooks';
import { userApi } from '../../../api/userApi.jsx';
import {
  spreadArr,
  spreadArrForPoint,
} from '../../../data/spreadList/spreadArr.jsx';
import { useSelector } from 'react-redux';
import { hasAccessTokenForPreference } from '../../../utils/storage/tokenPreference.jsx';
import { Capacitor } from '@capacitor/core';
import { SpreadModalTab } from '../../../components/SpreadModal/WhichTarotTab.jsx';
import { BottomBox } from '../../../components/SpreadModal/BottomBox.jsx';
import { SpreadListForPoint } from '../../../components/SpreadModal/SpreadListForPoint.jsx';
const isNative = Capacitor.isNativePlatform();

export const SpreadModal = ({
  stateGroup,
  setStateGroup,
  toggleModalGroup,
  handleStateGroup,
  userCacheForRedux,
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
    isVoucherModeOn,
    showInAppPurchase,
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
    updateAdsAlertModalOpen,
    updateBlinkModalForLoginOpen,
    updateChargeModalOpen,
    updateTarotSpreadPricePoint,
    updateTarotSpreadVoucherPrice,
    setVoucherMode,
    setWhichAds,
    setShowInAppPurchase,
    ...rest2
  } = setStateGroup;
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

  const { toggleSpreadModal, toggleTarotModal } = toggleModalGroup;
  const browserLanguage = useLanguageChange();

  return (
    <Card className={styles.spreadModal}>
      <SpreadModalTab
        styles={styles}
        whichTarot={whichTarot}
        handleWhichTarot={handleWhichTarot}
        toggleTarotModal={toggleTarotModal}
        updateAnswerForm={updateAnswerForm}
        browserLanguage={browserLanguage}
      />
      <SpreadListForPoint
        toggleTarotModal={toggleTarotModal}
        whichTarot={whichTarot}
        setStateGroup={setStateGroup}
      />
      <BottomBox
        styles={styles}
        whichTarot={whichTarot}
        isVoucherModeOn={isVoucherModeOn}
        setVoucherMode={setVoucherMode}
        toggleTarotModal={toggleTarotModal}
        toggleSpreadModal={toggleSpreadModal}
        browserLanguage={browserLanguage}
      />
    </Card>
  );
};

export default SpreadModal;

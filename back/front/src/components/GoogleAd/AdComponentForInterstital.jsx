import React, { useEffect, useCallback, useState } from 'react';
import styles from './AdComponent.module.scss';
import { Capacitor } from '@capacitor/core';
import { AdMob, InterstitialAdPluginEvents } from '@capacitor-community/admob';
import { initializeAdMob } from './initializeAdMob';
import { initializeAdSense } from './initializeAdsense';
import { getLocalizedContent } from './getLocalizedContent';
import { useTranslation } from 'react-i18next';
import CancelButton from '../../components/common/CancelButton';
import Button from '../../components/common/Button';

const isNative = Capacitor.isNativePlatform();
const AdComponentForInterstital = ({
  // whichAds,
  // setWhichAds,
  // setAdsWatched,
  // setAdWatchedOnlyForBlinkModal,
  stateGroup,
  setStateGroup,
  userInfo,
  // setAdmobReward,
}) => {
  const { t } = useTranslation();
  const content = getLocalizedContent();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

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
    isVoucherModeOn,
    isAdsWatched,
    whichAds,
    isChargeModalOpen,
    showInAppPurchase,
    whichSpread,
    whichCardPosition,
    isReadyToShowDurumagi,
    isDoneAnimationOfBackground,
    ...restOfStateGroup
  } = stateGroup;
  const {
    updateAnswerForm,
    updateCardForm,
    updateQuestionForm,
    updateModalForm,
    updateWhichTarot,
    updateCSSInvisible,
    updateCountry,
    updateBlinkModalForLoginOpen,
    updateChargeModalOpen,
    updateTarotSpreadPricePoint,
    updateTarotSpreadVoucherPrice,
    updateTarotManualModalOpen,
    setVoucherMode,
    setWhichAds,
    setAdsWatched,
    setShowInAppPurchase,
    setFilledInTheQuestion,
    setUnavailableWhichTarot,
    setWhichSpread,
    setWhichCardPosition,
    setAdWatchedOnlyForBlinkModal,
    setReadyToShowDurumagi,
    setAdmobReward,
    ...restOfSetStateGroup
  } = setStateGroup;

  const handleConfirm = useCallback(() => {
    setWhichAds(0);
    setAdsWatched(true);
    setAdWatchedOnlyForBlinkModal(true);
  }, [setWhichAds, setAdsWatched, setAdWatchedOnlyForBlinkModal]);

  const handleCancel = useCallback(
    e => {
      setWhichAds(0);
      setAdsWatched(true); // 오류 발생시 그냥 보여줌
      setAdWatchedOnlyForBlinkModal(false); // 추가적인 모달 상태 처리
      setIsLoading(false);
      setError(null);
    },
    [setWhichAds, setAdsWatched, setAdWatchedOnlyForBlinkModal]
  );

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);

  const handleInitialConfirm = useCallback(() => {
    setIsLoading(true);
  }, []);

  const handleInitialCancel = useCallback(
    e => {
      setWhichAds(0);
      setAdsWatched(false);
      setAdWatchedOnlyForBlinkModal(false);
    },
    [setWhichAds, setAdsWatched, setAdWatchedOnlyForBlinkModal]
  );

  let listeners = {};
  let cleanup = async () => {
    // await AdMob.removeListener(InterstitialAdPluginEvents.Loaded);
    // await AdMob.removeListener(InterstitialAdPluginEvents.FailedToLoad);
    // await AdMob.removeListener(InterstitialAdPluginEvents.Showed);
    // await AdMob.removeListener(InterstitialAdPluginEvents.FailedToShow);
    // await AdMob.removeListener(InterstitialAdPluginEvents.Dismissed);
    await AdMob.removeAllListeners();
  };
  let initialFunction;
  useEffect(() => {
    const initializeAd = async () => {
      if (error === null) {
        try {
          if (isNative) {
            if (error !== null) {
              // TODO: 모달창?
              return;
            }
            // setShowInAppPurchase(false);
            initialFunction = await initializeAdMob({
              setError,
              setIsLoading,
              setAdmobReward,
              setAdsWatched,
              setAdWatchedOnlyForBlinkModal,
              setWhichAds,
              whichAds,
              whichTarot,
              userInfo,
              content,
              listeners,
            });
          } else {
            await initializeAdSense(
              setError,
              setAdLoaded,
              setIsLoading,
              handleConfirm
            );
          }
        } catch (error) {
          console.error('Ad initialization error:', error);
          setError('AD_INIT_FAILED');
        }
      }
    };

    initializeAd();

    return () => {
      if (initialFunction) cleanup();
      if (initialFunction && Object.values(listeners).length > 0) {
        Object.values(listeners).forEach(listener => listener.remove());
        listeners = {};
      }
    };
  }, [error, initializeAdMob, initializeAdSense, whichAds, initialFunction]);

  if (error) {
    return (
      <div className={styles['backdrop']}>
        <div className={styles['backdrop-box']}>
          {/* <div className={styles['ad-badge']}>{t(`ad.label`)}</div> */}
          <div className={styles['modal']}>
            <h2>{content?.errorTitle}</h2>
            {/* <div>
                <p>{error}</p>
              </div> */}
            <div>
              <p>{content?.refreshSuggestion}</p>
            </div>
            <div className={styles['btn-box']}>
              <Button onClick={handleRefresh}>{content?.refreshButton}</Button>
              <CancelButton
                onClick={(e = null) => {
                  handleCancel(e);
                }}
              >
                {content?.cancelButton}
              </CancelButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // if (isLoading) {
  //   return (
  //     <div className={styles['backdrop']}>
  //       <div className={styles['backdrop-box']}>
  //         <div className={styles['ad-badge']}>{t(`ad.label`)}</div>
  //         <div className={styles['modal']}>
  //           <h1>{t(`instruction.loading`)}</h1>
  //           <div>
  //             <p>{t(`instruction.network-warnings`)}</p>
  //           </div>
  //           <div className={styles['loading-indicator']}>
  //             <div className={styles['spinner']}></div>
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <>
      {!isNative && adLoaded ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', width: '100%', height: 'auto' }}
          data-ad-client="ca-pub-7748316956330968"
          data-ad-slot="3545458418"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : null}
    </>
  );
};

export default AdComponentForInterstital;


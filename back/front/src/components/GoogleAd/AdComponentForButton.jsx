import React, { useEffect, useCallback, useState } from 'react';
import styles from './AdComponent.module.scss';
import Button from '../../components/common/Button';
import CancelButton from '../../components/common/CancelButton';
import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  InterstitialAdPluginEvents,
  RewardAdPluginEvents,
  AdmobConsentStatus,
  AdmobConsentDebugGeography,
} from '@capacitor-community/admob';
import { useTranslation } from 'react-i18next';
import { initializeAdMob } from './initializeAdMob';
import { initializeAdSense } from './initializeAdsense';
import { getLocalizedContent } from './getLocalizedContent';
import { useSelectedTarotCards } from '@/hooks';
import {
  setAdsFree,
  getRewardForPreference,
  useRewardForPreference,
  getAdsFree,
} from '../../utils/storage/tokenPreference';
import { useLanguageChange } from '@/hooks';
import { tarotApi } from '../../api/tarotApi';
import { useDispatch } from 'react-redux';
import {
  setIsAnswered,
  setIsReadyToShowDurumagi,
  setIsWaiting,
} from '../../store/booleanStore';
import { isNormalAccount } from '../../lib/user/isNormalAccount';
import { useRewardFromPreference } from './hooks/useRewardFromPreference';
import { useButtonLock } from '@/hooks';
import AdLoadingComponent from './components/AdLoadingComponent';
import { isDevelopmentMode, isProductionMode } from '@/utils/constants';

const isNative = Capacitor.isNativePlatform();

const AdComponentForButton = ({
  // whichAds,
  // setWhichAds,
  // setAdsWatched,
  // setAdWatchedOnlyForBlinkModal,
  stateGroup,
  setStateGroup,
  userInfo,
  // setAdmobReward,
  // timeButton,
}) => {
  const dispatch = useDispatch();
  const content = getLocalizedContent();
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [showConfirmButton, setShowConfirmButton] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showInitialPrompt, setShowInitialPrompt] = useState(true);
  const browserLanguage = useLanguageChange();
  const [isTarotAble, setTarotAble] = useState(false); //! reward에선 잘 되는데 그 외 광고는 잘 안됨.
  // const { clickCount, isLocked, remainingTime, handleClick } = timeButton;
  const { clickCount, isLocked, remainingTime, handleClick } = useButtonLock({
    maxClicks: 5,
    particalLockDuration: 60 * 60 * 1000,
    lockDuration: 5 * 60 * 60 * 1000,
    uniqueId: userInfo?.email,
  });

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
      setAdsWatched(false); // 예: 광고가 닫히면 시청 완료 상태를 false로 변경
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
    setShowInitialPrompt(false);
    setIsLoading(true);
  }, []);

  const [isCancelButtonClicked, setCancelButtonClicked] = useState(false);
  const handleInitialCancel = useCallback(
    e => {
      try {
        if (isCancelButtonClicked) return;
        setCancelButtonClicked(true);
        setWhichAds(0);
        setAdsWatched(false);
        setAdWatchedOnlyForBlinkModal(false);
      } catch (error) {
        if (isDevelopmentMode) {
          console.log(error);
        }
      } finally {
        setCancelButtonClicked(false);
      }
    },
    [setWhichAds, setAdsWatched, setAdWatchedOnlyForBlinkModal]
  );

  const selectedTarotCards = useSelectedTarotCards();

  const onSubmit = async () => {
    // e.preventDefault(); // 이거 없애면 입력값이 서버로 전송되기 전 새로고침 됨.
    const updatedSelectedTarotCards = [...selectedTarotCards];
    if (isNative) {
      if (whichTarot === 2 || whichTarot === 4)
        await useRewardFromPreference({
          userInfo,
          whichAds,
          whichTarot,
          isVoucherModeOn,
          setAdmobReward,
        });
      await setAdsFree(userInfo);
    }

    const tarotCardsNameArr = updatedSelectedTarotCards.map((elem, i) => {
      return elem?.name;
    });
    const reverseStatesArr = updatedSelectedTarotCards.map((elem, i) => {
      if (elem.reversed === true) {
        return 'reversed';
      } else {
        return 'normal_direction';
      }
    });

    const selectedTarotCardsArr = tarotCardsNameArr.map((elem, i) => {
      return elem + ' ' + '(' + reverseStatesArr[i] + ')';
    });

    const questionInfo = {
      question_topic: questionForm['question_topic'].trim(),
      subject: questionForm?.subject.trim(),
      object: questionForm?.object.trim(),
      relationship_subject: questionForm['relationship_subject'].trim(),
      relationship_object: questionForm['relationship_object'].trim(),
      theme: questionForm?.theme.trim(),
      situation: questionForm?.situation.trim(),
      question: questionForm?.question.trim(),
      firstOption: questionForm?.['firstOption']?.trim(),
      secondOption: questionForm?.['secondOption']?.trim(),
      thirdOption: questionForm?.['thirdOption']?.trim(),
    };

    const spreadInfo = {
      spreadTitle: questionForm?.spreadTitle,
      cardCount: questionForm?.cardCount,
      spreadListNumber: questionForm?.spreadListNumber,
      selectedTarotCardsArr: selectedTarotCardsArr,
    };
    // ! 카페에선 공공와이파이 때문에 블락시키자.
    let result;
    // const currentTime =   new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let tarotInfo = {
      questionInfo: { ...questionInfo },
      spreadInfo: { ...spreadInfo },
      // tarotSpreadPricePoint: tarotSpreadPricePoint,
      tarotSpreadVoucherPrice: tarotSpreadVoucherPrice,
      language: browserLanguage,
      time: answerForm?.timeOfCounselling,
      formattedTime: answerForm?.timeOfCounselling?.toLocaleString(
        ['ko-KR', 'ja-JP', 'en-US'].find(locale =>
          locale.startsWith(browserLanguage)
        ) || 'en-US',
        {
          timeZone:
            browserLanguage === 'ko'
              ? 'Asia/Seoul'
              : browserLanguage === 'ja'
              ? 'Asia/Tokyo'
              : userTimeZone,
        }
      ),
      isVoucherModeOn: isVoucherModeOn ?? true,
    };
    if (whichTarot === 2 && !isVoucherModeOn) {
      try {
        // console.log('체크 : ', tarotInfo);
        // console.log('***************들어오나?');
        updateAnswerForm(prev => {
          return {
            ...prev,
            isWaiting: true, //! 이거 굉장히 중요
            isAnswered: false, //! 이거 굉장히 중요
            isSubmitted: true,
          };
        });
        result = await tarotApi.postQuestionForNormalForAnthropicAPI(tarotInfo);
      } catch (error) {
        console.error(error);
      }
    }

    if (result?.response !== undefined && result?.response !== null) {
      setWhichCardPosition(prev => {
        return {
          isClicked: false,
          position: -1,
        };
      });
      const parsedObj = JSON.parse(result?.response?.answer);
      updateAnswerForm({
        questionInfo,
        spreadInfo,
        answer: parsedObj || result?.response?.answer,
        language: tarotInfo?.language,
        timeOfCounselling: tarotInfo?.time,
        createdAt: result?.response.createdAt,
        updatedAt: result?.response.updatedAt,
        isWaiting: false,
        isSubmitted: false,
        isAnswered: true,
      });
      dispatch(setIsWaiting(false));
      dispatch(setIsAnswered(true));
      // dispatch(setIsDoneAnimationOfBackground(true));
      dispatch(setIsReadyToShowDurumagi(true));
      setAdsWatched(false);
      // if (!isVoucherModeOn) setWhichAds(0);
      setWhichAds(0);
    }
  };
  let listeners = {};
  let cleanup = async () => {
    // 특정 리스너 제거
    // AdMob.removeListener(RewardAdPluginEvents.Loaded);
    // AdMob.removeListener(RewardAdPluginEvents.FailedToLoad);
    // AdMob.removeListener(RewardAdPluginEvents.Showed);
    // AdMob.removeListener(RewardAdPluginEvents.FailedToShow);
    // AdMob.removeListener(RewardAdPluginEvents.Dismissed);
    // AdMob.removeListener(RewardAdPluginEvents.Rewarded);
    await AdMob.removeAllListeners();
  };
  let initialFunction;
  useEffect(() => {
    const initializeAd = async () => {
      if (!showInitialPrompt && isLoading && error === null) {
        try {
          if (isNative) {
            if (error !== null) {
              // TODO: 모달창?
              return;
            }
            // setShowInAppPurchase(false);
            if (!isTarotAble) {
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
                setTarotAble,
                onSubmit,
                handleClick,
                listeners,
              });
            }
            if (
              ![1, 2, 4]?.includes(whichAds) ||
              isVoucherModeOn ||
              error !== null
              // || initialFunction === undefined
            )
              return;
            if (isDevelopmentMode) {
              console.log(
                `***************************whichAds ${whichAds}번 빠지나?`,
                error
              );
            }
            // if (isTarotAble && whichAds !== 1) {
            //   await onSubmit();
            //   setTarotAble(false);
            // }
            // if (initialFunction && whichAds === 1) {
            //   await onSubmit();
            // }
          } else {
            await initializeAdSense(
              setError,
              setAdLoaded,
              setIsLoading,
              handleConfirm
            );
            if (!isVoucherModeOn) await onSubmit();
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
  }, [
    error,
    showInitialPrompt,
    initializeAdMob,
    initializeAdSense,
    isLoading,
    whichAds,
    isVoucherModeOn,
    initialFunction,
    isTarotAble,
  ]);

  if (showInitialPrompt) {
    return (
      <div className={styles['backdrop']}>
        <div className={styles['backdrop-box']}>
          <div className={styles['ad-badge']}>{t(`ad.label`)}</div>
          <div className={styles['modal']}>
            <h2>{content?.initialPrompt.title}</h2>
            <div>
              <p>
                {isNative
                  ? content?.instructionForAd1ForAdMob
                  : content?.instructionForAd1}
              </p>
            </div>
            {/* <div>
              <p>{content?.instructionForAd2}</p>
            </div> */}
            <div></div>
            <div className={styles['btn-box']}>
              <Button onClick={handleInitialConfirm}>
                {isNative
                  ? content?.initialPrompt?.continueButtonForAdMob
                  : content?.initialPrompt?.continueButton}
              </Button>
              <CancelButton
                onClick={(e = null) => {
                  handleInitialCancel(e);
                }}
              >
                {content?.initialPrompt.cancelButton}
              </CancelButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles['backdrop']}>
        <div className={styles['backdrop-box']}>
          <div className={styles['ad-badge']}>{t(`ad.label`)}</div>
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

  if (isLoading) {
    return (
      <AdLoadingComponent
        setIsLoading={setIsLoading}
        setWhichAds={setWhichAds}
        setAdsWatched={setAdsWatched}
      />
    );
  }

  return (
    <>
      {isNative ? (
        <AdLoadingComponent
          setIsLoading={setIsLoading}
          setWhichAds={setWhichAds}
          setAdsWatched={setAdsWatched}
        />
      ) : (
        <div className={styles['backdrop']}>
          <div className={styles['backdrop-box']}>
            <div className={styles['ad-badge']}>{t(`ad.label`)}</div>
            <div className={styles['modal']}>
              {adLoaded && (
                <>
                  <ins
                    className="adsbygoogle"
                    style={{ display: 'block', width: '100%', height: 'auto' }}
                    data-ad-client="ca-pub-7748316956330968"
                    data-ad-slot="3545458418"
                    data-ad-format="auto"
                    data-full-width-responsive="true"
                  />
                  {/* {showConfirmButton && (
                <div className={styles['btn-box']}>
                  <Button onClick={handleConfirm}>{t(`button.confirm`)}</Button>
                </div>
              )} */}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdComponentForButton;

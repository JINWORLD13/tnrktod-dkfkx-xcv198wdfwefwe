import React, { useEffect, useCallback, useState } from 'react';
import styles from './AdComponent.module.scss';
import Button from '../../components/common/Button';
import CancelButton from '../../components/common/CancelButton';
import { Capacitor } from '@capacitor/core';
import {
  AdMob,
  RewardAdPluginEvents,
  AdmobConsentStatus,
  AdmobConsentDebugGeography,
} from '@capacitor-community/admob';
import { useTranslation } from 'react-i18next';
import { useLanguageChange } from '@/hooks';
import { initializeAdMob } from './initializeAdMob';
import { getLocalizedContent } from './getLocalizedContent';
import { isProductionMode } from '@/utils/constants';
import { useButtonLock } from '@/hooks';
import AdLoadingComponent from './components/AdLoadingComponent';
const isNative = Capacitor.isNativePlatform();

const AdComponentForShop = ({
  whichAds = 2,
  setWhichAds,
  setAdsWatched,
  userInfo = {},
  setAdmobReward,
  // timeButton,
}) => {
  const { t } = useTranslation();
  const content = getLocalizedContent();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // console.log('import.meta.env.NODE_ENV : ', import.meta.env.VITE_NODE_ENV)
  // const { clickCount, isLocked, remainingTime, handleClick } = timeButton;
  const { clickCount, isLocked, remainingTime, handleClick } = useButtonLock({
    maxClicks: 5,
    particalLockDuration: 60 * 60 * 1000,
    lockDuration: 5 * 60 * 60 * 1000,
    uniqueId: userInfo?.email,
  });

  const handleCancel = useCallback(
    e => {
      setWhichAds(0);
      setAdsWatched(false); // 예: 광고가 닫히면 시청 완료 상태를 false로 변경
      setIsLoading(false);
      setError(null);
    },
    [setWhichAds, setAdsWatched]
  );

  const handleRefresh = useCallback(() => {
    window.location.reload();
  }, []);
  let listeners = {};
  let cleanup = async () => {
    // AdMob.removeListener(RewardAdPluginEvents.Loaded);
    // AdMob.removeListener(RewardAdPluginEvents.FailedToLoad);
    // AdMob.removeListener(RewardAdPluginEvents.Showed);
    // AdMob.removeListener(RewardAdPluginEvents.Rewarded);
    await AdMob.removeAllListeners();
  };
  useEffect(() => {
    let initialFunction;

    const initializeAd = async () => {
      try {
        initialFunction = await initializeAdMob({
          setError,
          setIsLoading,
          setAdmobReward,
          setAdsWatched,
          setWhichAds,
          whichAds,
          userInfo,
          content,
          handleClick,
          listeners,
        });
      } catch (error) {
        console.error('Ad initialization error:', error);
        setError('AD_INIT_FAILED');
      } finally {
        setIsLoading(false);
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
  }, [initializeAdMob]);

  if (error) {
    return (
      <div className={styles['backdrop']}>
        <div className={styles['backdrop-box']}>
          <div className={styles['ad-badge']}>{t(`ad.label`)}</div>
          <div className={styles['modal']}>
            <h2>{content?.errorTitle}</h2>
            {/* <div>
              <p>{content?.errors[error]}</p>
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

  return (
    <AdLoadingComponent
      setIsLoading={setIsLoading}
      setWhichAds={setWhichAds}
      setAdsWatched={setAdsWatched}
    />
  );
};

export default AdComponentForShop;

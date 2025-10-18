import React, { useEffect, useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { AdMob, BannerAdPluginEvents } from '@capacitor-community/admob';
import { useTranslation } from 'react-i18next';
import { initializeAdMob } from './initializeAdMob';
import { initializeAdSense } from './initializeAdsense';
import { getLocalizedContent } from './getLocalizedContent';
import { setIsAnswered, setIsWaiting } from '../../store/booleanStore';
import { isAdsFreePassValid } from '../../lib/user/isAdsFreePassValid';
import { isDevelopmentMode, isProductionMode } from '@/utils/constants';

const isNative = Capacitor.isNativePlatform();

const AdComponentForBanner = ({ userInfo, isSignedIn = true, ...props }) => {
  const content = getLocalizedContent();
  const [error, setError] = useState(null);
  const [adLoaded, setAdLoaded] = useState(false);

  const whichAds = 3;

  const handleCancel = useCallback(e => {
    setError(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await AdMob.removeAllListeners();
      await AdMob.removeBanner();
    } catch (e) {
      console.warn('배너 제거 중 에러:', e);
    }
    window.location.reload();
  }, []);

  let listeners = {};
  let cleanup = async () => {
    // AdMob.removeListener(BannerAdPluginEvents.Loaded);
    // AdMob.removeListener(BannerAdPluginEvents.FailedToLoad);
    // AdMob.removeListener(BannerAdPluginEvents.Opened);
    // AdMob.removeListener(BannerAdPluginEvents.SizeChanged);
    // AdMob.removeListener(BannerAdPluginEvents.Closed);
    // AdMob.removeListener(BannerAdPluginEvents.AdImpression);
    await AdMob.removeAllListeners();
    await AdMob.removeBanner(); //! 파괴를 하지 않으면 중복됨. 겹침. 기존꺼 없애야 함. 타계정으로 로그인시, initialFunciton 변수 내용은 사라져도 기존 배너는 유지됨.
  };

  useEffect(() => {
    let initialFunction;
    const initializeAd = async () => {
      if (error === null) {
        try {
          if (isNative) {
            if (error !== null) return;
            initialFunction = await initializeAdMob({
              setError,
              whichAds,
              userInfo,
              content,
              listeners,
              margin: props?.margin,
              position: props?.position,
            });
            if (isDevelopmentMode) {
              console.log(
                '*************************initialFunction : ',
                JSON.stringify(initialFunction)
              );
              console.log(
                '*************************isSignedIn : ',
                JSON.stringify(isSignedIn)
              );
            }
          } else {
            await initializeAdSense(
              setError,
              setAdLoaded,
              undefined,
              undefined
            );
          }
        } catch (error) {
          console.error('Ad initialization error:', error);
          setError('AD_INIT_FAILED');
        }
      }
    };

    if (!isAdsFreePassValid(userInfo)) initializeAd();

    return () => {
      cleanup();
      // 즉시 실행되는 IIFE로 비동기 호출
      (async () => {
        await AdMob.removeAllListeners();
        await AdMob.removeBanner();
      })();
      Object.values(listeners).forEach(listener => listener.remove());
      listeners = {};
    };
  }, [error, initializeAdMob, initializeAdSense, whichAds, userInfo?.email]);

  // if (error) {
  //   return (
  //     <div className={styles['backdrop']}>
  //       <div className={styles['backdrop-box']}>
  //         <div className={styles['ad-badge']}>{t(`ad.label`)}</div>
  //         <div className={styles['modal']}>
  //           <h2>{content?.errorTitle}</h2>
  //           <div>
  //             <p>{content?.refreshSuggestion}</p>
  //           </div>
  //           <div className={styles['btn-box']}>
  //             <Button onClick={handleRefresh}>{content?.refreshButton}</Button>
  //             <CancelButton
  //               onClick={(e = null) => {
  //                 handleCancel(e);
  //               }}
  //             >
  //               {content?.cancelButton}
  //             </CancelButton>
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

export default AdComponentForBanner;

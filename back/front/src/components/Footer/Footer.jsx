// import React, { useState, useEffect } from 'react';
// import styles from '../../styles/scss/Footer.module.scss';
// import { useLanguageChange } from '@/hooks';
// import { useTranslation } from 'react-i18next';
// import AdComponentForBanner from '../../page/GoogleAd/AdComponentForBanner.jsx';
// import { Capacitor } from '@capacitor/core';
// import { Preferences } from '@capacitor/preferences';
// import { isNativeAppVertical } from '../utils/device/detectVertical.js';
// import { hasAccessToken } from '../../utils/storage/tokenCookie.jsx';
// import {
//   getAdsFree,
//   hasAccessTokenForPreference,
// } from '../../utils/storage/tokenPreference.jsx';
// import { useSelector } from 'react-redux';
// import { isAdsFreePassValid } from '../lib/user/isAdsFreePassValid.jsx';
// import { useOutletContext } from 'react-router-dom';

// const isNative = Capacitor.isNativePlatform();

// const Footer = props => {
//   const browserLanguage = useLanguageChange();
//   const userInfoInRedux = useSelector(state => state.userInfoStore.userInfo);
//   const isWaitingForRedux = useSelector(state => state.booleanStore.isWaiting);
//   const isAnsweredForRedux = useSelector(
//     state => state.booleanStore.isAnswered
//   );
//   const isReadyToShowDurumagiForRedux = useSelector(
//     state => state.booleanStore.isReadyToShowDurumagi
//   );
//   const { t } = useTranslation();
//   const totalQuoteSets = 3; // 총 인용구 세트 수
//   const [isFreeAdsMode, setFreeAdsMode] = useState(false);
//   const [currentQuoteSet, setCurrentQuoteSet] = useState(null);
//   // isWaitingForRedux, isAnsweredForRedux, isReadyToShowDurumagiForRedux
//   const [isBannerOpen, setBannerOpen] = useState(false);
//   const [isNativeScreenVertical, setNativeScreenVertical] = useState(() => {
//     return isNative && isNativeAppVertical();
//   });
//   const [isSignedIn, setIsSignedIn] = useState(null);

//   useEffect(() => {
//     if (isNative) {
//       hasAccessTokenForPreference().then(setIsSignedIn);
//     } else {
//       setIsSignedIn(hasAccessToken());
//     }
//   }, [userInfoInRedux]); // userInfoInRedux 등 필요한 의존성 추가

//   // 저장소에서 currentQuoteSet 가져오기
//   const getStoredQuoteSet = async () => {
//     try {
//       if (isNative) {
//         const { value } = await Preferences.get({ key: 'currentQuoteSet' });
//         return value ? parseInt(value, 10) : 1;
//       } else {
//         const stored = localStorage.getItem('currentQuoteSet');
//         return stored ? parseInt(stored, 10) : 1;
//       }
//     } catch (error) {
//       console.error('저장소 접근 오류:', error);
//       // return 1;
//     }
//   };

//   // 저장소에 currentQuoteSet 저장하기
//   const setStoredQuoteSet = async value => {
//     try {
//       if (isNative) {
//         await Preferences.set({
//           key: 'currentQuoteSet',
//           value: value.toString(),
//         });
//       } else {
//         localStorage.setItem('currentQuoteSet', value.toString());
//       }
//     } catch (error) {
//       console.error('저장소 저장 오류:', error);
//     }
//   };

//   // 로그인 상태 변경 시 처리 (로그인 시에만 리셋)
//   useEffect(() => {
//     const initializeQuoteSet = async () => {
//       const storedQuoteSet = await getStoredQuoteSet();
//       let wasSignedOut;
//       if (isNative) {
//         const { value } = await Preferences.get({ key: 'wasSignedIn' });
//         wasSignedOut = value !== 'true'; // 이전에 로그인 상태가 아니었는지 확인
//       } else {
//         wasSignedOut = localStorage.getItem('wasSignedIn') !== 'true';
//       }

//       if (isSignedIn) {
//         //? 로그인 상태
//         if (wasSignedOut) {
//           //? 로그인 직후
//           // 로그아웃에서 로그인 상태로 전환될 때만 currentQuoteSet을 1로 리셋
//           setCurrentQuoteSet(1);
//           await setStoredQuoteSet(1);
//           // 처리 후 로그인했던 상태로 바꿈.
//           if (isNative) {
//             await Preferences.set({
//               key: 'wasSignedIn',
//               value: 'true',
//             }); // 비로그인 상태 저장(중요)
//           } else {
//             localStorage.setItem('wasSignedIn', 'true'); // 비로그인 상태 저장(중요)
//           }
//         } else {
//           //? 로그인 상태에서 새로고침 시
//           // 저장소 값 사용
//           setCurrentQuoteSet(storedQuoteSet);
//         }
//       } else if (isSignedIn === false && isSignedIn !== null) {
//         //! 초기값을 false로 하면 비동기 특성상 true일 때도, 잠시나마 false로 초기화 되니 그때 false 로직 실행됨. 그래서 null값으로 따로 분별.
//         //? 비로그인 상태
//         if (wasSignedOut) {
//           //? 로그아웃된 상태에서 새로고침
//           // 저장소 값 사용
//           setCurrentQuoteSet(storedQuoteSet);
//         } else {
//           //? 로그인 상태에서 바로 로그아웃한 상태
//           // 저장소 값 사용
//           setCurrentQuoteSet(storedQuoteSet);

//           // 처리 후 로그아웃했던 상태로 바꿈.
//           if (isNative) {
//             await Preferences.set({
//               key: 'wasSignedIn',
//               value: 'false',
//             }); // 비로그인 상태 저장(중요)
//           } else {
//             localStorage.setItem('wasSignedIn', 'false'); // 비로그인 상태 저장(중요)
//           }
//         }
//       }
//     };

//     initializeQuoteSet();
//   }, [isSignedIn]); // isSignedIn 변경 시 실행

//   // currentQuoteSet 변경 시 저장소 업데이트
//   useEffect(() => {
//     if (currentQuoteSet) setStoredQuoteSet(currentQuoteSet);
//   }, [currentQuoteSet]);

//   useEffect(() => {
//     let isFree = async () => {
//       const result = await getAdsFree(userInfoInRedux);
//       setFreeAdsMode(result);
//     };
//     isFree();
//   }, [userInfoInRedux]);

//   useEffect(() => {
//     if (!isNative) return;

//     const handleResize = () => {
//       setNativeScreenVertical(isNativeAppVertical());
//     };

//     if (typeof window !== 'undefined') window.addEventListener('resize', handleResize);
//     if (typeof window !== 'undefined') window.addEventListener('orientationchange', handleResize);

//     // 초기값도 반영
//     handleResize();

//     return () => {
//       if (typeof window !== 'undefined') window.removeEventListener('resize', handleResize);
//       if (typeof window !== 'undefined') window.removeEventListener('orientationchange', handleResize);
//     };
//   }, []);

//   // 배너 표시 여부 처리
//   useEffect(() => {
//     if (isNative) {
//       let isVertical = isNativeAppVertical();

//       setBannerOpen(() => {
//         return (
//           isNative &&
//           !isAdsFreePassValid(userInfoInRedux) &&
//           !(
//             !props?.answerFormForApp?.isWaiting &&
//             !props?.answerFormForApp?.isAnswered
//           ) &&
//           (isWaitingForRedux ||
//             (isAnsweredForRedux &&
//               !isReadyToShowDurumagiForRedux &&
//               props?.isVoucherModeOnForApp) ||
//             (props?.isAdsWatchedForApp &&
//               !isReadyToShowDurumagiForRedux &&
//               !props?.isVoucherModeOnForApp &&
//               props?.whichTarotForApp === 2))
//         );
//       });
//       setNativeScreenVertical(() => {
//         return isNative && isVertical;
//       });
//     }
//     return () => {
//       setBannerOpen(false);
//     };
//   }, [
//     isNativeScreenVertical,
//     isSignedIn,
//     isWaitingForRedux,
//     isAnsweredForRedux,
//     isReadyToShowDurumagiForRedux,
//     props?.answerFormForApp?.isWaiting,
//     props?.answerFormForApp?.isAnswered,
//     props?.whichTarotForApp,
//     props?.isVoucherModeOnForApp,
//     props?.isAdsWatchedForApp,
//     userInfoInRedux,
//     isFreeAdsMode,
//   ]);

//   // 20초마다 인용구 회전
//   useEffect(() => {
//     const intervalId = setInterval(() => {
//       setCurrentQuoteSet(prevSet => (prevSet % totalQuoteSets) + 1);
//     }, 20000); // 20초마다 전환

//     return () => clearInterval(intervalId);
//   }, []);

//   const renderQuoteSet = setNumber => (
//     <>
//       <div
//         className={
//           browserLanguage === 'ja'
//             ? styles['quotation-japanese']
//             : styles['quotation']
//         }
//       >
//         {t(`footer.quotation${setNumber}-1`)}
//       </div>
//       <div
//         className={
//           browserLanguage === 'ja'
//             ? styles['quotation-japanese']
//             : styles['quotation']
//         }
//       >
//         {t(`footer.quotation${setNumber}-2`)}
//       </div>
//     </>
//   );
//   // currentQuoteSet이 null일 때는 아무것도 렌더링하지 않음(또는 로딩 표시)
//   if (currentQuoteSet === null) return null;
//   return (
//     <footer className={styles.footer}>
//       {isBannerOpen &&
//         !isAdsFreePassValid(userInfoInRedux) &&
//         isNativeScreenVertical && (
//           <AdComponentForBanner
//             userInfo={userInfoInRedux}
//             isSignedIn={isSignedIn}
//             position={
//               isNativeScreenVertical ? 'BOTTOM_CENTER' : 'BOTTOM_CENTER'
//             } // 배너 하단 여백
//             margin={isNativeScreenVertical ? 80 : 0} // 배너 하단 여백
//           />
//         )}
//       {isBannerOpen &&
//         !isAdsFreePassValid(userInfoInRedux) &&
//         !isNativeScreenVertical && (
//           <AdComponentForBanner
//             userInfo={userInfoInRedux}
//             isSignedIn={isSignedIn}
//             position={
//               isNativeScreenVertical ? 'BOTTOM_CENTER' : 'BOTTOM_CENTER'
//             } // 배너 하단 여백
//             margin={isNativeScreenVertical ? 80 : 0} // 배너 하단 여백
//           />
//         )}
//       {renderQuoteSet(currentQuoteSet)}
//       {/* <div className={styles['email']}>Email: cosmostarotinfo@gmail.com</div> */}
//     </footer>
//   );
// };

// export default Footer;

import React, { useState, useEffect } from 'react';
import styles from './Footer.module.scss';
import { useLanguageChange } from '@/hooks';
import { useTranslation } from 'react-i18next';
import AdComponentForBanner from '../GoogleAd/AdComponentForBanner.jsx';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { isNativeAppVertical } from '../../utils/device/detectVertical.js';
import { hasAccessToken } from '../../utils/storage/tokenCookie.jsx';
import {
  getAdsFree,
  hasAccessTokenForPreference,
} from '../../utils/storage/tokenPreference.jsx';
import { useSelector } from 'react-redux';
import { isAdsFreePassValid } from '../../lib/user/isAdsFreePassValid.jsx';
import { useOutletContext } from 'react-router-dom';

const isNative = Capacitor.isNativePlatform();

const Footer = props => {
  const browserLanguage = useLanguageChange();
  const userInfoInRedux = useSelector(state => state.userInfoStore.userInfo);
  const isWaitingForRedux = useSelector(state => state.booleanStore.isWaiting);
  const isAnsweredForRedux = useSelector(
    state => state.booleanStore.isAnswered
  );
  const isReadyToShowDurumagiForRedux = useSelector(
    state => state.booleanStore.isReadyToShowDurumagi
  );
  const { t } = useTranslation();
  const totalQuoteSets = 3; // 총 인용구 세트 수
  const [isFreeAdsMode, setFreeAdsMode] = useState(false);
  const [currentQuoteSet, setCurrentQuoteSet] = useState(null);

  // 배너 상태를 초기값 없이 설정
  const [isBannerOpen, setBannerOpen] = useState(false);
  const [isNativeScreenVertical, setNativeScreenVertical] = useState(() => {
    return isNative && isNativeAppVertical();
  });
  const [isSignedIn, setIsSignedIn] = useState(null);

  useEffect(() => {
    if (isNative) {
      hasAccessTokenForPreference().then(setIsSignedIn);
    } else {
      setIsSignedIn(hasAccessToken());
    }
  }, [userInfoInRedux]); // userInfoInRedux 등 필요한 의존성 추가

  // 저장소에서 currentQuoteSet 가져오기
  const getStoredQuoteSet = async () => {
    try {
      if (isNative) {
        const { value } = await Preferences.get({ key: 'currentQuoteSet' });
        return value ? parseInt(value, 10) : 1;
      } else {
        const stored = localStorage.getItem('currentQuoteSet');
        return stored ? parseInt(stored, 10) : 1;
      }
    } catch (error) {
      console.error('저장소 접근 오류:', error);
      return 1;
    }
  };

  // 저장소에 currentQuoteSet 저장하기
  const setStoredQuoteSet = async value => {
    try {
      if (isNative) {
        await Preferences.set({
          key: 'currentQuoteSet',
          value: value.toString(),
        });
      } else {
        localStorage.setItem('currentQuoteSet', value.toString());
      }
    } catch (error) {
      console.error('저장소 저장 오류:', error);
    }
  };

  // 로그인 상태 변경 시 처리 (로그인 시에만 리셋)
  useEffect(() => {
    const initializeQuoteSet = async () => {
      const storedQuoteSet = await getStoredQuoteSet();
      let wasSignedOut;
      if (isNative) {
        const { value } = await Preferences.get({ key: 'wasSignedIn' });
        wasSignedOut = value !== 'true'; // 이전에 로그인 상태가 아니었는지 확인
      } else {
        wasSignedOut = localStorage.getItem('wasSignedIn') !== 'true';
      }

      if (isSignedIn) {
        if (wasSignedOut) {
          // 로그아웃에서 로그인 상태로 전환될 때만 currentQuoteSet을 1로 리셋
          setCurrentQuoteSet(1);
          await setStoredQuoteSet(1);
          // 처리 후 로그인했던 상태로 바꿈.
          if (isNative) {
            await Preferences.set({
              key: 'wasSignedIn',
              value: 'true',
            }); // 비로그인 상태 저장(중요)
          } else {
            localStorage.setItem('wasSignedIn', 'true'); // 비로그인 상태 저장(중요)
          }
        } else {
          // 저장소 값 사용
          setCurrentQuoteSet(storedQuoteSet);
        }
      } else if (isSignedIn === false && isSignedIn !== null) {
        if (wasSignedOut) {
          // 저장소 값 사용
          setCurrentQuoteSet(storedQuoteSet);
        } else {
          // 저장소 값 사용
          setCurrentQuoteSet(storedQuoteSet);

          // 처리 후 로그아웃했던 상태로 바꿈.
          if (isNative) {
            await Preferences.set({
              key: 'wasSignedIn',
              value: 'false',
            }); // 비로그인 상태 저장(중요)
          } else {
            localStorage.setItem('wasSignedIn', 'false'); // 비로그인 상태 저장(중요)
          }
        }
      }
    };

    initializeQuoteSet();
  }, [isSignedIn]); // isSignedIn 변경 시 실행

  // currentQuoteSet 변경 시 저장소 업데이트
  useEffect(() => {
    if (currentQuoteSet) setStoredQuoteSet(currentQuoteSet);
  }, [currentQuoteSet]);

  useEffect(() => {
    let isFree = async () => {
      const result = await getAdsFree(userInfoInRedux);
      setFreeAdsMode(result);
    };
    isFree();
  }, [userInfoInRedux]);

  useEffect(() => {
    if (!isNative) return;

    const handleResize = () => {
      setNativeScreenVertical(isNativeAppVertical());
    };

    if (typeof window !== 'undefined')
      window.addEventListener('resize', handleResize);
    if (typeof window !== 'undefined')
      window.addEventListener('orientationchange', handleResize);

    // 초기값도 반영
    handleResize();

    return () => {
      if (typeof window !== 'undefined')
        window.removeEventListener('resize', handleResize);
      if (typeof window !== 'undefined')
        window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  // 배너 표시 여부 처리 - 수정된 부분
  useEffect(() => {
    if (isNative) {
      const shouldShowBanner =
        isNative &&
        !isAdsFreePassValid(userInfoInRedux) &&
        !(
          !props?.answerFormForApp?.isWaiting &&
          !props?.answerFormForApp?.isAnswered &&
          !isWaitingForRedux &&
          !isAnsweredForRedux
        ) &&
        (isWaitingForRedux ||
          (isAnsweredForRedux &&
            !isReadyToShowDurumagiForRedux &&
            props?.isVoucherModeOnForApp) ||
          (props?.isAdsWatchedForApp &&
            !isReadyToShowDurumagiForRedux &&
            !props?.isVoucherModeOnForApp &&
            props?.whichTarotForApp === 2));

      setBannerOpen(shouldShowBanner);
      setNativeScreenVertical(isNativeAppVertical());
    } else {
      setBannerOpen(false);
    }
  }, [
    isNativeScreenVertical,
    isSignedIn,
    isWaitingForRedux,
    isAnsweredForRedux,
    isReadyToShowDurumagiForRedux,
    props?.answerFormForApp?.isWaiting,
    props?.answerFormForApp?.isAnswered,
    props?.whichTarotForApp,
    props?.isVoucherModeOnForApp,
    props?.isAdsWatchedForApp,
    userInfoInRedux,
    isFreeAdsMode,
  ]);

  // 20초마다 인용구 회전
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentQuoteSet(prevSet => (prevSet % totalQuoteSets) + 1);
    }, 20000); // 20초마다 전환

    return () => clearInterval(intervalId);
  }, []);

  const renderQuoteSet = setNumber => (
    <>
      <div
        className={
          browserLanguage === 'ja'
            ? styles['quotation-japanese']
            : styles['quotation']
        }
      >
        {t(`footer.quotation${setNumber}-1`)}
      </div>
      <div
        className={
          browserLanguage === 'ja'
            ? styles['quotation-japanese']
            : styles['quotation']
        }
      >
        {t(`footer.quotation${setNumber}-2`)}
      </div>
    </>
  );

  // currentQuoteSet이 null일 때는 아무것도 렌더링하지 않음(또는 로딩 표시)
  if (currentQuoteSet === null) return null;

  return (
    <footer className={styles.footer}>
      {isBannerOpen &&
        !isAdsFreePassValid(userInfoInRedux) &&
        isNativeScreenVertical && (
          <AdComponentForBanner
            userInfo={userInfoInRedux}
            isSignedIn={isSignedIn}
            position={
              isNativeScreenVertical ? 'BOTTOM_CENTER' : 'BOTTOM_CENTER'
            } // 배너 하단 여백
            margin={isNativeScreenVertical ? 80 : 0} // 배너 하단 여백
          />
        )}
      {isBannerOpen &&
        !isAdsFreePassValid(userInfoInRedux) &&
        !isNativeScreenVertical && (
          <AdComponentForBanner
            userInfo={userInfoInRedux}
            isSignedIn={isSignedIn}
            position={
              isNativeScreenVertical ? 'BOTTOM_CENTER' : 'BOTTOM_CENTER'
            } // 배너 하단 여백
            margin={isNativeScreenVertical ? 80 : 0} // 배너 하단 여백
          />
        )}
      {renderQuoteSet(currentQuoteSet)}
      {/* <div className={styles['email']}>Email: cosmostarotinfo@gmail.com</div> */}
    </footer>
  );
};

export default Footer;

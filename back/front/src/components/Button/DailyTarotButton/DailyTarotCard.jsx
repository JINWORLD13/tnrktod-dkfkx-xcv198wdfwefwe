// import React, { useEffect, useState } from 'react';
// import TarotCardChoiceForm from '../../../Page/TarotCardForm/TarotCardChoiceForm';
// import OneCardSpreadForm from '../../../Page/TarotCardForm/TarotCardSpreadForm/OneCardSpreadForm';
// import DailyTarotFortune from './DailyTarotFortune';
// import { DailyCardButton } from './DailyCardButton';
// import { getTodayCardForNative } from '../../../utils/storage/tokenPreference';
// import { getTodayCard } from '../../../utils/storage/tokenLocalStorage';
// import { Capacitor } from '@capacitor/core';

// const DailyTarotCard = ({
//   modalForm,
//   answerForm,
//   isReadyToShowDurumagi,
//   userInfo,
//   cardForm,
//   todayCardIndexInLocalStorage,
//   styles,
//   handleStateGroup,
//   updateCardForm,
//   stateGroup,
//   setStateGroup,
//   setClickedForTodayCardFromHome,
// }) => {
//   const [isClickedForTodayCard, setClickedForTodayCard] = useState(false);

//   useEffect(() => {
//     setClickedForTodayCardFromHome(isClickedForTodayCard);
//   }, [isClickedForTodayCard]);

//   // 조건 체크 함수
//   const isConditionMet = () => {
//     return (
//       !modalForm?.spread &&
//       !modalForm?.tarot &&
//       !answerForm?.isWaiting &&
//       !answerForm?.isAnswered &&
//       !isReadyToShowDurumagi &&
//       userInfo?.email !== '' &&
//       userInfo?.email !== undefined
//     );
//   };

//   // 조건 체크 함수
//   const isCardChoiceConditionMet = () => {
//     return isClickedForTodayCard && isConditionMet();
//   };

//   const checkIfNewDay = async userInfo => {
//     if (!userInfo?.email) return false;

//     const isNative = Capacitor.isNativePlatform();

//     if (isNative) {
//       const result = await getTodayCardForNative(userInfo);
//       return result === null; // null이면 새로운 날이거나 데이터 없음
//     } else {
//       const result = getTodayCard(userInfo);
//       return result === null; // null이면 새로운 날이거나 데이터 없음
//     }
//   };

//   return (
//     <>
//       {isConditionMet() && (
//         <DailyCardButton
//           stateGroup={stateGroup}
//           setStateGroup={setStateGroup}
//           setClickedForTodayCard={setClickedForTodayCard}
//           styles={styles}
//           checkIfNewDay={checkIfNewDay}
//         />
//       )}
//       {isCardChoiceConditionMet() && (
//         <div className={styles['background']}>
//           {cardForm?.selectedCardIndexList?.length === 0 &&
//           !todayCardIndexInLocalStorage ? (
//             <TarotCardChoiceForm
//               stateGroup={stateGroup}
//               setStateGroup={setStateGroup}
//               handleStateGroup={handleStateGroup}
//               userInfo={userInfo}
//               from={1}
//               todayCardIndex={todayCardIndexInLocalStorage}
//               isClickedForTodayCard={isClickedForTodayCard}
//             />
//           ) : (
//             <>
//               <OneCardSpreadForm
//                 cardForm={cardForm}
//                 updateCardForm={updateCardForm}
//                 userInfo={userInfo}
//                 from={1}
//                 todayCardIndex={todayCardIndexInLocalStorage}
//               />
//               <DailyTarotFortune
//                 cardForm={cardForm}
//                 userInfo={userInfo}
//                 todayCardIndex={todayCardIndexInLocalStorage}
//                 checkIfNewDay={checkIfNewDay}
//               />
//             </>
//           )}
//         </div>
//       )}
//     </>
//   );
// };

// export default DailyTarotCard;

// 시나리오 1: 사용자가 11:59에 앱을 백그라운드로 → 12:30에 다시 실행
// → appStateChange 리스너가 날짜 변경을 감지

// 시나리오 2: 앱이 활성 상태에서 자정 넘김
// → setInterval과 setTimeout이 정확한 시점 감지

// 시나리오 3: 화면 잠금 후 다음날 앱 실행
// → 포그라운드 복귀 시 모든 리스너가 작동하여 확실히 감지

import React, { useEffect, useState, useRef, useCallback } from 'react';
import TarotCardChoiceForm from '../../TarotCardForm/TarotCardChoiceForm';
import OneCardSpreadForm from '../../TarotCardForm/TarotCardSpreadForm/OneCardSpreadForm';
import DailyTarotFortune from './DailyTarotFortune';
import { DailyCardButton } from './DailyCardButton';
import { getTodayCardForNative } from '../../../utils/storage/tokenPreference';
import { getTodayCard } from '../../../utils/storage/tokenLocalStorage';
import { Capacitor } from '@capacitor/core';
// 네이티브 앱용 - 앱이 포그라운드로 돌아올 때 체크
import { App } from '@capacitor/app';
import { isDevelopmentMode } from '@/utils/constants';

const DailyTarotCard = ({
  modalForm,
  answerForm,
  isReadyToShowDurumagi,
  userInfo,
  cardForm,
  todayCardIndexInLocalStorage,
  styles,
  handleStateGroup,
  updateCardForm,
  stateGroup,
  setStateGroup,
  setClickedForTodayCardFromHome,
  isTokenFromNavbar,
}) => {
  const [isClickedForTodayCard, setClickedForTodayCard] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());
  const [forceUpdate, setForceUpdate] = useState(0);
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setClickedForTodayCardFromHome(isClickedForTodayCard);
  }, [isClickedForTodayCard]);

  // 조건 체크 함수 - Navbar의 로그인 감지 기능(useAuth) 사용
  const isConditionMet = () => {
    return (
      isTokenFromNavbar &&
      !modalForm?.spread &&
      !modalForm?.tarot &&
      !answerForm?.isWaiting &&
      !answerForm?.isAnswered &&
      !isReadyToShowDurumagi &&
      userInfo?.email !== '' &&
      userInfo?.email !== undefined &&
      userInfo?.email !== null &&
      Object.keys(userInfo || {}).length > 0 // userInfo 자체가 비어있는지 체크
    );
  };

  // 조건 체크 함수
  const isCardChoiceConditionMet = () => {
    return isClickedForTodayCard && isConditionMet();
  };

  const checkIfNewDay = async userInfo => {
    if (!userInfo?.email) return false;

    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      const result = await getTodayCardForNative(userInfo);
      return result === null;
    } else {
      const result = getTodayCard(userInfo);
      return result === null;
    }
  };

  // 날짜 변경을 처리하는 함수
  const handleDateChange = useCallback(async () => {
    if (!userInfo?.email) return;

    if (isDevelopmentMode) {
      console.log('날짜가 변경되었습니다. 상태를 초기화합니다.');
    }

    // 모든 관련 상태 초기화
    setClickedForTodayCard(false);
    updateCardForm(prevCardForm => ({
      ...prevCardForm,
      shuffle: 0,
      isReadyToShuffle: false,
      isSuffleFinished: false,
      spread: false,
      flippedIndex: [],
      selectedCardIndexList: [],
    }));

    // 강제 리렌더링
    setForceUpdate(prev => prev + 1);
  }, [userInfo?.email, updateCardForm]);

  // 실시간 날짜 감시
  useEffect(() => {
    if (!userInfo?.email) return;

    // 현재 시간을 기준으로 다음 자정까지의 시간 계산
    const scheduleNextMidnightCheck = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // 정확히 자정

      const timeUntilMidnight = tomorrow.getTime() - now.getTime();

      // 자정 후 즉시 체크하는 타이머 (50ms 후)
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const newDate = new Date().toDateString();
        if (isDevelopmentMode) {
          console.log(
            `자정 체크: ${new Date().toLocaleTimeString()} - 날짜 변경: ${
              currentDate !== newDate
            }`
          );
        }
        if (currentDate !== newDate) {
          setCurrentDate(newDate);
          handleDateChange();
        }
        // 다음 자정을 위해 다시 스케줄링
        scheduleNextMidnightCheck();
      }, timeUntilMidnight + 50); // 자정 + 50ms

      // console.log(
      //   `다음 자정 체크: ${tomorrow.toLocaleString()}, ${Math.round(
      //     timeUntilMidnight / 1000
      //   )}초 후`
      // );
    };

    // 1초마다 날짜 체크 (더 정확한 감지)
    const startPeriodicCheck = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        const newDate = new Date().toDateString();
        if (currentDate !== newDate) {
          if (isDevelopmentMode) {
            console.log(
              `주기적 체크에서 날짜 변경 감지: ${new Date().toLocaleTimeString()}`
            );
          }
          setCurrentDate(newDate);
          handleDateChange();
        }
      }, 1000); // 1초마다 체크 (자정 전후 정확한 감지)
    };

    scheduleNextMidnightCheck();
    startPeriodicCheck();

    // 컴포넌트 언마운트 시 타이머 정리
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [userInfo?.email, currentDate, handleDateChange]);

  useEffect(() => {
    let stateChangeListener;

    if (Capacitor.isNativePlatform()) {
      stateChangeListener = App.addListener(
        'appStateChange',
        ({ isActive }) => {
          if (isActive) {
            const newDate = new Date().toDateString();
            if (currentDate !== newDate) {
              setCurrentDate(newDate);
              handleDateChange();
            }
          }
        }
      );
    }

    return () => {
      if (stateChangeListener) {
        stateChangeListener.remove();
      }
    };
  }, [currentDate, handleDateChange]);

  // 앱이 다시 활성화될 때도 체크 (모바일용)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const newDate = new Date().toDateString();
        if (currentDate !== newDate) {
          if (isDevelopmentMode) {
            console.log('앱 활성화 시 날짜 변경 감지');
          }
          setCurrentDate(newDate);
          handleDateChange();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [currentDate, handleDateChange]);

  return (
    <div key={forceUpdate}>
      {isConditionMet() && (
        <DailyCardButton
          stateGroup={stateGroup}
          setStateGroup={setStateGroup}
          setClickedForTodayCard={setClickedForTodayCard}
          checkIfNewDay={checkIfNewDay}
          userInfo={userInfo}
          isTokenFromNavbar={isTokenFromNavbar}
        />
      )}
      {isCardChoiceConditionMet() && (
        <div className={styles['background']}>
          {cardForm?.selectedCardIndexList?.length === 0 &&
          !todayCardIndexInLocalStorage ? (
            <TarotCardChoiceForm
              stateGroup={stateGroup}
              setStateGroup={setStateGroup}
              handleStateGroup={handleStateGroup}
              userInfo={userInfo}
              from={1}
              todayCardIndex={todayCardIndexInLocalStorage}
              isClickedForTodayCard={isClickedForTodayCard}
            />
          ) : (
            <>
              <OneCardSpreadForm
                cardForm={cardForm}
                updateCardForm={updateCardForm}
                userInfo={userInfo}
                from={1}
                todayCardIndex={todayCardIndexInLocalStorage}
              />
              <DailyTarotFortune
                cardForm={cardForm}
                userInfo={userInfo}
                todayCardIndex={todayCardIndexInLocalStorage}
                checkIfNewDay={checkIfNewDay}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DailyTarotCard;

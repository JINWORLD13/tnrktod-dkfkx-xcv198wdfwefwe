import React, { useEffect, useRef, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
const isNative = Capacitor.isNativePlatform();
import styles from './DailyCardButton.module.scss';

export const DailyCardButton = ({
  stateGroup,
  setStateGroup,
  setClickedForTodayCard,
  checkIfNewDay,
  isTokenFromNavbar,
  ...props
}) => {
  // Navbar의 로그인 감지 기능(useAuth) 사용
  const checkLoginStatus = () => {
    if (!isTokenFromNavbar) {
      updateBlinkModalForLoginOpen(true);
      return false;
    }
    return true;
  };
  const [key, setKey] = useState(Date.now()); // 강제 리렌더링용
  const { updateCardForm, updateBlinkModalForLoginOpen, ...rest } =
    setStateGroup;
  const handleClick = async e => {
    const result = checkLoginStatus();
    if (!result) return;

    // 자정이 지났는지 체크하고 필요하면 상태 초기화
    if (checkIfNewDay()) {
      setKey(Date.now());
      // 카드 폼도 함께 초기화
      updateCardForm(prevCardForm => ({
        ...prevCardForm,
        shuffle: 0,
        isReadyToShuffle: false,
        isSuffleFinished: false,
        spread: false,
        flippedIndex: [],
        selectedCardIndexList: [],
      }));
    }

    setClickedForTodayCard(prev => {
      if (
        stateGroup?.answerForm?.isWaiting ||
        stateGroup?.answerForm?.isAnswered ||
        stateGroup?.answerForm?.isSubmitted ||
        stateGroup?.modalForm?.spread ||
        stateGroup?.modalForm?.tarot
      )
        return false;

      // updateCardForm(prevCardForm => ({
      //   ...prevCardForm,
      //   shuffle: 0,
      //   isReadyToShuffle: false,
      //   isSuffleFinished: false,
      //   spread: false,
      //   flippedIndex: [],
      //   selectedCardIndexList: [],
      // }));
      return !prev;
    });
  };

  const dailyTarotButton = useRef(null);

  useEffect(() => {
    let backButtonListener;

    // ESC 키 이벤트 핸들러
    const handleEscKey = event => {
      if (event.key === 'Escape') {
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
      }
    };
    // 모바일 뒤로가기 버튼 핸들러
    const handleBackButton = event => {
      // event.preventDefault();
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
    };

    // Native platform back button handling
    if (isNative) {
      backButtonListener = App.addListener('backButton', e => {
        handleBackButton(e);
        return false; // Prevent default back button behavior
      });
    }

    if (!isNative) {
      if (typeof window !== 'undefined')
        window?.addEventListener('keydown', handleEscKey);
    }

    // Cleanup function
    return () => {
      if (isNative && backButtonListener) {
        backButtonListener.remove();
      } else if (!isNative) {
        if (typeof window !== 'undefined')
          window?.removeEventListener('keydown', handleEscKey);
      }
    };
  }, [dailyTarotButton, handleClick]);

  return (
    <div
      key={key}
      className={styles['today-card']}
      onClick={handleClick} // React의 onClick 이벤트 핸들러는 비동기 처리를 기다리지 않아도 되도록 설계되어 있어요. React는 이벤트가 발생하면 함수를 바로 실행하고, 그 안에서 비동기 작업(await)이 완료되길 기다리지 않아도 괜찮아요. 그래서 onClick={handleClick}처럼 바로 함수를 연결해도 문제가 없는 거예요.
      ref={dailyTarotButton}
    >
      <p>TODAY</p>
    </div>
  );
};

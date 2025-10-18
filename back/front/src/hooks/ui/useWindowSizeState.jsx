import { useState, useEffect } from 'react';

const useWindowSizeState = () => {
  // 초기 설정 및 변수선언
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  

  // 기능 설정 (크기 변경 함수)
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
    setWindowHeight(window.innerHeight);
  };

  // 실시간 구동 -> 이벤트에 반응하도록 -> useEffect와 addEventListenr
  useEffect(() => {
    // Component mount: add event listener
    window.addEventListener('resize', handleResize);

    // Component unmount: remove event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // 실시간 값 반영
  return { windowWidth, windowHeight };
};

export default useWindowSizeState;

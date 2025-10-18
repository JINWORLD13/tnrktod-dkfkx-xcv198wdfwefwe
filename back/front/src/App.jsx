/*eslint-disable*/
import React, { Suspense, useState } from 'react';
import Navbar from './components/Navbar/Navbar.jsx';
import Footer from './components/Footer/Footer.jsx';
import StarryBackground from './components/StarryBackground/StarryBackground.jsx';
import { Outlet } from 'react-router-dom';
import SEOMetaTags from './components/Helmet/SEOMetaTags.jsx';
import { Capacitor } from '@capacitor/core';
import LoadingForm from './components/Loading/Loading.jsx';
import AutoSEO from './components/AutoSEO/AutoSeo.jsx';
import MusicPlayer from './components/MusicPlayer/MusicPlayer.jsx';
import MusicStartNotice from './components/MusicPlayer/MusicStartNotice.jsx';
import { useMusicSettings } from '@/hooks';

const isNative = Capacitor.isNativePlatform();

function App() {
  // 앱 상태 초기화: 네이티브 앱은 광고 모드로 시작
  // App state initialization: native app starts with ad mode
  // アプリ状態初期化：ネイティブアプリは広告モードで開始
  const [isVoucherModeOnForApp, setIsVoucherModeOnForApp] = useState(() => {
    if (isNative) return false;
    if (!isNative) return true;
  });
  const [whichTarotForApp, setWhichTarotForApp] = useState(2);
  const [isAdsWatchedForApp, setAdsWatchedForApp] = useState(false);
  const [answerFormForApp, setAnswerFormForApp] = useState(false);

  // // App.jsx 또는 메인 컴포넌트에서
  // useEffect(() => {
  //   // WebGL 렌더링이 완료되면
  //   const checkWebGL = () => {
  //     const canvas = document.querySelector('canvas');
  //     if (canvas && canvas.getContext('webgl')) {
  //       console.log('Three.js 렌더링 완료');
  //       window.dispatchEvent(new Event('app-rendered'));
  //     } else {
  //       setTimeout(checkWebGL, 100);
  //     }
  //   };

  //   setTimeout(checkWebGL, 2000);
  // }, []);

  return (
    <>
      <AutoSEO>
        <div>
          {/* 애니메이션 배경: 별똥별 효과 */}
          {/* Animated background: shooting stars effect */}
          {/* アニメーション背景：流れ星エフェクト */}
          <StarryBackground />

          {/* {isMusicSettingsLoaded && <MusicPlayer />} */}
          {/* {isMusicSettingsLoaded && <MusicStartNotice />} */}
          <Navbar
            setAnswerFormForApp={setAnswerFormForApp}
            setAdsWatchedForApp={setAdsWatchedForApp}
          />
          <Suspense fallback={<LoadingForm />}>
            <Outlet
              context={{
                setWhichTarotForApp,
                setIsVoucherModeOnForApp,
                setAdsWatchedForApp,
                setAnswerFormForApp,
              }}
            />
          </Suspense>
          <Footer
            whichTarotForApp={whichTarotForApp}
            isVoucherModeOnForApp={isVoucherModeOnForApp}
            isAdsWatchedForApp={isAdsWatchedForApp}
            answerFormForApp={answerFormForApp}
          />
        </div>
      </AutoSEO>
    </>
  );
}

export default App;

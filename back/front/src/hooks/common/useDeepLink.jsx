import { useEffect } from 'react';
import { Browser } from '@capacitor/browser';
import { App } from '@capacitor/app';
import {
  setAccessTokenForPreference,
  setRefreshTokenForPreference,
} from '../../utils/storage/tokenPreference.jsx';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

/**
 * Capacitor 딥링크 처리를 위한 커스텀 훅
 * @param {string} appUrlScheme - 앱 URL 스킴 (예: 'cosmostarot')
 * @param {string} appHost - 앱 호스트 (예: 'cosmos-tarot.com')
 */
const useDeepLink = (appUrlScheme, appHost) => {
  useEffect(() => {
    if (!isNative) return;

    const handleAppUrlOpen = async data => {
      // 로그인 및 로그아웃 후처리
      await Browser.close();

      // 로그인 후
      if (data.url.startsWith(`${appUrlScheme}://${appHost}`)) {
        const url = new URL(data.url);
        const accessToken = url.searchParams.get('cos'); // accessTokenCosmos
        const refreshToken = url.searchParams.get('sin'); // refreshTokenCosmos

        if (accessToken) await setAccessTokenForPreference(accessToken);
        if (refreshToken) await setRefreshTokenForPreference(refreshToken);
      }

      window.location.reload();
    };

    // 앱에서만 딥링크 리스너 설정
    const urlOpenListener = App.addListener('appUrlOpen', handleAppUrlOpen);

    return () => {
      urlOpenListener.remove();
    };
  }, [appUrlScheme, appHost]);
};

export default useDeepLink;

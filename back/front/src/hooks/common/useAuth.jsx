import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hasAccessToken } from '../../utils/storage/tokenCookie.jsx';
import {
  hasAccessTokenForPreference,
  removeAccessTokensForPreference,
  removeRefreshTokensForPreference,
} from '../../utils/storage/tokenPreference.jsx';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

const isNative = Capacitor.isNativePlatform();

// 인증 Hook: Google OAuth 로그인/로그아웃, 토큰 관리
// Auth Hook: Google OAuth login/logout, token management
// 認証フック：Google OAuthログイン/ログアウト、トークン管理
const useAuth = () => {
  const navigate = useNavigate();
  const [isToken, setIsToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);

  const serverUrl = import.meta.env.VITE_SERVER_URL;
  const appUrlScheme = 'cosmostarot';
  const appHost = 'cosmos-tarot.com';

  // 토큰 유효성 확인: 웹/네이티브 앱 분기
  // Check token validity: web/native app branching
  // トークン有効性確認：ウェブ/ネイティブアプリ分岐
  useEffect(() => {
    const checkToken = async () => {
      setIsCheckingToken(true);
      try {
        if (isNative) {
          const hasToken = await hasAccessTokenForPreference();
          setIsToken(hasToken);
        } else {
          setIsToken(hasAccessToken());
        }
      } finally {
        setIsCheckingToken(false);
      }
    };
    checkToken();
  }, []);

  // Google OAuth 로그인: 네이티브는 App Browser, 웹은 리다이렉트
  // Google OAuth login: native uses App Browser, web uses redirect
  // Google OAuthログイン：ネイティブはアプリブラウザ、ウェブはリダイレクト
  const signin = async (isAnsweredForRedux, isWaitingForRedux) => {
    if (isAnsweredForRedux || isWaitingForRedux) return;

    const loginUrl = `${serverUrl}/auth/google/sign`;

    if (isNative) {
      await Preferences.set({ key: 'wasSignedIn', value: 'false' });
    } else {
      localStorage.setItem('wasSignedIn', 'false');
    }

    if (isNative) {
      const redirectUrl = `${appUrlScheme}://${appHost}`;
      await Browser.open({
        url: `${loginUrl}?redirect_uri=${encodeURIComponent(redirectUrl)}`,
      });
    } else {
      window.open(loginUrl, '_self');
    }
  };

  // 로그아웃: 토큰 제거 + 세션 클리어
  // Logout: remove tokens + clear session
  // ログアウト：トークン削除 + セッションクリア
  const logout = async (isAnsweredForRedux, isWaitingForRedux) => {
    if (isAnsweredForRedux || isWaitingForRedux) return;

    const logoutUrl = `${serverUrl}/auth/google/logout`;

    if (isNative) {
      await Preferences.set({ key: 'wasSignedIn', value: 'true' });
    } else {
      localStorage.setItem('wasSignedIn', 'true');
    }

    if (isNative) {
      await removeAccessTokensForPreference();
      await removeRefreshTokensForPreference();
      navigate('/');
      window.location.reload();
    } else {
      window.location.reload();
      window.open(logoutUrl, '_self');
    }
  };

  return {
    isToken,
    isCheckingToken,
    signin,
    logout,
  };
};

export default useAuth;

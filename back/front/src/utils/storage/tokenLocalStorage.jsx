/**
 * Token LocalStorage Management Module
 * 토큰 로컬스토리지 관리 모듈
 * トークンLocalStorage管理モジュール
 *
 * Note: This module is primarily for development/testing purposes.
 * For production, use tokenCookie.jsx (web) or tokenPreference.jsx (native app).
 *
 * 참고: 이 모듈은 주로 개발/테스트 목적입니다.
 * 프로덕션에서는 tokenCookie.jsx(웹) 또는 tokenPreference.jsx(네이티브 앱)를 사용하세요.
 *
 * 注意：このモジュールは主に開発/テスト目的です。
 * 本番環境ではtokenCookie.jsx（Web）またはtokenPreference.jsx（ネイティブアプリ）を使用してください。
 *
 * Security Warning:
 * - LocalStorage is vulnerable to XSS attacks
 * - Tokens stored here are accessible by any JavaScript code
 * - Use httpOnly cookies in production for better security
 *
 * 보안 경고:
 * - LocalStorage는 XSS 공격에 취약합니다
 * - 여기 저장된 토큰은 모든 JavaScript 코드에서 접근 가능합니다
 * - 프로덕션에서는 더 나은 보안을 위해 httpOnly 쿠키를 사용하세요
 *
 * セキュリティ警告：
 * - LocalStorageはXSS攻撃に脆弱です
 * - ここに保存されたトークンはすべてのJavaScriptコードからアクセス可能です
 * - 本番環境ではより良いセキュリティのためhttpOnly Cookieを使用してください
 */

// LocalStorage configuration from environment variables
// 환경변수에서 로컬스토리지 설정값 가져오기
// 環境変数からLocalStorage設定値を取得
const CONFIG = {
  accessKey: import.meta.env.VITE_STORAGE_KEY_A,
  refreshKey: import.meta.env.VITE_STORAGE_KEY_B,
  gAccessKey: import.meta.env.VITE_STORAGE_KEY_C,
  gRefreshKey: import.meta.env.VITE_STORAGE_KEY_D,
};

/**
 * Set JWT access token in localStorage
 * JWT 액세스 토큰을 localStorage에 저장
 * JWTアクセストークンをlocalStorageに保存
 *
 * @param {string} accessTokenKey - JWT access token
 */
export const setAccessToken = accessTokenKey => {
  if (accessTokenKey !== null && accessTokenKey !== undefined) {
    localStorage.setItem(CONFIG.accessKey, accessTokenKey);
  }
};

/**
 * Set JWT refresh token in localStorage
 * JWT 리프레시 토큰을 localStorage에 저장
 * JWTリフレッシュトークンをlocalStorageに保存
 *
 * @param {string} refreshTokenKey - JWT refresh token
 */
export const setRefreshToken = refreshTokenKey => {
  if (refreshTokenKey !== null && refreshTokenKey !== undefined) {
    localStorage.setItem(CONFIG.refreshKey, refreshTokenKey);
  }
};

/**
 * Get JWT access token from localStorage
 * localStorage에서 JWT 액세스 토큰 가져오기
 * localStorageからJWTアクセストークンを取得
 *
 * @returns {string|null} Access token or null if not found
 */
export const getAccessToken = () => {
  const keyValue = localStorage?.getItem(CONFIG.accessKey) ?? null;
  return keyValue === undefined ? null : keyValue;
};

/**
 * Get JWT refresh token from localStorage
 * localStorage에서 JWT 리프레시 토큰 가져오기
 * localStorageからJWTリフレッシュトークンを取得
 *
 * @returns {string|null} Refresh token or null if not found
 */
export const getRefreshToken = () => {
  const keyValue = localStorage?.getItem(CONFIG.refreshKey) ?? null;
  return keyValue === undefined ? null : keyValue;
};

/**
 * Check if access token exists
 * 액세스 토큰 존재 여부 확인
 * アクセストークンの存在を確認
 *
 * @returns {boolean} True if access token exists
 */
export const hasAccessToken = () => {
  const accessToken = getAccessToken();
  return accessToken !== null && accessToken !== undefined;
};

/**
 * Check if refresh token exists
 * 리프레시 토큰 존재 여부 확인
 * リフレッシュトークンの存在を確認
 *
 * @returns {boolean} True if refresh token exists
 */
export const hasRefreshToken = () => {
  const refreshToken = getRefreshToken();
  return refreshToken !== null && refreshToken !== undefined;
};

/**
 * Set Google OAuth access token in localStorage
 * Google OAuth 액세스 토큰을 localStorage에 저장
 * Google OAuthアクセストークンをlocalStorageに保存
 *
 * @param {string} accessTokenKey - Google OAuth access token
 */
export const setGoogleAccessToken = accessTokenKey => {
  if (accessTokenKey !== null && accessTokenKey !== undefined) {
    localStorage.setItem(CONFIG.gAccessKey, accessTokenKey);
  }
};

/**
 * Set Google OAuth refresh token in localStorage
 * Google OAuth 리프레시 토큰을 localStorage에 저장
 * Google OAuthリフレッシュトークンをlocalStorageに保存
 *
 * @param {string} refreshTokenKey - Google OAuth refresh token
 */
export const setGoogleRefreshToken = refreshTokenKey => {
  if (refreshTokenKey !== null && refreshTokenKey !== undefined) {
    localStorage.setItem(CONFIG.gRefreshKey, refreshTokenKey);
  }
};

/**
 * Get Google OAuth access token from localStorage
 * localStorage에서 Google OAuth 액세스 토큰 가져오기
 * localStorageからGoogle OAuthアクセストークンを取得
 *
 * @returns {string|null} Google access token or null if not found
 */
export const getGoogleAccessToken = () => {
  const keyValue = localStorage.getItem(CONFIG.gAccessKey) ?? null;
  return keyValue === undefined ? null : keyValue;
};

/**
 * Get Google OAuth refresh token from localStorage
 * localStorage에서 Google OAuth 리프레시 토큰 가져오기
 * localStorageからGoogle OAuthリフレッシュトークンを取得
 *
 * @returns {string|null} Google refresh token or null if not found
 */
export const getGoogleRefreshToken = () => {
  const keyValue = localStorage.getItem(CONFIG.gRefreshKey) ?? null;
  return keyValue === undefined ? null : keyValue;
};

/**
 * Check if Google OAuth access token exists
 * Google OAuth 액세스 토큰 존재 여부 확인
 * Google OAuthアクセストークンの存在を確認
 *
 * @returns {boolean} True if Google access token exists
 */
export const hasGoogleAccessToken = () => {
  const gAccessToken = getGoogleAccessToken();
  return gAccessToken !== null && gAccessToken !== undefined;
};

/**
 * Check if Google OAuth refresh token exists
 * Google OAuth 리프레시 토큰 존재 여부 확인
 * Google OAuthリフレッシュトークンの存在を確認
 *
 * @returns {boolean} True if Google refresh token exists
 */
export const hasGoogleRefreshToken = () => {
  const gRefreshToken = getGoogleRefreshToken();
  return gRefreshToken !== null && gRefreshToken !== undefined;
};

/**
 * Remove all access tokens from localStorage (for logout)
 * localStorage에서 모든 액세스 토큰 삭제 (로그아웃용)
 * localStorageからすべてのアクセストークンを削除（ログアウト用）
 */
export const removeAccessTokens = () => {
  localStorage.removeItem(CONFIG.accessKey);
  localStorage.removeItem(CONFIG.gAccessKey);
};

/**
 * Remove all refresh tokens from localStorage (for logout)
 * localStorage에서 모든 리프레시 토큰 삭제 (로그아웃용)
 * localStorageからすべてのリフレッシュトークンを削除（ログアウト用）
 */
export const removeRefreshTokens = () => {
  localStorage.removeItem(CONFIG.refreshKey);
  localStorage.removeItem(CONFIG.gRefreshKey);
};

/**
 * Format local date with timezone support
 * 타임존 지원으로 로컬 날짜 포맷
 * タイムゾーン対応でローカル日付をフォーマット
 *
 * @param {string} timezone - IANA timezone (default: user's timezone)
 * @returns {string} Formatted date string (MM-DD-YYYY)
 */
export const formatLocalDate = (
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
) => {
  const now = new Date();
  return now
    .toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: timezone,
    })
    .replace(/\//g, '-');
};

/**
 * Set today's tarot card for a user
 * 사용자의 오늘의 타로 카드 저장
 * ユーザーの今日のタロットカードを保存
 *
 * @param {number} todayCardIndex - Card index
 * @param {Object} userInfo - User information object
 */
export const setTodayCard = (todayCardIndex, userInfo) => {
  if (todayCardIndex !== null && todayCardIndex !== undefined) {
    const localDate = formatLocalDate();
    const cardData = {
      index: todayCardIndex,
      date: localDate,
    };
    localStorage.setItem(
      `todayCard-${userInfo?.email}`,
      JSON.stringify(cardData)
    );
  }
};

/**
 * Get today's tarot card for a user
 * 사용자의 오늘의 타로 카드 가져오기
 * ユーザーの今日のタロットカードを取得
 *
 * @param {Object} userInfo - User information object
 * @param {string} timezone - IANA timezone (default: user's timezone)
 * @returns {number|null} Card index or null if not found/expired
 *
 * Note: Automatically removes card data if date has changed
 * 참고: 날짜가 변경된 경우 자동으로 카드 데이터 삭제
 * 注意：日付が変更された場合、自動的にカードデータを削除
 */
export const getTodayCard = (
  userInfo,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
) => {
  try {
    if (
      !userInfo ||
      !userInfo?.email ||
      userInfo?.email === '' ||
      Object.keys(userInfo).length === 0
    )
      return null;

    const now = new Date();
    const cardKey = `todayCard-${userInfo?.email}`;
    const savedData = localStorage.getItem(cardKey);

    if (!savedData) return null;

    const cardData = JSON.parse(savedData);

    if (!cardData || !cardData.date) return null;

    const savedDate = new Date(cardData.date);

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const currentDateStr = formatter.format(now);
    const savedDateStr = formatter.format(savedDate);

    // Remove card data if date has changed
    // 날짜가 변경된 경우 카드 데이터 삭제
    // 日付が変更された場合、カードデータを削除
    if (currentDateStr !== savedDateStr) {
      localStorage.removeItem(cardKey);
      return null;
    }

    // Handle index 0 (falsy value in JavaScript)
    // 인덱스 0 처리 (JavaScript에서 falsy 값)
    // インデックス0を処理（JavaScriptでfalsy値）
    if (cardData?.index === 0) return 0;

    return cardData?.index || null;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('Error parsing today card data:', e);
    }
    return null;
  }
};

/**
 * Remove today's tarot card data for a user
 * 사용자의 오늘의 타로 카드 데이터 삭제
 * ユーザーの今日のタロットカードデータを削除
 *
 * @param {Object} userInfo - User information object
 */
export const removeTodayCards = userInfo => {
  localStorage.removeItem(`todayCard-${userInfo?.email}`);
};

/**
 * LocalStorage utility wrapper for lock button state management
 * 잠금 버튼 상태 관리를 위한 LocalStorage 유틸리티 래퍼
 * ロックボタン状態管理のためのLocalStorageユーティリティラッパー
 *
 * Provides JSON serialization/deserialization for complex objects
 * 복잡한 객체를 위한 JSON 직렬화/역직렬화 제공
 * 複雑なオブジェクトのためのJSONシリアライズ/デシリアライズを提供
 */
export const localStorageForLockButton = {
  getItem(key) {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },

  setItem(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },

  removeItem(key) {
    localStorage.removeItem(key);
  },

  clear() {
    localStorage.clear();
  },
};

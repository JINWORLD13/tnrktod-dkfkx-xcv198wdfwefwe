/**
 * Token Capacitor Preferences Management Module for Native App
 * 네이티브 앱을 위한 토큰 Capacitor Preferences 관리 모듈
 * ネイティブアプリ用のトークンCapacitor Preferences管理モジュール
 *
 * Features:
 * - Secure token storage for native mobile apps
 * - Automatic token expiration handling
 * - Reward system with expiration
 * - Daily tarot card storage
 *
 * 주요 기능:
 * - 네이티브 모바일 앱을 위한 보안 토큰 저장
 * - 자동 토큰 만료 처리
 * - 만료 기능이 있는 리워드 시스템
 * - 일일 타로 카드 저장
 *
 * 主な機能：
 * - ネイティブモバイルアプリ用のセキュアトークン保存
 * - 自動トークン有効期限処理
 * - 有効期限付きリワードシステム
 * - 日次タロットカード保存
 */

import { Preferences } from '@capacitor/core';
import { isDevelopmentMode, isProductionMode } from '@/utils/constants';

// Preference configuration from environment variables
// 환경변수에서 Preference 설정값 가져오기
// 環境変数からPreference設定値を取得
const CONFIG = {
  accessKey: import.meta.env.VITE_PREFERENCE_KEY_A,
  refreshKey: import.meta.env.VITE_PREFERENCE_KEY_B,
  gAccessKey: import.meta.env.VITE_PREFERENCE_KEY_C,
  gRefreshKey: import.meta.env.VITE_PREFERENCE_KEY_D,
  tokenExpires: parseInt(import.meta.env.VITE_PREFERENCE_EXPIRES_A) * 24 * 60 * 60 * 1000,
  rewardExpires: parseInt(import.meta.env.VITE_PREFERENCE_EXPIRES_B) * 24 * 60 * 60 * 1000,
};

/**
 * Remove expired token from Preferences
 * Preferences에서 만료된 토큰 제거
 * Preferencesから期限切れトークンを削除
 *
 * @param {string} key - Preference key
 * @returns {Promise<boolean>} True if token was expired and removed
 */
const removeExpiredToken = async key => {
  const preferenceData = await Preferences.get({ key });
  if (!preferenceData) return false;

  const { value } = preferenceData;
  if (!value) return false;

  const { token, expiresAt } = JSON.parse(value);

  if (token && Date.now() >= expiresAt) {
    await Preferences.remove({ key });
    return true;
  }

  return false;
};

/**
 * Set token with expiration in Preferences
 * Preferences에 만료 시간과 함께 토큰 저장
 * Preferencesに有効期限付きでトークンを保存
 *
 * @param {string} key - Preference key
 * @param {string} tokenKey - Token value
 */
const setTokenForPreference = async (key, tokenKey) => {
  if (tokenKey !== null && tokenKey !== undefined) {
    const expiresAt = Date.now() + CONFIG.tokenExpires;
    await Preferences.set({
      key,
      value: JSON.stringify({ token: tokenKey, expiresAt }),
    });
  }
};

/**
 * Get token from Preferences with automatic expiration check
 * Preferences에서 자동 만료 확인과 함께 토큰 가져오기
 * Preferencesから自動有効期限チェック付きでトークンを取得
 *
 * @param {string} key - Preference key
 * @returns {Promise<string|null>} Token or null if not found/expired
 */
const getTokenForPreference = async key => {
  if (await removeExpiredToken(key)) {
    return null;
  }

  const preferenceData = await Preferences.get({ key });
  if (!preferenceData) return null;

  const { value } = preferenceData;
  if (!value) return null;

  const parsedValue = JSON.parse(value);
  const { token, expiresAt } = parsedValue;

  if (token && Date.now() < expiresAt) {
    return token;
  }

  return null;
};

/**
 * Set JWT access token for native app
 * 네이티브 앱용 JWT 액세스 토큰 저장
 * ネイティブアプリ用JWTアクセストークンを保存
 *
 * @param {string} accessTokenKey - JWT access token
 */
export const setAccessTokenForPreference = async accessTokenKey => {
  await setTokenForPreference(CONFIG.accessKey, accessTokenKey);
};

/**
 * Set JWT refresh token for native app
 * 네이티브 앱용 JWT 리프레시 토큰 저장
 * ネイティブアプリ用JWTリフレッシュトークンを保存
 *
 * @param {string} refreshTokenKey - JWT refresh token
 */
export const setRefreshTokenForPreference = async refreshTokenKey => {
  await setTokenForPreference(CONFIG.refreshKey, refreshTokenKey);
};

/**
 * Get JWT access token for native app
 * 네이티브 앱용 JWT 액세스 토큰 가져오기
 * ネイティブアプリ用JWTアクセストークンを取得
 *
 * @returns {Promise<string|null>} Access token or null if not found/expired
 */
export const getAccessTokenForPreference = async () => {
  return await getTokenForPreference(CONFIG.accessKey);
};

/**
 * Get JWT refresh token for native app
 * 네이티브 앱용 JWT 리프레시 토큰 가져오기
 * ネイティブアプリ用JWTリフレッシュトークンを取得
 *
 * @returns {Promise<string|null>} Refresh token or null if not found/expired
 */
export const getRefreshTokenForPreference = async () => {
  return await getTokenForPreference(CONFIG.refreshKey);
};

/**
 * Check if access token exists
 * 액세스 토큰 존재 여부 확인
 * アクセストークンの存在を確認
 *
 * @returns {Promise<boolean>} True if access token exists and is valid
 */
export const hasAccessTokenForPreference = async () => {
  const accessToken = await getAccessTokenForPreference();
  return accessToken !== null;
};

/**
 * Check if refresh token exists
 * 리프레시 토큰 존재 여부 확인
 * リフレッシュトークンの存在を確認
 *
 * @returns {Promise<boolean>} True if refresh token exists and is valid
 */
export const hasRefreshTokenForPreference = async () => {
  const refreshToken = await getRefreshTokenForPreference();
  return refreshToken !== null;
};

/**
 * Set Google OAuth access token for native app
 * 네이티브 앱용 Google OAuth 액세스 토큰 저장
 * ネイティブアプリ用Google OAuthアクセストークンを保存
 *
 * @param {string} accessTokenKey - Google OAuth access token
 */
export const setGoogleAccessTokenForPreference = async accessTokenKey => {
  await setTokenForPreference(CONFIG.gAccessKey, accessTokenKey);
};

/**
 * Set Google OAuth refresh token for native app
 * 네이티브 앱용 Google OAuth 리프레시 토큰 저장
 * ネイティブアプリ用Google OAuthリフレッシュトークンを保存
 *
 * @param {string} refreshTokenKey - Google OAuth refresh token
 */
export const setGoogleRefreshTokenForPreference = async refreshTokenKey => {
  await setTokenForPreference(CONFIG.gRefreshKey, refreshTokenKey);
};

/**
 * Remove all access tokens from Preferences (for logout)
 * Preferences에서 모든 액세스 토큰 삭제 (로그아웃용)
 * Preferencesからすべてのアクセストークンを削除（ログアウト用）
 */
export const removeAccessTokensForPreference = async () => {
  await Preferences.remove({ key: CONFIG.accessKey });
  await Preferences.remove({ key: CONFIG.gAccessKey });
};

/**
 * Remove all refresh tokens from Preferences (for logout)
 * Preferences에서 모든 리프레시 토큰 삭제 (로그아웃용)
 * Preferencesからすべてのリフレッシュトークンを削除（ログアウト用）
 */
export const removeRefreshTokensForPreference = async () => {
  await Preferences.remove({ key: CONFIG.refreshKey });
  await Preferences.remove({ key: CONFIG.gRefreshKey });
};

/**
 * Remove all expired tokens from Preferences
 * Preferences에서 모든 만료된 토큰 제거
 * Preferencesからすべての期限切れトークンを削除
 *
 * Useful for cleanup operations and periodic maintenance
 * 정리 작업 및 주기적 유지보수에 유용
 * クリーンアップ操作と定期メンテナンスに有用
 */
export const removeAllExpiredTokens = async () => {
  await removeExpiredToken(CONFIG.accessKey);
  await removeExpiredToken(CONFIG.refreshKey);
  await removeExpiredToken(CONFIG.gAccessKey);
  await removeExpiredToken(CONFIG.gRefreshKey);
};

/**
 * Remove expired reward from Preferences
 * Preferences에서 만료된 리워드 제거
 * Preferencesから期限切れリワードを削除
 *
 * @param {string} rewardType - Reward type identifier
 * @param {string} userEmail - User email
 * @returns {Promise<boolean>} True if reward was expired and removed
 */
export const removeExpiredReward = async (rewardType = 'Voucher', userEmail) => {
  const userAccount = userEmail?.split('@')[0];
  const key = `${rewardType}${userAccount}${isProductionMode}`;

  const preferenceData = await Preferences.get({ key });
  if (!preferenceData) return false;

  const { value } = preferenceData;
  if (!value) return false;

  const parsedValue = JSON.parse(value);

  if (parsedValue?.rewardAmount > 0) {
    if (Date.now() >= parsedValue.expiresAt) {
      await Preferences.remove({ key });
      return true;
    }
  }

  return false;
};

/**
 * Set reward with expiration for user
 * 사용자에게 만료 시간과 함께 리워드 저장
 * ユーザーに有効期限付きでリワードを保存
 *
 * @param {string} rewardType - Reward type identifier
 * @param {number} newRewardAmount - Amount to add to existing rewards
 * @param {string} userEmail - User email
 */
export const setRewardForPreference = async (
  rewardType = 'Voucher',
  newRewardAmount,
  userEmail
) => {
  if (
    typeof newRewardAmount === 'number' &&
    !isNaN(newRewardAmount) &&
    typeof userEmail === 'string' &&
    userEmail?.length > 0
  ) {
    const userAccount = userEmail.split('@')[0];
    const key = `${rewardType}${userAccount}${isProductionMode}`;

    const preferenceData = await Preferences.get({ key });
    let existingReward = { rewardAmount: 0, expiresAt: 0 };

    if (preferenceData?.value) {
      const parsedValue = JSON.parse(preferenceData.value);

      if (parsedValue?.rewardAmount > 0) {
        if (Date.now() >= parsedValue.expiresAt) {
          existingReward.rewardAmount = 0;
        } else {
          existingReward.rewardAmount = parsedValue.rewardAmount;
        }
      }
    } else {
      if (isDevelopmentMode) {
        console.log(`Creating new Preference for ${key}`);
      }
    }

    const updatedRewardAmount = existingReward.rewardAmount + newRewardAmount;
    const expiresAt = Date.now() + CONFIG.rewardExpires;

    await Preferences.set({
      key,
      value: JSON.stringify({ rewardAmount: updatedRewardAmount, expiresAt }),
    });

    if (isDevelopmentMode) {
      console.log(`Reward updated for ${key}: ${updatedRewardAmount}`);
    }
  }
};

/**
 * Get reward amount for user
 * 사용자의 리워드 수량 가져오기
 * ユーザーのリワード数量を取得
 *
 * @param {string} rewardType - Reward type identifier
 * @param {string} userEmail - User email
 * @returns {Promise<number>} Reward amount or 0 if not found/expired
 */
export const getRewardForPreference = async (rewardType = 'Voucher', userEmail) => {
  const userAccount = userEmail?.split('@')[0];

  if (!userEmail || !userAccount) return 0;

  const key = `${rewardType}${userAccount}${isProductionMode}`;

  if (await removeExpiredReward(rewardType, userEmail)) {
    return 0;
  }

  const preferenceData = await Preferences.get({ key });
  if (!preferenceData?.value) return 0;

  const parsedValue = JSON.parse(preferenceData.value);

  if (parsedValue?.rewardAmount > 0 && Date.now() < parsedValue.expiresAt) {
    return parsedValue.rewardAmount;
  }

  return 0;
};

/**
 * Use (consume) reward for user
 * 사용자의 리워드 사용 (차감)
 * ユーザーのリワードを使用（消費）
 *
 * @param {string} rewardType - Reward type identifier
 * @param {number} amountToUse - Amount to consume
 * @param {string} userEmail - User email
 * @returns {Promise<boolean>} True if reward was successfully used
 */
export const useRewardForPreference = async (
  rewardType = 'Voucher',
  amountToUse = 1,
  userEmail
) => {
  const userAccount = userEmail?.split('@')[0];
  if (!userAccount) return false;

  const key = `${rewardType}${userAccount}${isProductionMode}`;

  const isExpired = await removeExpiredReward(rewardType, userEmail);
  if (isExpired) {
    if (isDevelopmentMode) {
      console.log(`Reward expired and removed for ${key}`);
    }
    return false;
  }

  const currentReward = await getRewardForPreference(rewardType, userEmail);

  if (currentReward === null || currentReward < amountToUse) {
    if (isDevelopmentMode) {
      console.log(`Insufficient or no reward for ${key}`);
    }
    return false;
  }

  const updatedRewardAmount = currentReward - amountToUse;
  const expiresAt = Date.now() + CONFIG.rewardExpires;

  await Preferences.set({
    key,
    value: JSON.stringify({ rewardAmount: updatedRewardAmount, expiresAt }),
  });

  if (isDevelopmentMode) {
    console.log(`Reward used for ${key}: ${amountToUse}, remaining: ${updatedRewardAmount}`);
  }

  return true;
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
 * Set today's tarot card for native app user
 * 네이티브 앱 사용자의 오늘의 타로 카드 저장
 * ネイティブアプリユーザーの今日のタロットカードを保存
 *
 * @param {number} todayCardIndex - Card index
 * @param {Object} userInfo - User information object
 */
export const setTodayCardForNative = async (todayCardIndex, userInfo) => {
  try {
    if (
      todayCardIndex !== null &&
      todayCardIndex !== undefined &&
      userInfo?.email
    ) {
      const localDate = formatLocalDate();
      const cardData = {
        index: todayCardIndex,
        date: localDate,
      };

      await Preferences.set({
        key: `todayCard-${userInfo.email.split('@')[0]}`,
        value: JSON.stringify(cardData),
      });
    }
  } catch (error) {
    if (isDevelopmentMode) {
      console.error('Error setting today card:', error);
    }
  }
};

/**
 * Get today's tarot card for native app user
 * 네이티브 앱 사용자의 오늘의 타로 카드 가져오기
 * ネイティブアプリユーザーの今日のタロットカードを取得
 *
 * @param {Object} userInfo - User information object
 * @param {string} timezone - IANA timezone (default: user's timezone)
 * @returns {Promise<number|null>} Card index or null if not found/expired
 */
export const getTodayCardForNative = async (
  userInfo,
  timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
) => {
  try {
    if (!userInfo?.email) return null;

    const cardKey = `todayCard-${userInfo.email.split('@')[0]}`;
    const result = await Preferences.get({ key: cardKey });
    const savedData = result.value;

    if (!savedData) return null;

    const cardData = JSON.parse(savedData);

    if (!cardData || !cardData.date) return null;

    const savedDate = new Date(cardData.date);
    const now = new Date();

    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });

    const currentDateStr = formatter.format(now);
    const savedDateStr = formatter.format(savedDate);

    if (currentDateStr !== savedDateStr) {
      await Preferences.remove({ key: cardKey });
      return null;
    }

    if (cardData?.index === 0) return 0;

    return cardData?.index ?? null;
  } catch (error) {
    if (isDevelopmentMode) {
      console.error('Error getting today card:', error);
    }
    return null;
  }
};

/**
 * Remove today's tarot card data for native app user
 * 네이티브 앱 사용자의 오늘의 타로 카드 데이터 삭제
 * ネイティブアプリユーザーの今日のタロットカードデータを削除
 *
 * @param {Object} userInfo - User information object
 */
export const removeTodayCardsForNative = async userInfo => {
  try {
    if (userInfo?.email) {
      await Preferences.remove({
        key: `todayCard-${userInfo.email.split('@')[0]}`,
      });
    }
  } catch (error) {
    if (isDevelopmentMode) {
      console.error('Error removing today cards:', error);
    }
  }
};

/**
 * Set ad-free status with alternating pattern
 * 교대 패턴으로 광고 면제 상태 설정
 * 交互パターンで広告免除ステータスを設定
 *
 * @param {Object} userInfo - User information object
 */
export const setAdsFree = async userInfo => {
  try {
    if (!userInfo?.email) return false;

    const emailPrefix = userInfo.email.split('@')[0];
    const key = `AF-${emailPrefix}`;

    const randomResult = Math.round(Math.random());

    const { value } = await Preferences.get({ key });
    let adFreeHistory = value ? JSON.parse(value) : [];

    if (!adFreeHistory || adFreeHistory?.length === 0) {
      adFreeHistory.push(randomResult);
      await Preferences.set({ key, value: JSON.stringify(adFreeHistory) });
      return;
    }

    if (adFreeHistory?.length === 1) {
      adFreeHistory[0] === 1 ? adFreeHistory.push(0) : adFreeHistory.push(1);
      await Preferences.set({ key, value: JSON.stringify(adFreeHistory) });
      return;
    }

    if (adFreeHistory?.length >= 2) {
      adFreeHistory.shift();
      adFreeHistory[0] === 1 ? adFreeHistory.push(0) : adFreeHistory.push(1);
      await Preferences.set({ key, value: JSON.stringify(adFreeHistory) });
      return;
    }
  } catch (error) {
    if (isDevelopmentMode) {
      console.error('Error in setAdsFree:', error);
    }
  }
};

/**
 * Get ad-free status for user
 * 사용자의 광고 면제 상태 가져오기
 * ユーザーの広告免除ステータスを取得
 *
 * @param {Object} userInfo - User information object
 * @returns {Promise<boolean>} True if user is ad-free
 */
export const getAdsFree = async userInfo => {
  try {
    if (!userInfo?.email) return false;

    const emailPrefix = userInfo.email.split('@')[0];
    const key = `AF-${emailPrefix}`;

    const { value } = await Preferences.get({ key });
    let adFreeHistory = value ? JSON.parse(value) : [];

    if (!adFreeHistory || adFreeHistory?.length === 0) {
      const randomResult = Math.round(Math.random());
      adFreeHistory.push(randomResult);
      await Preferences.set({ key, value: JSON.stringify(adFreeHistory) });
      return adFreeHistory[0] === 1;
    }

    return adFreeHistory[adFreeHistory?.length - 1] === 1;
  } catch (error) {
    if (isDevelopmentMode) {
      console.error('Error in getAdsFree:', error);
    }
    return false;
  }
};

/**
 * Preferences utility wrapper for lock button state management
 * 잠금 버튼 상태 관리를 위한 Preferences 유틸리티 래퍼
 * ロックボタン状態管理のためのPreferencesユーティリティラッパー
 *
 * Provides JSON serialization/deserialization for complex objects
 * 복잡한 객체를 위한 JSON 직렬화/역직렬화 제공
 * 複雑なオブジェクトのためのJSONシリアライズ/デシリアライズを提供
 */
export const preferenceForLockButton = {
  async getItem(key) {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  },

  async setItem(key, value) {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  },

  async removeItem(key) {
    await Preferences.remove({ key });
  },

  async clear() {
    await Preferences.clear();
  },
};

/**
 * API Client Module for Token-based Authentication
 * 토큰 기반 인증을 위한 API 클라이언트 모듈
 * トークンベース認証のためのAPIクライアントモジュール
 *
 * Features:
 * - Automatic token refresh with interceptors
 * - Cross-platform support (Web/Native app)
 * - Request cancellation support
 * - Centralized error handling
 *
 * 주요 기능:
 * - 인터셉터를 통한 자동 토큰 갱신
 * - 크로스 플랫폼 지원 (웹/네이티브 앱)
 * - 요청 취소 지원
 * - 중앙화된 에러 핸들링
 *
 * 主な機能：
 * - インターセプターによる自動トークン更新
 * - クロスプラットフォーム対応（Web/ネイティブアプリ）
 * - リクエストキャンセル対応
 * - 集中型エラーハンドリング
 */

import axios from 'axios';
import {
  setAccessToken,
  getAccessToken,
  removeAccessTokens,
  removeRefreshTokens,
} from '../utils/storage/tokenCookie.jsx';
import { Capacitor } from '@capacitor/core';
import {
  getAccessTokenForPreference,
  getRefreshTokenForPreference,
  setAccessTokenForPreference,
  removeAccessTokensForPreference,
  removeRefreshTokensForPreference,
} from '../utils/storage/tokenPreference.jsx';

// Platform and API configuration
// 플랫폼 및 API 설정
// プラットフォームとAPI設定
const isNative = Capacitor.isNativePlatform();
const serverUrl = import.meta.env.VITE_SERVER_URL;

// API configuration from environment variables
// 환경변수에서 API 설정값 가져오기
// 環境変数からAPI設定値を取得
const API_CONFIG = {
  refreshEndpoint: import.meta.env.VITE_API_ENDPOINT_A,
  redirectPath: import.meta.env.VITE_API_PATH_A,
  requestTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT),
};

/**
 * Create individual cancel token for request cancellation
 * 요청 취소를 위한 개별 취소 토큰 생성
 * リクエストキャンセル用の個別キャンセルトークンを生成
 *
 * @returns {Object} Axios CancelToken source
 *
 * Usage: const source = createCancelToken(); source.cancel('Operation cancelled');
 * 사용법: const source = createCancelToken(); source.cancel('작업 취소됨');
 * 使用方法：const source = createCancelToken(); source.cancel('操作がキャンセルされました');
 */
export const createCancelToken = () => {
  return axios.CancelToken.source();
};

/**
 * Get access token with automatic platform detection
 * 플랫폼 자동 감지를 통한 액세스 토큰 가져오기
 * プラットフォーム自動検出によるアクセストークン取得
 *
 * @returns {Promise<string>} Access token
 *
 * Web: Reads from cookie
 * Native: Reads from Capacitor Preferences
 *
 * 웹: 쿠키에서 읽기
 * 네이티브: Capacitor Preferences에서 읽기
 *
 * Web：Cookieから読み取り
 * ネイティブ：Capacitor Preferencesから読み取り
 */
export const getAccessToken2 = async () => {
  if (isNative) {
    return await getAccessTokenForPreference();
  } else {
    return getAccessToken();
  }
};

/**
 * Store access token with automatic platform detection
 * 플랫폼 자동 감지를 통한 액세스 토큰 저장
 * プラットフォーム自動検出によるアクセストークン保存
 *
 * @param {string} token - Access token to store
 */
export const setAccessToken2 = async token => {
  if (isNative) {
    await setAccessTokenForPreference(token);
  } else {
    setAccessToken(token);
  }
};

/**
 * Clear all tokens (for logout)
 * 모든 토큰 삭제 (로그아웃용)
 * すべてのトークンをクリア（ログアウト用）
 *
 * Web: Clears cookies
 * Native: Clears Capacitor Preferences
 *
 * 웹: 쿠키 삭제
 * 네이티브: Capacitor Preferences 삭제
 *
 * Web：Cookieをクリア
 * ネイティブ：Capacitor Preferencesをクリア
 */
export const clearTokens2 = async () => {
  if (isNative) {
    await removeAccessTokensForPreference();
    await removeRefreshTokensForPreference();
  } else {
    removeAccessTokens();
    removeRefreshTokens();
  }
};

/**
 * Setup axios interceptors for automatic token refresh
 * 자동 토큰 갱신을 위한 axios 인터셉터 설정
 * 自動トークン更新のためのaxiosインターセプターを設定
 *
 * @param {Object} api - Axios instance
 * @returns {Function} Cleanup function to remove interceptors
 *
 * Token Refresh Strategy:
 * - Web: Refresh token is automatically sent via httpOnly cookie
 * - Native: Refresh token is sent via header
 * - Prevents duplicate refresh requests with queue system
 *
 * 토큰 갱신 전략:
 * - 웹: 리프레시 토큰이 httpOnly 쿠키를 통해 자동 전송됨
 * - 네이티브: 리프레시 토큰이 헤더를 통해 전송됨
 * - 큐 시스템으로 중복 갱신 요청 방지
 *
 * トークン更新戦略：
 * - Web：リフレッシュトークンがhttpOnly Cookieを通じて自動送信
 * - ネイティブ：リフレッシュトークンがヘッダーを通じて送信
 * - キューシステムで重複更新リクエストを防止
 */
const setupInterceptors = api => {
  let isRefreshing = false;
  let failedQueue = [];

  const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token);
      }
    });
    failedQueue = [];
  };

  const responseInterceptorId = api.interceptors.response.use(
    async response => {
      // Handle new access token from server response
      // 서버 응답에서 새 액세스 토큰 처리
      // サーバーレスポンスから新しいアクセストークンを処理
      const newAccessToken =
        response?.data?.data?.newAccessToken ??
        response?.data?.newAccessToken ??
        null;

      if (newAccessToken !== null && !response.config._retry) {
        await setAccessToken2(newAccessToken);
        response.config.headers.Authorization = `Bearer ${newAccessToken}`;
        response.config._retry = true;
        return api(response.config);
      }
      return response;
    },
    async error => {
      const originalRequest = error.config;

      // Handle 401 Unauthorized - attempt token refresh
      // 401 인증 실패 처리 - 토큰 갱신 시도
      // 401未認証処理 - トークン更新を試行
      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          // Queue requests while refresh is in progress
          // 갱신 진행 중 요청을 큐에 추가
          // 更新進行中のリクエストをキューに追加
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshHeaders = { withCredentials: true };

          // Native app: Send refresh token via header
          // 네이티브 앱: 헤더로 리프레시 토큰 전송
          // ネイティブアプリ：ヘッダーでリフレッシュトークンを送信
          if (isNative) {
            const refreshToken = await getRefreshTokenForPreference();
            if (refreshToken) {
              refreshHeaders.headers = { 'Refresh-Token': refreshToken };
            }
          }

          const refreshResponse = await axios.post(
            `${serverUrl}${API_CONFIG.refreshEndpoint}`,
            {},
            refreshHeaders
          );

          const newAccessToken = refreshResponse.data?.data?.newAccessToken;

          if (newAccessToken) {
            await setAccessToken2(newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);
            return api(originalRequest);
          } else {
            throw new Error('No access token received');
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          await clearTokens2();
          window.location.href = API_CONFIG.redirectPath;
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Handle 403 Forbidden - force logout
      // 403 접근 금지 처리 - 강제 로그아웃
      // 403アクセス拒否処理 - 強制ログアウト
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || '';
        if (errorMessage.includes('로그인') || errorMessage.includes('login')) {
          await clearTokens2();
          window.location.href = API_CONFIG.redirectPath;
        }
      }

      return Promise.reject(error);
    }
  );

  return () => {
    api.interceptors.response.eject(responseInterceptorId);
  };
};

/**
 * Create basic API client without authentication
 * 인증 없는 기본 API 클라이언트 생성
 * 認証なしの基本APIクライアントを生成
 *
 * @returns {Object} API client instance
 *
 * Use for public endpoints that don't require authentication
 * 인증이 필요 없는 공개 엔드포인트에 사용
 * 認証が不要な公開エンドポイントに使用
 */
export const apiModule = () => {
  const api = axios.create({
    baseURL: serverUrl,
    withCredentials: true,
    timeout: API_CONFIG.requestTimeout,
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      'X-Client-Type': 'web',
    },
  });

  return { api };
};

/**
 * Create API client with token authentication
 * 토큰 인증을 포함한 API 클라이언트 생성
 * トークン認証を含むAPIクライアントを生成
 *
 * @param {string} accessToken - JWT access token
 * @returns {Promise<Object>} API client instance and cleanup function
 *
 * Token handling:
 * - Web: Refresh token sent via httpOnly cookie (automatic)
 * - Native: Refresh token sent via header (manual)
 *
 * 토큰 처리:
 * - 웹: 리프레시 토큰이 httpOnly 쿠키로 자동 전송
 * - 네이티브: 리프레시 토큰이 헤더로 수동 전송
 *
 * トークン処理：
 * - Web：リフレッシュトークンがhttpOnly Cookieで自動送信
 * - ネイティブ：リフレッシュトークンがヘッダーで手動送信
 */
export const apiWithTokensModule = async accessToken => {
  const headers = {
    'content-type': 'application/json',
    Authorization: `Bearer ${accessToken}`,
    accept: 'application/json',
    'X-Client-Type': 'web',
  };

  if (isNative) {
    const refreshToken = await getRefreshTokenForPreference();
    if (refreshToken) {
      headers['Refresh-Token'] = refreshToken;
    }
  }

  const apiWithTokens = axios.create({
    baseURL: serverUrl,
    withCredentials: true,
    timeout: API_CONFIG.requestTimeout,
    headers,
  });

  const cleanup = setupInterceptors(apiWithTokens);

  return { apiWithTokens, cleanup };
};

/**
 * Handle API errors with user-friendly messages
 * 사용자 친화적 메시지로 API 에러 처리
 * ユーザーフレンドリーなメッセージでAPIエラーを処理
 *
 * @param {Error} error - Error object
 * @param {string} apiName - API name for logging
 *
 * Error types:
 * - Cancel errors: Ignored (user-initiated)
 * - Network errors: Alert user and offer reload
 *
 * 에러 유형:
 * - 취소 에러: 무시 (사용자가 시작한 것)
 * - 네트워크 에러: 사용자에게 알리고 새로고침 제안
 *
 * エラータイプ：
 * - キャンセルエラー：無視（ユーザーが開始したもの）
 * - ネットワークエラー：ユーザーに通知し、リロードを提案
 */
export const handleApiError = (error, apiName = 'API') => {
  if (axios.isCancel(error)) {
    if (import.meta.env.DEV) {
      console.error(`${apiName} Error (Cancelled):`, error.message);
    }
    return;
  }

  if (import.meta.env.DEV) {
    console.error(`${apiName} Error:`, error);
  }

  if (window.confirm('Network error occurred. Please connect internet.')) {
    window.location.reload();
  }
};

/**
 * Common API request wrapper with automatic token and error handling
 * 자동 토큰 및 에러 처리를 포함한 공통 API 요청 래퍼
 * 自動トークンとエラー処理を含む共通APIリクエストラッパー
 *
 * @param {string} method - HTTP method (get, post, put, delete)
 * @param {string} url - API endpoint URL
 * @param {Object} data - Request body data (for POST, PUT, DELETE)
 * @param {Object} cancelToken - Cancel token for request cancellation
 * @param {string} apiName - API name for error logging
 * @returns {Promise<Object>} Response data, cleanup function, and status code
 *
 * Benefits:
 * - Eliminates duplicate code
 * - Automatic token management
 * - Centralized error handling
 * - Request cancellation support
 *
 * 장점:
 * - 중복 코드 제거
 * - 자동 토큰 관리
 * - 중앙화된 에러 처리
 * - 요청 취소 지원
 *
 * 利点：
 * - 重複コードを削除
 * - 自動トークン管理
 * - 集中型エラーハンドリング
 * - リクエストキャンセル対応
 */
export const makeApiRequest = async (
  method,
  url,
  data = null,
  cancelToken = null,
  apiName = 'API'
) => {
  const accessToken = await getAccessToken2();
  const { apiWithTokens, cleanup } = await apiWithTokensModule(accessToken);

  try {
    let response;
    const config = cancelToken ? { cancelToken } : {};

    switch (method.toLowerCase()) {
      case 'get':
        response = await apiWithTokens.get(url, config);
        break;
      case 'post':
        response = await apiWithTokens.post(url, data, config);
        break;
      case 'put':
        response = await apiWithTokens.put(url, data, config);
        break;
      case 'delete':
        response = await apiWithTokens.delete(url, { ...config, data });
        break;
      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return { response: response.data, cleanup, status: response.status };
  } catch (error) {
    handleApiError(error, apiName);
    return { response: null, cleanup, status: null };
  }
};

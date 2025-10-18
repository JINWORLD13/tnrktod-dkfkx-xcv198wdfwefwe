/**
 * Token Cookie Management Module for Web Platform
 * 웹 플랫폼을 위한 토큰 쿠키 관리 모듈
 * Webプラットフォーム用のトークンCookie管理モジュール
 *
 * Security Strategy:
 * - Access tokens: Stored in regular cookies (readable by frontend)
 * - Refresh tokens: Managed by backend as httpOnly cookies (not accessible from JS)
 * - Prevents XSS attacks through httpOnly flag on sensitive tokens
 *
 * 보안 전략:
 * - 액세스 토큰: 일반 쿠키에 저장 (프론트엔드에서 읽기 가능)
 * - 리프레시 토큰: 백엔드에서 httpOnly 쿠키로 관리 (JS에서 접근 불가)
 * - 민감한 토큰에 httpOnly 플래그를 통한 XSS 공격 방어
 *
 * セキュリティ戦略：
 * - アクセストークン：通常Cookieに保存（フロントエンドで読み取り可能）
 * - リフレッシュトークン：バックエンドでhttpOnly Cookieとして管理（JSからアクセス不可）
 * - 機密トークンにhttpOnlyフラグを通じたXSS攻撃防御
 */

import Cookies from 'js-cookie';

// Cookie configuration from environment variables
// 환경변수에서 쿠키 설정값 가져오기
// 環境変数からCookie設定値を取得
const CONFIG = {
  accessKey: import.meta.env.VITE_COOKIE_KEY_A,
  refreshKey: import.meta.env.VITE_COOKIE_KEY_B,
  gAccessKey: import.meta.env.VITE_COOKIE_KEY_C,
  gRefreshKey: import.meta.env.VITE_COOKIE_KEY_D,
  accessExpires: parseInt(import.meta.env.VITE_COOKIE_EXPIRES_A),
  refreshExpires: parseInt(import.meta.env.VITE_COOKIE_EXPIRES_B),
};

/**
 * Get cookie options based on environment and token type
 * 환경 및 토큰 타입에 따른 쿠키 옵션 반환
 * 環境とトークンタイプに応じたCookieオプションを返す
 *
 * @param {number} expires - Cookie expiration in days
 * @returns {Object} Cookie options
 */
const getCookieOptions = (expires) => {
  const isProduction = import.meta.env.PROD;

  return {
    expires,
    secure: isProduction,
    sameSite: 'lax',
  };
};

/**
 * Set JWT access token in cookie
 * JWT 액세스 토큰을 쿠키에 저장
 * JWTアクセストークンをCookieに保存
 *
 * @param {string} accessTokenKey - JWT access token
 *
 * Note: Access token is stored as regular cookie (not httpOnly) so frontend can read it
 * 참고: 액세스 토큰은 프론트엔드가 읽을 수 있도록 일반 쿠키로 저장
 * 注意：アクセストークンはフロントエンドで読み取れるよう通常Cookieとして保存
 */
export const setAccessToken = accessTokenKey => {
  if (accessTokenKey !== null && accessTokenKey !== undefined) {
    Cookies.set(
      CONFIG.accessKey,
      accessTokenKey,
      getCookieOptions(CONFIG.accessExpires)
    );
  }
};

/**
 * Get JWT access token from cookie
 * 쿠키에서 JWT 액세스 토큰 가져오기
 * CookieからJWTアクセストークンを取得
 *
 * @returns {string|null} Access token or null if not found
 */
export const getAccessToken = () => {
  const keyValue = Cookies.get(CONFIG.accessKey);
  return keyValue === undefined ? null : keyValue;
};

/**
 * Get JWT refresh token (always returns null for web platform)
 * JWT 리프레시 토큰 가져오기 (웹 플랫폼에서는 항상 null 반환)
 * JWTリフレッシュトークンを取得（Webプラットフォームでは常にnullを返す）
 *
 * @returns {null} Always null - refresh token is httpOnly and managed by backend
 *
 * Important: Refresh tokens are stored as httpOnly cookies by the backend
 * and are automatically sent with requests. JavaScript cannot access them.
 *
 * 중요: 리프레시 토큰은 백엔드에서 httpOnly 쿠키로 저장되며
 * 요청과 함께 자동으로 전송됩니다. JavaScript에서는 접근할 수 없습니다.
 *
 * 重要：リフレッシュトークンはバックエンドでhttpOnly Cookieとして保存され、
 * リクエストと共に自動送信されます。JavaScriptからはアクセスできません。
 */
export const getRefreshToken = () => {
  return null;
};

/**
 * Check if access token exists
 * 액세스 토큰 존재 여부 확인
 * アクセストークンの存在を確認
 *
 * @returns {boolean} True if access token exists
 *
 * Note: This only checks existence, not validity. Token validation is done by backend.
 * 참고: 이 함수는 존재 여부만 확인하며, 유효성 검증은 백엔드에서 수행됩니다.
 * 注意：この関数は存在のみ確認し、有効性検証はバックエンドで実行されます。
 */
export const hasAccessToken = () => {
  const accessToken = getAccessToken();
  return accessToken !== null && accessToken !== undefined;
};

/**
 * Set Google OAuth access token in cookie
 * Google OAuth 액세스 토큰을 쿠키에 저장
 * Google OAuthアクセストークンをCookieに保存
 *
 * @param {string} accessTokenKey - Google OAuth access token
 */
export const setGoogleAccessToken = accessTokenKey => {
  if (accessTokenKey !== null && accessTokenKey !== undefined) {
    Cookies.set(
      CONFIG.gAccessKey,
      accessTokenKey,
      getCookieOptions(CONFIG.accessExpires)
    );
  }
};

/**
 * Set Google OAuth refresh token in cookie
 * Google OAuth 리프레시 토큰을 쿠키에 저장
 * Google OAuthリフレッシュトークンをCookieに保存
 *
 * @param {string} refreshTokenKey - Google OAuth refresh token
 *
 * Note: In production, this should ideally be managed by backend as httpOnly
 * 참고: 프로덕션에서는 백엔드에서 httpOnly로 관리하는 것이 이상적입니다
 * 注意：本番環境ではバックエンドでhttpOnlyとして管理するのが理想的です
 */
export const setGoogleRefreshToken = refreshTokenKey => {
  if (refreshTokenKey !== null && refreshTokenKey !== undefined) {
    Cookies.set(
      CONFIG.gRefreshKey,
      refreshTokenKey,
      getCookieOptions(CONFIG.refreshExpires)
    );
  }
};

/**
 * Get Google OAuth access token from cookie
 * 쿠키에서 Google OAuth 액세스 토큰 가져오기
 * CookieからGoogle OAuthアクセストークンを取得
 *
 * @returns {string|null} Google access token or null if not found
 */
export const getGoogleAccessToken = () => {
  const keyValue = Cookies.get(CONFIG.gAccessKey);
  return keyValue === undefined ? null : keyValue;
};

/**
 * Get Google OAuth refresh token from cookie
 * 쿠키에서 Google OAuth 리프레시 토큰 가져오기
 * CookieからGoogle OAuthリフレッシュトークンを取得
 *
 * @returns {string|null} Google refresh token or null if not found
 */
export const getGoogleRefreshToken = () => {
  const keyValue = Cookies.get(CONFIG.gRefreshKey);
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
 * Remove all access tokens (for logout)
 * 모든 액세스 토큰 삭제 (로그아웃용)
 * すべてのアクセストークンを削除（ログアウト用）
 *
 * Removes both JWT and Google OAuth access tokens from cookies
 * JWT 및 Google OAuth 액세스 토큰을 쿠키에서 삭제
 * JWTおよびGoogle OAuthアクセストークンをCookieから削除
 */
export const removeAccessTokens = () => {
  Cookies.remove(CONFIG.accessKey);
  Cookies.remove(CONFIG.gAccessKey);
};

/**
 * Remove all refresh tokens (for logout)
 * 모든 리프레시 토큰 삭제 (로그아웃용)
 * すべてのリフレッシュトークンを削除（ログアウト用）
 *
 * Removes both JWT and Google OAuth refresh tokens from cookies
 * JWT 및 Google OAuth 리프레시 토큰을 쿠키에서 삭제
 * JWTおよびGoogle OAuthリフレッシュトークンをCookieから削除
 *
 * Note: JWT refresh token is httpOnly (managed by backend), but we still
 * attempt to remove it for consistency. Backend logout should clear httpOnly cookies.
 *
 * 참고: JWT 리프레시 토큰은 httpOnly(백엔드 관리)이지만,
 * 일관성을 위해 삭제를 시도합니다. 백엔드 로그아웃이 httpOnly 쿠키를 삭제해야 합니다.
 *
 * 注意：JWTリフレッシュトークンはhttpOnly（バックエンド管理）ですが、
 * 一貫性のため削除を試みます。バックエンドログアウトがhttpOnly Cookieをクリアする必要があります。
 */
export const removeRefreshTokens = () => {
  Cookies.remove(CONFIG.refreshKey);
  Cookies.remove(CONFIG.gRefreshKey);
};

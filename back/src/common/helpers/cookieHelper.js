/**
 * Cookie Helper Module for Secure Token Management
 * 보안 토큰 관리를 위한 쿠키 헬퍼 모듈
 * セキュアなトークン管理のためのCookieヘルパーモジュール
 *
 * Security Strategy:
 * - Refresh tokens: httpOnly cookies (XSS attack prevention)
 * - Access tokens: Regular cookies (readable by frontend for memory storage)
 *
 * 보안 전략:
 * - 리프레시 토큰: httpOnly 쿠키 (XSS 공격 방어)
 * - 액세스 토큰: 일반 쿠키 (프론트엔드에서 읽어 메모리 저장)
 *
 * セキュリティ戦略：
 * - リフレッシュトークン：httpOnly Cookie（XSS攻撃防御）
 * - アクセストークン：通常Cookie（フロントエンドで読み取りメモリ保存）
 */

// Cookie configuration from environment variables
// 환경변수에서 쿠키 설정 값 가져오기
// 環境変数からCookie設定値を取得
const CONFIG = {
  accessKey: process.env.COOKIE_KEY_A,
  refreshKey: process.env.COOKIE_KEY_B,
  gAccessKey: process.env.COOKIE_KEY_C,
  gRefreshKey: process.env.COOKIE_KEY_D,
  accessExpires: parseInt(process.env.COOKIE_EXPIRES_A),
  refreshExpires: parseInt(process.env.COOKIE_EXPIRES_B),
};

/**
 * Get common cookie options based on environment
 * 환경에 따른 공통 쿠키 옵션 반환
 * 環境に応じた共通Cookieオプションを返す
 *
 * @param {boolean} httpOnly - Whether cookie should be httpOnly
 * @param {number} maxAge - Cookie expiration time in milliseconds
 * @returns {Object} Cookie options
 */
const getCookieOptions = (httpOnly, maxAge) => {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    maxAge,
    httpOnly,
    secure: isProduction, // HTTPS only in production / 프로덕션에서만 HTTPS / 本番環境でのみHTTPS
    sameSite: "lax", // CSRF protection with OAuth compatibility / OAuth 호환 CSRF 방어 / OAuth互換のCSRF防御
  };
};

/**
 * Set JWT refresh token as httpOnly cookie
 * JWT 리프레시 토큰을 httpOnly 쿠키로 설정
 * JWTリフレッシュトークンをhttpOnly Cookieとして設定
 *
 * @param {Object} res - Express response object
 * @param {string} refreshToken - JWT refresh token
 *
 * Security: httpOnly prevents JavaScript access (XSS protection)
 * 보안: httpOnly로 JavaScript 접근 차단 (XSS 방어)
 * セキュリティ：httpOnlyでJavaScriptアクセスをブロック（XSS防御）
 */
const setRefreshTokenCookie = (res, refreshToken) => {
  res.cookie(
    CONFIG.refreshKey,
    refreshToken,
    getCookieOptions(true, CONFIG.refreshExpires)
  );
};

/**
 * Set Google refresh token as httpOnly cookie
 * Google 리프레시 토큰을 httpOnly 쿠키로 설정
 * GoogleリフレッシュトークンをhttpOnly Cookieとして設定
 *
 * @param {Object} res - Express response object
 * @param {string} googleRefreshToken - Google OAuth refresh token
 */
const setGoogleRefreshTokenCookie = (res, googleRefreshToken) => {
  res.cookie(
    CONFIG.gRefreshKey,
    googleRefreshToken,
    getCookieOptions(true, CONFIG.refreshExpires)
  );
};

/**
 * Set JWT access token as regular cookie
 * JWT 액세스 토큰을 일반 쿠키로 설정
 * JWTアクセストークンを通常Cookieとして設定
 *
 * @param {Object} res - Express response object
 * @param {string} accessToken - JWT access token
 *
 * Note: httpOnly is false to allow frontend to read and move to memory
 * 참고: 프론트엔드에서 읽어 메모리로 이동할 수 있도록 httpOnly false
 * 注意：フロントエンドで読み取りメモリに移動できるようhttpOnly false
 */
const setAccessTokenCookie = (res, accessToken) => {
  res.cookie(
    CONFIG.accessKey,
    accessToken,
    getCookieOptions(false, CONFIG.accessExpires)
  );
};

/**
 * Set Google access token as regular cookie
 * Google 액세스 토큰을 일반 쿠키로 설정
 * Googleアクセストークンを通常Cookieとして設定
 *
 * @param {Object} res - Express response object
 * @param {string} googleAccessToken - Google OAuth access token
 */
const setGoogleAccessTokenCookie = (res, googleAccessToken) => {
  res.cookie(
    CONFIG.gAccessKey,
    googleAccessToken,
    getCookieOptions(false, CONFIG.accessExpires)
  );
};

/**
 * Clear all authentication cookies (for logout)
 * 모든 인증 쿠키 삭제 (로그아웃용)
 * すべての認証Cookieをクリア（ログアウト用）
 *
 * @param {Object} res - Express response object
 *
 * Removes both JWT and Google OAuth tokens from cookies
 * JWT 및 Google OAuth 토큰을 모두 쿠키에서 제거
 * JWTおよびGoogle OAuthトークンをすべてCookieから削除
 */
const clearAllCookies = (res) => {
  res.clearCookie(CONFIG.gAccessKey);
  res.clearCookie(CONFIG.gRefreshKey);
  res.clearCookie(CONFIG.accessKey);
  res.clearCookie(CONFIG.refreshKey);
};

module.exports = {
  setRefreshTokenCookie,
  setGoogleRefreshTokenCookie,
  setAccessTokenCookie,
  setGoogleAccessTokenCookie,
  clearAllCookies,
  CONFIG, // Export for testing or other modules / 테스트 또는 다른 모듈용 / テストまたは他のモジュール用
};

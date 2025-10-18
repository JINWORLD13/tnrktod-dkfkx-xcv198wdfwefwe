const authRouter = require("express").Router();
const googlePassport = require("../middlewares/googlePassportForJWT");
const AppError = require("../../common/errors/AppError");
const createAndSendTokens = require("../middlewares/createAndSendTokens");
const { refreshVerify } = require("../../common/helpers/jwt");
const { clearAllCookies } = require("../../common/helpers/cookieHelper");
const jwt = require("jsonwebtoken");
const secretKey = require("../../config/secretKey").secretKey;

/**
 * Auth Router: Google OAuth 2.0 authentication and token management
 * 인증 라우터: Google OAuth 2.0 인증 및 토큰 관리
 * 認証ルーター：Google OAuth 2.0認証とトークン管理
 */

// Environment-based route paths for better configuration management
// 환경변수 기반 라우트 경로 설정으로 더 나은 설정 관리
// より良い設定管理のための環境変数ベースのルートパス
const AUTH_PATHS = {
  googleStart: process.env.AUTH_PATH_A,
  googleCallback: process.env.AUTH_PATH_B,
  googleFail: process.env.AUTH_PATH_C,
  googleLogout: process.env.AUTH_PATH_D,
  refresh: process.env.AUTH_PATH_E,
};

const AUTH_BASE_PATH = process.env.AUTH_BASE_PATH;
const APP_DEEP_LINK_SCHEME = process.env.APP_SCHEME;

/**
 * Start Google OAuth login flow
 * Google OAuth 로그인 플로우 시작
 * Google OAuthログインフローの開始
 * @param {string} redirect_uri - Optional redirect URI for mobile app deep linking
 */
authRouter.get(
  AUTH_PATHS.googleStart,
  (req, res, next) => {
    const redirectUri = req?.query?.redirect_uri || "";

    // Store redirect URI in temporary cookie for OAuth flow persistence
    // OAuth 플로우 유지를 위해 리다이렉트 URI를 임시 쿠키에 저장
    // OAuthフロー維持のため、リダイレクトURIを一時Cookieに保存
    if (redirectUri) {
      res.cookie("oauth_redirect_uri", redirectUri, {
        httpOnly: true,
        maxAge: 10 * 60 * 1000, // 10 minutes / 10분 / 10分
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
    }

    next();
  },
  googlePassport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline", // Required for refresh token / 리프레시 토큰 발급용 / リフレッシュトークン発行用
    prompt: "consent", // Force consent screen for refresh token / 리프레시 토큰 발급을 위한 동의 화면 / リフレッシュトークン発行のための同意画面
  })
);

/**
 * Google OAuth callback handler
 * Google OAuth 콜백 핸들러
 * Google OAuthコールバックハンドラー
 */
authRouter.get(
  AUTH_PATHS.googleCallback,
  googlePassport.authenticate("google", {
    session: false,
    failureRedirect: `${AUTH_BASE_PATH}${AUTH_PATHS.googleFail}`,
  }),
  (req, res, next) => {
    const redirectUri = req.cookies.oauth_redirect_uri || "";
    res.clearCookie("oauth_redirect_uri");
    createAndSendTokens(req, res, next, redirectUri);
  }
);

/**
 * OAuth failure redirect handler
 * OAuth 실패 리다이렉트 핸들러
 * OAuth失敗リダイレクトハンドラー
 */
authRouter.get(AUTH_PATHS.googleFail, (req, res, next) => {
  const redirectUri = req.cookies.oauth_redirect_uri || "";
  res.clearCookie("oauth_redirect_uri");

  if (redirectUri && redirectUri.startsWith(APP_DEEP_LINK_SCHEME)) {
    res.redirect(`${redirectUri}`);
  } else {
    res.redirect(process.env.CLIENT_URL);
  }
});

/**
 * Logout handler - clears all authentication cookies
 * 로그아웃 핸들러 - 모든 인증 쿠키 삭제
 * ログアウトハンドラー - すべての認証Cookieをクリア
 *
 * @param {string} redirect_uri - Optional redirect URI after logout
 */
authRouter.get(AUTH_PATHS.googleLogout, (req, res, next) => {
  try {
    clearAllCookies(res);
    const logoutRedirectUri = req?.query?.redirect_uri || "";

    if (
      logoutRedirectUri &&
      logoutRedirectUri.startsWith(APP_DEEP_LINK_SCHEME)
    ) {
      res.redirect(`${logoutRedirectUri}`);
    } else {
      res.redirect(process.env.CLIENT_URL);
    }
  } catch (err) {
    next(new AppError(err.name, err.message, 401));
  }
});

/**
 * Token refresh endpoint - generates new access token using refresh token
 * 토큰 갱신 엔드포인트 - 리프레시 토큰으로 새 액세스 토큰 생성
 * トークン更新エンドポイント - リフレッシュトークンで新しいアクセストークンを生成
 *
 * @param {string} refresh-token - Refresh token from header (for native app) or cookie (for web)
 * @returns {Object} New access token
 */
authRouter.post(AUTH_PATHS.refresh, async (req, res, next) => {
  try {
    // Read refresh token from header (native app) or cookie (web)
    // 리프레시 토큰: 헤더(네이티브 앱) 또는 쿠키(웹)에서 읽기
    // リフレッシュトークン：ヘッダー（ネイティブアプリ）またはCookie（Web）から読み取り
    const refreshToken =
      req.headers["refresh-token"] || req.cookies.refreshTokenCosmos;

    if (!refreshToken) {
      return next(
        new AppError(
          "no refresh token",
          "리프레시 토큰이 없습니다. 다시 로그인 해주세요.",
          401
        )
      );
    }

    // Extract userId from expired access token (payload is still readable when expired)
    // 만료된 액세스 토큰에서 userId 추출 (만료되어도 payload는 읽을 수 있음)
    // 期限切れのアクセストークンからuserIdを抽出（期限切れでもペイロードは読み取り可能）
    let userId;
    try {
      const decoded = jwt.decode(
        req.body.accessToken || req.headers.authorization?.slice(7)
      );
      userId = decoded?.user?.id;
    } catch (err) {
      // Fallback: extract userId from refresh token if access token is unavailable
      // 액세스 토큰이 없는 경우 리프레시 토큰에서 추출
      // アクセストークンがない場合、リフレッシュトークンから抽出
      const decodedRefresh = jwt.verify(refreshToken, secretKey);
      userId = decodedRefresh?.user?.id;
    }

    if (!userId) {
      return next(
        new AppError("invalid token", "유효하지 않은 토큰입니다.", 401)
      );
    }

    // Verify refresh token and generate new access token
    // 리프레시 토큰 검증 및 새 액세스 토큰 생성
    // リフレッシュトークンを検証し、新しいアクセストークンを生成
    const result = refreshVerify(refreshToken, userId);

    if (result.error) {
      return next(
        new AppError(
          "token refresh failed",
          "토큰 갱신에 실패했습니다. 다시 로그인 해주세요.",
          401
        )
      );
    }

    res.status(200).json({
      success: true,
      data: {
        newAccessToken: result.newAccessToken,
      },
    });
  } catch (err) {
    next(new AppError(err.name, err.message, 401));
  }
});

module.exports = authRouter;

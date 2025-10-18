const AppError = require("../../common/errors/AppError");
const { buildResponse } = require("../../common/utils/util");
const { verify, refreshVerify } = require("../../common/helpers/jwt");
const jwt = require("jsonwebtoken");

// JWT 토큰 갱신 미들웨어: Access Token 만료 시 Refresh Token으로 자동 갱신
// JWT token refresh middleware: auto-renew with Refresh Token when Access Token expires
// JWTトークン更新ミドルウェア：Access Token期限切れ時にRefresh Tokenで自動更新
const checkTokenWithRefresh = async (req, res, next) => {
  try {
    if (req.headers["authorization"] && req.headers["refresh-token"]) {
      const accessToken = req.headers["authorization"].slice(7);
      const refreshToken = req.headers["refresh-token"];

      // Access Token 서명 검증: 만료 및 유효성 확인
      // Verify Access Token signature: check expiration and validity
      // Access Tokenの署名検証：有効期限と正当性を確認
      const accessVerifiedResult = verify(accessToken);

      // Access Token 디코딩: 사용자 정보 추출 (서명 검증 없음)
      // Decode Access Token: extract user info (without signature verification)
      // Access Tokenデコード：ユーザー情報抽出（署名検証なし）
      const accessTokenPayload = jwt.decode(accessToken);

      // 토큰 무효성 검사: 잘못된 형식이거나 손상된 토큰
      // Token invalidation check: malformed or corrupted token
      // トークン無効性検査：不正な形式または破損したトークン
      if (accessTokenPayload === null || accessTokenPayload === undefined) {
        next(new AppError("unauthorization", "권한이 없습니다!", 401));
      }

      // 사용자 정보 전달: 후속 미들웨어에서 사용
      // Pass user info: for use in subsequent middleware
      // ユーザー情報を渡す：後続のミドルウェアで使用
      req.user = accessTokenPayload?.user.id;

      // Refresh Token 검증: 사용자 ID 기반 유효성 확인
      // Verify Refresh Token: validate based on user ID
      // Refresh Token検証：ユーザーIDベースの有効性確認
      const refreshVerifiedResult = refreshVerify(
        refreshToken,
        accessTokenPayload?.user?.id
      );

      // Access Token 만료 확인
      // Check Access Token expiration
      // Access Token有効期限確認
      if (accessVerifiedResult?.error?.message === "jwt expired") {
        // Case 1: 두 토큰 모두 만료 - 재로그인 필요
        // Case 1: Both tokens expired - re-login required
        // ケース1：両トークンが期限切れ - 再ログイン必要
        if (
          refreshVerifiedResult?.error?.message === "jwt expired" ||
          refreshVerifiedResult?.error?.message === "invalid token"
        ) {
          next(
            new AppError(
              "unauthorization",
              "다시 로그인해주시길 바랍니다.",
              401
            )
          );
        } else {
          // Case 2: Access Token만 만료 - 자동 갱신
          // Case 2: Only Access Token expired - auto-renew
          // ケース2：Access Tokenのみ期限切れ - 自動更新
          const data = {
            newAccessToken: refreshVerifiedResult.newAccessToken,
          };
          res.status(200).json(buildResponse(data, 200, null));
        }
      } else {
        // Case 3: Access Token 유효 - 갱신 불필요
        // Case 3: Access Token valid - no refresh needed
        // ケース3：Access Token有効 - 更新不要
        next();
      }
    } else {
      // Case 4: 토큰 누락 - 인증 실패
      // Case 4: Missing tokens - authentication failure
      // ケース4：トークン不足 - 認証失敗
      next(
        new AppError(
          "no tokens error",
          "Access Token 혹은 Refresh Token이 없습니다.",
          400
        )
      );
    }
  } catch (err) {
    next(err);
  }
};

module.exports = checkTokenWithRefresh;

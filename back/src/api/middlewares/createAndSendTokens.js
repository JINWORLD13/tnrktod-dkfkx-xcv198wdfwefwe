const jwt = require("../../common/helpers/jwt");
const { userController } = require("../../domains/user/controllers");
const { buildResponse } = require("../../common/utils/util");
const AppError = require("../../common/errors/AppError");
const {
  getGoogleAccessToken,
  getGoogleRefreshToken,
} = require("../../common/helpers/getGoogleToken");
const { userService } = require("../../domains/user/services");
const {
  setRefreshTokenCookie,
  setGoogleRefreshTokenCookie,
  setAccessTokenCookie,
  setGoogleAccessTokenCookie,
} = require("../../common/helpers/cookieHelper");

const createAndSendTokens = async (req, res, next, redirectUri) => {
  try {
    const userId = req?.user?.id || req?.user;
    const googleAccessToken = await getGoogleAccessToken(userId);
    const googleRefreshToken = await getGoogleRefreshToken(userId);

    const userInfo = await userService.getUserById(userId);
    const token = jwt.sign(userInfo);
    const JWTAccessToken = token?.accessToken;
    const JWTRefreshToken = token?.refreshToken;
    /**
    토큰을 사용자에게 전달합니다. (res.setHeader 기능이 자동 셋팅)
    Express 기능 :  res.cookie(), req.cookie.xxxx (<-이건 브라우저에서 알아서 헤더에 추가시켜 보내줌.) 사용 가능.
    암호화 없이 바로 저장. (accessToken이란게 원래 암호화 되어 있음.)
    
    보안 정책:
    - 리프레쉬 토큰: httpOnly 쿠키 (XSS 공격 방어)
    - 액세스 토큰: 일반 쿠키 (프론트에서 읽어서 메모리로 이동)
    */

    // 앱 환경: 딥링크로 토큰 전달 (redirectUri가 앱 스킴으로 시작하는 경우에만)
    if (redirectUri && redirectUri.startsWith("cosmostarot://")) {
      const queryParams = new URLSearchParams({
        cos: JWTAccessToken,
        sin: JWTRefreshToken,
      });

      // 앱으로 리다이렉트(딥링크처리 덕에 native mobile app에선 http, https로 들어가도 다시 여기로 리다이렉트 해줌.)
      // cosmostarot://?cos=xxx&sin=yyy 형태 (cos, sin은 일단 암호로써... 별 도움 안되겠지만)
      res.redirect(`${redirectUri}?${queryParams.toString()}`);
    } else {
      // 웹 환경: 쿠키로 토큰 전달
      // 액세스 토큰: 일반 쿠키 (프론트에서 읽을 수 있음)
      setGoogleAccessTokenCookie(res, googleAccessToken);
      setAccessTokenCookie(res, JWTAccessToken);

      // 리프레쉬 토큰: httpOnly 쿠키 (JavaScript로 접근 불가)
      setGoogleRefreshTokenCookie(res, googleRefreshToken);
      setRefreshTokenCookie(res, JWTRefreshToken);

      // 웹으로 리다이렉트
      res.redirect(process.env.CLIENT_URL);
    }
  } catch (err) {
    next(new AppError(err.name, err.message, 401));
  }
};

module.exports = createAndSendTokens;
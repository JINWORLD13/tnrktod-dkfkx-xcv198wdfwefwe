const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport = require("passport");
const { userService } = require("../../domains/user/services");
const {
  getGoogleAccessToken,
  getGoogleRefreshToken,
} = require("../../common/helpers/getGoogleToken");
const jwt = require("../../common/helpers/jwt");
const useragent = require("useragent");
const areObjectsEqual = require("../../common/utils/areObjectsEqual");

// Google OAuth 인증 전략: JWT 토큰 기반 사용자 인증 처리
// Google OAuth authentication strategy: handles JWT token-based user authentication
// Google OAuth認証戦略：JWTトークンベースのユーザー認証を処理

passport.use(
  "google",
  new GoogleStrategy(
    {
      authorizationURL: process.env.GOOGLE_AUTH_URL,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_SIGN_REDIRECT_URI,
      passReqToCallback: true,
    },
    // Google OAuth 콜백 핸들러: 사용자 정보 저장 및 JWT 토큰 생성
    // Google OAuth callback handler: saves user information and generates JWT tokens
    // Google OAuthコールバックハンドラー：ユーザー情報を保存しJWTトークンを生成
    async function (req, accessToken, refreshToken, profile, done) {
      if (process.env.NODE_ENV === "DEVELOPMENT") {
        console.log("googlePassportForJWT 작동");
      }
      try {
        const agent = useragent.parse(req?.headers?.["user-agent"]);
        const user = {
          // Google OAuth 고유 ID (계정 삭제 전까지 영구적)
          // Google OAuth unique ID (permanent until account deletion)
          // Google OAuth固有ID（アカウント削除まで永続的）
          id: profile?.id,
          email: profile?.emails[0]?.value,
          displayName: profile?.displayName,
          profilePictureUrl: profile?.photos[0]?.value,
          userAgent:
            {
              deviceType: agent.device.toString(),
              os: agent.os.toString(),
              browser: agent.toAgent(),
              login: new Date(),
            } || {},
          ipAdd: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
        };

        const userInDB = await userService.getUserById(user.id);
        let newUserInDB;
        let updatedUserInDB;
        const userWithTokens = { ...user, accessToken, refreshToken };
        if (userInDB === undefined || userInDB === null) {
          newUserInDB = await userService.createUser(userWithTokens);
        } else {
          const oldUser = {
            id: userInDB?.id,
            email: userInDB?.email,
            displayName: userInDB?.displayName,
            profilePictureUrl: userInDB?.profilePictureUrl,
            accessToken: userInDB?.accessToken,
            refreshToken: userInDB?.refreshToken,
            userAgent: userInDB?.userAgent || {},
            ipAdd: userInDB?.ipAdd || "",
          };

          if (!areObjectsEqual(userWithTokens, oldUser)) {
            updatedUserInDB = await userService.updateUser(userWithTokens);
          }
        }

        const googleAccessToken = await getGoogleAccessToken(user.id);
        const googleRefreshToken = await getGoogleRefreshToken(user.id);
        const userInfo = newUserInDB || updatedUserInDB || userInDB;
        const token = jwt.sign(userInfo);
        const JWTAccessToken = token?.accessToken;
        const JWTRefreshToken = token?.refreshToken;

        // Passport done 콜백: Google 및 JWT 토큰을 req.user에 전달
        // Passport done callback: passes Google and JWT tokens to req.user
        // Passport doneコールバック：GoogleおよびJWTトークンをreq.userに渡す
        done(null, {
          id: profile.id,
          gAccessTokenCosmos: googleAccessToken,
          gRefreshTokenCosmos: googleRefreshToken,
          accessTokenCosmos: JWTAccessToken,
          refreshTokenCosmos: JWTRefreshToken,
        });
      } catch (err) {
        console.error(err);
        done(err);
      }
    }
  )
);

// JWT 전략 사용 시 세션 직렬화 불필요
// Session serialization not required when using JWT strategy
// JWT戦略使用時はセッションのシリアル化は不要

const googlePassport = passport;
module.exports = googlePassport;

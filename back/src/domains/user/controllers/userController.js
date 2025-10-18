const { sanitizeObject, buildResponse } = require("../../../common/utils/util");
const AppError = require("../../../common/errors/AppError");
const commonErrors = require("../../../common/errors/commonErrors");
const { userService, deletedUserService } = require("../services");
const { tarotService } = require("../../tarot/services");
const { chargeService } = require("../../charge/services");
const redisClient = require("../../../cache/redisClient");

const userController = {
  // createUser는 실제로 사용되지 않음 (Google OAuth 인증 시 googlePassportForJWT에서 자동 생성)
  // createUser is not actually used (automatically created in googlePassportForJWT during Google OAuth authentication)
  // createUserは実際には使用されません（Google OAuth認証時にgooglePassportForJWTで自動生成されます）
  async createUser(req, res, next) {
    try {
      // Google OAuth 고유 ID로 사용자 식별
      // Identify user by Google OAuth unique ID
      // Google OAuth固有IDでユーザーを識別
      const userId = req?.user ?? req?.session?.user?.id ?? null;
      const userInfo = await userService.getUserById(userId);
      if (!userInfo) {
        const transmittedUserInfo = req?.body.userInfo;
        if (!transmittedUserInfo) {
          return next(
            new AppError(
              "UserInfoMissing",
              "User info is required to create a new user",
              400
            )
          );
        }
        const newUser = await userService.createUser(transmittedUserInfo);
        res?.status(200).json(buildResponse(newUser, null, 200));
      } else {
        // 409 Conflict: 이미 존재하는 사용자
        // 409 Conflict: User already exists
        // 409 Conflict: 既に存在するユーザー
        next(
          new AppError(
            commonErrors.userControllerCreaetUserError,
            commonErrors.userInfoConflictError,
            409
          )
        );
      }
    } catch (err) {
      const customedError = new AppError(err.name, err.message, 401);
      next(customedError);
    }
  },

  // 인증된 토큰 필수: JWT 토큰 검증 후 사용자 정보 조회
  // Authentication required: Retrieve user info after JWT token validation
  // 認証トークン必須：JWTトークン検証後にユーザー情報を取得
  async getUserById(req, res, next) {
    try {
      const userId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = userId;
      if (req?.isAuthenticated() === true) {
        const cachedUser = await redisClient.get(`user:${userId}`);
        if (cachedUser) {
          return res.status(200).json(buildResponse(cachedUser, null, 200));
        }
        let finalUserInfo;
        const userInDB = await userService.getUserById(userId);
        if (userInDB === undefined || userInDB === null) {
          // 404 Not Found: 사용자 정보를 찾을 수 없음
          // 404 Not Found: User information not found
          // 404 Not Found: ユーザー情報が見つかりません
          next(
            new AppError(
              commonErrors.userControllerGetUserByIdError,
              commonErrors.userInfoNotFoundError,
              404
            )
          );
        }
        finalUserInfo = userInDB;
        // 광고 제거 패스 유효성 검증
        // Validate ad-free pass validity
        // 広告削除パスの有効性検証
        const hasValidAdsFreePass = (pass) => {
          return pass?.name && pass?.orderId && pass?.expired;
        };
        if (hasValidAdsFreePass(userInDB?.adsFreePass)) {
          const chargeInfo = await chargeService.getChargeByOrderId(
            userInDB?.adsFreePass?.orderId
          );
          if (!chargeInfo || !chargeInfo?.orderId) {
            finalUserInfo = await userService.updateUser({
              ...userInDB,
              adsFreePass: { name: "", orderId: "", expired: "" },
            });
          }
        }
        // Redis 캐시에 1시간 동안 저장하여 성능 최적화
        // Store in Redis cache for 1 hour for performance optimization
        // パフォーマンス最適化のため1時間Redisキャッシュに保存
        await redisClient.set(`user:${userId}`, finalUserInfo, 3600);
        res?.status(200).json(buildResponse(finalUserInfo, null, 200));
      } else {
        // 401 Unauthorized: 인증되지 않은 요청
        // 401 Unauthorized: Unauthenticated request
        // 401 Unauthorized: 認証されていないリクエスト
        next(
          new AppError(
            commonErrors.userControllerGetUserByIdError,
            commonErrors.userUnauthorizedError,
            401
          )
        );
      }
    } catch (err) {
      next(new AppError(err.name, err.message, 401));
    }
  },

  // 사용자 정보 업데이트 (인증 필수)
  // Update user information (authentication required)
  // ユーザー情報を更新（認証必須）
  async putUser(req, res, next) {
    try {
      const userId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = userId;
      if (req?.isAuthenticated() === true) {
        const userInDB = await userService.getUserById(userId);
        if (userInDB === undefined || userInDB === null) {
          // 404 Not Found: 사용자 정보를 찾을 수 없음
          // 404 Not Found: User information not found
          // 404 Not Found: ユーザー情報が見つかりません
          next(
            new AppError(
              commonErrors.userControllerPutUserError,
              commonErrors.userInfoNotFoundError,
              404
            )
          );
        }
        const transfferedInfo = req?.body;
        // 빈 값 필터링: 유효한 데이터만 업데이트
        // Filter empty values: update only valid data
        // 空の値をフィルタリング：有効なデータのみ更新
        const updatedInfoArr = transfferedInfo?.filter(
          (elem) => elem.length > 0
        );
        const updatedUserInfo = { ...userInDB, ...updatedInfoArr };
        const result = await userService.updateUser(updatedUserInfo);
        res?.status(200).json(buildResponse(result, null, 200));
      } else {
        // 401 Unauthorized: 인증되지 않은 요청
        // 401 Unauthorized: Unauthenticated request
        // 401 Unauthorized: 認証されていないリクエスト
        next(
          new AppError(
            commonErrors.userControllerPutUserError,
            commonErrors.userUnauthorizedError,
            401
          )
        );
      }
    } catch (err) {
      next(new AppError(err.name, err.message, 401));
    }
  },

  // 사용자 계정 삭제 및 관련 데이터 정리
  // Delete user account and clean up related data
  // ユーザーアカウントを削除し、関連データをクリーンアップ
  async deleteUser(req, res, next) {
    try {
      const userId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = userId;
      if (req?.isAuthenticated() === true) {
        // Redis 캐시에서 사용자 데이터 삭제
        // Delete user data from Redis cache
        // Redisキャッシュからユーザーデータを削除
        await redisClient.del(`user:${userId}`);
        await redisClient.del(`cache:tarot:${userId}`);
        const userInDB = await userService.getUserById(userId);
        if (userInDB === undefined || userInDB === null) {
          // 404 Not Found: 사용자 정보를 찾을 수 없음
          // 404 Not Found: User information not found
          // 404 Not Found: ユーザー情報が見つかりません
          next(
            new AppError(
              commonErrors.userControllerDeleteUserError,
              commonErrors.userInfoNotFoundError,
              404
            )
          );
        }

        // 연관된 타로 및 결제 데이터 삭제
        // Delete associated tarot and payment data
        // 関連するタロットおよび決済データを削除
        const result = await tarotService.deleteTarotsByUserObjId(userInDB._id);
        const resultOfDeleteCharge =
          await chargeService.deleteChargesByUserObjId(userInDB._id);

        // 삭제된 사용자 정보를 별도 컬렉션에 보관 (감사 추적용)
        // Store deleted user info in separate collection (for audit trail)
        // 削除されたユーザー情報を別のコレクションに保管（監査追跡用）
        const deletedUser = await userService.deleteUser(userInDB);
        const updatedDeletedUser = {
          ...deletedUser?._doc,
        };
        const resultOfDeletedUser = await deletedUserService.createUser(
          updatedDeletedUser
        );
        // 모든 인증 쿠키 제거
        // Clear all authentication cookies
        // すべての認証クッキーをクリア
        res.clearCookie("gAccessTokenCosmos");
        res.clearCookie("gRefreshTokenCosmos");
        res.clearCookie("accessTokenCosmos");
        res.clearCookie("refreshTokenCosmos");
        res?.status(204).json(buildResponse({ success: true }, null, 204));
      } else {
        // 401 Unauthorized: 인증되지 않은 요청
        // 401 Unauthorized: Unauthenticated request
        // 401 Unauthorized: 認証されていないリクエスト
        next(
          new AppError(
            commonErrors.userControllerDeleteUserError,
            commonErrors.userUnauthorizedError,
            401
          )
        );
      }
    } catch (err) {
      next(new AppError(err.name, err.message, 401));
    }
  },
};

module.exports = userController;

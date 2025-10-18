const tarotCardInterpreterWithAIAPI = require("../../../../AI/tarotCardInterpreterWithAIAPI.js");
const redisClient = require("../../../../cache/redisClient.js");
const AppError = require("../../../../common/errors/AppError.js");
const {
  checkViolationInGoogleInAppRefund,
} = require("../../../../common/helpers/checkViolation.js");
const { userService } = require("../../../user/services/index.js");
const { chargeService } = require("../../../charge/services/index.js");
const checkVouchers = require("../utils/checkVouchers.js");
const createTarotAndSendResponse = require("../utils/createTarotAndSendResponse.js");
const processInterpretation = require("../utils/processInterpretation.js");
const processVoucherConsumption = require("../utils/processVoucherConsumption.js");
const mongoose = require("mongoose");

// AI 타로 해석 요청: 이용권 검증 → AI 해석 → MongoDB 트랜잭션
// AI tarot interpretation request: voucher validation → AI interpretation → MongoDB transaction
// AIタロット解釈リクエスト：利用券検証 → AI解釈 → MongoDBトランザクション
async function postQuestionToAI(req, res, next, modelNumber) {
  try {
    const userId = req?.user ?? req?.session?.user?.id ?? null;
    req.user = userId;
    if (req?.isAuthenticated() === true) {
      const inputQuestionData = req?.body;
      const cachedUser = await redisClient.get(`user:${userId}`);
      const userInfo = cachedUser
        ? cachedUser
        : await userService.getUserById(userId);
      const cardCount = inputQuestionData?.spreadInfo?.cardCount;
      const userVouchers = userInfo?.vouchers;

      // 이용권 보유 수량 검증
      // Validate voucher quantity
      // 利用券保有数量検証
      if (
        (modelNumber === 2 && inputQuestionData?.isVoucherModeOn) ||
        modelNumber === 3 ||
        modelNumber === 4
      ) {
        if (
          !checkVouchers(
            modelNumber,
            cardCount,
            userVouchers,
            inputQuestionData
          )
        ) {
          return res.status(500).json({ success: false });
        }
      }

      // 광고 제거 패스 유효성 검증
      // Validate ad-free pass
      // 広告削除パス有効性検証
      if (
        modelNumber === 2 &&
        !inputQuestionData?.isVoucherModeOn &&
        userInfo?.adsFreePass &&
        userInfo?.adsFreePass?.name &&
        userInfo?.adsFreePass?.orderId &&
        userInfo?.adsFreePass?.expired &&
        userInfo?.adsFreePass?.name !== "" &&
        userInfo?.adsFreePass?.orderId !== "" &&
        userInfo?.adsFreePass?.expired !== ""
      ) {
        const chargeInfo = await chargeService.getChargeByOrderId(
          userInfo?.adsFreePass?.orderId
        );
        if (!chargeInfo || !chargeInfo?.orderId) {
          await userService.updateUser({
            ...userInfo,
            adsFreePass: { name: "", orderId: "", expired: "" },
          });
          return res.status(500).json({ success: false });
        }

        if (new Date(userInfo?.adsFreePass?.expired) < new Date()) {
          return res.status(500).json({ success: false });
        }
      }

      // 환불 위반 사용자 제재
      // Block users with refund violations
      // 払い戻し違反ユーザー制裁
      const isViolated = checkViolationInGoogleInAppRefund(res, userInfo);
      if (isViolated) {
        return;
      }

      // AI 모델 호출: Anthropic Claude 사용
      // Call AI model: uses Anthropic Claude
      // AIモデル呼び出し：Anthropic Claudeを使用
      let interpretation;
      if (modelNumber === 2 || modelNumber === 3 || modelNumber === 4) {
        interpretation = await tarotCardInterpreterWithAIAPI(
          {
            ...inputQuestionData,
          },
          modelNumber
        );
      }

      const interpretationWithoutQuestion = processInterpretation(
        interpretation,
        inputQuestionData
      );

      let type;
      if (modelNumber === 2) {
        type = "anthropic_normal";
      } else if (modelNumber === 3) {
        type = "anthropic_deep";
      } else if (modelNumber === 4) {
        type = "anthropic_serious";
      }

      // MongoDB 트랜잭션: 타로 생성 → 바우처 차감 원자성 보장
      // MongoDB transaction: ensures atomicity of tarot creation → voucher deduction
      // MongoDBトランザクション：タロット生成 → バウチャー減額の原子性保証
      const session = await mongoose.startSession();

      try {
        await session.withTransaction(async () => {
          let updatedUserInfo;
          if (
            inputQuestionData.tarotSpreadVoucherPrice !== undefined &&
            inputQuestionData.tarotSpreadVoucherPrice !== null
          ) {
            await createTarotAndSendResponse(
              inputQuestionData,
              interpretationWithoutQuestion,
              type,
              userInfo,
              res,
              session
            );

            updatedUserInfo = await processVoucherConsumption(
              userInfo,
              inputQuestionData,
              session
            );
          } else {
            await createTarotAndSendResponse(
              inputQuestionData,
              interpretationWithoutQuestion,
              type,
              userInfo,
              res,
              session
            );

            updatedUserInfo = await userService.updateUser(
              {
                ...userInfo,
              },
              session
            );
          }

          // 트랜잭션 성공 후 캐시 무효화
          // Invalidate cache after successful transaction
          // トランザクション成功後にキャッシュを無効化
          await redisClient.del(`user:${userId}`);
          await redisClient.del(`cache:tarot:${userId}`);
          await redisClient.set(`user:${userId}`, updatedUserInfo, 3600);
        });
      } catch (error) {
        throw error;
      } finally {
        await session.endSession();
      }
    } else {
      next(
        new AppError(
          commonErrors.tarotControllerPostQuestionError,
          commonErrors.userInfoNotFoundError,
          404
        )
      );
    }
  } catch (err) {
    next(new AppError(err.name, err.message, err.statusCode));
  }
}

module.exports = postQuestionToAI;

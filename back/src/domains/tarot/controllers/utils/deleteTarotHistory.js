const redisClient = require("../../../../cache/redisClient");
const AppError = require("../../../../common/errors/AppError");
const commonErrors = require("../../../../common/errors/commonErrors");
const { buildResponse } = require("../../../../common/utils/util");
const { tarotService } = require("../../services");

// 타로 히스토리 삭제: 단일/복수 삭제 지원 + 캐시 무효화
// Delete tarot history: single/batch deletion support + cache invalidation
// タロット履歴削除：単一/複数削除サポート + キャッシュ無効化
const deleteTarotHistory = async (req, res, next) => {
  try {
    const userId = req?.user ?? req?.session?.user?.id ?? null;
    req.user = userId;
    if (req?.isAuthenticated() === true) {
      await redisClient.del(`cache:tarot:${userId}`);
      const tarotHistoryData = req?.body?.tarotHistoryData ?? null;

      if (Array.isArray(tarotHistoryData)) {
        const tarotAnswerArr = tarotHistoryData?.map(
          (oneTarotHistoryData, i) => {
            return oneTarotHistoryData?.answer;
          }
        );
        const tarotHistory = await tarotService.deleteTarotsByAnswerArr(
          tarotAnswerArr
        );
        res.status(204).json(buildResponse(null, null, 204));
      }
      if (!Array.isArray(tarotHistoryData)) {
        let tarotAnswer = tarotHistoryData?.answer;
        const tarotHistory = await tarotService.deleteTarotByAnswer(
          tarotAnswer
        );
        res.status(204).json(buildResponse(null, null, 204));
      }
    } else {
      next(
        new AppError(
          commonErrors.tarotControllerDeleteHistoryError,
          commonErrors.userInfoNotFoundError,
          404
        )
      );
    }
  } catch (err) {
    next(new AppError(err.name, err.message, err.statusCode));
  }
};

module.exports = deleteTarotHistory;

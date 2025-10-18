const { tarotController } = require("../../domains/tarot/controllers/index");
const checkTokenWithRefresh = require("../middlewares/checkTokenWithRefresh");
const tarotRouter = require("express").Router();

// Tarot 라우터: AI 질문, 히스토리 조회/삭제
// Tarot router: AI questions, history retrieval/deletion
// Tarotルーター：AI質問、履歴照会/削除

const TAROT_PATHS = {
  history: process.env.TAROT_HISTORY_PATH,
  delete: process.env.TAROT_DELETE_PATH,
  tier1: process.env.TAROT_TIER_1_PATH,
  tier2: process.env.TAROT_TIER_2_PATH,
  tier3: process.env.TAROT_TIER_3_PATH,
};

tarotRouter.post(
  TAROT_PATHS.tier1,
  checkTokenWithRefresh,
  tarotController.postQuestionForNormalToAI
);

tarotRouter.post(
  TAROT_PATHS.tier2,
  checkTokenWithRefresh,
  tarotController.postQuestionForDeepToAI
);

tarotRouter.post(
  TAROT_PATHS.tier3,
  checkTokenWithRefresh,
  tarotController.postQuestionForSeriousToAI
);

tarotRouter.get(
  TAROT_PATHS.history,
  checkTokenWithRefresh,
  tarotController.getHistory
);

tarotRouter.delete(
  TAROT_PATHS.delete,
  checkTokenWithRefresh,
  tarotController.deleteHistory
);

module.exports = tarotRouter;

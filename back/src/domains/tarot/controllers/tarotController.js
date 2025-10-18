const postQuestionToAI = require("./utils/postQuestionToAI");
const getTarotHistory = require("./utils/getTarotHistory");
const deleteTarotHistory = require("./utils/deleteTarotHistory");

const tarotController = {
  async postQuestionForNormalToAI(req, res, next) {
    // if (req.headers["x-forwarded-for"].includes("222.113.168.180")) {
    //   res.status(500).json({ success: false });
    //   return;
    // }
    await postQuestionToAI(req, res, next, 2);
  },

  async postQuestionForDeepToAI(req, res, next) {
    // if (req.headers["x-forwarded-for"].includes("222.113.168.180")) {
    //   res.status(500).json({ success: false });
    //   return;
    // }
    await postQuestionToAI(req, res, next, 3);
  },

  async postQuestionForSeriousToAI(req, res, next) {
    // if (req.headers["x-forwarded-for"].includes("222.113.168.180")) {
    //   res.status(500).json({ success: false });
    //   return;
    // }
    await postQuestionToAI(req, res, next, 4);
  },

  async getHistory(req, res, next) {
    await getTarotHistory(req, res, next);
  },

  async deleteHistory(req, res, next) {
    await deleteTarotHistory(req, res, next);
  },
};

module.exports = tarotController;

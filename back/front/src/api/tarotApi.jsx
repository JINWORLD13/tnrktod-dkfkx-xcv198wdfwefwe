import { makeApiRequest, createCancelToken } from './api.jsx';

// Tarot API: 히스토리 조회, AI 질문 요청, 히스토리 삭제
// Tarot API: history retrieval, AI question request, history deletion
// Tarot API：履歴照会、AI質問リクエスト、履歴削除


const TAROT_PATHS = {
  history: import.meta.env.VITE_TAROT_HISTORY_PATH,
  question: import.meta.env.VITE_TAROT_QUESTION_PATH,
  questionAds: import.meta.env.VITE_TAROT_QUESTION_ADS_PATH,
  delete: import.meta.env.VITE_TAROT_DELETE_PATH,
  tier1: import.meta.env.VITE_TAROT_TIER_1_PATH,
  tier2: import.meta.env.VITE_TAROT_TIER_2_PATH,
  tier3: import.meta.env.VITE_TAROT_TIER_3_PATH,
};

export const tarotApi = {
  getHistory: async (cancelToken = null) => {
    const result = await makeApiRequest(
      'get',
      TAROT_PATHS.history,
      null,
      cancelToken,
      'tarotApi.getHistory'
    );

    return {
      response: result.response,
      cleanup: result.cleanup,
    };
  },

  getHistoryForSub: async () => {
    const result = await makeApiRequest(
      'get',
      TAROT_PATHS.history,
      null,
      null,
      'tarotApi.getHistoryForSub'
    );

    return {
      response: result.response,
      cleanup: result.cleanup,
    };
  },

  postQuestionForPurchase: async form => {
    const result = await makeApiRequest(
      'post',
      TAROT_PATHS.question,
      { ...form },
      null,
      'tarotApi.postQuestionForPurchase'
    );

    return {
      response: result.response,
      cleanup: result.cleanup,
    };
  },

  postQuestionForAds: async form => {
    const result = await makeApiRequest(
      'post',
      TAROT_PATHS.questionAds,
      { ...form },
      null,
      'tarotApi.postQuestionForAds'
    );

    return {
      response: result.response,
      cleanup: result.cleanup,
    };
  },

  postQuestionForNormalForAnthropicAPI: async form => {
    const result = await makeApiRequest(
      'post',
      TAROT_PATHS.tier1,
      { ...form },
      null,
      'tarotApi.postQuestionForNormal'
    );

    return {
      response: result.response,
      cleanup: result.cleanup,
    };
  },

  /**
   * 타로 질문 전송 (심층 모드)
   */
  postQuestionForDeepForAnthropicAPI: async form => {
    const result = await makeApiRequest(
      'post',
      TAROT_PATHS.tier2,
      { ...form },
      null,
      'tarotApi.postQuestionForDeep'
    );

    return {
      response: result.response,
      cleanup: result.cleanup,
    };
  },

  /**
   * 타로 질문 전송 (진지 모드)
   */
  postQuestionForSeriousForAnthropicAPI: async form => {
    const result = await makeApiRequest(
      'post',
      TAROT_PATHS.tier3,
      { ...form },
      null,
      'tarotApi.postQuestionForSerious'
    );

    return {
      response: result.response,
      cleanup: result.cleanup,
    };
  },

  /**
   * 타로 히스토리 삭제 (개별)
   */
  deleteHistory: async tarotHistoryData => {
    const result = await makeApiRequest(
      'delete',
      TAROT_PATHS.delete,
      { tarotHistoryData },
      null,
      'tarotApi.deleteHistory'
    );

    // 기존과 동일: status 204일 때 'success' 반환
    if (result.status === 204) {
      return { response: 'success', cleanup: result.cleanup };
    }
    return { response: null, cleanup: result.cleanup };
  },

  /**
   * 타로 히스토리 전체 삭제
   */
  deleteAllHistory: async () => {
    const result = await makeApiRequest(
      'delete',
      TAROT_PATHS.delete,
      null,
      null,
      'tarotApi.deleteAllHistory'
    );

    // 기존과 동일: status 204일 때 'success' 반환
    if (result.status === 204) {
      return { response: 'success', cleanup: result.cleanup };
    }
    return { response: null, cleanup: result.cleanup };
  },
};

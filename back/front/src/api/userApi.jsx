import { makeApiRequest, createCancelToken } from './api.jsx';

// User API: 사용자 정보 조회, 수정, 회원 탈퇴
// User API: user info retrieval, modification, withdrawal
// User API：ユーザー情報照会、修正、会員退会

const USER_PATHS = {
  userinfo: import.meta.env.VITE_USER_USERINFO_PATH,
  userinfoChange: import.meta.env.VITE_USER_USERINFO_CHANGE_PATH,
  userinfoWithdraw: import.meta.env.VITE_USER_USERINFO_WITHDRAW_PATH,
};

export const userApi = {
  modify: async form => {
    const result = await makeApiRequest(
      'put',
      USER_PATHS.userinfoChange,
      { ...form },
      null,
      'userApi.modify'
    );

    return {
      response: result.response?.data,
      cleanup: result.cleanup,
    };
  },

  withdraw: async () => {
    const result = await makeApiRequest(
      'delete',
      USER_PATHS.userinfoWithdraw,
      null,
      null,
      'userApi.withdraw'
    );

    if (result.status === 204) {
      return { response: result.status, cleanup: result.cleanup };
    }
    return { response: null, cleanup: result.cleanup };
  },

  get: async (cancelToken = null) => {
    const result = await makeApiRequest(
      'get',
      USER_PATHS.userinfo,
      null,
      cancelToken,
      'userApi.get'
    );

    if (result.status >= 200 && result.status < 300) {
      return {
        response: result.response?.data,
        cleanup: result.cleanup,
      };
    }
    return { response: null, cleanup: result.cleanup };
  },

  getForSub: async () => {
    const result = await makeApiRequest(
      'get',
      USER_PATHS.userinfo,
      null,
      null,
      'userApi.getForSub'
    );

    // 기존과 동일: status 체크 및 res.data.data 반환
    if (result.status >= 200 && result.status < 300) {
      return {
        response: result.response?.data,
        cleanup: result.cleanup,
      };
    }
    return { response: null, cleanup: result.cleanup };
  },
};

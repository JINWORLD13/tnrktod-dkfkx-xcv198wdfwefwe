import { createSlice } from '@reduxjs/toolkit';

// Redux Store: 사용자 정보 전역 상태 관리
// Redux Store: global state management for user information
// Reduxストア：ユーザー情報のグローバル状態管理
let userInfoStore = createSlice({
  name: 'userInfoStore',
  initialState: { userInfo: {}, userInfoForRefund: {} },
  reducers: {
    setUserInfoAction(state, action) {
      state.userInfo = action.payload;
    },
    setUserInfoForRefundAction(state, action) {
      state.userInfoForRefund = action.payload;
    },
  },
});

export let { setUserInfoAction, setUserInfoForRefundAction } =
  userInfoStore.actions;

export default userInfoStore;

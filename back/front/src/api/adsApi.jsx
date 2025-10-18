// import { getAccessToken, getRefreshToken } from '../utils/storage/tokenLocalStorage.jsx';
import { Capacitor } from '@capacitor/core';
import { getAccessToken, getRefreshToken } from '../utils/storage/tokenCookie.jsx';
import {
  getAccessTokenForPreference,
  getRefreshTokenForPreference,
} from '../utils/storage/tokenPreference.jsx';
const isNative = Capacitor.isNativePlatform();
const getAccessToken2 = async () => {
  if (isNative) {
    return await getAccessTokenForPreference();
  } else {
    return getAccessToken();
  }
};

const getRefreshToken2 = async () => {
  if (isNative) {
    return await getRefreshTokenForPreference();
  } else {
    return getRefreshToken();
  }
};
import { apiWithTokensModule } from './api.jsx';
import axios from 'axios';

const TAROT_PATHS = {
  question: import.meta.env.VITE_TAROT_QUESTION_PATH,
};

export const adsApi = {

  postAdMobReward: async form => {
    const accessToken = await getAccessToken2();
    const refreshToken = await getRefreshToken2();
    const { apiWithTokens, cleanup } = apiWithTokensModule(
      accessToken,
      refreshToken
    );

    try {
      const res = await apiWithTokens.post(TAROT_PATHS.question, { ...form });
      return { response: res.data, cleanup }; // cleanup 함수를 함께 반환
    } catch (error) {
      console.error(error);
      if (!axios.isCancel(error)) {

        if (
          window.confirm('Network error occurred. Please connect internet.')
        ) {
          window.location.reload();
        } else {
          if (error?.response) {
            console.error('SSV verification failed:', error?.response?.data);
          } else if (error?.request) {
            console.error('No response received:', error?.request);
          } else {
            console.error('Error setting up the request:', error?.message);
          }
          console.error('SSV verification failed');
        }
      } else {


        console.error('postQuestionForPurchase Error:', error);
      }
      return { data: null, cleanup }; // 에러 발생 시에도 cleanup 반환
    }
  },
};

// // 새로고침할건지 묻고 확인시 새로고침
// if (window.confirm('Network error occurred. Do you want to refresh the page?')) {
//   window.location.reload();
// }

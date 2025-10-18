// import { getAccessToken, getRefreshToken, removeAccessTokens, removeRefreshTokens } from '../utils/storage/tokenLocalStorage';
import { Capacitor } from '@capacitor/core';
import {
  getAccessToken,
  getRefreshToken,
} from '../utils/storage/tokenCookie.jsx';
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

// Charge API: Toss Payments 결제, 환불, Google Play 인앱결제
// Charge API: Toss Payments payment, refund, Google Play in-app purchase
// Charge API：Toss Payments決済、払い戻し、Google Playアプリ内購入

const CHARGE_PATHS = {
  tossPrePayment: import.meta.env.VITE_CHARGE_TOSS_PRE_PAYMENT_PATH,
  tossPrePaymentByPaymentKey: import.meta.env.VITE_CHARGE_TOSS_PRE_PAYMENT_BY_PAYMENT_KEY_PATH,
  tossPaymentConfirm: import.meta.env.VITE_CHARGE_TOSS_PAYMENT_CONFIRM_PATH,
  tossPaymentCancelPart: import.meta.env.VITE_CHARGE_TOSS_PAYMENT_CANCEL_PART_PATH,
  googlePlayPayment: import.meta.env.VITE_CHARGE_GOOGLE_PLAY_PAYMENT_PATH,
  purchaseLimit: import.meta.env.VITE_CHARGE_PURCHASE_LIMIT_PATH,
};

export const chargeApi = {
  postPrePaymentForToss: async form => {
    const accessToken = await getAccessToken2();
    const refreshToken = await getRefreshToken2();
    const { apiWithTokens, cleanup } = apiWithTokensModule(
      accessToken,
      refreshToken
    );
    try {
      const res = await apiWithTokens.post(CHARGE_PATHS.tossPrePayment, {
        ...form,
      });
      return { response: res.data, cleanup };
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error:', JSON.stringify(error));
        if (
          window.confirm(
            'Network error occurred. Failed to post PrePaymentForToss.'
          )
        ) {
          window.location.reload();
        } else {
          console.error('postPrePaymentForToss Error:', JSON.stringify(error));
        }
      } else {
        console.error('postPrePaymentForToss Error:', JSON.stringify(error));
      }
      return { response: null, cleanup };
    }
  },

  getPrePaymentForToss: async () => {
    const accessToken = await getAccessToken2();
    const refreshToken = await getRefreshToken2();
    const { apiWithTokens, cleanup } = apiWithTokensModule(
      accessToken,
      refreshToken
    );
    try {
      const res = await apiWithTokens.get(CHARGE_PATHS.tossPrePayment);
      return { response: res.data.chargeInfo, cleanup };
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error:', JSON.stringify(error));
        if (
          window.confirm(
            'Network error occurred. Failed to get PrePaymentForToss.'
          )
        ) {
          window.location.reload();
        } else {
          console.error('getPrePaymentForToss Error:', JSON.stringify(error));
        }
      } else {
        扇.error('getPrePaymentForToss Error:', JSON.stringify(error));
      }
      return { response: null, cleanup };
    }
  },

  getPrePaymentForTossByOrderId: async form => {
    const accessToken = await getAccessToken2();
    const refreshToken = await getRefreshToken2();
    const { apiWithTokens, cleanup } = apiWithTokensModule(
      accessToken,
      refreshToken
    );
    try {
      const res = await apiWithTokens.get(
        `${CHARGE_PATHS.tossPrePayment}?orderId=${form?.orderId}`
      );
      return { response: res.data.chargeInfo, cleanup };
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error:', JSON.stringify(error));
        if (
          window.confirm(
            'Network error occurred. Failed to get PrePaymentForTossByOrderId.'
          )
        ) {
          window.location.reload();
        } else {
          console.error(
            'getPrePaymentForTossByOrderId Error:',
            JSON.stringify(error)
          );
        }
      } else {
        console.error(
          'getPrePaymentForTossByOrderId Error:',
          JSON.stringify(error)
        );
      }
      return { response: null, cleanup };
    }
  },

  deletePrePaymentForTossByOrderId: async form => {
    const accessToken = await getAccessToken2();
    const refreshToken = await getRefreshToken2();
    const { apiWithTokens, cleanup } = apiWithTokensModule(
      accessToken,
      refreshToken
    );
    try {
      const res = await apiWithTokens.delete(CHARGE_PATHS.tossPrePayment, {
        data: { orderId: form?.orderId },
      });
      return { response: res.data, cleanup };
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error:', JSON.stringify(error));
        if (
          window.confirm(
            'Network error occurred. Failed to delete PrePaymentForTossByOrderId.'
          )
        ) {
          window.location.reload();
        } else {
          console.error(
            'deletePrePaymentForTossByOrderId Error:',
            JSON.stringify(error)
          );
        }
      } else {
        console.error(
          'deletePrePaymentForTossByOrderId Error:',
          JSON.stringify(error)
        );
      }
      return { response: null, cleanup };
    }
  },

  // "not yet"인거 없애기
  deletePrePaymentForTossByPaymentKey: async form => {
    const accessToken = await getAccessToken2();
    const refreshToken = await getRefreshToken2();
    const { apiWithTokens, cleanup } = apiWithTokensModule(
      accessToken,
      refreshToken
    );
    try {
      const res = await apiWithTokens.delete(
        CHARGE_PATHS.tossPrePaymentByPaymentKey,
        {
          data: { paymentKey: form?.paymentKey },
        }
      );
      return { response: res.data, cleanup };
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error:', JSON.stringify(error));
        if (
          window.confirm(
            'Network error occurred. Failed to delete PrePaymentForTossByPaymentKey.'
          )
        ) {
          window.location.reload();
        } else {
          console.error(
            'deletePrePaymentForTossByPaymentKey Error:',
            JSON.stringify(error)
          );
        }
      } else {
        console.error(
          'deletePrePaymentForTossByPaymentKey Error:',
          JSON.stringify(error)
        );
      }
      return { response: null, cleanup };
    }
  },

  putPrePaymentForToss: async form => {
    const accessToken = await getAccessToken2();
    const refreshToken = await getRefreshToken2();
    const { apiWithTokens, cleanup } = apiWithTokensModule(
      accessToken,
      refreshToken
    );
    try {
      const res = await apiWithTokens.put(CHARGE_PATHS.tossPrePayment, {
        ...form,
      });
      return { response: res.data, cleanup };
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error:', JSON.stringify(error));
        if (
          window.confirm(
            'Network error occurred. Failed to put PrePaymentForToss.'
          )
        ) {
          window.location.reload();
        } else {
          console.error('putPrePaymentForToss Error:', JSON.stringify(error));
        }
      } else {
        console.error('putPrePaymentForToss Error:', JSON.stringify(error));
      }
      return { response: null, cleanup };
    }
  },

  postPaymentForToss: async form => {
    const accessToken = await getAccessToken2();
    const refreshToken = await getRefreshToken2();
    const { apiWithTokens, cleanup } = apiWithTokensModule(
      accessToken,
      refreshToken
    );
    try {
      const res = await apiWithTokens.post(CHARGE_PATHS.tossPaymentConfirm, {
        ...form,
      });
      return { response: res, cleanup };
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error:', JSON.stringify(error));
        if (
          window.confirm(
            'Network error occurred. Failed to post PaymentForToss.'
          )
        ) {
          window.location.reload();
        } else {
          console.error('postPaymentForToss Error:', JSON.stringify(error));
        }
      } else {
        console.error('postPaymentForToss Error:', JSON.stringify(error));
      }
      return { response: null, cleanup };
    }
  },

  postPartialCancelForToss: async form => {
    const accessToken = await getAccessToken2();
    const refreshToken = await getRefreshToken2();
    const { apiWithTokens, cleanup } = apiWithTokensModule(
      accessToken,
      refreshToken
    );
    try {
      const res = await apiWithTokens.post(CHARGE_PATHS.tossPaymentCancelPart, {
        ...form,
      });
      return { response: res, cleanup };
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error:', JSON.stringify(error));
        if (
          window.confirm(
            'Network error occurred. Failed to post PartialCancelForToss.'
          )
        ) {
          window.location.reload();
        } else {
          console.error(
            'postPartialCancelForToss Error:',
            JSON.stringify(error)
          );
        }
      } else {
        console.error('postPartialCancelForToss Error:', JSON.stringify(error));
      }
      return { response: null, cleanup };
    }
  },

  postPaymentForGooglePlayStore: async form => {
    const accessToken = await getAccessToken2();
    const refreshToken = await getRefreshToken2();
    const { apiWithTokens, cleanup } = apiWithTokensModule(
      accessToken,
      refreshToken
    );
    try {
      const res = await apiWithTokens.post(
        CHARGE_PATHS.googlePlayPayment,
        form
      );
      return { response: res.data, cleanup };
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error:', JSON.stringify(error));
        console.error(
          'postPaymentForGooglePlayStore Error:',
          JSON.stringify(error)
        );
      } else {
        console.error(
          'postPaymentForGooglePlayStore Error:',
          JSON.stringify(error)
        );
      }
      return { response: null, cleanup };
    }
  },

  getPurchaseLimit: async form => {
    const accessToken = await getAccessToken2();
    const refreshToken = await getRefreshToken2();
    const { apiWithTokens, cleanup } = apiWithTokensModule(
      accessToken,
      refreshToken
    );
    try {
      const res = await apiWithTokens.get(
        `${CHARGE_PATHS.purchaseLimit}?productId=${form?.productId}`
      );
      return { response: res.data.purchaseLimit, cleanup };
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error('Error:', JSON.stringify(error));
        if (
          window.confirm(
            'Network error occurred. Failed to get PrePaymentForTossByOrderId.'
          )
        ) {
          window.location.reload();
        } else {
          console.error(
            'getPrePaymentForTossByOrderId Error:',
            JSON.stringify(error)
          );
        }
      } else {
        console.error(
          'getPrePaymentForTossByOrderId Error:',
          JSON.stringify(error)
        );
      }
      return { response: null, cleanup };
    }
  },
};
import { apiModule } from './api.jsx';
import axios from 'axios';

// Auth API: Google OAuth 로그인/로그아웃
// Auth API: Google OAuth login/logout
// Auth API：Google OAuthログイン/ログアウト

const AUTH_PATHS = {
  googleSign: import.meta.env.VITE_AUTH_GOOGLE_SIGN_PATH,
  googleLogout: import.meta.env.VITE_AUTH_GOOGLE_LOGOUT_PATH,
};

export const authApi = {
  logIn: async () => {
    const { api } = apiModule();
    return await api
      .get(AUTH_PATHS.googleSign)
      .then(res => {
        return res?.data?.data;
      })
      .catch(error => {
        if (!axios.isCancel(error)) {
          console.error('Error:', error);
          if (window.confirm('Please try again. Failed to log in.')) {
            window.location.reload();
          } else {
            console.error('Login Error:', error);
            throw error;
          }
        } else {
          console.error('Login Error:', error);
        }
      });
  },

  logOut: async () => {
    const { api } = apiModule();
    return await api
      .get(AUTH_PATHS.googleLogout)
      .then(res => {
        return res?.data?.data;
      })
      .catch(error => {
        if (!axios.isCancel(error)) {
          console.error('Error:', error);
          if (window.confirm('Please try again. Failed to log out.')) {
            window.location.reload();
          } else {
            console.error('Logout Error:', error);
            throw error;
          }
        } else {
          console.error('Logout Error:', error);
        }
      });
  },
};

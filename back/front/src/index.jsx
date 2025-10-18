import React from 'react';
import App from './App.jsx';
import ReactDOM from 'react-dom/client';
import { hydrateRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { HelmetProvider } from 'react-helmet-async';
import store from './store/store.jsx';
import { router } from './config/route/ROUTE.jsx';
import '/src/locales/i18n';
import LoadingForm from './components/Loading/Loading.jsx';
import { isDevelopmentMode } from '@/utils/constants';

//! Service Worker 등록 (VitePWA가 자동으로 처리)
//! Service Worker registration (automatically handled by VitePWA)
//! Service Worker の登録（VitePWA が自動的に処理）
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function (registrations) {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
}

const rootElement = document.getElementById('root');

const app = (
  <HelmetProvider>
    <Provider store={store}>
      <RouterProvider router={router} fallbackElement={<LoadingForm />}>
        <App />
      </RouterProvider>
    </Provider>
  </HelmetProvider>
);

// SSR Hydration: 사전 렌더링된 HTML 재사용 vs CSR
// SSR Hydration: reuse pre-rendered HTML vs CSR
// SSRハイドレーション：事前レンダリングされたHTML再利用 vs CSR
if (rootElement.hasChildNodes()) {
  try {
    hydrateRoot(rootElement, app);
  } catch (error) {
    console.error('Hydration failed:', error);
    ReactDOM.createRoot(rootElement).render(app);
  }
} else {
  ReactDOM.createRoot(rootElement).render(app);
}

import React from 'react';
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
  createBrowserRouter,
} from 'react-router-dom';
import {
  ETC_PATH,
  HOME_PATH,
  LOGOUT_PATH,
  MORE_BUSINESS_INFO_PATH,
  MYPAGE_CHART_PATH,
  MYPAGE_MAIN_PATH,
  MYPAGE_SUBJECTCHART_PATH,
  MYPAGE_QUESTION_TOPIC_CHART_PATH,
  MORE_TERMS_OF_SERVICE_PATH,
  MYPAGE_THEMECHART_CAREER_PATH,
  MYPAGE_THEMECHART_DECISION_MAKING_PATH,
  MYPAGE_THEMECHART_FINANCE_PATH,
  MYPAGE_THEMECHART_INNER_FEELING_PATH,
  MYPAGE_THEMECHART_LOVE_PATH,
  MYPAGE_THEMECHART_OCCUPATION_PATH,
  MYPAGE_THEMECHART_PATH,
  MYPAGE_THEMECHART_RELATIONSHIP_PATH,
  MYPAGE_TOTALCHART_PATH,
  MYPAGE_USERINFO_CHANGE_PATH,
  MYPAGE_USERINFO_WITHDRAW_PATH,
  TAROT_CARDTABLE_PATH,
  TAROT_PRINCIPLE_PATH,
  MYPAGE_READINGINFO_PATH,
  MYPAGE_REFUND_PATH,
  TAROT_EXPLANATION_PATH,
  TAROT_LEARNING_PATH,
} from './UrlPaths.jsx';
import App from '../../App.jsx';
import Home from '../../pages/Home/Home.jsx';
import TarotCardPrincipleForm from '../../pages/Tarot/Principle/TarotCardPrincipleForm.jsx';
import MyPageForm from '../../pages/MyPage/MyPageForm.jsx';
import TossSuccessPage from '../../components/Charge/TossSuccessPage.jsx';
import TossFailPage from '../../components/Charge/TossFailPage.jsx';
import ETCForm from '../../pages/ETC/ETCForm.jsx';
import ErrorPage from '../../pages/ErrorPage/ErrorPage.jsx';
import UserVoucherRefundPage from '../../pages/MyPage/voucher/UserVoucherRefundPage.jsx';
import TarotExplanationForm from '../../pages/Tarot/Explanation/TarotExplanationForm.jsx';
import TarotSectionForm from '../../pages/Tarot/Section/TarotSectionForm.jsx';
import { useEffect, useState } from 'react';
import { useLanguageChange } from '@/hooks';
import MyPagePage from '../../pages/MyPage/MyPagePage.jsx';
import SpreadModal from '../../modals/SpreadModal/SpreadModal.jsx';

export const LanguageRedirect = () => {
  const browserLanguage = useLanguageChange();
  return <Navigate to={`/${browserLanguage}`} replace />;
};

// 다국어 라우팅: 브라우저 언어 감지 + 자동 리다이렉트
// Multi-language routing: browser language detection + auto-redirect
// 多言語ルーティング：ブラウザ言語検出 + 自動リダイレクト
export const LanguageAwareApp = () => {
  const browserLanguage = useLanguageChange();
  const location = useLocation();
  const navigate = useNavigate();
  const { lang: currentLang } = useParams();

  useEffect(() => {
    if (
      location.pathname.match(
        /\.(xml|txt|json|ico|jpg|jpeg|png|gif|webp|svg|ttf|woff|woff2|eot|bin|gltf|html|css|js)$/
      )
    )
      return;

    let newPath;
    const search = location.search;
    if (['en', 'ko', 'ja'].includes(location.pathname.slice(1, 3))) {
      if (browserLanguage && browserLanguage !== currentLang.slice(0, 2)) {
        newPath = `/${browserLanguage}${location.pathname.replace(
          /^\/[^/]+/,
          ''
        )}${search}`;
      } else {
        newPath = `${location.pathname}${search}`;
      }
    } else {
      newPath = `/${browserLanguage}${location.pathname}${search}`;
    }
    navigate(newPath, { replace: true });
  }, [browserLanguage, currentLang, location.pathname, location.search]);
  return <App />;
};
// <MyPageLayout />,-부모
// <MyPageReadingInfo />, - 자식
// <MyPageTotalChart />, - 자식




// Route
// "/ko/tarot/principle",
// "/en/tarot/principle",
// "/ja/tarot/principle",
// "/ko/etc/tarot/learning",
// "/ko/etc/tarot/explanation",
// "/en/etc/tarot/learning",
// "/en/etc/tarot/explanation",
// "/ja/etc/tarot/learning",
// "/ja/etc/tarot/explanation",
// "/ko/etc",
// "/en/etc",
// "/ja/etc",
// "/ko/mypage/chart/totalchart",
// "/ko/mypage/chart/subjectchart",
// "/ko/mypage/chart/questiontopicchart",
// "/en/mypage/chart/totalchart",
// "/en/mypage/chart/subjectchart",
// "/en/mypage/chart/questiontopicchart",
// "/ja/mypage/chart/totalchart",
// "/ja/mypage/chart/subjectchart",
// "/ja/mypage/chart/questiontopicchart"
export const router = createBrowserRouter([
  {
    path: '/',
    element: <LanguageRedirect />,
  },
  {
    path: '/:lang',
    element: <LanguageAwareApp />,
    // errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: TAROT_PRINCIPLE_PATH,
        element: <TarotCardPrincipleForm />,
      },
      {
        path: TAROT_EXPLANATION_PATH,
        element: <TarotCardPrincipleForm />,
      },
      {
        path: TAROT_LEARNING_PATH,
        element: <TarotCardPrincipleForm />,
      },
      {
        path: LOGOUT_PATH,
        element: null,
      },
      {
        path: 'toss/success',
        element: <TossSuccessPage />,
      },
      {
        path: 'toss/fail',
        element: <TossFailPage />,
      },
      {
        path: MYPAGE_REFUND_PATH,
        element: <UserVoucherRefundPage />,
      },
      // MyPage routes - 모두 flat하게 정의 (중첩 제거)
      {
        path: MYPAGE_MAIN_PATH,
        element: <MyPageForm />,
      },
      {
        path: `${MYPAGE_MAIN_PATH}/${MYPAGE_READINGINFO_PATH}`,
        element: <MyPageForm />,
      },
      {
        path: `${MYPAGE_MAIN_PATH}/${MYPAGE_CHART_PATH}/${MYPAGE_TOTALCHART_PATH}`,
        element: <MyPageForm />,
      },
      {
        path: `${MYPAGE_MAIN_PATH}/${MYPAGE_CHART_PATH}/${MYPAGE_SUBJECTCHART_PATH}`,
        element: <MyPageForm />,
      },
      {
        path: `${MYPAGE_MAIN_PATH}/${MYPAGE_CHART_PATH}/${MYPAGE_QUESTION_TOPIC_CHART_PATH}`,
        element: <MyPageForm />,
      },
      {
        path: `${MYPAGE_MAIN_PATH}/${MYPAGE_USERINFO_WITHDRAW_PATH}`,
        element: <MyPageForm />,
      },
      // ETC routes - 모두 flat하게 정의 (중첩 제거)
      {
        path: ETC_PATH,
        element: <ETCForm />,
      },
      {
        path: `${ETC_PATH}/${MORE_BUSINESS_INFO_PATH}`,
        element: <ETCForm />,
      },
    ],
  },
]);

// ====================
// Relative paths (자식 라우트용)
// ====================
export const HOME_PATH = '';
export const LOGOUT_PATH = 'logout';

// Tarot paths (relative)
export const TAROT_PRINCIPLE_REL = 'tarot/principle';
export const TAROT_EXPLANATION_REL = 'tarot/principle/explanation';
export const TAROT_LEARNING_REL = 'tarot/principle/learning';
export const TAROT_CARDTABLE_REL = 'tarot/cardtable';

// ETC paths (relative)
export const ETC_REL = 'etc';
export const MORE_BUSINESS_INFO_REL = 'businessinfo';

// MyPage paths (relative)
export const MYPAGE_REL = 'mypage';
export const MYPAGE_READING_INFO_REL = 'readingInfo';
export const MYPAGE_CHART_REL = 'chart';
export const MYPAGE_TOTALCHART_REL = 'totalchart';
export const MYPAGE_SUBJECTCHART_REL = 'subjectchart';
export const MYPAGE_QUESTION_TOPIC_CHART_REL = 'questiontopicchart';
export const MYPAGE_USERINFO_WITHDRAW_REL = 'userinfo/withdraw';
export const MYPAGE_REFUND_REL = 'refund';

// ====================
// Absolute paths (Link, navigate용)
// ====================
const buildPath = (lang, ...segments) =>
  `/${lang}/${segments.filter(Boolean).join('/')}`.replace(/\/+$/, '');

// Helper function for current language
export const getPathWithLang = lang => ({
  HOME: `/${lang}`,
  TAROT_PRINCIPLE: buildPath(lang, 'tarot/principle'),
  TAROT_EXPLANATION: buildPath(lang, 'tarot/principle/explanation'),
  TAROT_LEARNING: buildPath(lang, 'tarot/principle/learning'),
  ETC: buildPath(lang, 'etc'),
  ETC_BUSINESS_INFO: buildPath(lang, 'etc/businessinfo'),
  MYPAGE: buildPath(lang, 'mypage'),
  MYPAGE_READING_INFO: buildPath(lang, 'mypage/readingInfo'),
  MYPAGE_CHART: buildPath(lang, 'mypage/chart'),
  MYPAGE_CHART_TOTAL: buildPath(lang, 'mypage/chart/totalchart'),
  MYPAGE_CHART_SUBJECT: buildPath(lang, 'mypage/chart/subjectchart'),
  MYPAGE_CHART_QUESTION: buildPath(lang, 'mypage/chart/questiontopicchart'),
  MYPAGE_WITHDRAW: buildPath(lang, 'mypage/userinfo/withdraw'),
  MYPAGE_REFUND: buildPath(lang, 'refund'),
  LOGOUT: buildPath(lang, 'logout'),
});

// ====================
// Backward compatibility (기존 코드 호환성)
// ====================
export const TAROT_PRINCIPLE_PATH = TAROT_PRINCIPLE_REL;
export const TAROT_EXPLANATION_PATH = TAROT_EXPLANATION_REL;
export const TAROT_LEARNING_PATH = TAROT_LEARNING_REL;
export const TAROT_CARDTABLE_PATH = TAROT_CARDTABLE_REL;
export const ETC_PATH = ETC_REL;
export const MORE_BUSINESS_INFO_PATH = MORE_BUSINESS_INFO_REL;
export const MORE_TERMS_OF_SERVICE_PATH = '';
export const MYPAGE_MAIN_PATH = MYPAGE_REL;
export const MYPAGE_READINGINFO_PATH = MYPAGE_READING_INFO_REL;
export const MYPAGE_CHART_PATH = MYPAGE_CHART_REL;
export const MYPAGE_TOTALCHART_PATH = MYPAGE_TOTALCHART_REL;
export const MYPAGE_SUBJECTCHART_PATH = MYPAGE_SUBJECTCHART_REL;
export const MYPAGE_QUESTION_TOPIC_CHART_PATH = MYPAGE_QUESTION_TOPIC_CHART_REL;
export const MYPAGE_USERINFO_WITHDRAW_PATH = MYPAGE_USERINFO_WITHDRAW_REL;
export const MYPAGE_REFUND_PATH = MYPAGE_REFUND_REL;
export const MYPAGE_USERINFO_PATH = '';
export const MYPAGE_THEMECHART_PATH = 'themechart';
export const MYPAGE_THEMECHART_INNER_FEELING_PATH = 'innerfeeling';
export const MYPAGE_THEMECHART_RELATIONSHIP_PATH = 'relationship';
export const MYPAGE_THEMECHART_LOVE_PATH = 'love';
export const MYPAGE_THEMECHART_FINANCE_PATH = 'finance';
export const MYPAGE_THEMECHART_OCCUPATION_PATH = 'occupation';
export const MYPAGE_THEMECHART_CAREER_PATH = 'career';
export const MYPAGE_THEMECHART_DECISION_MAKING_PATH = 'decisionmaking';
export const MYPAGE_USERINFO_CHANGE_PATH = 'userinfo/change';

/*eslint-disable*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './MyPageForm.module.scss';
import {
  hasAccessToken,
  removeAccessTokens,
  removeRefreshTokens,
} from '../../utils/storage/tokenCookie.jsx';
import { useNavigate, useLocation } from 'react-router-dom';
import { tarotApi } from '../../api/tarotApi.jsx';
import { useTranslation } from 'react-i18next';
import { userApi } from '../../api/userApi.jsx';
import MyPageSideMenuForm from './components/MyPageSideMenuForm.jsx';
import {
  MORE_BUSINESS_INFO_PATH,
  MYPAGE_CHART_PATH,
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
  MYPAGE_USERINFO_PATH,
  MYPAGE_READINGINFO_PATH,
  MYPAGE_USERINFO_WITHDRAW_PATH,
  MYPAGE_MAIN_PATH,
} from '../../config/route/UrlPaths.jsx';
import {
  useAlertModalState,
  useAnswerFormState,
  useBlinkModalState,
  useChargeModalState,
  useRefundPolicyState,
  useTarotAndIndexInfoState,
  useTarotHistoryState,
} from '@/hooks';
import AnswerCardImagesModal from '../../modals/AnswerModal/AnswerCardImagesModal.jsx';
import AnswerDurumagiModal from '../../modals/AnswerModal/AnswerDurumagiModal.jsx';
import ChartInfoForm from '../../components/Chart/ChartInfoForm.jsx';
import UserInfoForm from './user/UserInfoForm.jsx';
import AlertModal from '../../modals/AlertModal/AlertModal.jsx';
import BlinkModal from '../../modals/BlinkModal/BlinkModal.jsx';
import ChargeModal from '../../modals/PurchaseModal/TossPurchase/ChargeModal.jsx';
import InAppPurchase from '../../modals/PurchaseModal/InAppPurchase/InAppPurchase.jsx';
import { usePreventModalBackgroundScroll } from '@/hooks';
import { usePriceInfoModalState } from '@/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { useFetchUserAndTarotDataWithRedux } from '@/hooks';
import TarotReadingInfoForm from './tarot/TarotReadingInfoForm.jsx';
import UserInfoWithdrawalForm from './user/UserInfoWithdrawalForm.jsx';
import { setTarotHistoryAction } from '../../store/tarotHistoryStore.jsx';
import {
  getRewardForPreference,
  hasAccessTokenForPreference,
  removeAccessTokensForPreference,
  removeRefreshTokensForPreference,
} from '../../utils/storage/tokenPreference.jsx';
import { checkViolationInGoogleInAppRefund } from '../../utils/validation/checkViolation.jsx';
import { cardPositionInfo } from '../../lib/tarot/card/cardPositionInfo.jsx';
import { useLanguageChange } from '@/hooks';
import { Capacitor } from '@capacitor/core';
import isComDomain from '../../utils/validation/isComDomain.jsx';
import AdComponentForShop from '../../components/GoogleAd/AdComponentForShop.jsx';
import { BlinkModalSet } from '../../components/BlinkModals/BlinkModalSet.jsx';
import { isBot } from '../../utils/validation/isBot.js';
import { isNormalAccount } from '../../lib/user/isNormalAccount.js';
import { useButtonLock } from '@/hooks';
import { createCancelToken } from '../../api/api.jsx';
import HomePage from '../../components/Button/HomePageButton/HomePage.jsx';
import { isDevelopmentMode, isProductionMode } from '@/utils/constants';

const isNative = Capacitor.isNativePlatform();

// 마이페이지: 사용자 정보, 타로 히스토리, 차트, 결제 관리
// My Page: user info, tarot history, charts, payment management
// マイページ：ユーザー情報、タロット履歴、チャート、決済管理
const MyPageForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const sourceRef = useRef(createCancelToken());
  const myPageFormRef = useRef(null);
  useEffect(() => {
    return () => {
      myPageFormRef.current = null;
    };
  }, []);
  const { t } = useTranslation();
  const [tarotHistory, updateTarotHistory] = useTarotHistoryState();
  const [userInfo, setUserInfo] = useState({});
  const [pathName, setPathName] = useState(MYPAGE_USERINFO_PATH);
  const [isAnswerModalOpen, setAnswerModalOpen] = useState(false);
  const [answerForm, updateAnswerForm] = useAnswerFormState();
  const [statistics, setStatistics] = useState('');
  const [theme, setTheme] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(t(`chart.statistics-total`));
  const [questionTopic, setQuestionTopic] = useState('');
  const [questionOfTopic, setQuestionOfTopic] = useState(
    t(`chart.statistics-total`)
  );
  const [question, setQuestion] = useState(t(`chart.statistics-total`));
  const [isUnavailableVoucher, setUnavailableVoucher] = useState(false);
  const [isChargeModalOpen, updateChargeModalOpen] = useChargeModalState();
  const [showInAppPurchase, setShowInAppPurchase] = useState(false);
  const [isRefundPolicyOpen, updateRefundPolicyOpen] =
    useRefundPolicyState(false);
  const [isPriceInfoModalOpen, updatePriceInfoModalOpen] =
    usePriceInfoModalState(false);
  const [isBlinkModalForChargingKRWOpen, setBlinkModalForChargingKRWOpen] =
    useState(false);
  const [isBlinkModalForChargingUSDOpen, setBlinkModalForChargingUSDOpen] =
    useState(false);
  const [isBlinkModalForCopyOpen, updateBlinkModalForCopyOpen] =
    useBlinkModalState();
  const [isBlinkModalForSaveOpen, updateBlinkModalForSaveOpen] =
    useBlinkModalState();
  const [isUserAlertModalOpen, updateUserAlertModalOpen] = useAlertModalState();
  const [isDeleteTarotClicked, setDeleteTarotClicked] = useState(false);
  const [isTarotAlertModalOpen, updateTarotAlertModalOpen] =
    useAlertModalState();
  const [tarotAndIndexInfo, updateTarotAndIndexInfo] =
    useTarotAndIndexInfoState();
  const [isClickedForInvisible, setClickedForInvisible] = useState([]);
  const [whichCardPosition, setWhichCardPosition] = useState({
    isClicked: false,
    position: -1,
  });
  const [whichAds, setWhichAds] = useState(0);
  const [isAdsWatched, setAdsWatched] = useState(false);
  const [admobReward, setAdmobReward] = useState(0);

  const browserLanguage = useLanguageChange();

  if (hasAccessToken() === false && isNative === false && !isBot()) return;
  if (hasAccessTokenForPreference() === false && isNative === true && !isBot())
    return;

  const deleteUserInfo = async e => {
    e.stopPropagation();
    const { response, cleanup } = await userApi.withdraw();
    const statusCode = response;
    if (statusCode === 204) {
      if (isNative) {
        removeAccessTokensForPreference();
        removeRefreshTokensForPreference();
      } else {
        removeAccessTokens();
        removeRefreshTokens();
      }
      navigate('/');
      window.location.reload();
    }
  };

  const handleDeleteTarotHistory = async tarotAndIndexInfo => {
    if (isDeleteTarotClicked) return;
    setDeleteTarotClicked(true);
    const { tarot, index } = tarotAndIndexInfo;
    try {
      const { response, cleanup } = await tarotApi.deleteHistory(tarot);
      const result = response;
      if (result === 'success') {
        setClickedForInvisible(prev => {

          if (!prev.includes(index)) return [...prev];
          return prev;
        });

        updateTarotHistory(currentHistorys => {
          const filteredArray = currentHistorys?.filter(tarotHistory => {
            // tarot만 tarot.questionInfo.question와 같이 2중으로 된건 ''로 나옴.
            return tarotHistory?.createdAt !== tarot?.createdAt;
          });
          dispatch(setTarotHistoryAction([...filteredArray]));
          return filteredArray;
        });
      } else {
        // 삭제 실패 처리
        console.error('Failed to delete tarot history');
      }
    } catch (error) {
      console.error('Error deleting tarot history:', error);
      // 에러 처리 로직 (예: 사용자에게 에러 메시지 표시)
    } finally {
      setDeleteTarotClicked(false);
    }
  };

  const handleDeleteAllTarotHistory = async () => {
    if (isDeleteTarotClicked) return;
    setDeleteTarotClicked(true);
    try {
      const { response, cleanup } = await tarotApi.deleteHistory();
      const result = response;
      if (result === 'success') {
        // [0~ 78]
        //_ 는 자바스크립트에서 사용되는 특별한 변수로, 일반적으로 무시되는 값에 사용됩니다. 여기서는 콜백 함수에서 현재 요소의 값이 필요하지 않기 때문에 _를 사용하여 그것을 나타냅니다. 따라서 _는 해당 위치에 있는 요소의 값이 아니라, 그냥 무시할 값이라는 것
        // let numberArray = Array.from({ length: 79 }, (_, i) => i);
        // setClickedForInvisible(numberArray);

        updateTarotHistory(() => {
          dispatch(setTarotHistoryAction([]));
          return [];
        });
      } else {
        // 삭제 실패 처리
        console.error('Failed to delete all tarot history');
      }
    } catch (error) {
      console.error('Error deleting all tarot history:', error);
    } finally {
      setDeleteTarotClicked(false);
    }
  };

  const userInfoForRedux = useSelector(state => state?.userInfoStore?.userInfo);
  const tarotHistoryForRedux = useSelector(
    state => state?.tarotHistoryStore?.tarotHistory
  );

  const {
    getUserAndTarot: getUserAndTarotForRedux,
    clearCaches,
    cleanupInterceptorArr,
  } = useFetchUserAndTarotDataWithRedux(tarotApi, userApi, dispatch);

  const saveUserAndTarotInRedux = async () => {
    try {
      // cancelToken을 전달하여 요청 취소 가능하도록 함
      const cancelToken = sourceRef.current?.token;

      // ✅ 더 엄격한 조건으로 변경 - 정말 필요할 때만 호출
      if (
        !userInfoForRedux ||
        !userInfoForRedux.email ||
        Object.keys(userInfoForRedux)?.length === 0 ||
        !tarotHistoryForRedux ||
        !Array.isArray(tarotHistoryForRedux)
      ) {
        await getUserAndTarotForRedux(cancelToken);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // const { clickCount, isLocked, remainingTime, handleClick } = useButtonLock({
  //     maxClicks: 5,
  //     lockDuration: 5 * 60 * 60 * 1000,
  //     uniqueId: userInfo?.email,
  //   });

  useEffect(() => {
    // deleteTarotHistoryOver3MonthsData();
    if (
      (Array.isArray(tarotHistoryForRedux) &&
        tarotHistoryForRedux?.length === 0) ||
      tarotHistoryForRedux === undefined ||
      tarotHistoryForRedux === null
    ) {
      updateTarotHistory([]);
    } else {
      if (!isBot()) updateTarotHistory(tarotHistoryForRedux);
    }
    if (
      (typeof userInfoForRedux === 'object' &&
        Object.keys(userInfoForRedux)?.length === 0) ||
      userInfoForRedux === undefined ||
      userInfoForRedux === null
    ) {
      setUserInfo({});
    } else {
      if (!isBot()) setUserInfo(userInfoForRedux);
    }

    // ✅ 최초 마운트 시에만 데이터 가져오기
    if (
      !isBot() &&
      (!userInfoForRedux ||
        !userInfoForRedux.email ||
        !tarotHistoryForRedux ||
        !Array.isArray(tarotHistoryForRedux))
    ) {
      saveUserAndTarotInRedux();
    }

    return () => {
      if (
        cleanupInterceptorArr &&
        Array.isArray(cleanupInterceptorArr) &&
        cleanupInterceptorArr?.length > 0
      ) {
        cleanupInterceptorArr.forEach(cleanup => {
          cleanup();
        });
      }
      clearCaches();
      if (sourceRef.current) {
        sourceRef.current.cancel('Cancelled all requests');
        sourceRef.current = createCancelToken(); // 새로운 source 생성
      }
    };
  }, [
    // ✅ 의존성 배열 최적화 - 불필요한 재호출 방지
    userInfoForRedux?.email, // 사용자 Email만 체크
    !!tarotHistoryForRedux, // 배열 존재 여부만 체크
    // isUserAlertModalOpen 제거 - 모달 상태 변경으로 인한 불필요한 API 호출 방지
  ]);

  // //& redux 용(mypage에서 쓸 예정)
  // useEffect(() => {
  //   tarotCacheForRedux.clear(); //! 이거 때문에 중요
  //   userCacheForRedux.clear(); //! 이거 때문에 중요
  // }, [isUserAlertModalOpen]);
  // //& 여기까지

  useEffect(() => {
    const pathname = location.pathname;

    // URL 경로에서 현재 페이지 판단
    if (pathname.includes(`/${MYPAGE_MAIN_PATH}/${MYPAGE_READINGINFO_PATH}`)) {
      setPathName(MYPAGE_READINGINFO_PATH);
    } else if (
      pathname.includes(
        `/${MYPAGE_MAIN_PATH}/${MYPAGE_CHART_PATH}/${MYPAGE_TOTALCHART_PATH}`
      )
    ) {
      setPathName(`${MYPAGE_CHART_PATH}/${MYPAGE_TOTALCHART_PATH}`);
    } else if (
      pathname.includes(
        `/${MYPAGE_MAIN_PATH}/${MYPAGE_CHART_PATH}/${MYPAGE_QUESTION_TOPIC_CHART_PATH}`
      )
    ) {
      setPathName(MYPAGE_QUESTION_TOPIC_CHART_PATH);
    } else if (
      pathname.includes(
        `/${MYPAGE_MAIN_PATH}/${MYPAGE_CHART_PATH}/${MYPAGE_SUBJECTCHART_PATH}`
      )
    ) {
      setPathName(MYPAGE_SUBJECTCHART_PATH);
    } else if (
      pathname.includes(`/${MYPAGE_MAIN_PATH}/${MYPAGE_USERINFO_WITHDRAW_PATH}`)
    ) {
      setPathName(MYPAGE_USERINFO_WITHDRAW_PATH);
    } else if (pathname.endsWith(`/${MYPAGE_MAIN_PATH}`)) {
      setPathName(MYPAGE_USERINFO_PATH);
    } else {
      setPathName(MYPAGE_USERINFO_PATH);
    }
  }, [location.pathname]); // browserLanguage 의존성 제거로 경쟁 상태 방지

  // 서버에서 이미 토큰으로 해당 유저의 타로기록만 줌.
  // const getUserAndTarot = useFetchUserAndTarotData(
  //   tarotApi,
  //   userApi,
  //   updateTarotHistory,
  //   setUserInfo
  // );

  // useEffect(() => {
  //   getUserAndTarot();
  // }, [userCache, tarotCache]);

  usePreventModalBackgroundScroll(
    isChargeModalOpen,
    isBlinkModalForCopyOpen,
    isBlinkModalForSaveOpen,
    isUserAlertModalOpen,
    isTarotAlertModalOpen,
    isRefundPolicyOpen
  );

  checkViolationInGoogleInAppRefund(userInfo);

  let [resultOfHasUserEmail, setResultOfHasUserEmail] = useState(false);
  useEffect(() => {
    setResultOfHasUserEmail(() => {
      return userInfo?.email ? isComDomain(userInfo?.email) : false;
    });
  }, [userInfo?.email]);

  useEffect(() => {
    const initializeReward = async () => {
      try {
        if (!userInfo || Object.keys(userInfo)?.length === 0) return;
        let type =
          isProductionMode && isNormalAccount(userInfo) ? 'Voucher' : 'coins';
        if (userInfo?.email) {
          const rewardAmount = await getRewardForPreference(
            type,
            userInfo?.email
          );
          if (rewardAmount > 0) setAdmobReward(rewardAmount);
          if (rewardAmount === 0) setAdmobReward(0);
          return rewardAmount;
        }
      } catch (error) {
        console.error('error while initializing admobReward :', error);
        setAdmobReward(0); // 오류 발생 시 0으로 설정
      }
    };
    initializeReward();
  }, [admobReward, whichAds, showInAppPurchase, userInfo, userInfo?.email]);

  return (
    <div className={`${styles['container']}`} ref={myPageFormRef}>
      <HomePage
        answerForm={answerForm}
        userInfo={userInfo}
        isAnswerModalOpen={isAnswerModalOpen}
        isTokenFromNavbar={true}
      />
      {isTarotAlertModalOpen === true ? (
        <AlertModal
          updateTarotAlertModalOpen={updateTarotAlertModalOpen}
          tarotAndIndexInfo={tarotAndIndexInfo}
          handleDeleteTarotHistory={handleDeleteTarotHistory}
        >
          {t(`alert_modal.delete_tarot_history`)}
        </AlertModal>
      ) : null}
      {isUserAlertModalOpen === true ? (
        <AlertModal
          updateUserAlertModalOpen={updateUserAlertModalOpen}
          deleteUserInfo={deleteUserInfo}
          handleDeleteAllTarotHistory={handleDeleteAllTarotHistory}
        >
          {t(`alert_modal.delete_user`)}
        </AlertModal>
      ) : null}
      <BlinkModalSet
        stateGroup={{
          answerForm,
          isBlinkModalForCopyOpen,
          isBlinkModalForSaveOpen,
          isBlinkModalForChargingKRWOpen,
          isBlinkModalForChargingUSDOpen,
          isUnavailableVoucher,
          whichCardPosition,
          isAnswerModalOpen,
        }}
        setStateGroup={{
          updateBlinkModalForCopyOpen,
          updateBlinkModalForSaveOpen,
          setBlinkModalForChargingKRWOpen,
          setBlinkModalForChargingUSDOpen,
          setUnavailableVoucher,
          setWhichCardPosition,
        }}
        styles={styles}
      />
      {isChargeModalOpen && !isNative && resultOfHasUserEmail && (
        <ChargeModal
          updateChargeModalOpen={updateChargeModalOpen}
          isRefundPolicyOpen={isRefundPolicyOpen}
          updateRefundPolicyOpen={updateRefundPolicyOpen}
          isPriceInfoModalOpen={isPriceInfoModalOpen}
          updatePriceInfoModalOpen={updatePriceInfoModalOpen}
          setBlinkModalForChargingKRWOpen={setBlinkModalForChargingKRWOpen}
          setBlinkModalForChargingUSDOpen={setBlinkModalForChargingUSDOpen}
          userInfoFromMyPage={userInfo}
          setUnavailableVoucher={setUnavailableVoucher}
        >
          {t(`charge_modal.purchase`)}
        </ChargeModal>
      )}
      {showInAppPurchase && resultOfHasUserEmail && (
        <InAppPurchase
          updateRefundPolicyOpen={updateRefundPolicyOpen}
          updatePriceInfoModalOpen={updatePriceInfoModalOpen}
          userInfoFromMyPage={userInfo}
          isPriceInfoModalOpen={isPriceInfoModalOpen}
          showInAppPurchase={showInAppPurchase}
          setShowInAppPurchase={setShowInAppPurchase}
          setUnavailableVoucher={setUnavailableVoucher}
          setWhichAds={setWhichAds}
          setAdsWatched={setAdsWatched}
          admobReward={admobReward}
          setAdmobReward={setAdmobReward}
          // timeButton = {{ clickCount, isLocked, remainingTime, handleClick }}
        >
          {t(`charge_modal.purchase`)}
        </InAppPurchase>
      )}
      {/* {isChargeModalOpen && !isNative && resultOfHasUserEmail && (
        <InAppPurchase
          updateRefundPolicyOpen={updateRefundPolicyOpen}
          updatePriceInfoModalOpen={updatePriceInfoModalOpen}
          userInfoFromMyPage={userInfo}
          isPriceInfoModalOpen={isPriceInfoModalOpen}
          showInAppPurchase={showInAppPurchase}
          setShowInAppPurchase={setShowInAppPurchase}
          setUnavailableVoucher={setUnavailableVoucher}
          setWhichAds={setWhichAds}
          setAdsWatched={setAdsWatched}
          admobReward={admobReward}
          setAdmobReward={setAdmobReward}
          // timeButton = {{ clickCount, isLocked, remainingTime, handleClick }}
        >
          {t(`charge_modal.purchase`)}
        </InAppPurchase>
      )} */}
      {!isAdsWatched && whichAds !== 0 && (
        <AdComponentForShop
          whichAds={whichAds}
          setWhichAds={setWhichAds}
          setAdsWatched={setAdsWatched}
          setAdmobReward={setAdmobReward}
          userInfo={userInfo}
          // timeButton = {{ clickCount, isLocked, remainingTime, handleClick }}
        />
      )}
      <div className={styles['container-box1']}>
        <MyPageSideMenuForm
          setPathName={setPathName}
          setAnswerModalOpen={setAnswerModalOpen}
        />
      </div>
      <div className={styles['container-box2']}>
        {pathName === MYPAGE_USERINFO_PATH ? (
          <UserInfoForm
            userInfo={userInfo}
            tarotHistory={tarotHistory}
            setAnswerModalOpen={setAnswerModalOpen}
            updateAnswerForm={updateAnswerForm}
            updateTarotAlertModalOpen={updateTarotAlertModalOpen}
            updateTarotAndIndexInfo={updateTarotAndIndexInfo}
            updateUserAlertModalOpen={updateUserAlertModalOpen}
            updateChargeModalOpen={updateChargeModalOpen}
            showInAppPurchase={showInAppPurchase}
            setShowInAppPurchase={setShowInAppPurchase}
            isClickedForInvisible={isClickedForInvisible}
            resultOfHasUserEmail={resultOfHasUserEmail}
          />
        ) : null}
        {isAnswerModalOpen && (
          <div className={styles['answer-container']}>
            <AnswerCardImagesModal
              stateGroup={{ answerForm, whichCardPosition }}
              setWhichCardPosition={setWhichCardPosition}
            />
            <AnswerDurumagiModal
              answerForm={answerForm}
              setAnswerModalOpen={setAnswerModalOpen}
              updateBlinkModalForSaveOpen={updateBlinkModalForSaveOpen}
              updateBlinkModalForCopyOpen={updateBlinkModalForCopyOpen}
              setWhichCardPosition={setWhichCardPosition}
            />
          </div>
        )}
        {pathName === MYPAGE_READINGINFO_PATH ? (
          <TarotReadingInfoForm
            userInfo={userInfo}
            tarotHistory={tarotHistory}
            updateTarotHistory={updateTarotHistory}
            setAnswerModalOpen={setAnswerModalOpen}
            updateAnswerForm={updateAnswerForm}
            updateTarotAlertModalOpen={updateTarotAlertModalOpen}
            updateTarotAndIndexInfo={updateTarotAndIndexInfo}
            updateUserAlertModalOpen={updateUserAlertModalOpen}
            updateChargeModalOpen={updateChargeModalOpen}
            isClickedForInvisible={isClickedForInvisible}
          />
        ) : null}
        {pathName === `${MYPAGE_CHART_PATH}/${MYPAGE_TOTALCHART_PATH}` ||
        pathName === MYPAGE_SUBJECTCHART_PATH ||
        pathName === MYPAGE_QUESTION_TOPIC_CHART_PATH ||
        pathName === MYPAGE_THEMECHART_PATH ||
        pathName === MYPAGE_THEMECHART_CAREER_PATH ||
        pathName === MYPAGE_THEMECHART_DECISION_MAKING_PATH ||
        pathName === MYPAGE_THEMECHART_FINANCE_PATH ||
        pathName === MYPAGE_THEMECHART_INNER_FEELING_PATH ||
        pathName === MYPAGE_THEMECHART_LOVE_PATH ||
        pathName === MYPAGE_THEMECHART_OCCUPATION_PATH ||
        pathName === MYPAGE_THEMECHART_RELATIONSHIP_PATH ? (
          <ChartInfoForm
            userInfo={userInfo}
            tarotHistory={tarotHistory}
            pathName={pathName}
            setPathName={setPathName}
            statistics={statistics}
            setStatistics={setStatistics}
            theme={theme}
            setTheme={setTheme}
            subject={subject}
            setSubject={setSubject}
            date={date}
            setDate={setDate}
            questionTopic={questionTopic}
            setQuestionTopic={setQuestionTopic}
            questionOfTopic={questionOfTopic}
            setQuestionOfTopic={setQuestionOfTopic}
            question={question}
            setQuestion={setQuestion}
            updateBlinkModalForSaveOpen={updateBlinkModalForSaveOpen}
            updateBlinkModalForCopyOpen={updateBlinkModalForCopyOpen}
          />
        ) : null}
        {pathName === MYPAGE_USERINFO_WITHDRAW_PATH ? (
          <UserInfoWithdrawalForm
            userInfo={userInfo}
            tarotHistory={tarotHistory}
            setAnswerModalOpen={setAnswerModalOpen}
            updateAnswerForm={updateAnswerForm}
            updateTarotAlertModalOpen={updateTarotAlertModalOpen}
            updateTarotAndIndexInfo={updateTarotAndIndexInfo}
            updateUserAlertModalOpen={updateUserAlertModalOpen}
            updateChargeModalOpen={updateChargeModalOpen}
            isClickedForInvisible={isClickedForInvisible}
          />
        ) : null}
        {/* {pathName === MORE_TERMS_OF_SERVICE_PATH ? (
            <TermsOfServiceForm
            />
          ) : null}
          {pathName === MORE_BUSINESS_INFO_PATH ? (
            <BusinessInfoForm
            />
          ) : null} */}
      </div>
      {/* 숨겨진 SEO 콘텐츠 */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
        <h1>{t('page.mypage.mainHeading')}</h1>

        <section>
          <p>{t('page.mypage.intro.paragraph1')}</p>
          <p>{t('page.mypage.intro.paragraph2')}</p>
        </section>

        <section>
          <h2>{t('page.mypage.sections.title')}</h2>
          <ul>
            <li>{t('page.mypage.sections.history')}</li>
            <li>{t('page.mypage.sections.statistics')}</li>
            <li>{t('page.mypage.sections.profile')}</li>
          </ul>
        </section>

        <section>
          <h2>{t('page.mypage.features.title')}</h2>

          <div>
            <h3>{t('page.mypage.features.recordManagement.title')}</h3>
            <p>{t('page.mypage.features.recordManagement.description')}</p>
          </div>

          <div>
            <h3>{t('page.mypage.features.statisticalAnalysis.title')}</h3>
            <p>{t('page.mypage.features.statisticalAnalysis.description')}</p>
          </div>
        </section>

        <section>
          <h2>{t('page.mypage.dataManagement.title')}</h2>
          <p>{t('page.mypage.dataManagement.description')}</p>
        </section>

        <section>
          <h2>{t('page.mypage.personalGrowth.title')}</h2>
          <p>{t('page.mypage.personalGrowth.description')}</p>
        </section>

        <section>
          <h2>{t('page.mypage.privacy.title')}</h2>
          <p>{t('page.mypage.privacy.description')}</p>
        </section>
      </div>
    </div>
  );
};

export default MyPageForm;

// withCredentials: true는 서버에 요청 시에 인증 정보를 함께 보내도록 하는 옵션일 것입니다. 보통 쿠키를 사용하는 세션 기반 인증에서 필요한 옵션입니다.
// data.user._json은 일반적으로 OAuth 인증을 통해 얻은 사용자 정보에서 사용자의 추가 정보(사용자의 이메일, 이름, 프로필 사진 URL 등)를 담고 있는 객체
// 언더스코어(_)는 객체의 프로퍼티 이름. 즉,  _json은 단순히 객체의 속성 이름
// 추출한 userInfo 객체의 _json 속성
// _json이라는 이름의 속성은 주로 OAuth 인증 프로세스에서 사용됩니다. 일반적으로 OAuth 공급자로부터 반환되는 사용자 정보가 JSON 형식으로 제공되는데, 이 정보는 _json이라는 속성에 담겨 있을 수 있습니다.
// {
//   "login": "example_user",
//   "id": 123456,
//   "name": "John Doe",
//   "email": "john@example.com"
//   // ... 기타 사용자 정보
// }
// 이런식으로 나옴.

// console.log('tarotHistory._json : ', tarotHistory._json);

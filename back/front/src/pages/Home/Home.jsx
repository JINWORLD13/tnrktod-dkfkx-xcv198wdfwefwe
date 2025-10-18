import React, {
  useState,
  useEffect,
  useMemo,
  useTransition,
  Suspense,
  useCallback,
  useRef,
} from 'react';
import styles from './Home.module.scss';
import SpreadModal from '../../modals/SpreadModal/SpreadModal.jsx';
import TarotModal from '../../modals/TarotModal/TarotModal.jsx';
import { useTranslation } from 'react-i18next';
import {
  useAnswerFormState,
  useQuestionFormState,
  useModalFormState,
  useCardFormState,
  useWhichTarotState,
  useCSSInvisibleState,
  useCountryState,
  useBlinkModalState,
  useChargeModalState,
  useTarotSpreadPricePointState,
  useTarotManualModalState,
  useRefundPolicyState,
  usePriceInfoModalState,
  useTarotSpreadVoucherPriceState,
  useAuth,
} from '@/hooks';
import { useDispatch, useSelector } from 'react-redux';
import { resetAllTarotCards } from '../../store/tarotCardStore.jsx';
import {
  setIsAnswered,
  setIsWaiting,
  setIsDoneAnimationOfBackground,
  setIsReadyToShowDurumagi,
} from '../../store/booleanStore.jsx';
import AnswerDurumagiModal from '../../modals/AnswerModal/AnswerDurumagiModal.jsx';
import AnswerCardImagesModal from '../../modals/AnswerModal/AnswerCardImagesModal.jsx';
import TarotManualModal from '../../modals/TarotManualModal/TarotManualModal.jsx';
import {
  usePreventModalBackgroundScroll,
  useFetchUserAndTarotDataWithRedux,
  userCacheForRedux,
} from '@/hooks';
import { isProductionMode } from '@/utils/constants';
import { tarotApi } from '../../api/tarotApi.jsx';
import { userApi } from '../../api/userApi.jsx';
import { hasAccessToken } from '../../utils/storage/tokenCookie.jsx';
import {
  getRewardForPreference,
  hasAccessTokenForPreference,
} from '../../utils/storage/tokenPreference.jsx';
// import AdComponent from '../GoogleAd/AdComponent.jsx';
// import AdComponentOfPlusForButton from '../GoogleAd/AdComponentOfPlusForButton.jsx';
import AdComponentForButton from '../../components/GoogleAd/AdComponentForButton.jsx';
import { createCancelToken } from '../../api/api.jsx';
// import { useNavigate } from 'react-router-dom';
import ChargeModal from '../../modals/PurchaseModal/TossPurchase/ChargeModal.jsx';
import InAppPurchase from '../../modals/PurchaseModal/InAppPurchase/InAppPurchase.jsx';
import { checkViolationInGoogleInAppRefund } from '../../utils/validation/checkViolation.jsx';
import isComDomain from '../../utils/validation/isComDomain.jsx';
import TarotMasterScene from '../../components/ThreeScene/Model/TarotMasterSceneFirstEdition/TarotMasterScene.jsx';
import { BlinkModalSet } from '../../components/BlinkModals/BlinkModalSet.jsx';
import TarotQuestionInstructionModal from '../../modals/TarotQuestionInstructionModal/TarotQuestionInstructionModal.jsx';
import { getTodayCard } from '../../utils/storage/tokenLocalStorage.jsx';
import { getTodayCardForNative } from '../../utils/storage/tokenPreference.jsx';
import { Capacitor } from '@capacitor/core';
const isNative = Capacitor.isNativePlatform();
import AdComponentForInterstital from '../../components/GoogleAd/AdComponentForInterstital.jsx';
import { isNormalAccount } from '../../lib/user/isNormalAccount.js';
import { isAdsFreePassValid } from '../../lib/user/isAdsFreePassValid.jsx';
import { useTotalCardsNumber } from '@/hooks';
import { useOutletContext } from 'react-router-dom';
import DailyTarotCard from '../../components/Button/DailyTarotButton/DailyTarotCard.jsx';
import Login from '../../components/Button/LoginButton/Login.jsx';
import LoadingForm from '../../components/Loading/Loading.jsx';
import Spread from '../../components/Button/SpreadButton/Spread.jsx';
import MyPage from '../../components/Button/MyPageButton/MyPage.jsx';
import NoticePopup from '../../components/NoticePopup/NoticePopup.jsx';
import AnswerModal from '../../modals/AnswerModal/AnswerModal.jsx';
import TarotManual from '../../components/Button/TarotManual/TarotManual.jsx';
import TarotHomeScene from '../../components/ThreeScene/TarotHomeScene.jsx';

// 홈페이지: 타로 모달, 스프레드 선택, 3D 씬, 광고
// Home page: tarot modal, spread selection, 3D scene, ads
// ホームページ：タロットモーダル、スプレッド選択、3Dシーン、広告
const Home = () => {
  const {
    setWhichTarotForApp,
    setIsVoucherModeOnForApp,
    setAdsWatchedForApp,
    setAnswerFormForApp,
  } = useOutletContext();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const { isToken, isCheckingToken } = useAuth();

  const sourceRef = useRef(createCancelToken());
  const [isPending, startTransition] = useTransition();
  const [userInfo, setUserInfo] = useState({});
  const [answerForm, updateAnswerForm] = useAnswerFormState();
  const [isReadyToShowDurumagi, setReadyToShowDurumagi] = useState(false);
  const [isDoneAnimationOfBackground, setDoneAnimationOfBackground] =
    useState(false);
  const [cardForm, updateCardForm] = useCardFormState();
  const [questionForm, updateQuestionForm] = useQuestionFormState();
  const [modalForm, updateModalForm] = useModalFormState();
  const [whichTarot, updateWhichTarot] = useWhichTarotState();
  const [cssInvisible, updateCSSInvisible] = useCSSInvisibleState();
  const [country, updateCountry] = useCountryState();
  const [isVoucherModeOn, setVoucherMode] = useState(() => {
    if (isNative) return false;
    if (!isNative) return true;
  });
  const [isAdsWatched, setAdsWatched] = useState(false);
  const [isAdWatchedOnlyForBlinkModal, setAdWatchedOnlyForBlinkModal] =
    useState(false);
  const [whichAds, setWhichAds] = useState(0);
  const [admobReward, setAdmobReward] = useState(null);

  useEffect(() => {
    setWhichTarotForApp(whichTarot);
    setIsVoucherModeOnForApp(isVoucherModeOn);
    setAdsWatchedForApp(isAdsWatched);
    setAnswerFormForApp(answerForm);
  }, [
    whichTarot,
    isVoucherModeOn,
    isAdsWatched,
    answerForm.isWaiting,
    answerForm.isAnswered,
    answerForm.isSubmitted,
    answerForm.answer,
    answerForm.questionInfo.question,
  ]);

  useEffect(() => {
    let isMounted = true;

    const fetchReward = async () => {
      try {
        let type =
          isProductionMode && isNormalAccount(userInfo) ? 'Voucher' : 'coins';
        const rewardAmount = await getRewardForPreference(
          type,
          userInfo?.email
        );
        if (isMounted) {
          setAdmobReward(rewardAmount);
        }
      } catch (error) {
        if (error.name === 'AbortError') return; // 요청 취소 시 무시
        console.error('Failed to fetch reward:', error);
      }
    };

    fetchReward();

    return () => {
      isMounted = false; // 컴포넌트 언마운트 시 상태 업데이트 방지
    };
  }, [userInfo]); // userInfo가 변경될 때마다 실행


  const [isBlinkModalForLoginOpen, updateBlinkModalForLoginOpen] =
    useBlinkModalState();
  const [isBlinkModalForCopyOpen, updateBlinkModalForCopyOpen] =
    useBlinkModalState();
  const [isBlinkModalForSaveOpen, updateBlinkModalForSaveOpen] =
    useBlinkModalState();
  const [isChargeModalOpen, updateChargeModalOpen] = useChargeModalState();
  const [showInAppPurchase, setShowInAppPurchase] = useState(false);
  const [isTarotManualModalOpen, updateTarotManualModalOpen] =
    useTarotManualModalState();
  const [tarotSpreadPricePoint, updateTarotSpreadPricePoint] =
    useTarotSpreadPricePointState();
  const [tarotSpreadVoucherPrice, updateTarotSpreadVoucherPrice] =
    useTarotSpreadVoucherPriceState();
  const [isRefundPolicyOpen, updateRefundPolicyOpen] =
    useRefundPolicyState(false);
  const [isPriceInfoModalOpen, updatePriceInfoModalOpen] =
    usePriceInfoModalState(false);

  const [isBlinkModalForChargingKRWOpen, setBlinkModalForChargingKRWOpen] =
    useState(false);
  const [isBlinkModalForChargingUSDOpen, setBlinkModalForChargingUSDOpen] =
    useState(false);
  const [isFilledInTheQuestion, setFilledInTheQuestion] = useState(true);
  const [isOverInTheQuestion, setOverInTheQuestion] = useState(false);
  const [isUnavailableVoucher, setUnavailableVoucher] = useState(false);
  const [isUnavailableWhichTarot, setUnavailableWhichTarot] = useState(false);
  const [isSpeedTarotNotificationOn, setSpeedTarotNotificationOn] =
    useState(false);
  const [whichSpread, setWhichSpread] = useState(false);
  const [whichCardPosition, setWhichCardPosition] = useState({
    isClicked: false,
    position: -1,
  });
  const [questionMode, setQuestionMode] = useState(1);
  const [requiredVoucherInfo, setRequiredVoucherInfo] = useState({
    name: 0,
    requiredAmount: 0,
    remainingAmount: 0,
  });

  const toggleSpreadModal = useCallback(
    (value, list_number, spread_title, card_count) => {
      if (answerForm?.isWaiting === false) {
        updateModalForm({ ...modalForm, spread: value });
        updateQuestionForm(prev => ({
          ...prev,
          spreadTitle: spread_title,
          cardCount: card_count,
          spreadListNumber: list_number,
        }));
      }
    },
    [answerForm, modalForm, updateModalForm, updateQuestionForm] // 의존성 배열
  );

  const toggleTarotModal = useCallback(
    (value, list_number, spread_title, card_count) => {
      updateModalForm(prev => {
        return { ...prev, tarot: value };
      });
      updateQuestionForm(prev => {
        return {
          ...prev,
          spreadTitle: spread_title,
          cardCount: card_count,
          spreadListNumber: list_number,
        };
      });
    }
  );

  const handleCardForm = useCallback(e => {
    e.preventDefault();
    const { name, value } = e.target; // input 태그의 name속성(name을 state명이랑 같게 해야) 및 value속성을 뽑음
    updateCardForm(prev => ({
      ...prev, // state(객체형) 변경법
      [name]: value, // 표현법이 신기(대괄호 붙임)
    }));
  });

  const handleQuestionForm = useCallback(e => {
    e.preventDefault();
    const { name, value } = e.target;
    updateQuestionForm(prev => ({
      ...prev,
      [name]: value,
    }));
  });

  const handleWhichTarot = useCallback(number => {
    updateWhichTarot(number);
    if (number === 2 && isVoucherModeOn === false) {
    }
  });

  const handleAnsweredState = useCallback(() => {
    dispatch(setIsWaiting(false));
    dispatch(setIsAnswered(true));
    // dispatch(setIsDoneAnimationOfBackground(true));
    // dispatch(setIsReadyToShowDurumagi(true));
    updateAnswerForm(prev => {
      return {
        ...prev,
        isSubmitted: false,
        isWaiting: false,
        isAnswered: true,
      };
    });
  });

  const handleNotAnsweredState = useCallback(() => {
    dispatch(setIsWaiting(false));
    dispatch(setIsAnswered(false));
    dispatch(setIsDoneAnimationOfBackground(false));
    dispatch(setIsReadyToShowDurumagi(false));
    updateAnswerForm(prev => {
      return {
        ...prev,
        isSubmitted: false,
        isWaiting: false,
        isAnswered: false,
      };
    });
    // setAdsWatched(false); //? 넣어야 하는지 모르겠음
  });

  const handleResetAll = useCallback(() => {
    dispatch(resetAllTarotCards());
    dispatch(setIsWaiting(false));
    dispatch(setIsAnswered(false));
    dispatch(setIsDoneAnimationOfBackground(false));
    dispatch(setIsReadyToShowDurumagi(false));
    updateAnswerForm(prev => {
      return {
        ...prev,
        questionInfo: {
          question_topic: '',
          subject: '',
          object: '',
          relationship_subject: '',
          relationship_object: '',
          theme: '',
          situation: '',
          question: '',
          firstOption: '',
          secondOption: '',
          thirdOption: '',
        },
        spreadInfo: {
          spreadTitle: '',
          cardCount: 0,
          spreadListNumber: 0,
          selectedTarotCardsArr: [],
        },
        answer: '',
        language: '',
        timeOfCounselling: '',
        createdAt: '',
        updatedAt: '',
        isSubmitted: false,
        isWaiting: false,
        isAnswered: false,
      };
    });
    updateQuestionForm(prev => {
      return {
        ...prev,
        question_topic: '',
        subject: '',
        object: '',
        relationship_subject: '',
        relationship_object: '',
        theme: '',
        situation: '',
        question: '',
        spreadTitle: '',
        cardCount: 0,
        spreadListNumber: 0,
        firstOption: '',
        secondOption: '',
      };
    });
    updateCardForm(prev => {
      return {
        ...prev,
        shuffle: 0,
        isReadyToShuffle: false,
        isSuffleFinished: false,
        spread: false,
        flippedIndex: [],
        selectedCardIndexList: [],
      };
    });
    updateCSSInvisible(false);
    setDoneAnimationOfBackground(false);
    setReadyToShowDurumagi(false);
    setWhichCardPosition(prev => {
      return {
        ...prev,
        isClicked: false,
        position: -1,
      };
    });
  });

  const handleResetDeck = useCallback(() => {
    dispatch(resetAllTarotCards());
    updateCardForm(prev => {
      return {
        ...prev,
        shuffle: 0,
        isReadyToShuffle: false,
        isSuffleFinished: false,
        spread: false,
        flippedIndex: [],
        selectedCardIndexList: [],
      };
    });
  });

  const handleSpreadValue = useCallback(value => {
    updateCardForm(prev => {
      return { ...prev, spread: value };
    });
  });

  const handleReadyToShuffleValue = useCallback(value => {
    updateCardForm(prev => {
      return { ...prev, isReadyToShuffle: value };
    });
  });

  const handleSuffleFinishValue = useCallback(value => {
    updateCardForm(prev => {
      return { ...prev, isShuffleFinished: value };
    });
  });

  const stateGroup = useMemo(
    () => ({
      answerForm,
      cardForm,
      questionForm,
      modalForm,
      whichTarot,
      cssInvisible,
      country,
      tarotSpreadPricePoint,
      tarotSpreadVoucherPrice,
      isVoucherModeOn,
      isAdsWatched,
      isAdWatchedOnlyForBlinkModal,
      whichAds,
      isChargeModalOpen,
      showInAppPurchase,
      whichSpread,
      whichCardPosition,
      isReadyToShowDurumagi,
      isDoneAnimationOfBackground,
      admobReward,
      questionMode,
      isSpeedTarotNotificationOn,
      isBlinkModalForLoginOpen,
      isBlinkModalForCopyOpen,
      isBlinkModalForSaveOpen,
      isBlinkModalForChargingKRWOpen,
      isBlinkModalForChargingUSDOpen,
      isFilledInTheQuestion,
      isUnavailableVoucher,
      isUnavailableWhichTarot,
      requiredVoucherInfo,
      isPending,
      isOverInTheQuestion,
    }),
    [
      answerForm,
      cardForm,
      questionForm,
      modalForm,
      whichTarot,
      cssInvisible,
      country,
      tarotSpreadPricePoint,
      tarotSpreadVoucherPrice,
      isVoucherModeOn,
      isAdsWatched,
      isAdWatchedOnlyForBlinkModal,
      whichAds,
      isChargeModalOpen,
      showInAppPurchase,
      whichSpread,
      whichCardPosition,
      isReadyToShowDurumagi,
      isDoneAnimationOfBackground,
      admobReward,
      questionMode,
      isSpeedTarotNotificationOn,
      isBlinkModalForLoginOpen,
      isBlinkModalForCopyOpen,
      isBlinkModalForSaveOpen,
      isBlinkModalForChargingKRWOpen,
      isBlinkModalForChargingUSDOpen,
      isFilledInTheQuestion,
      isUnavailableVoucher,
      isUnavailableWhichTarot,
      requiredVoucherInfo,
      isPending,
      isOverInTheQuestion,
    ]
  );

  // 상태 업데이트 함수 그룹: useMemo로 메모이제이션
  const setStateGroup = useMemo(
    () => ({
      updateAnswerForm,
      updateCardForm,
      updateQuestionForm,
      updateModalForm,
      updateWhichTarot,
      updateCSSInvisible,
      updateCountry,
      updateBlinkModalForLoginOpen,
      updateChargeModalOpen,
      updateTarotSpreadPricePoint,
      updateTarotSpreadVoucherPrice,
      updateTarotManualModalOpen,
      setVoucherMode,
      setWhichAds,
      setAdsWatched,
      setShowInAppPurchase,
      setFilledInTheQuestion,
      setUnavailableWhichTarot,
      setWhichSpread,
      setWhichCardPosition,
      setAdWatchedOnlyForBlinkModal,
      setReadyToShowDurumagi,
      setAdmobReward,
      setQuestionMode,
      setSpeedTarotNotificationOn,
      updateBlinkModalForCopyOpen,
      updateBlinkModalForSaveOpen,
      setBlinkModalForChargingKRWOpen,
      setBlinkModalForChargingUSDOpen,
      setUnavailableVoucher,
      setRequiredVoucherInfo,
      startTransition,
      setOverInTheQuestion,
    }),
    [
      updateAnswerForm,
      updateCardForm,
      updateQuestionForm,
      updateModalForm,
      updateWhichTarot,
      updateCSSInvisible,
      updateCountry,
      updateBlinkModalForLoginOpen,
      updateChargeModalOpen,
      updateTarotSpreadPricePoint,
      updateTarotSpreadVoucherPrice,
      updateTarotManualModalOpen,
      setVoucherMode,
      setWhichAds,
      setAdsWatched,
      setShowInAppPurchase,
      setFilledInTheQuestion,
      setUnavailableWhichTarot,
      setWhichSpread,
      setWhichCardPosition,
      setAdWatchedOnlyForBlinkModal,
      setReadyToShowDurumagi,
      setAdmobReward,
      setQuestionMode,
      setSpeedTarotNotificationOn,
      updateBlinkModalForCopyOpen,
      updateBlinkModalForSaveOpen,
      setBlinkModalForChargingKRWOpen,
      setBlinkModalForChargingUSDOpen,
      setUnavailableVoucher,
      setRequiredVoucherInfo,
      startTransition,
      setOverInTheQuestion,
    ]
  );

  // 모달 토글 함수 그룹: useMemo로 메모이제이션
  const toggleModalGroup = useMemo(
    () => ({
      toggleSpreadModal,
      toggleTarotModal,
    }),
    [toggleSpreadModal, toggleTarotModal]
  );

  // 상태 처리 함수 그룹: useMemo로 메모이제이션
  const handleStateGroup = useMemo(
    () => ({
      handleAnsweredState,
      handleCardForm,
      handleQuestionForm,
      handleResetAll,
      handleResetDeck,
      handleSpreadValue,
      handleReadyToShuffleValue,
      handleSuffleFinishValue,
      handleWhichTarot,
    }),
    [
      handleAnsweredState,
      handleCardForm,
      handleQuestionForm,
      handleResetAll,
      handleResetDeck,
      handleSpreadValue,
      handleReadyToShuffleValue,
      handleSuffleFinishValue,
      handleWhichTarot,
    ]
  );
  const userInfoForRedux = useSelector(state => state?.userInfoStore?.userInfo);

  const { getUserAndTarot, clearCaches, cleanupInterceptorArr } =
    useFetchUserAndTarotDataWithRedux(tarotApi, userApi, dispatch);
  const saveUserAndTarotInRedux = async () => {
    // cancelToken을 전달하여 요청 취소 가능하도록 함
    const cancelToken = sourceRef.current?.token;

    if (hasAccessToken() === true && isNative === false)
      await getUserAndTarot(cancelToken);
    const checkTokenInApp =
      isNative === true ? await hasAccessTokenForPreference() : false;
    if (isNative === true && checkTokenInApp === true)
      await getUserAndTarot(cancelToken);
  };
  useEffect(() => {

    if (answerForm?.isWaiting === false && answerForm?.isAnswered === true) {
      // tarotCacheForRedux.clear(); //& 이거 때문에 중요
      // userCacheForRedux.clear(); //& 이거 때문에 중요
      saveUserAndTarotInRedux();

      setAdsWatched(false);
    } else {
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
  }, [answerForm?.isWaiting, answerForm?.isAnswered]);


  useEffect(() => {
    if (
      (typeof userInfoForRedux === 'object' &&
        Object.keys(userInfoForRedux)?.length === 0) ||
      userInfoForRedux === undefined ||
      userInfoForRedux === null
    ) {
      setUserInfo({});
    } else {
      setUserInfo(userInfoForRedux);
    }
    saveUserAndTarotInRedux();
    return () => {
      if (sourceRef.current) {
        sourceRef.current.cancel('Cancelled all requests');
        sourceRef.current = createCancelToken(); // 새로운 source 생성
      }
    };
  }, [
    userInfoForRedux,
    isChargeModalOpen,
    isTarotManualModalOpen,
    modalForm?.spread,
  ]);

  usePreventModalBackgroundScroll(isChargeModalOpen, isTarotManualModalOpen);

  checkViolationInGoogleInAppRefund(userInfo);

  let [resultOfHasUserEmail, setResultOfHasUserEmail] = useState(false);
  useEffect(() => {
    setResultOfHasUserEmail(() => {
      return userInfo?.email ? isComDomain(userInfo?.email) : false;
    });
  }, [userInfo?.email]);

  // console.log('Home.jsx 새로고침 됨.');
  // console.log('isDoneAnimationOfBackground : ', isDoneAnimationOfBackground);
  // console.log('isReadyToShowDurumagi : ', isReadyToShowDurumagi);

  const isAdmobOn =
    isNative &&
    whichAds !== 0 && //! 이게 바뀌어서 렌더가 되고 안되고 함.
    isAdsWatched === false &&
    !isAdsFreePassValid(userInfo) &&
    ((!isVoucherModeOn && answerForm?.isAnswered && whichTarot === 2) || //~ 첫째조건
      (isVoucherModeOn && showInAppPurchase) || //~ 둘째조건(결제창)
      (!isVoucherModeOn && showInAppPurchase && whichTarot !== 2)); //~셋째조건(결제창)

  // if (!isProductionMode || !isNormalAccount(userInfo)) {
  //   console.log(
  //     `(Home.jsx)*********************************whichAds:${whichAds}; isAdsWatched: ${isAdsWatched}, isAnswered: ${answerForm.isAnswered}, whichTarot: ${whichTarot}, isWaiting: ${answerForm.isWaiting}, isAdmobOn: ${isAdmobOn}`
  //   );
  // }
  const totalCardsNumber = useTotalCardsNumber();
  const isAdmobInterstitialOn =
    isNative &&
    whichAds === 1 && //! 이게 바뀌어서 렌더가 되고 안되고 함(TarotDisplacementForm에서 바꿈).
    isAdsWatched === false &&
    whichTarot === 1 &&
    !isAdsFreePassValid(userInfo) &&
    cardForm?.selectedCardIndexList.length === totalCardsNumber && //! Displacement 창 나올 때임.
    modalForm.tarot; //! Home에선, tarot 모달창이 팝업된 상태에서 보는거지(보통무료 타로모달창 띄었다가 => 스피드모드 변경시 일단 광고 막기 가능).

  const RenderTarotModal =
    modalForm?.tarot && userInfo?.email !== '' && userInfo?.email !== undefined;

  // const isAdmobOn = isNative
  //   ? isVoucherModeOn === false &&
  //     whichAds !== 0 && //! 이게 바뀌어서 렌더가 되고 안되고 함.
  //     isAdsWatched === false &&
  //     (isProductionMode ? admobReward < 1 : admobReward < 10) //! 이게 바뀌어서 렌더가 되고 안되고 함.
  //   : isVoucherModeOn === false && whichAds !== 0 && isAdsWatched === false;

  // const RenderTarotModal =
  //   modalForm.tarot &&
  //   (isNative
  //     ? !(
  //         whichTarot === 2 &&
  //         !isVoucherModeOn &&
  //         (isProductionMode ? admobReward < 1 : admobReward < 10) &&
  //         isAdsWatched === false
  //       )
  //     : !(whichTarot === 2 && !isVoucherModeOn && isAdsWatched === false));

  const initialAdsMode =

    whichTarot === 2 &&
    !isVoucherModeOn &&
    !answerForm?.isWaiting &&
    answerForm?.isAnswered &&
    !isReadyToShowDurumagi &&
    !isDoneAnimationOfBackground &&
    answerForm?.answer?.length === 0 &&
    !isAdsFreePassValid(userInfo);

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
        // setAdmobReward(0); // 오류 발생 시 0으로 설정
      }
    };
    initializeReward();
  }, [
    // modalForm.spread,
    whichTarot,
    isVoucherModeOn,
    isAdsWatched,
    admobReward,
    whichAds,
    userInfo,
    userInfo?.email,
    userInfoForRedux,
  ]);


  const [isInstructionOpen, setInstructionOpen] = useState(false);
  const [questionKind, setQuestionKind] = useState(0);
  const [isClickedForTodayCard, setClickedForTodayCard] = useState(false);

  const [todayCardIndexInLocalStorage, setTodayCardIndexInLocalStorage] =
    useState(() => {
      // if (
      //   cardForm?.selectedCardIndexList?.length !== 0 &&
      //   userInfo?.email !== undefined &&
      //   userInfo?.email !== ''
      // )
      //   return cardForm?.selectedCardIndexList[0];
      if (!isNative) return getTodayCard(userInfo); //! 카드 인덱스나 null 반환
      if (isNative) return null;
    });
  useEffect(() => {
    const fetchTodayCard = async () => {
      try {
        let index;
        if (isNative) {
          index = await getTodayCardForNative(userInfo);
        } else {
          index = getTodayCard(userInfo);
        }
        if (
          cardForm?.selectedCardIndexList?.length !== 0 &&
          userInfo?.email !== undefined &&
          userInfo?.email !== ''
        )
          setTodayCardIndexInLocalStorage(cardForm?.selectedCardIndexList[0]);
        if (index) setTodayCardIndexInLocalStorage(index);
      } catch (error) {
        console.error("Error fetching today's card:", error);
      }
    };

    if (
      !todayCardIndexInLocalStorage &&
      userInfo?.email !== '' &&
      userInfo?.email !== undefined
    )
      fetchTodayCard();
  }, [isNative, userInfo?.email, cardForm?.selectedCardIndexList?.length]);

  return (
    <div className={styles['container']}>
      {/* 이벤트공지창 - 아이디별로 로컬스토리지에 팝업 표시 여부 설정 */}
      {/* {!isNative && userInfo?.email && <NoticePopup email={userInfo?.email} />} */}
      {new Date() < new Date('2025-08-26') && isNative && userInfo?.email && (
        <NoticePopup email={userInfo?.email} />
      )}
      {/* {!isNative && (!userInfo || userInfo?.email === "" || !userInfo?.email) && <NoticePopup email={'user@user.com'} />} */}
      {new Date() < new Date('2025-08-26') &&
        isNative &&
        (!userInfo || userInfo?.email === '' || !userInfo?.email) && (
          <NoticePopup email={'user@user.com'} />
        )}
      {/* 로그인 전 나타남 */}
      <Login
        userInfo={userInfo}
        isTokenFromNavbar={isToken}
        stateGroup={stateGroup}
        setStateGroup={setStateGroup}
      />
      {/* 로그인 후 나타남 */}
      <DailyTarotCard
        modalForm={modalForm}
        answerForm={answerForm}
        isReadyToShowDurumagi={isReadyToShowDurumagi}
        userInfo={userInfo}
        cardForm={cardForm}
        todayCardIndexInLocalStorage={todayCardIndexInLocalStorage}
        styles={styles}
        handleStateGroup={handleStateGroup}
        updateCardForm={updateCardForm}
        stateGroup={stateGroup}
        setStateGroup={setStateGroup}
        setClickedForTodayCardFromHome={setClickedForTodayCard}
        isTokenFromNavbar={isToken}
      />
      <Spread
        modalForm={modalForm}
        answerForm={answerForm}
        isReadyToShowDurumagi={isReadyToShowDurumagi}
        userInfo={userInfo}
        cardForm={cardForm}
        todayCardIndexInLocalStorage={todayCardIndexInLocalStorage}
        handleStateGroup={handleStateGroup}
        updateCardForm={updateCardForm}
        stateGroup={stateGroup}
        setStateGroup={setStateGroup}
        isClickedForTodayCardFromHome={isClickedForTodayCard}
        isTokenFromNavbar={isToken}
      />
      <MyPage
        modalForm={modalForm}
        answerForm={answerForm}
        isReadyToShowDurumagi={isReadyToShowDurumagi}
        userInfo={userInfo}
        cardForm={cardForm}
        todayCardIndexInLocalStorage={todayCardIndexInLocalStorage}
        handleStateGroup={handleStateGroup}
        updateCardForm={updateCardForm}
        stateGroup={stateGroup}
        setStateGroup={setStateGroup}
        isClickedForTodayCardFromHome={isClickedForTodayCard}
        isTokenFromNavbar={isToken}
      />
      <TarotManual
        modalForm={modalForm}
        answerForm={answerForm}
        isReadyToShowDurumagi={isReadyToShowDurumagi}
        userInfo={userInfo}
        cardForm={cardForm}
        todayCardIndexInLocalStorage={todayCardIndexInLocalStorage}
        handleStateGroup={handleStateGroup}
        updateCardForm={updateCardForm}
        stateGroup={stateGroup}
        updateTarotManualModalOpen={updateTarotManualModalOpen}
        isClickedForTodayCardFromHome={isClickedForTodayCard}
        isTokenFromNavbar={isToken}
      />

      <BlinkModalSet
        stateGroup={stateGroup}
        setStateGroup={setStateGroup}
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
          requiredVoucherInfo={requiredVoucherInfo}
        >
          {t(`charge_modal.out-of-voucher`)}
        </ChargeModal>
      )}
      {showInAppPurchase && isNative && resultOfHasUserEmail && (
        <InAppPurchase
          updateRefundPolicyOpen={updateRefundPolicyOpen}
          updatePriceInfoModalOpen={updatePriceInfoModalOpen}
          userInfoFromMyPage={userInfo}
          isPriceInfoModalOpen={isPriceInfoModalOpen}
          showInAppPurchase={showInAppPurchase}
          setShowInAppPurchase={setShowInAppPurchase}
          stateGroup={stateGroup}
          setUnavailableVoucher={setUnavailableVoucher}
          setWhichAds={setWhichAds}
          admobReward={admobReward}
          setAdsWatched={setAdsWatched}
          setAdmobReward={setAdmobReward}
          // timeButton={{ clickCount, isLocked, remainingTime, handleClick }}
        >
          {t(`charge_modal.out-of-voucher`)}
        </InAppPurchase>
      )}
      {isTarotManualModalOpen && (
        <TarotManualModal
          updateTarotManualModalOpen={updateTarotManualModalOpen}
        />
      )}
      {/* //! 보통 타로용 */}
      {isAdmobOn && (
        <AdComponentForButton
          // whichAds={whichAds}
          // setWhichAds={setWhichAds}
          // setAdsWatched={setAdsWatched}
          // setAdWatchedOnlyForBlinkModal={setAdWatchedOnlyForBlinkModal}
          stateGroup={stateGroup}
          setStateGroup={setStateGroup}
          userInfo={userInfo}
          // setAdmobReward={setAdmobReward}
          // timeButton={{ clickCount, isLocked, remainingTime, handleClick }}
        />
      )}
      {/* //! 스피드 타로용 */}
      {isAdmobInterstitialOn && (
        <AdComponentForInterstital
          // whichAds={whichAds}
          // setWhichAds={setWhichAds}
          // setAdsWatched={setAdsWatched}
          // setAdWatchedOnlyForBlinkModal={setAdWatchedOnlyForBlinkModal}
          stateGroup={stateGroup}
          setStateGroup={setStateGroup}
          userInfo={userInfo}
          // setAdmobReward={setAdmobReward}
        />
      )}
      {/* Canvas 태그(TarotMaster태그에 포함됨)를 배치 및 크기를 지정하고 싶을 땐 부모 div를 씌어주어 스타일 주자. 
        Canvas 태그에는 스타일을 주는게 아니다. 속성으로 정하기. */}

      {/* SEO를 위한 숨겨진 콘텐츠 - 검색엔진이 읽을 수 있음 */}
      <div
        style={{ position: 'absolute', left: '-9999px', top: 0 }}
        aria-hidden="true"
      >
        <h1>{t('meta.title')}</h1>
        <p>{t('meta.description')}</p>
        <article>
          <h2>{t('home.welcome_title')}</h2>
          <p>{t('home.welcome_description')}</p>
          <section>
            <h3>{t('home.features_title')}</h3>
            <ul>
              <li>{t('home.feature_ai_reading')}</li>
              <li>{t('home.feature_daily_tarot')}</li>
              <li>{t('home.feature_multiple_spreads')}</li>
              <li>{t('home.feature_personal_stats')}</li>
            </ul>
          </section>
        </article>
      </div>

      {/* JavaScript가 비활성화된 경우를 위한 noscript 태그 */}
      <noscript>
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#1a1a2e',
            color: '#ffffff',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <h1 style={{ marginBottom: '1rem' }}>{t('meta.title')}</h1>
          <p style={{ marginBottom: '2rem', maxWidth: '600px' }}>
            {t('meta.description')}
          </p>
          <div style={{ maxWidth: '800px', textAlign: 'left' }}>
            <h2 style={{ marginBottom: '1rem' }}>
              {t('home.js_required_title', {
                defaultValue: 'JavaScript Required',
              })}
            </h2>
            <p>
              {t('home.js_required_message', {
                defaultValue:
                  'This application requires JavaScript to display the interactive 3D tarot experience. Please enable JavaScript in your browser settings to continue.',
              })}
            </p>
          </div>
        </div>
      </noscript>

      <div className={styles['tarot-master-container']}>
        <Suspense fallback={<LoadingForm />}>
          {/* <TarotMasterScene
            position={[0, 0, 0]}
            stateGroup={stateGroup}
            setStateGroup={setStateGroup}
            toggleModalGroup={toggleModalGroup}
            handleStateGroup={handleStateGroup}
            setReadyToShowDurumagi={setReadyToShowDurumagi}
            updateTarotManualModalOpen={updateTarotManualModalOpen}
            setDoneAnimationOfBackground={setDoneAnimationOfBackground}
            userInfo={userInfo}
            isClickedForTodayCard={isClickedForTodayCard}
          /> */}
          <TarotHomeScene
            stateGroup={stateGroup}
            setStateGroup={setStateGroup}
            toggleModalGroup={toggleModalGroup}
            handleStateGroup={handleStateGroup}
            setReadyToShowDurumagi={setReadyToShowDurumagi}
            updateTarotManualModalOpen={updateTarotManualModalOpen}
            setDoneAnimationOfBackground={setDoneAnimationOfBackground}
            userInfo={userInfo}
            isClickedForTodayCard={isClickedForTodayCard}
          />
        </Suspense>
        {isInstructionOpen && (
          <TarotQuestionInstructionModal
            setInstructionOpen={setInstructionOpen}
            questionKind={questionKind}
          />
        )}
        <Suspense fallback={null}>
          {modalForm?.spread &&
            userInfo?.email !== '' &&
            userInfo?.email !== undefined && (
              <SpreadModal
                stateGroup={stateGroup}
                setStateGroup={setStateGroup}
                toggleModalGroup={toggleModalGroup}
                handleStateGroup={handleStateGroup}
                userCacheForRedux={userCacheForRedux}
                admobReward={admobReward}
              />
            )}
        </Suspense>
        <Suspense fallback={null}>
          {RenderTarotModal && (
            <TarotModal
              stateGroup={stateGroup}
              setStateGroup={setStateGroup}
              toggleModalGroup={toggleModalGroup}
              handleStateGroup={handleStateGroup}
              userInfo={userInfo}
              setAdmobReward={setAdmobReward}
              isInstructionOpen={isInstructionOpen}
              setInstructionOpen={setInstructionOpen}
              setQuestionKind={setQuestionKind}
            />
          )}
        </Suspense>
        {/* <AnswerModal
          // answerForm={answerForm}
          // whichTarot={whichTarot}
          isVoucherModeOn={isVoucherModeOn}
        /> */}
        {answerForm?.isAnswered &&
        whichTarot !== 1 &&
        !modalForm?.tarot &&
        !modalForm?.spread &&
        (initialAdsMode ||
          (isDoneAnimationOfBackground && isReadyToShowDurumagi)) ? (
          <>
            <AnswerCardImagesModal
              stateGroup={{ answerForm, whichCardPosition }}
              setWhichCardPosition={setWhichCardPosition}
            />
            <AnswerDurumagiModal
              questionForm={questionForm}
              answerForm={answerForm}
              updateAnswerForm={updateAnswerForm}
              tarotSpreadVoucherPrice={tarotSpreadVoucherPrice}
              handleNotAnsweredState={handleNotAnsweredState}
              handleResetAll={handleResetAll}
              updateBlinkModalForSaveOpen={updateBlinkModalForSaveOpen}
              updateBlinkModalForCopyOpen={updateBlinkModalForCopyOpen}
              whichTarot={whichTarot}
              whichAds={whichAds}
              setWhichAds={setWhichAds}
              admobReward={admobReward}
              setAdmobReward={setAdmobReward}
              isVoucherModeOn={isVoucherModeOn}
              userInfo={userInfo}
              setWhichCardPosition={setWhichCardPosition}
              setAdsWatched={setAdsWatched}
            />
          </>
        ) : null}
      </div>
      {/* /* 이런 건 검색엔진이 처벌할 수 있어요 */}
      {/* display: none;           /* 아예 숨김 */}
      {/* visibility: hidden;      /* 보이지 않게 */}
      {/* color: white;            /* 배경색과 같은 색 */}
      {/* font-size: 0;            /* 글씨 크기 0 */}
      <div
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
        }}
      >
        <h1>{t('page.threejs.mainHeading')}</h1>

        <section>
          <p>{t('page.threejs.intro.paragraph1')}</p>
          <p>{t('page.threejs.intro.paragraph2')}</p>
        </section>

        <section>
          <h2>{t('page.threejs.pageFeatures.title')}</h2>

          <div>
            <h3>{t('page.threejs.pageFeatures.characterCompanion.title')}</h3>
            <p>
              {t('page.threejs.pageFeatures.characterCompanion.description')}
            </p>
          </div>

          <div>
            <h3>{t('page.threejs.pageFeatures.visualComfort.title')}</h3>
            <p>{t('page.threejs.pageFeatures.visualComfort.description')}</p>
          </div>

          <div>
            <h3>{t('page.threejs.pageFeatures.emotionalConnection.title')}</h3>
            <p>
              {t('page.threejs.pageFeatures.emotionalConnection.description')}
            </p>
          </div>
        </section>

        <section>
          <h2>{t('page.threejs.accessibility.title')}</h2>
          <p>{t('page.threejs.accessibility.description')}</p>
        </section>
      </div>

      <noscript>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1>{t('page.threejs.noscript.title')}</h1>
          <p>{t('page.threejs.noscript.message1')}</p>
          <p>{t('page.threejs.noscript.message2')}</p>
        </div>
      </noscript>

      {/* Google Ads를 위한 실제 보이는 콘텐츠
      <LandingContent /> */}
    </div>
  );
};
export default Home;

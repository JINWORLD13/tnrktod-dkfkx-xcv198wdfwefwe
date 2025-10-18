import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AnswerDurumagiModal.module.scss';
import { useRenderQuestionAsLines } from '../../lib/tarot/answer/useRenderQuestionAsLines.jsx';
import { renderAnswerAsLines } from '../../lib/tarot/answer/renderAnswerAsLines.jsx';
import { allAnswerAsText } from '../../lib/tarot/answer/allAnswerAsText.jsx';
import { useSaveTextFile } from '@/hooks';
import { copyText } from '../../utils/dom/copyText.jsx';
import { useLanguageChange } from '@/hooks';
import Button from '../../components/common/Button.jsx';
import CancelButton from '../../components/common/CancelButton.jsx';
import { detectComputer } from '../../utils/device/detectComputer.js';
import {
  getRewardForPreference,
  getAdsFree,
  useRewardForPreference,
  setAdsFree,
} from '../../utils/storage/tokenPreference.jsx';
import { useSelectedTarotCards } from '@/hooks';
import { tarotApi } from '../../api/tarotApi.jsx';
import { useDispatch } from 'react-redux';
import {
  setIsAnswered,
  setIsDoneAnimationOfBackground,
  setIsReadyToShowDurumagi,
  setIsWaiting,
} from '../../store/booleanStore.jsx';
import { useSelectedCardsMeaningInAnswerDurumagiModal } from '@/hooks';
import { tarotDeck } from '../../data/TarotCardDeck/TarotCardDeck.jsx';
import { translateTarotCardName } from '../../lib/tarot/card/cardNameTranslator.jsx';
import { isNormalAccount } from '../../lib/user/isNormalAccount.js';
import { useRewardFromPreference } from '../../components/GoogleAd/hooks/useRewardFromPreference.jsx';
import { isAdsFreePassValid } from '../../lib/user/isAdsFreePassValid.jsx';
import { Capacitor } from '@capacitor/core';
import formatTarotInterpretation from '../../lib/tarot/spread/formatTarotInterpretation.jsx';
import { determineTarotType } from './lib/determineTarotType.jsx';
import { isDevelopmentMode, isProductionMode } from '@/utils/constants';
const isNative = Capacitor.isNativePlatform();

const AnswerDurumagiModal = props => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [isCardMeaningOn, setCardMeaningOn] = useState(false);
  const [isShowAdsClicked, setShowAdsClicked] = useState(false);
  const browserLanguage = useLanguageChange();
  let whichTarot = props?.whichTarot;
  let answerForm = props?.answerForm;
  const 마이페이지를_위한_카드_배열 =
    answerForm?.spreadInfo.selectedTarotCardsArr.map((elem, i) => {
      const result = tarotDeck
        .map((cardInfo, i) => {
          if (cardInfo.name === elem.split('(')[0].trim()) return cardInfo;
          return null;
        })
        ?.filter(elem => elem !== null);
      // console.log(result[0]);
      return result[0];
    });
  const selectedTarotCardsFromHook = useSelectedTarotCards();
  const selectedTarotCards =
    selectedTarotCardsFromHook && selectedTarotCardsFromHook.length > 0
      ? selectedTarotCardsFromHook
      : 마이페이지를_위한_카드_배열;

  const 카드_방향_배열 = answerForm?.spreadInfo.selectedTarotCardsArr.map(
    (elem, i) => {
      // normal_direction
      // reversed
      return elem
        .split('(')[1]
        .trim()
        .slice(0, elem.split('(')[1].trim()?.length - 1)
        .trim();
    }
  );
  const translatedCardsNameArr = translateTarotCardName(
    answerForm?.spreadInfo?.selectedTarotCardsArr,
    browserLanguage
  );
  // const 카드_이름_배열 = answerForm?.spreadInfo.selectedTarotCardsArr.map(
  //   (elem, i) => {
  //     return elem.split('(')[0].trim();
  //   }
  // );
  // const 카드_방향_배열 = answerForm?.spreadInfo.selectedTarotCardsArr.map(
  //   (elem, i) => {
  //     // normal_direction
  //     // reversed
  //     return elem
  //       .split('(')[1]
  //       .trim()
  //       .slice(0, elem.split('(')[1].trim()?.length - 1)
  //       .trim();
  //   }
  // );
  const {
    questionInfo,
    spreadInfo,
    answer,
    language,
    timeOfCounselling,
    ...rest
  } = answerForm;

  const questionLines = useRenderQuestionAsLines(
    questionInfo,
    spreadInfo,
    language,
    timeOfCounselling
  );
  // const answerLines = renderAnswerAsLines(answer);
  whichTarot = determineTarotType(answerForm, whichTarot);
  const answerLines =
    typeof answer === 'string' &&
    !answer.includes('{') &&
    !answer.includes('arrOfPositionMeaningInSpread')
      ? renderAnswerAsLines(answer)
      : renderAnswerAsLines(
          formatTarotInterpretation(answer, whichTarot, browserLanguage, t)
        );

  const JSXTagArr = [questionLines, ...answerLines];
  const symbolMeaningLines = useSelectedCardsMeaningInAnswerDurumagiModal(
    whichTarot,
    props?.isVoucherModeOn,
    answerForm?.answer,
    selectedTarotCards,
    translatedCardsNameArr,
    카드_방향_배열
  );

  const scrollContainerRef = useRef(null);
  const downloadLinkRef = useRef(null);
  useEffect(() => {
    return () => {
      scrollContainerRef.current = null;
      downloadLinkRef.current = null;
    };
  }, []);
  const [heightUp, setHeightUp] = useState(false);
  const [fontSize, setFontSize] = useState(language === 'ja' ? 1.15 : 1.65);

  const saveTextFile = useSaveTextFile(
    allAnswerAsText([
      ...JSXTagArr,
      isCardMeaningOn ? symbolMeaningLines : null,
    ]),
    questionInfo,
    downloadLinkRef
  );

  const handleScroll = event => {
    event.preventDefault();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += event.deltaY > 0 ? 30 : -30;
    }
  };

  const [isCancelButtonClicked, setCancelButtonClicked] = useState(false);
  const handleCancel = e => {
    try {
      if (isCancelButtonClicked) return;
      setCancelButtonClicked(true);
      if (props?.handleResetAll !== undefined) props?.handleResetAll();

      // setAnswerModalOpen이 있는 경우에만 호출 (MyPage에서만 사용)
      if (
        props?.setAnswerModalOpen &&
        typeof props.setAnswerModalOpen === 'function'
      ) {
        props?.setAnswerModalOpen(() => {
          if (
            props?.setWhichCardPosition !== undefined &&
            props?.setWhichCardPosition !== null
          )
            props?.setWhichCardPosition(prev => {
              return { ...prev, isClicked: false, position: -1 };
            });
          return false;
        });
      } else {
        // Home에서는 setWhichCardPosition만 처리
        if (
          props?.setWhichCardPosition !== undefined &&
          props?.setWhichCardPosition !== null
        ) {
          props?.setWhichCardPosition(prev => {
            return { ...prev, isClicked: false, position: -1 };
          });
        }
      }

      setFontSize(language === 'ja' ? 0.95 : 1.35);
      props?.handleNotAnsweredState();
    } catch (error) {
      console.error(error);
    } finally {
      setCancelButtonClicked(false);
    }
  };

  const openBlinkModal = type => {
    const updateFunction =
      type === 'copy'
        ? props?.updateBlinkModalForCopyOpen
        : props?.updateBlinkModalForSaveOpen;
    if (updateFunction) updateFunction(true);
  };

  const getStyleClass = (baseClass, isJapanese) =>
    isJapanese ? styles[`${baseClass}-japanese`] : styles[baseClass];

  const onSubmit = async e => {
    e.preventDefault(); // 이거 없애면 입력값이 서버로 전송되기 전 새로고침 됨.
    const updatedSelectedTarotCards = [...selectedTarotCards];
    if (isNative) {
      if (whichTarot === 2 || whichTarot === 4)
        await useRewardFromPreference({
          userInfo: props?.userInfo,
          whichAds: props?.whichAds,
          whichTarot: whichTarot,
          isVoucherModeOn: props?.isVoucherModeOn,
          setAdmobReward: props?.setAdmobReward,
        });
      await setAdsFree(props?.userInfo);
    }

    const tarotCardsNameArr = updatedSelectedTarotCards.map((elem, i) => {
      return elem?.name;
    });
    const reverseStatesArr = updatedSelectedTarotCards.map((elem, i) => {
      if (elem.reversed === true) {
        return 'reversed';
      } else {
        return 'normal_direction';
      }
    });

    const selectedTarotCardsArr = tarotCardsNameArr.map((elem, i) => {
      return elem + ' ' + '(' + reverseStatesArr[i] + ')';
    });

    const questionInfo =
      props?.questionForm?.spreadListNumber === 201 ||
      props?.questionForm?.spreadListNumber === 304
        ? {
            question_topic: props?.questionForm['question_topic'].trim(),
            subject: props?.questionForm?.subject.trim(),
            object: props?.questionForm?.object.trim(),
            relationship_subject:
              props?.questionForm['relationship_subject'].trim(),
            relationship_object:
              props?.questionForm['relationship_object'].trim(),
            theme: props?.questionForm?.theme.trim(),
            situation: props?.questionForm?.situation.trim(),
            question: props?.questionForm?.question.trim(),
            firstOption: props?.questionForm?.['firstOption']?.trim(),
            secondOption: props?.questionForm?.['secondOption']?.trim(),
            thirdOption: props?.questionForm?.['thirdOption']?.trim(),
          }
        : {
            question_topic: props?.questionForm['question_topic'].trim(),
            subject: props?.questionForm?.subject.trim(),
            object: props?.questionForm?.object.trim(),
            relationship_subject:
              props?.questionForm['relationship_subject'].trim(),
            relationship_object:
              props?.questionForm['relationship_object'].trim(),
            theme: props?.questionForm?.theme.trim(),
            situation: props?.questionForm?.situation.trim(),
            question: props?.questionForm?.question.trim(),
          };

    const spreadInfo = {
      spreadTitle: props?.questionForm?.spreadTitle,
      cardCount: props?.questionForm?.cardCount,
      spreadListNumber: props?.questionForm?.spreadListNumber,
      selectedTarotCardsArr: selectedTarotCardsArr,
    };
    // ! 카페에선 공공와이파이 때문에 블락시키자.
    let result;
    // const currentTime = new Date();
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let tarotInfo = {
      questionInfo: { ...questionInfo },
      spreadInfo: { ...spreadInfo },
      // tarotSpreadPricePoint: tarotSpreadPricePoint,
      tarotSpreadVoucherPrice: props?.tarotSpreadVoucherPrice,
      language: browserLanguage,
      time: answerForm?.timeOfCounselling,
      formattedTime: answerForm?.timeOfCounselling?.toLocaleString(
        ['ko-KR', 'ja-JP', 'en-US'].find(locale =>
          locale.startsWith(browserLanguage)
        ) || 'en-US',
        {
          timeZone:
            browserLanguage === 'ko'
              ? 'Asia/Seoul'
              : browserLanguage === 'ja'
              ? 'Asia/Tokyo'
              : userTimeZone,
        }
      ),
      isVoucherModeOn: props?.isVoucherModeOn ?? true,
    };

    if (whichTarot === 2 && props?.isVoucherModeOn === false) {
      try {
        // if (!isAdsFreePassValid(props?.userInfo)) props?.setAdsWatched(true); //! banner 광고를 isFree일때도 보여주기 위해 어쩔 수 없이 함.(false는 답변을 받고 처리됨. - 광고 컴포넌트, 여기, tarotmodal 중 여기 onSubmit에서 처리됨.)
        props?.updateAnswerForm(prev => {
          return {
            ...prev,
            isWaiting: true, //! 이거 굉장히 중요
            isAnswered: false, //! 이거 굉장히 중요
            isSubmitted: true,
          };
        });
        result = await tarotApi.postQuestionForNormalForAnthropicAPI(tarotInfo);
      } catch (e) {
        if (isDevelopmentMode) {
          console.log(e);
        }
      }
    }
    // result가 유효한지 확인
    if (!result?.response) {
      console.error('API 호출 결과가 없습니다.');
      dispatch(setIsWaiting(false));
      return;
    }

    if (
      result !== undefined &&
      result?.response !== undefined &&
      result?.response !== null
    ) {
      const parsedObj = JSON.parse(result?.response.answer);
      props?.updateAnswerForm({
        questionInfo,
        spreadInfo,
        answer: parsedObj || result?.response.answer,
        language: tarotInfo?.language,
        timeOfCounselling: tarotInfo?.time,
        createdAt: result?.response.createdAt,
        updatedAt: result?.response.updatedAt,
        isWaiting: false,
        isSubmitted: false,
        isAnswered: true,
      });
      dispatch(setIsWaiting(false));
      dispatch(setIsAnswered(true));
      // dispatch(setIsDoneAnimationOfBackground(true));
      dispatch(setIsReadyToShowDurumagi(true));
      props?.setAdsWatched(false);
      // if (!isVoucherModeOn) setWhichAds(0);
      props?.setWhichAds(0);
    }
  };

  const showAds = async e => {
    try {
      e.preventDefault();
      if (isShowAdsClicked) return;
      setShowAdsClicked(true);
      let isFree;
      if (isNative) {
        isFree = await getAdsFree(props?.userInfo);
      }
      if (!isProductionMode || !isNormalAccount(props?.userInfo)) {
        if (isDevelopmentMode) {
          console.log('***************************************isFree : ', isFree);
        }
      }
      if (
        whichTarot === 2 &&
        !props?.isVoucherModeOn &&
        !isAdsFreePassValid(props?.userInfo)
      ) {
        const shouldShowAd = isNative
          ? isProductionMode && isNormalAccount(props?.userInfo)
            ? 1 > props?.admobReward && !isFree
            : 10 > props?.admobReward && !isFree
          : true;
        if (!isProductionMode || !isNormalAccount(props?.userInfo)) {
          if (isDevelopmentMode) {
            console.log(
              '***************************************shouldShowAd : ',
              shouldShowAd
            );
          }
        }
        if (shouldShowAd) {
          props?.setWhichAds(1);
        } else {
          props?.setAdsWatched(true); //! banner 광고를 isFree일때도 보여주기 위해 어쩔 수 없이 함.(false는 답변을 받고 처리됨. - 광고 컴포넌트, 여기, tarotmodal 중 여기 onSubmit에서 처리됨.)
          await onSubmit(e);
        }
      } else if (
        whichTarot === 2 &&
        !props?.isVoucherModeOn &&
        isAdsFreePassValid(props?.userInfo)
      ) {
        await onSubmit(e);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setShowAdsClicked(false);
    }
  };

  const showCardMeaning = async e => {
    e.preventDefault();
    setCardMeaningOn(prev => !prev);
  };

  const renderContent = () => {
    const isJapanese = language === 'ja';
    const isBrowserJapanese = browserLanguage === 'ja';
    return (
      <div
        className={`${getStyleClass('durumagi-container', isJapanese)} ${
          heightUp ? styles['heightUp'] : styles['initial']
        }`}
      >
        <div className={getStyleClass('durumagi-box', isJapanese)}>
          <div
            className={getStyleClass('content', isJapanese)}
            ref={scrollContainerRef}
            onWheel={handleScroll}
            style={{
              fontSize: `${fontSize}rem`,
              transition: 'font-size 0.3s ease-in-out',
            }}
          >
            <div className={styles['symbol-meaning-box']}>{JSXTagArr}</div>
            {/* {<strong style={{color: "red"}}>"ascascsa"</strong>} */}
            {whichTarot === 2 &&
              props?.isVoucherModeOn === false &&
              answerForm?.answer?.length < 100 && (
                <p
                  style={{
                    width: `100%`,
                    display: 'flex',
                    flexRow: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <Button
                    className={styles['ads']}
                    onClick={e => {
                      showAds(e);
                    }}
                  >
                    {t(`button.view-ads-for-interpretation`)}
                  </Button>
                </p>
              )}
            <p
              style={{
                width: `100%`,
                display: 'flex',
                flexRow: 'row',
                justifyContent: 'center',
              }}
            >
              <Button
                className={styles['card-meaning']}
                onClick={e => {
                  showCardMeaning(e);
                }}
              >
                {isCardMeaningOn
                  ? t(`button.close-card-meaning`)
                  : t(`button.view-card-meaning`)}
              </Button>
            </p>
            {isCardMeaningOn && (
              <div className={styles['symbol-meaning-box']}>
                {symbolMeaningLines}
              </div>
            )}
            {isCardMeaningOn && (
              <p
                style={{
                  width: `100%`,
                  display: 'flex',
                  flexRow: 'row',
                  justifyContent: 'center',
                }}
              >
                <Button
                  className={styles['card-meaning']}
                  onClick={e => {
                    showCardMeaning(e);
                  }}
                >
                  {isCardMeaningOn
                    ? t(`button.close-card-meaning`)
                    : t(`button.view-card-meaning`)}
                </Button>
              </p>
            )}
          </div>
          <div className={getStyleClass('btn-box', isBrowserJapanese)}>
            <Button
              className={getStyleClass('scale-btn', isBrowserJapanese)}
              onClick={() => setHeightUp(prev => !prev)}
            >
              □
            </Button>
            <Button
              className={getStyleClass('scale-btn', isBrowserJapanese)}
              onClick={() => setFontSize(prev => prev * 1.1)}
            >
              +
            </Button>
            <Button
              className={getStyleClass('scale-btn', isBrowserJapanese)}
              onClick={() => setFontSize(prev => prev / 1.1)}
            >
              -
            </Button>
            <Button
              className={getStyleClass('text-save-btn', isBrowserJapanese)}
              onClick={() => {
                copyText([
                  ...JSXTagArr,
                  isCardMeaningOn ? symbolMeaningLines : null,
                ]);
                if (detectComputer()) openBlinkModal('copy');
              }}
            >
              {t(`button.copy`)}
            </Button>
            {(detectComputer() || true) && (
              <Button
                className={getStyleClass('text-save-btn', isBrowserJapanese)}
                onClick={() => {
                  saveTextFile();
                  openBlinkModal('save');
                }}
              >
                {t(`button.text-save`)}
              </Button>
            )}
            <CancelButton
              className={getStyleClass('cancel-btn', isBrowserJapanese)}
              onClick={(e = null) => {
                handleCancel(e);
              }}
            >
              {t(`button.cancel`)}
            </CancelButton>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <a ref={downloadLinkRef} style={{ display: 'none' }}>
        Download
      </a>
      {renderContent()}
    </>
  );
};

export default AnswerDurumagiModal;

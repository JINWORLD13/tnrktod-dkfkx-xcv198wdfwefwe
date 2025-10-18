import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
  Plus,
  Minus,
  Copy,
  Download,
  Sparkles,
  Info,
} from 'lucide-react';
import styles from './AnswerModal.module.scss';
import CardDetailModal from './CardDetailModal';
import { useTranslation } from 'react-i18next';
import { tarotDeck } from '../../data/TarotCardDeck/TarotCardDeck';
import { localizeTimeZone } from '../../utils/format/localizeTimeZone';
import { getSpreadTitle } from '../../lib/tarot/spread/getSpreadTitle';
import { formattingDate } from '../../utils/format/formatDate';
import { useSelectedCardsMeaningInAnswerDurumagiModal } from '@/hooks';
import { translateTarotCardName } from '../../lib/tarot/card/cardNameTranslator';
import { useLanguageChange } from '@/hooks';
import { useSelectedTarotCards } from '@/hooks';
import { useRenderQuestionAsLines } from '../../lib/tarot/answer/useRenderQuestionAsLines';
import { detectComputer } from '../../utils/device/detectComputer';

const AnswerModal = ({ answerForm = {}, whichTarot = 3, ...props }) => {
  let {
    questionInfo,
    spreadInfo,
    answer,
    language,
    timeOfCounselling,
    firstOption,
    secondOption,
    thirdOption,
    ...rest
  } = answerForm;
  questionInfo = questionInfo || {
    question_topic: 'Love & Relationships',
    subject: 'Current relationship',
    object: 'Current relationship',
    relationship_subject: "Understanding my partner's feelings",
    relationship_object: "Understanding my partner's feelings",
    theme: "Understanding my partner's feelings",
    situation: "We've been having some communication issues lately",
    question: 'What do I need to know about my relationship right now?',
  };
  spreadInfo = spreadInfo || {
    spreadTitle: 'Problem solving',
    cardCount: 3,
    spreadListNumber: 302,
    selectedTarotCardsArr: [
      'Knight of Wands (normal_direction)',
      'The Lovers (reversed)',
      'Two of Cups (normal_direction)',
      'Two of Cups (normal_direction)',
      'Two of Cups (normal_direction)',
      'Two of Cups (normal_direction)',
      'Two of Cups (normal_direction)',
      'Two of Cups (normal_direction)',
      'Two of Cups (normal_direction)',
      'Two of Cups (normal_direction)',
    ],
  };
  answer =
    answer ||
    `{
  "comprehensive": "진성은 당신에게 복잡하고 모순된 감정을 품고 있어요. 겉으로는 이성적이고 분석적인 태도를 보이지만, 내면에는 혼란과 불확실성이 있어요. 진성은 당신에게 감정을 표현하는 데 어려움을 겪고 있으며, 자신의 진짜 마음을 드러내지 못하고 있어요. 과거의 다양한 감정적 경험들이 현재 진성의 마음에 영향을 미치고 있고, 당신과의 관계에서 방어적인 태도를 취하고 있어요. 진성은 당신에게 희망을 품고 있지만 기대치가 충족되지 않을까 두려워하는 모습이 보여요. 주변 환경이나 다른 사람들의 영향으로 변화를 받아들이기 어려워하고 있어요. 진성이 당신에게 마음을 열기 위해서는 시간과 인내가 필요해요. 대화를 통해 서로의 기대와 두려움에 대해 솔직하게 이야기해보거나, 부담 없는 활동을 함께하며 자연스럽게 관계를 발전시켜 보세요.\\n\\n진성의 속마음: \\"사실 나는 당신에게 끌리는 마음이 있어요. 하지만 이 감정을 어떻게 다뤄야 할지 혼란스러워요. 내가 마음을 열면 상처받을까 두려워요. 내 감정을 확실히 정리하고 싶은데, 그러기 위한 시간이 필요해요. 당신이 기다려줄 수 있을지 모르겠어요.\\"",
  "individual": {
    "symbolicKeywordArray": [
      "이성적 판단, 명확함, 객관성",
      "잠재력 미발휘, 혼란, 자신감 부족",
      "우유부단함, 선택의 어려움, 망설임",
      "환상, 다양한 선택지, 감정적 혼란",
      "방어, 도전, 자기주장",
      "희망 상실, 낙담, 기대 불충족",
      "실용성, 안정, 보살핌",
      "변화 거부, 정체, 미루기",
      "부담, 책임, 과도한 짐",
      "내적 불안, 자신감 부족, 의지 약화"
    ],
    "interpretationArray": [
      "당신을 이성적으로 판단하며 감정을 드러내지 않아요",
      "진정한 감정을 표현하는 데 어려움을 겪고 있어요",
      "당신과의 관계에 대해 결정을 내리지 못하고 있어요",
      "당신에 대한 다양한 감정과 가능성을 탐색 중이에요",
      "자신의 입장을 지키려 하며 방어적인 태도를 보여요",
      "당신과의 관계에 대한 희망이 흔들리고 있어요",
      "안정적이고 실용적인 관계를 원하고 있어요",
      "감정적 변화를 받아들이기 어려워하고 있어요",
      "당신에 대한 감정이 부담으로 느껴지기도 해요",
      "감정을 다루는 내적 힘이 부족해 망설이고 있어요"
    ],
    "arrOfPositionMeaningInSpread": [
      "현재 상황, 주요 이슈",
      "도전 또는 장애물",
      "기초 또는 근거",
      "과거로부터의 영향",
      "현재 상황에 영향을 미치는 외부 요인",
      "현재 상황에서 발생하는 미래의 가능성",
      "현재 상황에 대한 태도",
      "주변 환경, 다른 사람들의 태도나 영향",
      "희망, 두려움, 기대",
      "전반적인 결과, 미래에 대한 종합적인 전망"
    ],
    "englishTarotCardNameArray": [
      "King of Swords",
      "The Magician",
      "Two of Wands",
      "Seven of Cups",
      "Seven of Wands",
      "The Star",
      "Queen of Pentacles",
      "Death",
      "Ten of Wands",
      "Strength"
    ],
    "translateTarotCardNameArray": [
      "킹 오브 소드",
      "마법사",
      "투 오브 완즈",
      "세븐 오브 컵",
      "세븐 오브 완즈",
      "별",
      "퀸 오브 펜타클",
      "죽음",
      "텐 오브 완즈",
      "힘"
    ],
    "directionsArray": [
      "정방향",
      "역방향",
      "역방향",
      "정방향",
      "정방향",
      "역방향",
      "정방향",
      "역방향",
      "정방향",
      "역방향"
    ]
  }
}`;
  language = language || 'en';

  const [showCards, setShowCards] = useState(true);
  const [showCardMeanings, setShowCardMeanings] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fontSize, setFontSize] = useState(language === 'ja' ? 0.85 : 1.2);
  const [selectedCard, setSelectedCard] = useState(null);
  const [cardSize, setCardSize] = useState('medium');
  const [isMethodOpen, setIsMethodOpen] = useState(false);
  const scrollContainerRef = useRef(null);

  const [isTall, setIsTall] = useState(() => {
    // 초기값을 함수로 설정하여 지연 초기화
    if (typeof window !== 'undefined') {
      return (
        window.innerHeight >= 670 ||
        (!detectComputer() && window.screen.height >= 670)
      );
    }
    return false;
  });

  useEffect(() => {
    // 핸들러를 useCallback으로 최적화
    const handleResize = () => {
      const newIsTall =
        window.innerHeight >= 670 ||
        (!detectComputer() && window.screen.height >= 670);
      setIsTall(prev => {
        // 이전 값과 비교하여 불필요한 상태 업데이트 방지
        if (prev !== newIsTall) {
          return newIsTall;
        }
        return prev;
      });
    };

    // 초기 실행 (페이지 로드 시점의 크기 확인)
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { t } = useTranslation();

  // answer 파싱
  let parsedAnswer = null;
  let formattedAnswer = '';
  try {
    if (typeof answer === 'string') {
      const trimmed = answer.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        parsedAnswer = JSON.parse(trimmed);
        formattedAnswer = formatTarotInterpretation(
          parsedAnswer,
          whichTarot,
          language,
          t
        );
      } else {
        formattedAnswer = trimmed;
      }
    } else if (typeof answer === 'object') {
      parsedAnswer = answer;
      formattedAnswer = formatTarotInterpretation(
        parsedAnswer,
        whichTarot,
        language,
        t
      );
    }
  } catch (e) {
    formattedAnswer = typeof answer === 'string' ? answer : '';
  }

  // 카드 이미지 생성 (spreadInfo.selectedTarotCardsArr에서 추출, 이미지 플레이스홀더 사용)
  const cardImages = spreadInfo.selectedTarotCardsArr.map(originalCardName => {
    const match = originalCardName.match(/(.+) \((.+)\)/);
    const name = match ? match[1] : originalCardName;
    const direction = match ? match[2] : 'normal_direction';
    const tarotCardInfo = tarotDeck?.find((tarot, index) => {
      return tarot.name === name;
    });
    const fileName = tarotCardInfo?.file_name + '.jpg';
    return {
      name,
      image: './assets/images/deck/' + `${fileName}`,
      reversed: direction === 'reversed',
    };
  });
  const browserLanguage = useLanguageChange();
  const 마이페이지를_위한_카드_배열 = spreadInfo?.selectedTarotCardsArr?.map(
    (elem, i) => {
      const result = tarotDeck
        .map((cardInfo, i) => {
          if (cardInfo?.name === elem.split('(')[0].trim()) return cardInfo;
          return null;
        })
        ?.filter(elem => elem !== null);
      // console.log(result[0]);
      return result[0];
    }
  );
  const selectedTarotCardsFromHook = useSelectedTarotCards();
  const selectedTarotCards =
    selectedTarotCardsFromHook && selectedTarotCardsFromHook?.length > 0
      ? selectedTarotCardsFromHook
      : 마이페이지를_위한_카드_배열;

  // 카드 의미 (individual 포맷팅)
  const 카드_방향_배열 = spreadInfo?.selectedTarotCardsArr?.map((elem, i) => {
    // normal_direction
    // reversed
    return elem
      ?.split('(')[1]
      ?.trim()
      ?.slice(0, elem?.split('(')[1]?.trim()?.length - 1)
      ?.trim();
  });
  const translatedCardsNameArr = translateTarotCardName(
    spreadInfo?.selectedTarotCardsArr,
    browserLanguage
  );
  let fromAnswerModal = true; //! 카드 기초적인 의미시 첫 단락용
  const cardMeanings = useSelectedCardsMeaningInAnswerDurumagiModal(
    whichTarot,
    props?.isVoucherModeOn,
    answer,
    selectedTarotCards,
    translatedCardsNameArr,
    카드_방향_배열,
    fromAnswerModal
  );

  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') {
        if (selectedCard) {
          setSelectedCard(null);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [selectedCard]);

  const handleScroll = event => {
    event.preventDefault();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += event.deltaY > 0 ? 30 : -30;
    }
  };

  const handleCopy = () => {
    const content = generateTextContent(
      questionInfo,
      spreadInfo,
      language,
      timeOfCounselling,
      formattedAnswer,
      cardMeanings,
      showCardMeanings
    );
    navigator.clipboard.writeText(content);
  };

  const handleDownload = () => {
    const content = generateTextContent(
      questionInfo,
      spreadInfo,
      language,
      timeOfCounselling,
      formattedAnswer,
      cardMeanings,
      showCardMeanings
    );
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `\ntarot-reading-${
      new Date().toISOString().split('T')[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCardClick = (card, index) => {
    setSelectedCard({ ...card, index });
  };

  const getCardLayoutClass = (cardCount, flagForCelticCross = 0) => {
    const spreadTitle = spreadInfo?.spreadTitle || '';
    switch (cardCount) {
      case 1:
        return 'layout-1';
      case 2:
        return 'layout-2';
      case 3:
        return 'layout-3';
      case 4:
        return 'layout-4-Row';
      case 5:
        return spreadTitle.includes('v') ? 'layout-5-V' : 'layout-5-3-2';
      case 6:
        return 'layout-6-3-3';
      case 10:
        return !spreadTitle.toLowerCase().includes('celtic')
          ? flagForCelticCross === 0
            ? 'celtic-cross'
            : 'celtic-cross-straight'
          : 'layout-10-5-5';
      default:
        return 'auto-grid';
    }
  };

  // 카드 개수에 따른 클래스명을 반환하는 함수
  const getCardCountAndSizeClass = (cardCount, cardSize) => {
    const spreadTitle = spreadInfo?.spreadTitle || '';
    let countGroup;
    if (cardCount <= 3) countGroup = 'count1-3';
    else if (cardCount <= 5) {
      if (!spreadTitle.includes('v')) countGroup = 'count4-5';
      if (spreadTitle.includes('v')) countGroup = 'count5-V';
    } else if (cardCount <= 7) countGroup = 'count6-7';
    else if (cardCount <= 10) countGroup = 'count8-10';
    else countGroup = 'count11Plus';

    return `${countGroup}-${cardSize}`; // 예: count1-3-medium
  };

  return (
    <div className={styles.answerModalOverlay}>
      <div
        className={`${styles.answerModal} ${
          isFullscreen ? styles.fullscreen : ''
        }`}
      >
        {/* Cosmic Background */}
        <div className={styles.cosmicBackground}>
          <div className={styles.stars}></div>
          <div className={styles.stars2}></div>
          <div className={styles.nebula}></div>
          <div className={styles.milkyWay}></div>
          <div className={styles.extraStars}></div>
        </div>

        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <Sparkles className={styles.titleIcon} />
            타로 결과
          </h2>
          <div className={styles.headerControls}>
            <button
              className={`${styles.controlBtn} ${styles.methodBtn}`}
              onClick={() => setIsMethodOpen(true)}
              title="해석 과정"
            >
              <Info />
            </button>
            <button
              className={styles.controlBtn}
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? '전체화면 종료' : '전체화면'}
            >
              {isFullscreen ? <Minimize2 /> : <Maximize2 />}
            </button>
            <button
              className={`${styles.controlBtn} ${styles.closeBtn}`}
              onClick={() => {}}
              title="닫기"
            >
              <X />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`${styles.modalContent} ${
            ['large', 'extra-large'].includes(cardSize) ? styles.fluidLeft : ''
          }`}
        >
          {/* Cards Section */}
          {showCards && cardImages && cardImages.length > 0 && (
            <div
              className={`${styles.cardsSection} ${styles[`size-${cardSize}`]}`}
            >
              <div className={styles.cardsCenter}>
                <div className={styles.innerWrapper}>
                  {!spreadInfo?.spreadTitle.toLowerCase().includes('celtic') ? (
                    <div className={styles.cardsContainerWrapper}>
                      <div
                        className={`${styles.cardsContainer} 
                              ${styles[getCardLayoutClass(cardImages.length)]} 
                              ${
                                styles[
                                  getCardCountAndSizeClass(
                                    cardImages.length,
                                    cardSize
                                  )
                                ]
                              } // 이렇게 수정
                              ${
                                cardSize === 'extra-large' ? styles.xlGrid : ''
                              } 
                              ${
                                getCardLayoutClass(cardImages.length) ===
                                'auto-grid'
                                  ? styles.autoGrid
                                  : ''
                              }`}
                      >
                        {cardImages.slice(0, 6).map((card, index) => (
                          <div
                            key={index}
                            className={`${styles.tarotCard} ${
                              styles[`card-${cardSize}`]
                            }`}
                            onClick={() => handleCardClick(card, index)}
                            style={{ '--index': index }}
                          >
                            <div
                              className={`${styles.cardInner} ${styles.cardFrame}`}
                            >
                              <div className={styles.artwork}>
                                <img
                                  src={card.image}
                                  alt={`${card.name}${
                                    card.reversed ? ' (뒤집힌)' : ''
                                  } 타로 카드`}
                                  className={`${styles.cardImage} ${
                                    card.reversed ? styles.reversed : ''
                                  }`}
                                />
                              </div>
                              <div className={styles.cardOverlay}>
                                <span className={styles.cardName}>
                                  {card.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div
                        className={`${styles.cardsContainer} 
                              ${
                                styles[getCardLayoutClass(cardImages.length, 1)]
                              } 
                              ${
                                styles[
                                  getCardCountAndSizeClass(
                                    cardImages.length,
                                    cardSize
                                  )
                                ]
                              } // 이렇게 수정
                              ${
                                cardSize === 'extra-large' ? styles.xlGrid : ''
                              } 
                              ${
                                getCardLayoutClass(cardImages.length) ===
                                'auto-grid'
                                  ? styles.autoGrid
                                  : ''
                              }`}
                      >
                        {cardImages.slice(6, 10).map((card, index) => (
                          <div
                            key={index}
                            className={`${styles.tarotCard} ${
                              styles[`card-${cardSize}`]
                            }`}
                            onClick={() => handleCardClick(card, index)}
                            style={{ '--index': index }}
                          >
                            <div
                              className={`${styles.cardInner} ${styles.cardFrame}`}
                            >
                              <div className={styles.artwork}>
                                <img
                                  src={card.image}
                                  alt={`${card.name}${
                                    card.reversed ? ' (뒤집힌)' : ''
                                  } 타로 카드`}
                                  className={`${styles.cardImage} ${
                                    card.reversed ? styles.reversed : ''
                                  }`}
                                />
                              </div>
                              <div className={styles.cardOverlay}>
                                <span className={styles.cardName}>
                                  {card.name}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`${styles.cardsContainer} 
                              ${styles[getCardLayoutClass(cardImages.length)]} 
                              ${
                                styles[
                                  getCardCountAndSizeClass(
                                    cardImages.length,
                                    cardSize
                                  )
                                ]
                              } // 이렇게 수정
                              ${
                                cardSize === 'extra-large' ? styles.xlGrid : ''
                              } 
                              ${
                                getCardLayoutClass(cardImages.length) ===
                                'auto-grid'
                                  ? styles.autoGrid
                                  : ''
                              }`}
                    >
                      {cardImages.map((card, index) => (
                        <div
                          key={index}
                          className={`${styles.tarotCard} ${
                            styles[`card-${cardSize}`]
                          }`}
                          onClick={() => handleCardClick(card, index)}
                          style={{ '--index': index }}
                        >
                          <div
                            className={`${styles.cardInner} ${styles.cardFrame}`}
                          >
                            <div className={styles.artwork}>
                              <img
                                src={card.image}
                                alt={`${card.name}${
                                  card.reversed ? ' (뒤집힌)' : ''
                                } 타로 카드`}
                                className={`${styles.cardImage} ${
                                  card.reversed ? styles.reversed : ''
                                }`}
                              />
                            </div>
                            <div className={styles.cardOverlay}>
                              <span className={styles.cardName}>
                                {card.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.cardsHeader}>
                <button
                  className={styles.toggleCardsBtn}
                  onClick={() => setShowCards(false)}
                >
                  <EyeOff /> <span>카드 이미지 숨기기</span>
                </button>
              </div>
            </div>
          )}

          {!showCards && cardImages && cardImages.length > 0 && (
            <button
              className={styles.showCardsBtn}
              onClick={() => setShowCards(true)}
            >
              <Eye /> <span>카드 이미지 보기</span>
            </button>
          )}

          {/* Answer Section */}
          <div className={styles.answerSection}>
            <div
              className={`${styles.answerContent} ${styles.readingText}`}
              ref={scrollContainerRef}
              onWheel={handleScroll}
              style={{
                fontSize: `${fontSize}rem`,
                ...(language === 'ja'
                  ? { fontFamily: "'Noto Sans JP', sans-serif" }
                  : {}),
              }}
            >
              {/* Question Info */}
              {questionInfo && (
                <div className={styles.questionInfo}>
                  <h3>질문 내용</h3>
                  <>
                    {useRenderQuestionAsLines(
                      questionInfo,
                      spreadInfo,
                      language,
                      timeOfCounselling
                    )}
                  </>
                </div>
              )}

              {/* Answer */}
              {formattedAnswer && (
                <div className={styles.answerText}>
                  <h3 className={styles.goldShimmer}>해석 결과</h3>
                  <div className={styles.answerParagraphs}>
                    {formattedAnswer
                      .split('\n')
                      .map(
                        (paragraph, index) =>
                          paragraph.trim() && <p key={index}>{paragraph}</p>
                      )}
                  </div>
                </div>
              )}

              {/* Card Meanings */}
              {showCardMeanings && cardMeanings && (
                <div className={styles.cardMeanings}>
                  <h3>카드의 기초적인 의미</h3>
                  <div style={{ whiteSpace: 'pre-line' }}>{cardMeanings}</div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div
              className={`${styles.answerControls} ${styles.controlsScrollable}`}
            >
              <div className={styles.leftControls}>
                <button
                  className={styles.controlBtn}
                  onClick={() => setFontSize(prev => Math.min(prev * 1.1, 3))}
                  title="글씨 크기 증가"
                >
                  <Plus />
                </button>
                <button
                  className={styles.controlBtn}
                  onClick={() => setFontSize(prev => Math.max(prev / 1.1, 0.8))}
                  title="글씨 크기 감소"
                >
                  <Minus />
                </button>
                <button
                  className={styles.controlBtn}
                  onClick={() => setShowCardMeanings(!showCardMeanings)}
                  title={
                    showCardMeanings ? '카드 의미 숨기기' : '카드 의미 보기'
                  }
                >
                  {showCardMeanings ? <EyeOff /> : <Eye />}
                  <span>{showCardMeanings ? '숨기기' : '보기'}</span>
                </button>

                {/* Card Size Control */}
                {cardImages && cardImages.length > 0 && (
                  <div className={styles.cardSizeControls}>
                    <label htmlFor="cardSize">카드 크기:</label>
                    <select
                      id="cardSize"
                      value={cardSize}
                      onChange={e => setCardSize(e.target.value)}
                    >
                      {isTall && <option value="small">작게</option>}
                      <option value="medium">보통</option>
                      {!(!isTall && spreadInfo?.spreadTitle.includes('v')) && (
                        <option value="large">크게</option>
                      )}
                      {/* <option value="extra-large">매우 크게</option> */}
                    </select>
                  </div>
                )}
              </div>

              <div className={styles.rightControls}>
                <button
                  className={`${styles.controlBtn} ${styles.copyBtn}`}
                  onClick={handleCopy}
                  title="클립보드에 복사"
                >
                  <Copy /> <span>복사</span>
                </button>
                <button
                  className={`${styles.controlBtn} ${styles.downloadBtn}`}
                  onClick={handleDownload}
                  title="텍스트로 다운로드"
                >
                  <Download /> <span>저장</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Method Panel */}
        {isMethodOpen && (
          <div
            className={`${styles.methodPanel} ${
              isMethodOpen ? styles.open : ''
            }`}
          >
            <div className={styles.methodHeader}>
              <h3>해석 과정</h3>
              <button
                className={`${styles.controlBtn} ${styles.closeBtn}`}
                onClick={() => setIsMethodOpen(false)}
                title="닫기"
              >
                <X />
              </button>
            </div>
            <div className={styles.methodContent}>
              <p>이 해석은 다음 과정을 거쳐 생성되었습니다:</p>
              <ul>
                <li>스프레드: {spreadInfo?.spreadTitle || '기본 스프레드'}</li>
                <li>
                  카드: {spreadInfo.selectedTarotCardsArr?.join(', ') || '없음'}
                </li>
                <li>질문 맥락: {questionInfo?.question || '없음'}</li>
              </ul>
              {cardMeanings && (
                <>
                  <h4>카드 키워드</h4>
                  <div className={styles.methodMeanings}>
                    {extractAllText(cardMeanings)
                      .split('\n')
                      .map(
                        (line, idx) => line.trim() && <p key={idx}>{line}</p>
                      )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Card Detail Modal */}
        {selectedCard && (
          <CardDetailModal
            card={selectedCard}
            onClose={() => setSelectedCard(null)}
            language={language}
          />
        )}
      </div>
    </div>
  );
};

const prefixesForComprehensive = {
  en: '🔮 Comprehensive Interpretation',
  ko: '🔮 종합해석',
  ja: '🔮 総合解釈',
};

const prefixesForIndividual = {
  en: '🔮 Individual Card Interpretation',
  ko: '🔮 개별카드해석',
  ja: '🔮 個別カード解釈',
};

// 개별 카드 포맷팅 함수
const formatIndividualCard = (index, cardData, t) => {
  const {
    englishTarotCardNameArray = [],
    translateTarotCardNameArray = [],
    directionsArray = [],
    symbolicKeywordArray = [],
    interpretationArray = [],
  } = cardData.individual || {};
  const positionMeanings =
    cardData.individual.arrOfPositionMeaningInSpread || [];

  return (
    `${index + 1}) ${
      englishTarotCardNameArray?.[index] || t('interpretation.unknown_card')
    } ` +
    `(${
      translateTarotCardNameArray?.length > 0
        ? translateTarotCardNameArray?.[index] + ', ' ||
          t('interpretation.unknown_card') + ', '
        : ''
    }` +
    `${directionsArray[index] || t('interpretation.unknown_direction')}, ` +
    `${positionMeanings[index] || t('interpretation.unknown_position')}, ` +
    `${
      symbolicKeywordArray[index] || t('interpretation.unknown_keyword')
    }): \n` +
    `${
      (interpretationArray[index][interpretationArray[index].length - 1] === '.'
        ? interpretationArray[index]
        : interpretationArray[index] + '.') ||
      t('interpretation.no_interpretation')
    }\n`
  );
};

// 타로 데이터 포맷팅 함수(결과는 문자열)
const formatTarotInterpretation = (answer, whichTarot, language, t) => {
  let parsedAnswer = answer;
  if (typeof parsedAnswer === 'string') parsedAnswer = JSON.parse(answer);
  // 지원되지 않는 언어는 'en'으로 fallback
  const lang = prefixesForComprehensive?.[language] ? language : 'en';

  // 결과 문자열을 모을 배열
  const lines = [];

  // 종합 해석 추가
  lines.push(
    `${prefixesForComprehensive[lang]} :\n ${
      parsedAnswer?.comprehensive || t('interpretation.no_interpretation')
    }`
  );

  // 개별 카드 해석
  if (
    (whichTarot === 3 || whichTarot === 4) &&
    parsedAnswer?.individual?.interpretationArray?.length > 1
  ) {
    lines?.push(`\n${prefixesForIndividual[lang]} :`);
    parsedAnswer?.individual?.interpretationArray?.forEach((_, index) => {
      lines?.push(formatIndividualCard(index, parsedAnswer, t));
    });
  }

  // 배열을 줄바꿈으로 합쳐서 반환
  return lines.join('\n');
};
function extractAllText(reactNode) {
  if (!reactNode) return '';

  if (typeof reactNode === 'string' || typeof reactNode === 'number') {
    return String(reactNode);
  }

  if (Array.isArray(reactNode)) {
    return reactNode
      .map((child, index) => extractAllText(child))
      ?.filter(text => text.trim())
      ?.join('')
      ?.split('.-')
      ?.join('.\n-')
      ?.replace(/\n{2,}/g, '\n')
      ?.replace(/([A-Z]\. )/g, '\n$1') // 알파벳대문자. 패턴 앞에 \n 추가
      ?.split(')-')
      ?.join(')\n-')
      ?.replace(/^\nA\. /, 'A. '); // 이 줄만 추가
  }

  if (reactNode.props && reactNode.props.children) {
    return extractAllText(reactNode.props.children);
  }

  return '';
}
const generateTextContent = (
  questionInfo,
  spreadInfo,
  language,
  timeOfCounselling,
  formattedAnswer,
  cardMeanings,
  showCardMeanings
) => {
  const userTimeZone = localizeTimeZone(language);
  const spreadTitle = getSpreadTitle(spreadInfo, language);
  let content = '';

  // Spread Type
  if (language === 'en') {
    content += `Spread Type: \n${
      spreadInfo?.spreadTitle === undefined ||
      spreadInfo?.spreadTitle === null ||
      spreadInfo?.spreadTitle === ''
        ? 'Omitted'
        : spreadTitle
    }\n`;
  } else if (language === 'ko') {
    content += `스프레드 종류: \n${
      spreadInfo?.spreadTitle === undefined ||
      spreadInfo?.spreadTitle === null ||
      spreadInfo?.spreadTitle === ''
        ? '생략'
        : spreadTitle
    }\n`;
  } else if (language === 'ja') {
    content += `スプレッドの種類: \n${
      spreadInfo?.spreadTitle === undefined ||
      spreadInfo?.spreadTitle === null ||
      spreadInfo?.spreadTitle === ''
        ? '省略'
        : spreadTitle
    }\n`;
  }

  // Counselling Time
  if (timeOfCounselling) {
    if (language === 'en') {
      content += `\nCounselling time: \n${formattingDate(
        timeOfCounselling,
        language
      )}(${userTimeZone})\n`;
    } else if (language === 'ko') {
      content += `\n상담 일시: \n${formattingDate(
        timeOfCounselling,
        language
      )}(${userTimeZone})\n`;
    } else if (language === 'ja') {
      content += `\n相談日時: \n${formattingDate(
        timeOfCounselling,
        language
      )}(${userTimeZone})\n`;
    }
  }

  // Topic
  if (language === 'en') {
    content += `\nTopic(optional): \n${
      questionInfo?.question_topic === undefined ||
      questionInfo?.question_topic === null ||
      questionInfo?.question_topic === ''
        ? 'Omitted'
        : questionInfo?.question_topic
    }\n`;
  } else if (language === 'ko') {
    content += `\n질문 주제(생략 가능): \n${
      questionInfo?.question_topic === undefined ||
      questionInfo?.question_topic === null ||
      questionInfo?.question_topic === ''
        ? '생략'
        : questionInfo?.question_topic
    }\n`;
  } else if (language === 'ja') {
    content += `\n質問のテーマ(省略可): \n${
      questionInfo?.question_topic === undefined ||
      questionInfo?.question_topic === null ||
      questionInfo?.question_topic === ''
        ? '省略'
        : questionInfo?.question_topic
    }\n`;
  }

  // Target of Question
  if (language === 'en') {
    content += `\nTarget of Question(optional): \n${
      questionInfo?.subject === undefined ||
      questionInfo?.subject === null ||
      questionInfo?.subject === ''
        ? 'Omitted'
        : questionInfo?.subject
    }\n`;
  } else if (language === 'ko') {
    content += `\n질문의 대상(생략 가능): \n${
      questionInfo?.subject === undefined ||
      questionInfo?.subject === null ||
      questionInfo?.subject === ''
        ? '생략'
        : questionInfo?.subject
    }\n`;
  } else if (language === 'ja') {
    content += `\n質問の対象(省略可): \n${
      questionInfo?.subject === undefined ||
      questionInfo?.subject === null ||
      questionInfo?.subject === ''
        ? '省略'
        : questionInfo?.subject
    }\n`;
  }

  // Related one to the target
  if (language === 'en') {
    content += `\nRelated one to the target(optional): \n${
      questionInfo?.object === undefined ||
      questionInfo?.object === null ||
      questionInfo?.object === ''
        ? 'Omitted'
        : questionInfo?.object
    }\n`;
  } else if (language === 'ko') {
    content += `\n대상의 상대(생략 가능): \n${
      questionInfo?.object === undefined ||
      questionInfo?.object === null ||
      questionInfo?.object === ''
        ? '생략'
        : questionInfo?.object
    }\n`;
  } else if (language === 'ja') {
    content += `\n対象の相手(省略可): \n${
      questionInfo?.object === undefined ||
      questionInfo?.object === null ||
      questionInfo?.object === ''
        ? '省略'
        : questionInfo?.object
    }\n`;
  }

  // Relationship
  if (language === 'en') {
    content += `\nRelationship(optional)`;
    content += `\nTarget: ${questionInfo?.relationship_subject || 'Omitted'}`;
    content += `\nObject(Related one): ${
      questionInfo?.relationship_object || 'Omitted'
    }\n`;
  } else if (language === 'ko') {
    content += `\n관계(생략 가능)`;
    content += `\n질문의 대상: ${questionInfo?.relationship_subject || '생략'}`;
    content += `\n대상의 상대: ${
      questionInfo?.relationship_object || '생략'
    }\n`;
  } else if (language === 'ja') {
    content += `\n関係(省略可)`;
    content += `\n質問の対象: ${questionInfo?.relationship_subject || '省略'}`;
    content += `\n対象の相手: ${questionInfo?.relationship_object || '省略'}\n`;
  }

  // Statement about the Situation (exclude for spread 201 and 304)
  if (
    spreadInfo?.spreadListNumber !== 201 &&
    spreadInfo?.spreadListNumber !== 304
  ) {
    if (language === 'en') {
      content += `\nStatement about the Situation(optional): \n${
        questionInfo?.situation === undefined ||
        questionInfo?.situation === null ||
        questionInfo?.situation === ''
          ? 'Omitted'
          : questionInfo?.situation
      }\n`;
    } else if (language === 'ko') {
      content += `\n질문 내용의 배경(생략 가능): \n${
        questionInfo?.situation === undefined ||
        questionInfo?.situation === null ||
        questionInfo?.situation === ''
          ? '생략'
          : questionInfo?.situation
      }\n`;
    } else if (language === 'ja') {
      content += `\n質問内容の背景(省略可): \n${
        questionInfo?.situation === undefined ||
        questionInfo?.situation === null ||
        questionInfo?.situation === ''
          ? '省略'
          : questionInfo?.situation
      }\n`;
    }
  }

  // Options for spread 201 (2 options)
  if (spreadInfo?.spreadListNumber === 201) {
    if (language === 'en') {
      content += `\nOption 1: \n${questionInfo?.firstOption || 'Omitted'}\n`;
      content += `\nOption 2: \n${questionInfo?.secondOption || 'Omitted'}\n`;
    } else if (language === 'ko') {
      content += `\n선택지1: \n${questionInfo?.firstOption || '생략'}\n`;
      content += `\n선택지2: \n${questionInfo?.secondOption || '생략'}\n`;
    } else if (language === 'ja') {
      content += `\n選択肢1: \n${questionInfo?.firstOption || '省略'}\n`;
      content += `\n選択肢2: \n${questionInfo?.secondOption || '省略'}\n`;
    }
  }

  // Options for spread 304 (3 options)
  if (spreadInfo?.spreadListNumber === 304) {
    if (language === 'en') {
      content += `\nOption 1: \n${questionInfo?.firstOption || 'Omitted'}\n`;
      content += `\nOption 2: \n${questionInfo?.secondOption || 'Omitted'}\n`;
      content += `\nOption 3: \n${questionInfo?.thirdOption || 'Omitted'}\n`;
    } else if (language === 'ko') {
      content += `\n선택지1: \n${questionInfo?.firstOption || '생략'}\n`;
      content += `\n선택지2: \n${questionInfo?.secondOption || '생략'}\n`;
      content += `\n선택지3: \n${questionInfo?.thirdOption || '생략'}\n`;
    } else if (language === 'ja') {
      content += `\n選択肢1: \n${questionInfo?.firstOption || '省略'}\n`;
      content += `\n選択肢2: \n${questionInfo?.secondOption || '省략'}\n`;
      content += `\n選択肢3: \n${questionInfo?.thirdOption || '省략'}\n`;
    }
  }

  // Question
  if (language === 'en') {
    content += `\nQuestion: \n${
      questionInfo?.question === undefined ||
      questionInfo?.question === null ||
      questionInfo?.question === ''
        ? 'Omitted'
        : questionInfo?.question
    }\n\n`;
  } else if (language === 'ko') {
    content += `\n질문: \n${
      questionInfo?.question === undefined ||
      questionInfo?.question === null ||
      questionInfo?.question === ''
        ? '생략'
        : questionInfo?.question
    }\n\n`;
  } else if (language === 'ja') {
    content += `\n質問: \n${
      questionInfo?.question === undefined ||
      questionInfo?.question === null ||
      questionInfo?.question === ''
        ? '省略'
        : questionInfo?.question
    }\n\n`;
  }

  // Result/Answer
  if (formattedAnswer) {
    if (language === 'en') {
      content += `\nResult:\n${formattedAnswer}\n`;
    } else if (language === 'ko') {
      content += `\n결과:\n${formattedAnswer}\n`;
    } else if (language === 'ja') {
      content += `\n結果:\n${formattedAnswer}\n`;
    }
  }

  // Card Meanings
  if (showCardMeanings && cardMeanings) {
    if (language === 'en') {
      content += `\nCard Meanings:\n${extractAllText(cardMeanings)}\n`;
    } else if (language === 'ko') {
      content += `\n카드 의미:\n${extractAllText(cardMeanings)}\n`;
    } else if (language === 'ja') {
      content += `\nカードの意味:\n${extractAllText(cardMeanings)}\n`;
    }
  }

  return content;
};
export default AnswerModal;

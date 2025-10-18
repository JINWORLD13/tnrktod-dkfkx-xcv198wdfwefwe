// const { anthropic, openai, grok } = require("./model/model-list");
// const { translateTarotCardName } = require("./lib/cardNameTranslator");
// const {
//   getSpreadDescriptions,
//   getSpreadDescriptionsList,
// } = require("./lib/getSpreadDescription");
// const { formatTarotCards } = require("./lib/formatTarotCards");
// const { getLanguageSettings } = require("./lib/getLanguageSetting");
// const { stripOuterBraces } = require("./lib/stripOuterBraces");
// const { validate } = require("./utils/validate");
// const { TAROT_CONFIG } = require("../config/tarotConfig");
// const { default: processMessage } = require("./utils/messageProcessor");
// const { processTarotResult } = require("./utils/processTarotResult");
// const { tryAnthropicFinalMsg } = require("./utils/messageProcessor");


// const tarotCardInterpreterWithAIAPI = async (inputData, whichTarot) => {
//   const isOwned = inputData?.isOwned;
//   const questionInfo = inputData?.questionInfo;
//   const spreadInfo = inputData?.spreadInfo;
//   const selectedTarotCardsArr = spreadInfo?.selectedTarotCardsArr;
//   const isVoucherMode = inputData?.isVoucherModeOn;

//   let {
//     formattedTimeOfCounselling,
//     language,
//     occupation,
//     careerPath,
//     decisionMaking,
//     assistant_id,
//   } = getLanguageSettings(inputData);

//   const cardsArr = translateTarotCardName(selectedTarotCardsArr, language);
//   let drawnCardsArr = formatTarotCards(
//     language,
//     spreadInfo,
//     selectedTarotCardsArr,
//     cardsArr
//   );
//   let drawnCards = drawnCardsArr?.join(", ");
//   const comments = getSpreadDescriptions(
//     inputData?.language,
//     drawnCardsArr,
//     questionInfo,
//     spreadInfo
//   );

//   let AnthropicModel, GrokModel, OpenAIModel;
//   const { Sun, Moon, Star, max_tokens } = TAROT_CONFIG[whichTarot];
//   AnthropicModel = Sun;
//   OpenAIModel = Moon;
//   GrokModel = Star;

//   // let max_tokens;
//   // if (whichTarot === 2) {
//   //   AnthropicModel = "claude-3-5-haiku-latest";
//   //   OpenAIModel = "gpt-4o-mini";
//   //   GrokModel = "grok-3";
//   //   max_tokens = 4096; // claude와 grok
//   // }
//   // if (whichTarot === 3) {
//   //   // AnthropicModel = "claude-3-5-sonnet-20241022";
//   //   AnthropicModel = "claude-sonnet-4-20250514";
//   //   OpenAIModel = "gpt-4o";
//   //   GrokModel = "grok-3";
//   //   max_tokens = 4096; // claude와 grok
//   // }
//   // if (whichTarot === 4) {
//   //   AnthropicModel = "claude-sonnet-4-20250514";
//   //   OpenAIModel = "gpt-4o";
//   //   GrokModel = "grok-3";
//   //   max_tokens = 8192; // claude와 grok
//   // }
//   const rateForConsoleLog = 1460;

//   const data = {
//     isOwned,
//     questionInfo,
//     spreadInfo,
//     selectedTarotCardsArr,
//     formattedTimeOfCounselling,
//     language,
//     occupation,
//     careerPath,
//     decisionMaking,
//     assistant_id,
//     cardsArr,
//     drawnCardsArr,
//     drawnCards,
//     comments,
//     AnthropicModel,
//     GrokModel,
//     OpenAIModel,
//     max_tokens,
//     whichTarot,
//     rateForConsoleLog,
//     anthropic,
//     openai,
//     grok,
//     isVoucherMode,
//   };

//   const finalMessage = await processMessage(data, whichTarot, isVoucherMode);

//   let result;

//   //! 검사기 넣기
//   const validation = validate(stripOuterBraces(finalMessage), data);

//   //! 비용상 한번만 하자.
//   if (!validation) {
//     const validatedFinalMessage = await tryAnthropicFinalMsg(
//       data,
//       finalMessage
//     );
//     const validation = validate(stripOuterBraces(validatedFinalMessage), data);
//     if (validation) result = stripOuterBraces(validatedFinalMessage);
//   }

//   //! 리액트 formatTarotInterpretation.jsx에서 따로 문자열변환시 종합해석/개별카드해석 문구 넣어주고 있음.
//   result = processTarotResult({
//     result,
//     finalMessage,
//     whichTarot,
//     spreadInfo,
//     language,
//     questionInfo,
//     selectedTarotCardsArr,
//   });

//   return result;
// };

// module.exports = tarotCardInterpreterWithAIAPI;

const { anthropic, openai, grok } = require("./model/model-list");
const { translateTarotCardName } = require("./lib/cardNameTranslator");
const {
  getSpreadDescriptions,
  getSpreadDescriptionsList,
} = require("./lib/getSpreadDescription");
const { formatTarotCards } = require("./lib/formatTarotCards");
const { getLanguageSettings } = require("./lib/getLanguageSetting");
const { stripOuterBraces } = require("./lib/stripOuterBraces");
const { validate } = require("./utils/validate");
const { TAROT_CONFIG } = require("../config/tarotConfig");
const { default: processMessage } = require("./utils/messageProcessor");
const { processTarotResult } = require("./utils/processTarotResult");
const { tryAnthropicFinalMsg } = require("./utils/messageProcessor");

const tarotCardInterpreterWithAIAPI = async (inputData, whichTarot) => {
  const isOwned = inputData?.isOwned;
  const questionInfo = inputData?.questionInfo;
  const spreadInfo = inputData?.spreadInfo;
  const selectedTarotCardsArr = spreadInfo?.selectedTarotCardsArr;
  const isVoucherMode = inputData?.isVoucherModeOn;

  let {
    formattedTimeOfCounselling,
    language,
    occupation,
    careerPath,
    decisionMaking,
    assistant_id,
  } = getLanguageSettings(inputData);

  const cardsArr = translateTarotCardName(selectedTarotCardsArr, language);
  let drawnCardsArr = formatTarotCards(
    language,
    spreadInfo,
    selectedTarotCardsArr,
    cardsArr
  );
  let drawnCards = drawnCardsArr?.join(", ");
  const comments = getSpreadDescriptions(
    inputData?.language,
    drawnCardsArr,
    questionInfo,
    spreadInfo
  );

  let AnthropicModel, GrokModel, OpenAIModel;
  const { Sun, Moon, Star, max_tokens } = TAROT_CONFIG[whichTarot];
  AnthropicModel = Sun;
  OpenAIModel = Moon;
  GrokModel = Star;

  const rateForConsoleLog = 1460;

  const data = {
    isOwned,
    questionInfo,
    spreadInfo,
    selectedTarotCardsArr,
    formattedTimeOfCounselling,
    language,
    occupation,
    careerPath,
    decisionMaking,
    assistant_id,
    cardsArr,
    drawnCardsArr,
    drawnCards,
    comments,
    AnthropicModel,
    GrokModel,
    OpenAIModel,
    max_tokens,
    whichTarot,
    rateForConsoleLog,
    anthropic,
    openai,
    grok,
    isVoucherMode,
  };

  try {
    const finalMessage = await processMessage(data, whichTarot, isVoucherMode);

    if (!finalMessage || finalMessage.trim() === '') {
      console.error("모든 AI API 실패, 기본 메시지 생성");
      return createEmergencyFallback(data);
    }

    let result;
    const cleanedMessage = stripOuterBraces(finalMessage, data);
    const validation = validate(cleanedMessage, data);

    if (!validation) {
      console.log("첫 번째 검증 실패, 재시도 중...");
      
      try {
        const validatedFinalMessage = await tryAnthropicFinalMsg(data, finalMessage);
        
        if (validatedFinalMessage) {
          const cleanedValidatedMessage = stripOuterBraces(validatedFinalMessage, data);
          const secondValidation = validate(cleanedValidatedMessage, data);
          
          if (secondValidation) {
            result = cleanedValidatedMessage;
            console.log("두 번째 검증 성공");
          } else {
            console.log("두 번째 검증도 실패, 안전한 기본값 사용");
            result = cleanedMessage;
          }
        } else {
          console.log("재시도 API 호출 실패, 원본 사용");
          result = cleanedMessage;
        }
      } catch (retryError) {
        console.error("재시도 중 오류:", retryError.message);
        result = cleanedMessage;
      }
    } else {
      result = cleanedMessage;
      console.log("첫 번째 검증 성공");
    }

    const finalResult = processTarotResult({
      result,
      finalMessage,
      whichTarot,
      spreadInfo,
      language,
      questionInfo,
      selectedTarotCardsArr,
    });

    return ensureFinalResultValid(finalResult, data);

  } catch (error) {
    console.error("tarotCardInterpreterWithAIAPI 전체 오류:", error);
    return createEmergencyFallback(data);
  }
};

const createEmergencyFallback = (data) => {
  const { language = "Korean language", spreadInfo, selectedTarotCardsArr } = data;
  const cardCount = Number(spreadInfo?.cardCount) || 1;
  
  const messages = {
    "Korean language": {
      comprehensive: "죄송합니다. 일시적인 오류로 타로 해석을 생성할 수 없습니다. 잠시 후 다시 시도해 주세요.",
      individual: "개별 카드 해석 준비중",
      position: "포지션 의미"
    },
    "English language": {
      comprehensive: "Sorry, unable to generate tarot interpretation due to temporary error. Please try again later.",
      individual: "Preparing individual card interpretation",
      position: "Position meaning"
    },
    "Japanese language": {
      comprehensive: "申し訳ございません。一時的なエラーによりタロット解釈を生成できません。しばらくしてから再度お試しください。",
      individual: "個別カード解釈準備中",
      position: "ポジション意味"
    }
  };
  
  const msg = messages[language] || messages["Korean language"];
  
  const result = {
    comprehensive: msg.comprehensive
  };
  
  if (cardCount > 1) {
    result.individual = {
      symbolicKeywordArray: new Array(cardCount).fill(msg.individual),
      interpretationArray: new Array(cardCount).fill(msg.individual),
      arrOfPositionMeaningInSpread: new Array(cardCount).fill(msg.position),
      englishTarotCardNameArray: selectedTarotCardsArr?.map(card => 
        card.replace(/\s*\(.*?\)/, "").trim()
      ) || new Array(cardCount).fill("Unknown Card")
    };
    
    if (language !== "English language") {
      result.individual.translateTarotCardNameArray = new Array(cardCount).fill(msg.individual);
      result.individual.directionsArray = new Array(cardCount).fill("");
    }
  }
  
  return JSON.stringify(result, null, 2);
};

const ensureFinalResultValid = (result, data) => {
  try {
    const parsed = JSON.parse(result);
    
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      console.error("최종 결과가 올바른 객체가 아님, 비상 대체 사용");
      return createEmergencyFallback(data);
    }
    
    if (!parsed.comprehensive) {
      console.error("comprehensive 필드 누락, 비상 대체 사용");
      return createEmergencyFallback(data);
    }
    
    return result;
    
  } catch (error) {
    console.error("최종 결과 검증 실패:", error.message);
    return createEmergencyFallback(data);
  }
};

module.exports = tarotCardInterpreterWithAIAPI;
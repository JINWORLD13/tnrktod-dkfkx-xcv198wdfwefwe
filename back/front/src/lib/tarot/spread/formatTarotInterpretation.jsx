import React from 'react';

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
    `${symbolicKeywordArray[index] || t('interpretation.unknown_keyword')}): ` +
    `${interpretationArray[index] || t('interpretation.no_interpretation')}`
  );
};

// 타로 데이터 포맷팅 함수(결과는 문자열)
// 🔮 종합해석 :\n
//     A explanation \n
// 🔮 개별카드해석 :\n
//     number) card's english name (card's name in the Korean language, card's direction, position's meaning, card's key word used in interpretation): A explanation
const formatTarotInterpretation = (answer, whichTarot, browserLanguage, t) => {
  let parsedAnswer = answer;
  if (typeof parsedAnswer !== 'object') parsedAnswer = JSON.parse(answer);
  // 지원되지 않는 언어는 'en'으로 fallback
  const lang = prefixesForComprehensive?.[browserLanguage]
    ? browserLanguage
    : 'en';

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
    lines?.push(`${prefixesForIndividual[lang]} :`);
    parsedAnswer?.individual?.interpretationArray?.forEach((_, index) => {
      lines?.push(formatIndividualCard(index, parsedAnswer, t));
    });
  }

  // 배열을 줄바꿈으로 합쳐서 반환
  return lines.join('\n');
};

export default formatTarotInterpretation;

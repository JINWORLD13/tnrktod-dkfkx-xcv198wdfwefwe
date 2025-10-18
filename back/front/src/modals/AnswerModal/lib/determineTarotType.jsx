export function determineTarotType(answerForm, whichTarot = null) {
  // 마이페이지일 경우
  if (!whichTarot) {
    if (
      typeof answerForm?.answer === 'string' &&
      !answerForm?.answer?.includes('{') &&
      !answerForm?.answer?.includes('arrOfPositionMeaningInSpread')
    ) {
      // 강제부여(보통타로)
      if (!answerForm?.answer?.includes('1)')) {
        whichTarot = 2;
      }
      // 임시부여(개별해석 보이는 타로모드들)
      if (answerForm?.answer?.includes('1)')) {
        whichTarot = 3;
      }
    } else if (
      typeof answerForm?.answer === 'string' &&
      answerForm?.answer?.includes('{') &&
      answerForm?.answer?.includes('arrOfPositionMeaningInSpread')
    ) {
      // JSON 파싱 시도
      try {
        const parsedAnswer = JSON.parse(answerForm?.answer);
        // 강제부여(보통타로)
        if (!parsedAnswer?.individual) {
          whichTarot = 2;
        }
        // 임시부여(개별해석 보이는 타로모드들)
        if (parsedAnswer?.individual) {
          whichTarot = 3;
        }
      } catch (error) {
        console.error('JSON 파싱 오류:', error);
        whichTarot = 2; // 오류 발생 시 기본값
      }
    } else if (typeof answerForm?.answer === 'object') {
      // 강제부여(보통타로)
      if (!answerForm?.answer?.individual) {
        whichTarot = 2;
      }
      // 임시부여(개별해석 보이는 타로모드들)
      if (answerForm?.answer?.individual) {
        whichTarot = 3;
      }
    }
  }

  return whichTarot;
}

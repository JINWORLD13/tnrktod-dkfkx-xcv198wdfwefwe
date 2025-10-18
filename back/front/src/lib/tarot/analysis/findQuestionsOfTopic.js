export const findQuestionsOfTopic = (
  tarotHistory,
  questionTopic,
  browserLanguage
) => {
  const questionsSet = new Set();

  tarotHistory?.forEach(tarot => {
    // 언어 필터링
    if (tarot.language !== browserLanguage) return;
    
    // 주제가 비어있으면 제외
    const topic = tarot?.questionInfo?.question_topic;
    if (!topic || topic === '' || topic === undefined) return;
    
    // 선택된 주제와 일치하는지 확인
    if (topic !== questionTopic) return;
    
    // 실제 타로 카드 데이터가 있는지 확인
    if (
      !tarot?.spreadInfo?.selectedTarotCardsArr ||
      tarot?.spreadInfo?.selectedTarotCardsArr?.length === 0
    )
      return;
    
    // 질문 추가
    const question = tarot?.questionInfo?.question;
    if (question && question !== '' && question !== undefined) {
      questionsSet.add(question);
    }
  });

  // Set을 배열로 변환하여 반환
  return Array.from(questionsSet);
};


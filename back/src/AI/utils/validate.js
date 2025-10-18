// const validate = (finalMessage, data) => {
//   // 1단계: 입력값 검증
//   if (!finalMessage || typeof finalMessage !== 'string') {
//     console.error("Validation error: finalMessage가 유효하지 않음");
//     return false;
//   }

//   if (!data || typeof data !== 'object') {
//     console.error("Validation error: data가 유효하지 않음");
//     return false;
//   }

//   try {
//     // 2단계: JSON 파싱 전 전처리
//     let cleanMessage = finalMessage.trim();
    
//     // 마크다운 코드 블록 제거
//     if (cleanMessage.includes('```')) {
//       cleanMessage = cleanMessage
//         .replace(/```json\s*/gi, '')
//         .replace(/```\s*/g, '')
//         .trim();
//     }

//     // 3단계: JSON 파싱
//     const parsedObj = JSON.parse(cleanMessage);
    
//     // 4단계: 데이터 구조 검증
//     if (!parsedObj || typeof parsedObj !== 'object' || Array.isArray(parsedObj)) {
//       console.error("Validation error: 파싱된 객체가 유효하지 않음");
//       return false;
//     }

//     const { spreadInfo, whichTarot, language } = data;

//     // 5단계: 필수 필드 검증
//     // comprehensive 검증
//     if (!parsedObj.comprehensive || 
//         typeof parsedObj.comprehensive !== 'string' || 
//         parsedObj.comprehensive.trim().length === 0) {
//       console.error("Validation error: comprehensive 필드 누락 또는 빈 문자열");
//       return false;
//     }

//     // 6단계: 카드 수에 따른 individual 검증
//     const needsIndividual = (whichTarot === 3 || whichTarot === 4) && 
//                            spreadInfo && 
//                            Number(spreadInfo.cardCount) > 1;

//     if (needsIndividual) {
//       if (!parsedObj.individual || typeof parsedObj.individual !== 'object') {
//         console.error("Validation error: individual 필드 누락 (다중 카드 스프레드)");
//         return false;
//       }

//       const cardCount = Number(spreadInfo.cardCount);
      
//       // symbolicKeywordArray 검증
//       if (!Array.isArray(parsedObj.individual.symbolicKeywordArray) ||
//           parsedObj.individual.symbolicKeywordArray.length !== cardCount) {
//         console.error(`Validation error: symbolicKeywordArray 길이 불일치 (예상: ${cardCount}, 실제: ${parsedObj.individual.symbolicKeywordArray?.length})`);
//         return false;
//       }

//       // interpretationArray 검증 (neglect인 경우 제외)
//       if (parsedObj.individual.interpretationArray !== "neglect." &&
//           (!Array.isArray(parsedObj.individual.interpretationArray) ||
//            parsedObj.individual.interpretationArray.length !== cardCount)) {
//         console.error(`Validation error: interpretationArray 길이 불일치 (예상: ${cardCount}, 실제: ${parsedObj.individual.interpretationArray?.length})`);
//         return false;
//       }
//     }

//     // 7단계: 언어별 검증
//     if (!language) {
//       console.warn("Validation warning: language 정보 없음, 언어 검증 건너뜀");
//       return true;
//     }

//     const validateLanguage = (obj, targetLang) => {
//       const textToCheck = JSON.stringify(obj);
      
//       switch (targetLang) {
//         case "English language":
//           // 한글, 일본어, 한자 금지
//           const hasNonEnglish = /[ㄱ-ㅎ가-힣ひらがなカタカナ]/g.test(textToCheck);
//           const hasCJK = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u20000-\u2EBEF]/u.test(textToCheck);
          
//           if (hasNonEnglish || hasCJK) {
//             console.error("Validation error: 영어가 아닌 문자 감지");
//             return false;
//           }
//           break;

//         case "Korean language":
//           // 한글 필수, 영어/일본어/한자 금지
//           const hasKorean = /[ㄱ-ㅎ가-힣]/g.test(textToCheck);
//           if (!hasKorean) {
//             console.error("Validation error: 한글 없음");
//             return false;
//           }

//           const hasKoreanCJK = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u20000-\u2EBEF]/u.test(textToCheck);
//           const hasJapanese = /[ひらがなカタカナ]/g.test(textToCheck);
          
//           if (hasKoreanCJK) {
//             console.error("Validation error: 한자 감지");
//             return false;
//           }
//           if (hasJapanese) {
//             console.error("Validation error: 일본어 감지");
//             return false;
//           }

//           // comprehensive와 individual에서 영어 검증
//           const comprehensiveText = JSON.stringify(obj.comprehensive);
//           const hasEnglishInComp = /[a-zA-Z]/g.test(comprehensiveText);
//           if (hasEnglishInComp) {
//             console.error("Validation error: comprehensive에 영어 감지");
//             return false;
//           }

//           if (needsIndividual && obj.individual) {
//             if (obj.individual.interpretationArray !== "neglect.") {
//               const individualText = JSON.stringify(obj.individual.interpretationArray?.join("") || "");
//               const hasEnglishInInd = /[a-zA-Z]/g.test(individualText);
//               if (hasEnglishInInd) {
//                 console.error("Validation error: individual interpretationArray에 영어 감지");
//                 return false;
//               }
//             }

//             const symbolicText = JSON.stringify(obj.individual.symbolicKeywordArray?.join("") || "");
//             const hasEnglishInSym = /[a-zA-Z]/g.test(symbolicText);
//             if (hasEnglishInSym) {
//               console.error("Validation error: symbolicKeywordArray에 영어 감지");
//               return false;
//             }
//           }
//           break;

//         case "Japanese language":
//           // 일본어 필수, 한글/영어 금지
//           const hasJapaneseChars = /[ひらがなカタカナ一-龯]/g.test(textToCheck);
//           if (!hasJapaneseChars) {
//             console.error("Validation error: 일본어 없음");
//             return false;
//           }

//           const hasKoreanChars = /[ㄱ-ㅎ가-힣]/g.test(textToCheck);
//           if (hasKoreanChars) {
//             console.error("Validation error: 한글 감지");
//             return false;
//           }

//           // comprehensive와 individual에서 영어 검증
//           const jpCompText = JSON.stringify(obj.comprehensive);
//           const hasEnglishInJpComp = /[a-zA-Z]/g.test(jpCompText);
//           if (hasEnglishInJpComp) {
//             console.error("Validation error: comprehensive에 영어 감지");
//             return false;
//           }

//           if (needsIndividual && obj.individual) {
//             if (obj.individual.interpretationArray !== "neglect.") {
//               const jpIndText = JSON.stringify(obj.individual.interpretationArray?.join("") || "");
//               const hasEnglishInJpInd = /[a-zA-Z]/g.test(jpIndText);
//               if (hasEnglishInJpInd) {
//                 console.error("Validation error: individual interpretationArray에 영어 감지");
//                 return false;
//               }
//             }

//             const jpSymText = JSON.stringify(obj.individual.symbolicKeywordArray?.join("") || "");
//             const hasEnglishInJpSym = /[a-zA-Z]/g.test(jpSymText);
//             if (hasEnglishInJpSym) {
//               console.error("Validation error: symbolicKeywordArray에 영어 감지");
//               return false;
//             }
//           }
//           break;

//         default:
//           console.warn(`Validation warning: 알 수 없는 언어 설정: ${targetLang}`);
//           return true;
//       }
      
//       return true;
//     };

//     // 언어 검증 실행
//     if (!validateLanguage(parsedObj, language)) {
//       return false;
//     }

//     console.log("Validation passed: 모든 검증 통과");
//     return true;

//   } catch (error) {
//     // JSON 파싱 에러 또는 기타 에러 발생시 false 반환
//     console.error("Validation error:", error.message);
    
//     // 디버깅을 위한 추가 정보
//     if (error instanceof SyntaxError) {
//       console.error("JSON 구문 오류. 메시지 미리보기:", finalMessage.substring(0, 200) + "...");
//     }
    
//     return false;
//   }
// };

// module.exports = { validate };

const validate = (finalMessage, data) => {
  if (!finalMessage || typeof finalMessage !== 'string') {
    console.error("Validation error: finalMessage가 유효하지 않음");
    return false;
  }

  if (!data || typeof data !== 'object') {
    console.error("Validation error: data가 유효하지 않음");
    return false;
  }

  try {
    let cleanMessage = finalMessage.trim();
    
    if (cleanMessage.includes('```')) {
      cleanMessage = cleanMessage
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
    }

    const parsedObj = JSON.parse(cleanMessage);
    
    if (!parsedObj || typeof parsedObj !== 'object' || Array.isArray(parsedObj)) {
      console.error("Validation error: 파싱된 객체가 유효하지 않음", typeof parsedObj);
      return false;
    }

    const { spreadInfo, whichTarot, language } = data;

    if (!parsedObj.comprehensive || 
        typeof parsedObj.comprehensive !== 'string' || 
        parsedObj.comprehensive.trim().length === 0) {
      console.error("Validation error: comprehensive 필드 누락 또는 빈 문자열");
      return false;
    }

    const needsIndividual = (whichTarot === 3 || whichTarot === 4) && 
                           spreadInfo && 
                           Number(spreadInfo.cardCount) > 1;

    if (needsIndividual) {
      if (!parsedObj.individual || typeof parsedObj.individual !== 'object') {
        console.error("Validation error: individual 필드 누락 (다중 카드 스프레드)");
        return false;
      }

      const cardCount = Number(spreadInfo.cardCount);
      
      if (!validateArrayField(parsedObj.individual.symbolicKeywordArray, cardCount, "symbolicKeywordArray")) {
        return false;
      }

      if (parsedObj.individual.interpretationArray !== "neglect." &&
          !validateArrayField(parsedObj.individual.interpretationArray, cardCount, "interpretationArray")) {
        return false;
      }

      if (!validateArrayField(parsedObj.individual.arrOfPositionMeaningInSpread, cardCount, "arrOfPositionMeaningInSpread")) {
        console.warn("Validation warning: arrOfPositionMeaningInSpread 누락, 계속 진행");
      }
    }

    if (!language) {
      console.warn("Validation warning: language 정보 없음, 언어 검증 건너뜀");
      return true;
    }

    if (!validateLanguage(parsedObj, language, needsIndividual)) {
      return false;
    }

    console.log("Validation passed: 모든 검증 통과");
    return true;

  } catch (error) {
    console.error("Validation error:", error.message);
    
    if (error instanceof SyntaxError) {
      console.error("JSON 구문 오류. 메시지 미리보기:", finalMessage.substring(0, 200) + "...");
    }
    
    return false;
  }
};

const validateArrayField = (field, expectedLength, fieldName) => {
  if (!Array.isArray(field)) {
    console.error(`Validation error: ${fieldName}이 배열이 아님`);
    return false;
  }
  
  if (field.length !== expectedLength) {
    console.error(`Validation error: ${fieldName} 길이 불일치 (예상: ${expectedLength}, 실제: ${field.length})`);
    return false;
  }
  
  return true;
};

const validateLanguage = (obj, targetLang, needsIndividual) => {
  const textToCheck = JSON.stringify(obj);
  
  switch (targetLang) {
    case "English language":
      const hasNonEnglish = /[ㄱ-ㅎ가-힣ひらがなカタカナ]/g.test(textToCheck);
      const hasCJK = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u20000-\u2EBEF]/u.test(textToCheck);
      
      if (hasNonEnglish || hasCJK) {
        console.error("Validation error: 영어가 아닌 문자 감지");
        return false;
      }
      break;

    case "Korean language":
      const hasKorean = /[ㄱ-ㅎ가-힣]/g.test(textToCheck);
      if (!hasKorean) {
        console.error("Validation error: 한글 없음");
        return false;
      }

      const hasKoreanCJK = /[\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\u20000-\u2EBEF]/u.test(textToCheck);
      const hasJapanese = /[ひらがなカタカナ]/g.test(textToCheck);
      
      if (hasKoreanCJK) {
        console.error("Validation error: 한자 감지");
        return false;
      }
      if (hasJapanese) {
        console.error("Validation error: 일본어 감지");
        return false;
      }

      if (!validateKoreanContent(obj, needsIndividual)) {
        return false;
      }
      break;

    case "Japanese language":
      const hasJapaneseChars = /[ひらがなカタカナ一-龯]/g.test(textToCheck);
      if (!hasJapaneseChars) {
        console.error("Validation error: 일본어 없음");
        return false;
      }

      const hasKoreanChars = /[ㄱ-ㅎ가-힣]/g.test(textToCheck);
      if (hasKoreanChars) {
        console.error("Validation error: 한글 감지");
        return false;
      }

      if (!validateJapaneseContent(obj, needsIndividual)) {
        return false;
      }
      break;

    default:
      console.warn(`Validation warning: 알 수 없는 언어 설정: ${targetLang}`);
      return true;
  }
  
  return true;
};

const validateKoreanContent = (obj, needsIndividual) => {
  const comprehensiveText = JSON.stringify(obj.comprehensive);
  const hasEnglishInComp = /[a-zA-Z]/g.test(comprehensiveText);
  if (hasEnglishInComp) {
    console.error("Validation error: comprehensive에 영어 감지");
    return false;
  }

  if (needsIndividual && obj.individual) {
    if (obj.individual.interpretationArray !== "neglect.") {
      const individualText = JSON.stringify(obj.individual.interpretationArray?.join("") || "");
      const hasEnglishInInd = /[a-zA-Z]/g.test(individualText);
      if (hasEnglishInInd) {
        console.error("Validation error: individual interpretationArray에 영어 감지");
        return false;
      }
    }

    const symbolicText = JSON.stringify(obj.individual.symbolicKeywordArray?.join("") || "");
    const hasEnglishInSym = /[a-zA-Z]/g.test(symbolicText);
    if (hasEnglishInSym) {
      console.error("Validation error: symbolicKeywordArray에 영어 감지");
      return false;
    }
  }
  return true;
};

const validateJapaneseContent = (obj, needsIndividual) => {
  const jpCompText = JSON.stringify(obj.comprehensive);
  const hasEnglishInJpComp = /[a-zA-Z]/g.test(jpCompText);
  if (hasEnglishInJpComp) {
    console.error("Validation error: comprehensive에 영어 감지");
    return false;
  }

  if (needsIndividual && obj.individual) {
    if (obj.individual.interpretationArray !== "neglect.") {
      const jpIndText = JSON.stringify(obj.individual.interpretationArray?.join("") || "");
      const hasEnglishInJpInd = /[a-zA-Z]/g.test(jpIndText);
      if (hasEnglishInJpInd) {
        console.error("Validation error: individual interpretationArray에 영어 감지");
        return false;
      }
    }

    const jpSymText = JSON.stringify(obj.individual.symbolicKeywordArray?.join("") || "");
    const hasEnglishInJpSym = /[a-zA-Z]/g.test(jpSymText);
    if (hasEnglishInJpSym) {
      console.error("Validation error: symbolicKeywordArray에 영어 감지");
      return false;
    }
  }
  return true;
};

module.exports = { validate };
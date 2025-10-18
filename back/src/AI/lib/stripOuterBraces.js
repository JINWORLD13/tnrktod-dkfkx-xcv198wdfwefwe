// /**
//  * JSON 문자열에서 comprehensive/individual 키를 기준으로 핵심 내용을 추출하고 정리하는 모듈 (개선 버전)
//  * @param {string} msg - 입력 문자열
//  * @returns {string} - 정리된 JSON 문자열
//  */
// const stripOuterBraces = (msg) => {
//   if (typeof msg !== "string") return msg;

//   let cleaned = msg.trim();
  
//   // 0단계: 먼저 원본이 이미 올바른 JSON인지 확인
//   try {
//     const parsed = JSON.parse(cleaned);
//     if (parsed && typeof parsed === 'object' && 
//         ('comprehensive' in parsed || 'individual' in parsed)) {
//       return JSON.stringify(parsed, null, 2);
//     }
//   } catch (e) {
//     // 파싱 실패하면 계속 진행
//   }
  
//   // 0.5단계: 일반적인 JSON 문법 오류 수정
//   cleaned = fixCommonJsonErrors(cleaned);
  
//   // 1단계: 중괄호 균형 먼저 확인
//   let openCount = 0;
//   let closeCount = 0;
//   for (let char of cleaned) {
//     if (char === '{') openCount++;
//     if (char === '}') closeCount++;
//   }
  
//   // 2단계: 누락된 중괄호가 있으면 추가
//   if (openCount > closeCount) {
//     const missing = openCount - closeCount;
//     cleaned += '}'.repeat(missing);
//   }
  
//   // 3단계: 균형 맞춘 후 파싱 시도
//   try {
//     const parsed = JSON.parse(cleaned);
//     if (parsed && typeof parsed === 'object' && 
//         ('comprehensive' in parsed || 'individual' in parsed)) {
//       return JSON.stringify(parsed, null, 2);
//     }
//   } catch (e) {
//     // 여전히 실패하면 키 기반 추출 진행
//   }
  
//   // 4단계: 키 기반 JSON 추출
//   const mainKeys = [
//     '"comprehensive"',
//     "'comprehensive'",
//     '"individual"',
//     "'individual'"
//   ];
  
//   let startPos = -1;
  
//   for (const key of mainKeys) {
//     const pos = cleaned.indexOf(key);
//     if (pos !== -1 && (startPos === -1 || pos < startPos)) {
//       startPos = pos;
//     }
//   }
  
//   if (startPos === -1) {
//     console.log('comprehensive 또는 individual 키를 찾을 수 없습니다.');
//     return cleaned;
//   }
  
//   // 키를 기준으로 JSON 객체 범위 찾기
//   let outerStart = -1;
//   for (let i = startPos - 1; i >= 0; i--) {
//     if (cleaned[i] === '{') {
//       outerStart = i;
//       break;
//     }
//   }
  
//   if (outerStart === -1) {
//     outerStart = startPos;
//     while (outerStart > 0 && /[\s,:]/.test(cleaned[outerStart - 1])) {
//       outerStart--;
//     }
//   }
  
//   // 매칭되는 } 찾기
//   let braceCount = 0;
//   let inString = false;
//   let escapeNext = false;
//   let quote = null;
//   let outerEnd = -1;
  
//   const startsWithBrace = cleaned[outerStart] === '{';
//   if (startsWithBrace) braceCount = 1;
  
//   for (let i = outerStart + (startsWithBrace ? 1 : 0); i < cleaned.length; i++) {
//     const char = cleaned[i];
    
//     if (escapeNext) {
//       escapeNext = false;
//       continue;
//     }
    
//     if (char === '\\') {
//       escapeNext = true;
//       continue;
//     }
    
//     if ((char === '"' || char === "'") && !inString) {
//       inString = true;
//       quote = char;
//       continue;
//     } else if (char === quote && inString && !escapeNext) {
//       inString = false;
//       quote = null;
//       continue;
//     }
    
//     if (!inString) {
//       if (char === '{') {
//         braceCount++;
//       } else if (char === '}') {
//         braceCount--;
//         if (braceCount === 0) {
//           outerEnd = i;
//           break;
//         }
//       }
//     }
//   }
  
//   // 내용 추출
//   let content;
//   if (startsWithBrace && outerEnd !== -1) {
//     content = cleaned.slice(outerStart + 1, outerEnd).trim();
//   } else {
//     const endPos = outerEnd !== -1 ? outerEnd : cleaned.length;
//     content = cleaned.slice(outerStart, endPos).trim();
    
//     content = removeTrailingGarbage(content);
    
//     if (content.endsWith('}')) {
//       content = content.slice(0, -1).trim();
//     }
//   }
  
//   // 재포장 및 작은따옴표 변환
//   let rewrapped = `{${content}}`;
//   rewrapped = convertQuotes(rewrapped);
  
//   // 최종 파싱 시도
//   try {
//     const parsed = JSON.parse(rewrapped);
//     return JSON.stringify(parsed, null, 2);
//   } catch (e) {
//     console.log('최종 파싱 실패:', e.message);
//     return rewrapped;
//   }
// };

// /**
//  * 일반적인 JSON 문법 오류 수정
//  * @param {string} jsonStr - JSON 문자열
//  * @returns {string} - 수정된 JSON 문자열
//  */
// const fixCommonJsonErrors = (jsonStr) => {
//   let fixed = jsonStr;
  
//   // 1. 배열 값이 잘못 문자열로 감싸진 경우 수정
//   // 예: "key": [배열내용]", -> "key": [배열내용],
//   fixed = fixed.replace(/("\w+Array":\s*\[[^\]]+\])"/g, '$1');
  
//   // 2. 중복 따옴표 제거
//   // 예: ""key"" -> "key"
//   fixed = fixed.replace(/""/g, '"');
  
//   // 3. 잘못된 쉼표 위치 수정
//   // 마지막 속성 뒤의 쉼표 제거
//   fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
  
//   // 4. 문자열 내부의 잘못된 이스케이프 수정
//   // \\n\\n -> \n\n (실제 줄바꿈으로)
//   fixed = fixed.replace(/\\\\n/g, '\\n');
  
//   return fixed;
// };

// /**
//  * 뒤쪽의 불필요한 텍스트 제거
//  */
// const removeTrailingGarbage = (content) => {
//   let trimmed = content;
  
//   while (trimmed.length > 0) {
//     const lastChar = trimmed[trimmed.length - 1];
    
//     // 유효한 JSON 끝 문자들
//     if (/[}\]"']/.test(lastChar)) {
//       break;
//     }
    
//     // 공백, 쉼표는 제거
//     if (/[\s,]/.test(lastChar)) {
//       trimmed = trimmed.slice(0, -1);
//       continue;
//     }
    
//     // 기타 문자들은 제거
//     trimmed = trimmed.slice(0, -1);
//   }
  
//   return trimmed;
// };

// /**
//  * 작은따옴표를 큰따옴표로 변환 (JSON 표준 준수)
//  */
// const convertQuotes = (str) => {
//   let result = '';
//   let inString = false;
//   let currentQuote = null;
//   let escapeNext = false;
  
//   for (let i = 0; i < str.length; i++) {
//     const char = str[i];
    
//     if (escapeNext) {
//       result += char;
//       escapeNext = false;
//       continue;
//     }
    
//     if (char === '\\') {
//       result += char;
//       escapeNext = true;
//       continue;
//     }
    
//     if ((char === '"' || char === "'") && !inString) {
//       inString = true;
//       currentQuote = char;
//       result += '"'; // 항상 큰따옴표로
//     } else if (char === currentQuote && inString) {
//       inString = false;
//       currentQuote = null;
//       result += '"'; // 항상 큰따옴표로
//     } else {
//       result += char;
//     }
//   }
  
//   return result;
// };

// module.exports = { stripOuterBraces };


const stripOuterBraces = (msg, data = {}) => {
  if (typeof msg !== "string") return createBasicJSON("입력값이 문자열이 아닙니다.", data);

  let cleaned = msg.trim();
  
  if (!cleaned) return createBasicJSON("빈 문자열입니다.", data);

  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object' && 
        ('comprehensive' in parsed || 'individual' in parsed)) {
      return JSON.stringify(parsed, null, 2);
    }
  } catch (e) {
    // 계속 진행
  }
  
  cleaned = fixCommonJsonErrors(cleaned);
  
  let openCount = 0;
  let closeCount = 0;
  for (let char of cleaned) {
    if (char === '{') openCount++;
    if (char === '}') closeCount++;
  }
  
  if (openCount > closeCount) {
    const missing = openCount - closeCount;
    cleaned += '}'.repeat(missing);
  }
  
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === 'object' && 
        ('comprehensive' in parsed || 'individual' in parsed)) {
      return JSON.stringify(parsed, null, 2);
    }
  } catch (e) {
    // 키 기반 추출 진행
  }
  
  const mainKeys = [
    '"comprehensive"',
    "'comprehensive'",
    '"individual"',
    "'individual'"
  ];
  
  let startPos = -1;
  
  for (const key of mainKeys) {
    const pos = cleaned.indexOf(key);
    if (pos !== -1 && (startPos === -1 || pos < startPos)) {
      startPos = pos;
    }
  }
  
  if (startPos === -1) {
    console.log('comprehensive 또는 individual 키를 찾을 수 없습니다.');
    return createBasicJSON("JSON 구조를 찾을 수 없습니다.", data);
  }
  
  let outerStart = -1;
  for (let i = startPos - 1; i >= 0; i--) {
    if (cleaned[i] === '{') {
      outerStart = i;
      break;
    }
  }
  
  if (outerStart === -1) {
    outerStart = startPos;
    while (outerStart > 0 && /[\s,:]/.test(cleaned[outerStart - 1])) {
      outerStart--;
    }
  }
  
  let braceCount = 0;
  let inString = false;
  let escapeNext = false;
  let quote = null;
  let outerEnd = -1;
  
  const startsWithBrace = cleaned[outerStart] === '{';
  if (startsWithBrace) braceCount = 1;
  
  for (let i = outerStart + (startsWithBrace ? 1 : 0); i < cleaned.length; i++) {
    const char = cleaned[i];
    
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    if ((char === '"' || char === "'") && !inString) {
      inString = true;
      quote = char;
      continue;
    } else if (char === quote && inString && !escapeNext) {
      inString = false;
      quote = null;
      continue;
    }
    
    if (!inString) {
      if (char === '{') {
        braceCount++;
      } else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          outerEnd = i;
          break;
        }
      }
    }
  }
  
  let content;
  if (startsWithBrace && outerEnd !== -1) {
    content = cleaned.slice(outerStart + 1, outerEnd).trim();
  } else {
    const endPos = outerEnd !== -1 ? outerEnd : cleaned.length;
    content = cleaned.slice(outerStart, endPos).trim();
    
    content = removeTrailingGarbage(content);
    
    if (content.endsWith('}')) {
      content = content.slice(0, -1).trim();
    }
  }
  
  let rewrapped = `{${content}}`;
  rewrapped = convertQuotes(rewrapped);
  
  try {
    const parsed = JSON.parse(rewrapped);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return createBasicJSON("올바르지 않은 객체 구조입니다.", data);
    }
    return JSON.stringify(parsed, null, 2);
  } catch (e) {
    console.log('최종 파싱 실패:', e.message);
    return createBasicJSON("JSON 파싱에 실패했습니다.", data);
  }
};

const createBasicJSON = (message, data = {}) => {
  const { language = "Korean language", spreadInfo } = data;
  const cardCount = Number(spreadInfo?.cardCount) || 1;
  
  const messages = {
    "Korean language": {
      comprehensive: message || "타로 해석을 생성하는 중입니다.",
      individual: "개별 카드 해석 준비중",
      position: "포지션 의미"
    },
    "English language": {
      comprehensive: message || "Generating tarot interpretation.",
      individual: "Preparing individual card interpretation",
      position: "Position meaning"
    },
    "Japanese language": {
      comprehensive: message || "タロット解釈を生成しています。",
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
      arrOfPositionMeaningInSpread: new Array(cardCount).fill(msg.position)
    };
  }
  
  return JSON.stringify(result, null, 2);
};

const fixCommonJsonErrors = (jsonStr) => {
  let fixed = jsonStr;
  
  fixed = fixed.replace(/("\w+Array":\s*\[[^\]]+\])"/g, '$1');
  fixed = fixed.replace(/""/g, '"');
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
  fixed = fixed.replace(/\\\\n/g, '\\n');
  
  return fixed;
};

const removeTrailingGarbage = (content) => {
  let trimmed = content;
  
  while (trimmed.length > 0) {
    const lastChar = trimmed[trimmed.length - 1];
    
    if (/[}\]"']/.test(lastChar)) {
      break;
    }
    
    if (/[\s,]/.test(lastChar)) {
      trimmed = trimmed.slice(0, -1);
      continue;
    }
    
    trimmed = trimmed.slice(0, -1);
  }
  
  return trimmed;
};

const convertQuotes = (str) => {
  let result = '';
  let inString = false;
  let currentQuote = null;
  let escapeNext = false;
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    
    if (escapeNext) {
      result += char;
      escapeNext = false;
      continue;
    }
    
    if (char === '\\') {
      result += char;
      escapeNext = true;
      continue;
    }
    
    if ((char === '"' || char === "'") && !inString) {
      inString = true;
      currentQuote = char;
      result += '"';
    } else if (char === currentQuote && inString) {
      inString = false;
      currentQuote = null;
      result += '"';
    } else {
      result += char;
    }
  }
  
  return result;
};

const safeJSONParse = (str) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.log("safeJSONParse 실패:", error.message);
    return null;
  }
};

const isValidJSONString = (str) => {
  try {
    const parsed = JSON.parse(str);
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed);
  } catch (error) {
    return false;
  }
};

const debugJSONInfo = (str) => {
  console.log("=== JSON 디버그 정보 ===");
  console.log("길이:", str.length);
  console.log("첫 50자:", str.substring(0, 50));
  console.log("마지막 50자:", str.substring(str.length - 50));
  console.log("첫 번째 {:", str.indexOf('{'));
  console.log("마지막 }:", str.lastIndexOf('}'));
  
  const braceCount = (str.match(/{/g) || []).length;
  const closeBraceCount = (str.match(/}/g) || []).length;
  console.log("{ 개수:", braceCount);
  console.log("} 개수:", closeBraceCount);
  console.log("======================");
};

module.exports = { 
  stripOuterBraces,
  safeJSONParse,
  isValidJSONString,
  debugJSONInfo
};
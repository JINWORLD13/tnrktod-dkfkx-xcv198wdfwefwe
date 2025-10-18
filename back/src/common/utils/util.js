// undefined 값 제거: 깔끔한 응답 객체 생성
// Remove undefined values: create clean response object
// undefined値を削除：クリーンな応答オブジェクト生成
function sanitizeObject(obj) {
  const result = Object.entries(obj).reduce((map, [key, value]) => {
    if (value !== undefined) {
      map[key] = value;
    }
    return map;
  }, {});
  return result;
}

// 표준 응답 형식: data + error + statusCode
// Standard response format: data + error + statusCode
// 標準応答形式：data + error + statusCode
function buildResponse(data, error, statusCode) {
  return {
    data,
    errorName: error?.name ?? null,
    errorMessage: error?.message ?? null,
    statusCode: statusCode ?? error?.statusCode,
  };
}

module.exports = {
  sanitizeObject,
  buildResponse,
};

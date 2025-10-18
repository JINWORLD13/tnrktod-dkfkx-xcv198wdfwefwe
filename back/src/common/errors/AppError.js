// 커스텀 에러 클래스: 표준화된 에러 처리
// Custom Error class: standardized error handling
// カスタムエラークラス：標準化されたエラー処理
class AppError extends Error {
  constructor(name, message, statusCode) {
    super(message);

    this.name = name;
    this.statusCode = statusCode;
    Error.captureStackTrace(this);
  }
}

module.exports = AppError;

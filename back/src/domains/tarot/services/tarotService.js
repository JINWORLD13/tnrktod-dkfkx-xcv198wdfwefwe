const { tarotRepository } = require("../repositories/index");
const { userRepository } = require("../../user/repositories/index");
const commonErrors = require("../../../common/errors/commonErrors");

// 타로 비즈니스 로직 서비스 (Service Layer)
// Tarot business logic service (Service Layer)
// タロットビジネスロジックサービス（サービスレイヤー）
class TarotService {
  // 타로 데이터 생성 (트랜잭션 지원)
  // Create tarot data (with transaction support)
  // タロットデータ生成（トランザクション対応）
  async createTarot(tarotInfo, session = null) {
    try {
      const newTarot = await tarotRepository.create(tarotInfo, session);
      return newTarot;
    } catch (err) {
      if (err.name === commonErrors.tarotRepositoryCreateError) throw err;
      err.name = commonErrors.tarotServiceCreateTarotError;
      throw err;
    }
  }

  // ID로 단일 타로 데이터 조회
  // Get single tarot data by ID
  // IDで単一タロットデータ取得
  async getTarotById(tarotId) {
    try {
      const tarotInDB = await tarotRepository.findById(tarotId);
      if (tarotInDB !== null && tarotInDB !== undefined) {
        return tarotInDB;
      } else {
        throw new Error(commonErrors.tarotInfoNotFoundError);
      }
    } catch (err) {
      if (err.name === commonErrors.tarotRepositoryFindByIdError) throw err;
      err.name = commonErrors.tarotServiceGetTarotByIdError;
      if (err.message === commonErrors.tarotInfoNotFoundError)
        err.stausCode = 404;
      throw err;
    }
  }

  // ID로 복수 타로 데이터 조회
  // Get multiple tarot data by ID
  // IDで複数タロットデータ取得
  async getTarotsById(tarotId) {
    try {
      const tarotArrInDB = await tarotRepository.findManyById(tarotId);
      if (tarotArrInDB !== null && tarotArrInDB !== undefined) {
        return tarotArrInDB;
      } else {
        throw new Error(commonErrors.tarotsInfoNotFoundError);
      }
    } catch (err) {
      if (err.name === commonErrors.tarotRepositoryFindManyByIdError) throw err;
      err.name = commonErrors.tarotServiceGetTarotsByIdError;
      if (err.message === commonErrors.tarotsInfoNotFoundError)
        err.stausCode = 404;
      throw err;
    }
  }

  // 사용자 ID로 타로 기록 조회
  // Get tarot history by user ID
  // ユーザーIDでタロット履歴取得
  async getHistoryByUserId(userObjId) {
    try {
      const tarotArrInDB = await tarotRepository.findManyByUserId(userObjId);
      if (tarotArrInDB !== null && tarotArrInDB !== undefined) {
        return tarotArrInDB;
      } else {
        throw new Error(commonErrors.tarotsInfoNotFoundError);
      }
    } catch (err) {
      if (err.name === commonErrors.tarotRepositoryFindManyByUserIdError)
        throw err;
      err.name = commonErrors.tarotServiceGetHistoryByUserIdError;
      if (err.message === commonErrors.tarotsInfoNotFoundError)
        err.stausCode = 404;
      throw err;
    }
  }

  // 스프레드 타입으로 타로 데이터 조회
  // Get tarot data by spread type
  // スプレッドタイプでタロットデータ取得
  async getTarotsBySpread(spreadInfo) {
    try {
      const tarotArrInDB = await tarotRepository.findManyBySpread(spreadInfo);
      if (tarotArrInDB !== null && tarotArrInDB !== undefined) {
        return tarotArrInDB;
      } else {
        throw new Error(commonErrors.tarotsInfoNotFoundError);
      }
    } catch (err) {
      if (err.name === commonErrors.tarotRepositoryFindManyBySpreadError)
        throw err;
      err.name = commonErrors.tarotServiceGetTarotsBySpreadError;
      if (err.message === commonErrors.tarotsInfoNotFoundError)
        err.stausCode = 404;
      throw err;
    }
  }

  // 답변으로 단일 타로 데이터 삭제 (멱등성 보장)
  // Delete single tarot data by answer (idempotent)
  // 回答で単一タロットデータ削除（冪等性保証）
  async deleteTarotByAnswer(tarotAnswer) {
    try {
      // DELETE 멱등성: 웹/앱 동기화 이슈 방지
      // DELETE idempotency: prevents web/app sync issues
      // DELETE冪等性：ウェブ/アプリ同期問題防止
      const deletedTarot = await tarotRepository.deleteByAnswer(tarotAnswer);
      return deletedTarot;
    } catch (err) {
      if (err.name === commonErrors.tarotRepositoryDeleteByAnswerError)
        throw err;
      err.name = commonErrors.tarotServiceDeleteTarotsByUserObjIdError;
      throw err;
    }
  }

  // 답변 배열로 복수 타로 데이터 삭제 (멱등성 보장)
  // Delete multiple tarot data by answer array (idempotent)
  // 回答配列で複数タロットデータ削除（冪等性保証）
  async deleteTarotsByAnswerArr(tarotAnswerArr) {
    try {
      // DELETE 멱등성: 웹/앱 동기화 이슈 방지
      // DELETE idempotency: prevents web/app sync issues
      // DELETE冪等性：ウェブ/アプリ同期問題防止
      const deletedTarot = await tarotRepository.deleteManyByAnswerArr(
        tarotAnswerArr
      );
      return deletedTarot;
    } catch (err) {
      if (err.name === commonErrors.tarotRepositoryDeleteManyByAnswerArrError)
        throw err;
      err.name = commonErrors.tarotServiceDeleteTarotByAnswerError;
      throw err;
    }
  }

  // 사용자 ID로 복수 타로 데이터 삭제 (멱등성 보장)
  // Delete multiple tarot data by user ID (idempotent)
  // ユーザーIDで複数タロットデータ削除（冪等性保証）
  async deleteTarotsByUserObjId(userObjId) {
    try {
      // DELETE 멱등성: 웹/앱 동기화 이슈 방지
      // DELETE idempotency: prevents web/app sync issues
      // DELETE冪等性：ウェブ/アプリ同期問題防止
      const result = await tarotRepository.deleteManyByUserId(userObjId);
      return result;
    } catch (err) {
      if (err.name === commonErrors.tarotRepositoryDeleteManyByIdError)
        throw err;
      err.name = commonErrors.tarotServiceDeleteTarotsByUserObjIdError;
      throw err;
    }
  }

  // 스프레드 타입으로 복수 타로 데이터 삭제 (멱등성 보장)
  // Delete multiple tarot data by spread type (idempotent)
  // スプレッドタイプで複数タロットデータ削除（冪等性保証）
  async deleteTarotsBySpread(spreadInfo) {
    try {
      // DELETE 멱등성: 웹/앱 동기화 이슈 방지
      // DELETE idempotency: prevents web/app sync issues
      // DELETE冪等性：ウェブ/アプリ同期問題防止
      const deletedTarots = await tarotRepository.deleteManyBySpread(
        spreadInfo
      );
      return deletedTarots;
    } catch (err) {
      if (err.name === commonErrors.tarotRepositoryDeleteManyBySpreadError)
        throw err;
      err.name = commonErrors.tarotServiceDeleteTarotsBySpreadError;
      throw err;
    }
  }
}
const tarotService = new TarotService();

module.exports = tarotService;

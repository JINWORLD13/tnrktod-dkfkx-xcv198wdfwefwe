const Tarot = require("../models/tarot");
const commonErrors = require("../../../common/errors/commonErrors");

// 타로 데이터 접근 객체 (Repository Pattern)
// Tarot data access object (Repository Pattern)
// タロットデータアクセスオブジェクト（リポジトリパターン）
const tarotDAO = {
  // 타로 데이터 생성 (트랜잭션 지원)
  // Create tarot data (with transaction support)
  // タロットデータ生成（トランザクション対応）
  create: async (tarotInfo, session = null) => {
    try {
      // userInfo 객체에서 ObjectId만 추출
      // Extract ObjectId from userInfo object
      // userInfoオブジェクトからObjectIdのみ抽出
      const userObjId = tarotInfo?.userInfo?._id ?? null;
      const { userInfo, ...rest } = tarotInfo;
      const tarotInfoWithoutUserInfo = rest;

      const newTarot = new Tarot({
        ...tarotInfoWithoutUserInfo,
        userInfo: userObjId,
      });
      await newTarot.save({ session });

      // populate를 통해 userInfo 관계 데이터 조회
      // Populate userInfo relation data
      // populateでuserInfo関連データ取得
      const query = Tarot?.findOne({
        _id: newTarot?._id,
      }).populate("userInfo");

      // 트랜잭션 세션 적용
      // Apply transaction session
      // トランザクションセッション適用
      if (session) {
        query.session(session);
      }

      const populatedTarot = await query;
      return populatedTarot?.toObject();
    } catch (err) {
      err.name = commonErrors.tarotDAOCreateError;
      throw err;
    }
  },

  // ID로 단일 타로 데이터 조회
  // Find single tarot data by ID
  // IDで単一タロットデータ取得
  findById: async (tarotId) => {
    try {
      const plainTarot = await Tarot?.findOne({ _id: tarotId })?.lean();
      return plainTarot;
    } catch (err) {
      err.name = commonErrors.tarotDAOFindByIdError;
      throw err;
    }
  },

  // 사용자 ID로 단일 타로 데이터 조회
  // Find single tarot data by user ID
  // ユーザーIDで単一タロットデータ取得
  findByUserId: async (userObjId) => {
    try {
      const plainTarot = await Tarot?.findOne({ userInfo: userObjId })?.lean();
      return plainTarot;
    } catch (err) {
      err.name = commonErrors.tarotDAOFindByUserIdError;
      throw err;
    }
  },

  // 답변으로 단일 타로 데이터 조회
  // Find single tarot data by answer
  // 回答で単一タロットデータ取得
  findByAnswer: async (tarotAnswer) => {
    try {
      const plainTarot = await Tarot?.findOne({ answer: tarotAnswer })?.lean();
      return plainTarot;
    } catch (err) {
      err.name = commonErrors.tarotDAOFindByAnswerError;
      throw err;
    }
  },

  // 답변 배열로 복수 타로 데이터 조회 (배치 쿼리 최적화)
  // Find multiple tarot data by answer array (batch query optimization)
  // 回答配列で複数タロットデータ取得（バッチクエリ最適化）
  findByAnswerArr: async (tarotAnswerArr) => {
    try {
      // $in 연산자로 단일 쿼리 실행 (복수 커넥션 → 단일 커넥션)
      // Execute single query with $in operator (multiple connections → single connection)
      // $in演算子で単一クエリ実行（複数コネクション→単一コネクション）
      const plainTarotArr = await Tarot?.find({
        answer: { $in: tarotAnswerArr },
      })?.lean();
      return plainTarotArr;
    } catch (err) {
      err.name = commonErrors.tarotDAOFindByAnswerError;
      throw err;
    }
  },

  // ID로 복수 타로 데이터 조회
  // Find multiple tarot data by ID
  // IDで複数タロットデータ取得
  findManyById: async (tarotId) => {
    try {
      const plainTarotArr = await Tarot?.find({ _id: tarotId });
      return plainTarotArr;
    } catch (err) {
      err.name = commonErrors.tarotDAOFindManyByIdError;
      throw err;
    }
  },

  // 사용자 ID로 타로 기록 조회 (필터링 및 데이터 정제)
  // Find tarot history by user ID (filtering and data sanitization)
  // ユーザーIDでタロット履歴取得（フィルタリングとデータ整形）
  findManyByUserId: async (userObjId) => {
    try {
      const plainTarotArr = await Tarot?.find({ userInfo: userObjId });

      // 유효한 타로 카드 데이터만 필터링 및 필요한 필드만 추출
      // Filter valid tarot card data and extract necessary fields only
      // 有効なタロットカードデータのみフィルタリングし必要なフィールドのみ抽出
      const plainTarotArrWithoutObjId = plainTarotArr
        .filter((tarot) => {
          return (
            tarot?.spreadInfo?.selectedTarotCardsArr &&
            Array.isArray(tarot.spreadInfo.selectedTarotCardsArr) &&
            tarot.spreadInfo.selectedTarotCardsArr.length > 0
          );
        })
        .map((tarot, i) => {
          const {
            questionInfo,
            spreadInfo,
            answer,
            language,
            createdAt,
            updatedAt,
            timeOfCounselling,
            ...rest
          } = tarot;
          return {
            questionInfo,
            spreadInfo,
            answer,
            language,
            createdAt,
            updatedAt,
            timeOfCounselling,
          };
        });
      return plainTarotArrWithoutObjId;
    } catch (err) {
      err.name = commonErrors.tarotDAOFindManyByUserIdError;
      throw err;
    }
  },

  // 스프레드 타입으로 타로 데이터 조회
  // Find tarot data by spread type
  // スプレッドタイプでタロットデータ取得
  findManyBySpread: async (spreadInfo) => {
    try {
      const plainTarotArr = await Tarot?.find({ spreadInfo })?.lean();
      return plainTarotArr;
    } catch (err) {
      err.name = commonErrors.tarotDAOFindManyBySpreadError;
      throw err;
    }
  },

  // 언어별 타로 데이터 조회
  // Find tarot data by language
  // 言語別タロットデータ取得
  findManyByLanguage: async (languageInfo) => {
    try {
      const plainTarotArr = await Tarot?.find({
        language: languageInfo,
      })?.lean();
      return plainTarotArr;
    } catch (err) {
      err.name = commonErrors.tarotDAOFindManyByLanguageError;
      throw err;
    }
  },

  // ID로 타로 데이터 삭제
  // Delete tarot data by ID
  // IDでタロットデータ削除
  deleteById: async (tarotId) => {
    try {
      const result = await Tarot?.deleteOne({ _id: tarotId });
      return result;
    } catch (err) {
      err.name = commonErrors.tarotDAODeleteByIdError;
      throw err;
    }
  },

  // 답변으로 타로 데이터 삭제 (직접 삭제)
  // Delete tarot data by answer (direct deletion)
  // 回答でタロットデータ削除（直接削除）
  deleteByAnswer: async (tarotAnswer) => {
    try {
      const result = await Tarot?.deleteOne({ answer: tarotAnswer });
      return result;
    } catch (err) {
      err.name = commonErrors.tarotDAODeleteByAnswerError;
      throw err;
    }
  },

  // ID 배열로 복수 타로 데이터 삭제 (배치 처리)
  // Delete multiple tarot data by ID array (batch processing)
  // ID配列で複数タロットデータ削除（バッチ処理）
  deleteManyByIdArr: async (tarotIdArr) => {
    try {
      // $in 연산자로 단일 쿼리 실행 (에러 방지 처리)
      // Execute single query with $in operator (error prevention)
      // $in演算子で単一クエリ実行（エラー防止処理）
      const result = await Tarot?.deleteMany({ _id: { $in: tarotIdArr } });
      return result;
    } catch (err) {
      err.name = commonErrors.tarotDAODeleteManyByIdError;
      throw err;
    }
  },

  // 답변 배열로 복수 타로 데이터 삭제 (배치 처리)
  // Delete multiple tarot data by answer array (batch processing)
  // 回答配列で複数タロットデータ削除（バッチ処理）
  deleteManyByAnswerArr: async (tarotAnswerArr) => {
    try {
      const result = await Tarot?.deleteMany({
        answer: { $in: tarotAnswerArr },
      });
      return result;
    } catch (err) {
      err.name = commonErrors.tarotDAODeleteManyByAnswerArrError;
      throw err;
    }
  },

  // 사용자 ID로 복수 타로 데이터 삭제
  // Delete multiple tarot data by user ID
  // ユーザーIDで複数タロットデータ削除
  deleteManyByUserId: async (userObjId) => {
    try {
      const result = await Tarot?.deleteMany({
        userInfo: userObjId,
      })?.lean();
      return result;
    } catch (err) {
      err.name = commonErrors.tarotDAODeleteManyByUserInfoError;
      throw err;
    }
  },

  // 스프레드 타입으로 복수 타로 데이터 삭제
  // Delete multiple tarot data by spread type
  // スプレッドタイプで複数タロットデータ削除
  deleteManyBySpread: async (spreadInfo) => {
    try {
      const result = await Tarot?.deleteMany({ spreadInfo })?.lean();
      return result;
    } catch (err) {
      err.name = commonErrors.tarotDAODeleteManyBySpreadError;
      throw err;
    }
  },

  // 모든 타로 데이터 삭제
  // Delete all tarot data
  // 全タロットデータ削除
  deleteAll: async () => {
    try {
      const result = await Tarot?.deleteMany({})?.lean();
      return result;
    } catch (err) {
      err.name = commonErrors.tarotDAODeleteAllError;
      throw err;
    }
  },
};

module.exports = tarotDAO;

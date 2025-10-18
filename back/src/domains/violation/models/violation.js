const mongoose = require("mongoose");
const { Schema } = mongoose;

// Violation 스키마 예시: 위반 기록
// Violation schema example: Violation records
// Violationスキーマ例：違反記録
const violationSchema = new Schema(
  {
    violationName: {
      type: String,
      required: true,
    },
    violationDate: {
      type: Date,
      required: false,
      default: Date.now,
    },
    violationDescription: {
      type: String,
      required: false,
    },
    userInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null,
    },
    // 실제 서비스에서는 추가 필드 포함:
    // In production, additional fields included:
    // 実際のサービスでは追加フィールドを含む：
    // - 환불 관련 정보 (orderId, quantities)
    // - Refund related info (orderId, quantities)
    // - 払い戻し関連情報 (orderId, quantities)
    // - 위반 세부 정보 및 처리 상태
    // - Violation details and processing status
    // - 違反詳細情報および処理状態
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Violation = mongoose.model("Violation", violationSchema);

module.exports = Violation;

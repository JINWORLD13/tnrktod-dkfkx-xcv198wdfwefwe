const mongoose = require("mongoose");
const { Schema } = mongoose;

// Charge 스키마 예시: 결제 정보
// Charge schema example: Payment information
// Chargeスキーマ例：決済情報
const chargeSchema = new Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    orderName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: false,
    },
    method: {
      type: String,
      required: false,
    },
    userInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // 실제 서비스에서는 추가 필드 포함:
    // In production, additional fields included:
    // 実際のサービスでは追加フィールドを含む：
    // - 결제 게이트웨이 정보 (Toss, Google Play)
    // - Payment gateway info (Toss, Google Play)
    // - 決済ゲートウェイ情報 (Toss, Google Play)
    // - 환불 관련 필드 (refund account, status)
    // - Refund related fields (refund account, status)
    // - 払い戻し関連フィールド (refund account, status)
    // - 결제 상품 정보 (productId, vouchers)
    // - Payment product info (productId, vouchers)
    // - 決済商品情報 (productId, vouchers)
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 중복 결제 방지
// Duplicate payment prevention
// 重複決済防止
chargeSchema.index({ userInfo: 1, orderId: 1 }, { unique: true });

const Charge = mongoose.model("Charge", chargeSchema);

module.exports = Charge;

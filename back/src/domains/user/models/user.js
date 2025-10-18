const { Schema } = require("mongoose");
const mongoose = require("mongoose");

// User 스키마 예시: Google OAuth 사용자 정보
// User schema example: Google OAuth user info
// Userスキーマ例：Google OAuthユーザー情報
const userSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
    },
    profilePictureUrl: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: false,
      default: "user",
    },
    // 실제 서비스에서는 추가 필드 포함:
    // In production, additional fields included:
    // 実際のサービスでは追加フィールドを含む：
    // - 결제 정보 (vouchers, payment history)
    // - Payment info (vouchers, payment history)
    // - 決済情報 (vouchers, payment history)
    // - 사용자 등급 (membership tiers)
    // - User tiers (membership tiers)
    // - ユーザーランク (membership tiers)
    // - 보안 관련 필드 (tokens, violations)
    // - Security fields (tokens, violations)
    // - セキュリティフィールド (tokens, violations)
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// 이메일 유니크 인덱스
// Email unique index
// メールユニークインデックス
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
module.exports = User;

// address: {
//   type: new Schema(
//     {
//       postalCode: String,
//       address1: String,
//       address2: String,
//     },
//     {
//       _id: false,
//     }
//   ),
//   required: false,
// },

// {
//   collection: "users",
//   timestamps: true,
//   versionKey : false,
// }

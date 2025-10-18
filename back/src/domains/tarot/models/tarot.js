const { Schema } = require("mongoose");
const mongoose = require("mongoose");

// Tarot 스키마 예시: AI 타로 상담
// Tarot schema example: AI tarot consultation
// Tarotスキーマ例：AIタロット相談
const tarotSchema = new Schema(
  {
    questionInfo: {
      question: { type: String, required: false },
      theme: { type: String, required: false },
      // 실제 서비스에서는 더 많은 질문 구조화 필드 포함
      // In production, more structured question fields included
      // 実際のサービスではより多くの質問構造化フィールドを含む
    },
    spreadInfo: {
      spreadTitle: { type: String, required: true },
      cardCount: { type: Number, required: true },
      selectedTarotCardsArr: { type: Array, required: true },
    },
    answer: {
      type: String,
      required: false,
      default: "",
    },
    type: {
      type: String,
      required: true,
    },
    userInfo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // 실제 서비스에서는 추가 필드 포함:
    // In production, additional fields included:
    // 実際のサービスでは追加フィールドを含む：
    // - 상세 질문 구조 (주제, 대상, 관계, 상황 등)
    // - Detailed question structure (topic, subject, relationship, situation, etc.)
    // - 詳細な質問構造 (トピック、対象、関係、状況など)
    // - 스프레드 상세 정보
    // - Spread detailed info
    // - スプレッド詳細情報
    // - AI 모델 및 언어 정보
    // - AI model and language info
    // - AIモデルおよび言語情報
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Tarot = mongoose.model("Tarot", tarotSchema);
module.exports = Tarot;

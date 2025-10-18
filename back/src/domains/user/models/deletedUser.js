const { Schema } = require("mongoose");
const mongoose = require("mongoose");

// Deleted User 스키마: 삭제된 사용자 감사 추적
// Deleted User schema: audit trail for deleted users
// Deleted Userスキーマ：削除されたユーザーの監査追跡
const deletedUserSchema = new Schema(
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
    userAgent: {
      type: Object,
      required: false,
      default: {
        deviceType: "",
        os: "",
        browser: "",
        login: "",
      },
    },
    ipAdd: {
      type: String,
      required: false,
      default: "",
    },
    adsFreePass: {
      type: Object,
      required: false,
    },
    vouchersInDetail: {
      type: Object,
      required: false,
      default: {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
        8: [],
        9: [],
        10: [],
        11: [],
        13: [],
      },
    },
    vouchers: {
      type: Object,
      required: false,
      default: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0,
        11: 0,
        13: 0,
      },
    },
    accessToken: {
      type: String,
      required: false,
    },
    refreshToken: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: false,
      default: "user",
    },
    isOldUser: {
      type: Boolean,
      required: false,
      default: false,
    },
    isInViolation: {
      type: Boolean,
      required: false,
      default: false,
    },
    violationsInDetail: {
      type: Array,
      required: false,
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// TTL 인덱스 1: 신규 사용자 1개월 후 삭제
// TTL index 1: delete new users after 1 month
// TTLインデックス1：新規ユーザーを1ヶ月後に削除
deletedUserSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 2628000,
    partialFilterExpression: {
      role: "user",
      isOldUser: false,
    },
    name: "expire_after_1_month_deletedUser",
  }
);

// TTL 인덱스 2: 이용권 없는 사용자 5분 후 삭제
// TTL index 2: delete users without vouchers after 5 minutes
// TTLインデックス2：利用券のないユーザーを5分後に削除
deletedUserSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 300,
    partialFilterExpression: {
      "adsFreePass.name": "",
      "adsFreePass.expired": "",
      "vouchers.1": 0,
      "vouchers.2": 0,
      "vouchers.3": 0,
      "vouchers.4": 0,
      "vouchers.5": 0,
      "vouchers.6": 0,
      "vouchers.7": 0,
      "vouchers.8": 0,
      "vouchers.9": 0,
      "vouchers.10": 0,
      "vouchers.11": 0,
      "vouchers.13": 0,
      isOldUser: false,
    },
    name: "expire_after_5_minutes_deletedUser",
  }
);
// Mongoose 모델을 생성하고, 해당 모델을 외부에서 사용할 수 있도록 모듈로 내보냄(module.exports = xxx)
// Mongoose에서 'users'라는 컬렉션의 모델을 생성(소문자됨)
const DeletedUser = mongoose.model("DeletedUser", deletedUserSchema);
module.exports = DeletedUser;

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

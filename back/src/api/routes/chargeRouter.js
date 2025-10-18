const chargeRouter = require("express").Router();
const { chargeController } = require("../../domains/charge/controllers/index");
const checkTokenWithRefresh = require("../middlewares/checkTokenWithRefresh");

// Charge 라우터: Toss Payments, Google Play 결제/환불
// Charge router: Toss Payments, Google Play payment/refund
// Chargeルーター：Toss Payments、Google Play決済/払い戻し

const CHARGE_PATHS = {
  tossPrePayment: process.env.CHARGE_TOSS_PRE_PAYMENT_PATH,
  tossPrePaymentByPaymentKey:
    process.env.CHARGE_TOSS_PRE_PAYMENT_BY_PAYMENT_KEY_PATH,
  tossPaymentConfirm: process.env.CHARGE_TOSS_PAYMENT_CONFIRM_PATH,
  tossPaymentCancelPart: process.env.CHARGE_TOSS_PAYMENT_CANCEL_PART_PATH,
  googlePlayPayment: process.env.CHARGE_GOOGLE_PLAY_PAYMENT_PATH,
  purchaseLimit: process.env.CHARGE_PURCHASE_LIMIT_PATH,
  tossWebhook: process.env.TOSS_WEBHOOK_SECRET_PATH,
  googlePlayWebhook: process.env.GOOGLE_WEBHOOK_SECRET_PATH,
};

chargeRouter.post(
  CHARGE_PATHS.tossPrePayment,
  checkTokenWithRefresh,
  chargeController.postPrePaymentForToss
);

chargeRouter.get(
  CHARGE_PATHS.tossPrePayment,
  checkTokenWithRefresh,
  chargeController.getPrePaymentForToss
);

chargeRouter.delete(
  CHARGE_PATHS.tossPrePayment,
  checkTokenWithRefresh,
  chargeController.deletePrePaymentForTossByOrderId
);

chargeRouter.delete(
  CHARGE_PATHS.tossPrePaymentByPaymentKey,
  checkTokenWithRefresh,
  chargeController.deletePrePaymentForTossByPaymentKey
);

chargeRouter.put(
  CHARGE_PATHS.tossPrePayment,
  checkTokenWithRefresh,
  chargeController.putPrePaymentForToss
);

chargeRouter.post(
  CHARGE_PATHS.tossPaymentConfirm,
  checkTokenWithRefresh,
  chargeController.postConfirmForToss
);

chargeRouter.post(
  CHARGE_PATHS.tossPaymentCancelPart,
  checkTokenWithRefresh,
  chargeController.postPartialCancelForToss
);

// Toss 웹훅
// Toss webhoo
// Tossウェブフック
chargeRouter.post(
  CHARGE_PATHS.tossWebhook,
  chargeController.postWebHookForToss
);

// Google Play 인앱결제
// Google Play in-app purchase
// Google Playアプリ内購入
chargeRouter.post(
  CHARGE_PATHS.googlePlayPayment,
  checkTokenWithRefresh,
  chargeController.postChargeForGooglePayStore
);

// Google Play 환불 웹훅
// Google Play refund webhoo
// Google Play払い戻しウェブフック
chargeRouter.post(
  CHARGE_PATHS.googlePlayWebhook,
  chargeController.postRefundForGooglePlayStore
);

chargeRouter.get(
  CHARGE_PATHS.purchaseLimit,
  checkTokenWithRefresh,
  chargeController.getPurchaseLimit
);

module.exports = chargeRouter;

// 환불 위반 검증: 중복 환불 시도 감지 및 차단
// Refund violation check: detect and block duplicate refund attempts
// 払い戻し違反検証：重複払い戻し試行を検知してブロック
const checkViolationInGoogleInAppRefund = (res, userInfo) => {
  const limitedCountOfViolations = 3;
  const violations = structuredClone(userInfo?.violationsInDetail) || [];

  if (violations.length >= limitedCountOfViolations) {
    const googleRefundViolations = violations?.filter(
      (elem) => elem[0] === "GoogleInAppRefund"
    );

    if (googleRefundViolations.length >= limitedCountOfViolations) {
      res.status(500).json({
        success: false,
        message: "violated in GoogleInAppRefund",
      });
      return true;
    }
  }

  return false;
};

module.exports = {
  checkViolationInGoogleInAppRefund,
};

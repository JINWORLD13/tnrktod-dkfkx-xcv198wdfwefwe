const { sanitizeObject, buildResponse } = require("../../../common/utils/util");
const AppError = require("../../../common/errors/AppError");
const commonErrors = require("../../../common/errors/commonErrors");
const { chargeService } = require("../services");
const { userService } = require("../../user/services");
const { violationService } = require("../../violation/services");
const axios = require("axios");
const { consoleForReceipt } = require("../../../common/utils/console");
const {
  verifyPurchaseWithGooglePlay,
} = require("../../../api/middlewares/verifyPurchaseWithGooglePlay");
const orderHistoryMaker = require("./utils/orderHistoryMaker");
const orderVouchersArrMaker = require("./utils/orderVouchersArrMaker");
const orderNameMaker = require("./utils/orderNameMaker");
const updatedVouchersInDetailMaker = require("./utils/updatedVouchersInDetailMaker");
const updatedVouchersMaker = require("./utils/updatedVouchersMaker");
const adsFreePassExpiredDateMaker = require("./utils/adsFreePassExpiredDateMaker");
const redisClient = require("../../../cache/redisClient");
const mongoose = require("mongoose");

// Redis 키 관리 헬퍼: 일관된 캐시 키 생성 및 관리
// Redis key management helpers: consistent cache key generation and management
// Redisキー管理ヘルパー：一貫したキャッシュキーの生成と管理
const RedisKeys = {
  userInfo: (userId) => `user:${userId}`,
  requestCount: (orderId) => `refund:count:${orderId}`,
  vouchersForRefund: (orderId) => `refund:vouchers:${orderId}`,
  googleOrderId: () => `refund:google:current`,
  paymentProgress: (userId, orderId) => `payment:progress:${userId}:${orderId}`,
  webhookProcessed: (orderId, status) => `webhook:${orderId}:${status}`,
  purchaseLimit: (productId, userId) => `cache:limit:${productId}:${userId}`,
};

let remainingPercentage = 1 - Number(process.env.CANCEL_PERCENTAGE);

const chargeController = {
  // 구매 제한 확인: 중복 구매 방지를 위한 Redis 캐싱
  // Purchase limit check: Redis caching for duplicate purchase prevention
  // 購入制限確認：重複購入防止のためのRedisキャッシング
  async getPurchaseLimit(req, res, next) {
    const userId = req?.user ?? req?.session?.user?.id ?? null;
    req.user = userId;
    const productId = req.query.productId;

    if (!productId) {
      return res
        .status(400)
        .json({ success: false, message: "Product ID is required" });
    }

    try {
      // Redis 캐시 확인: 성능 최적화
      // Check Redis cache: performance optimization
      // Redisキャッシュ確認：パフォーマンス最適化
      const cacheKey = RedisKeys.purchaseLimit(productId, userId);
      const cachedResult = await redisClient.get(cacheKey);

      if (cachedResult) {
        return res
          .status(200)
          .json({ success: true, purchaseLimit: cachedResult.limit });
      }

      // DB 조회: 캐시 미스 시
      // Query DB: on cache miss
      // DB照会：キャッシュミス時
      const purchaseLimitArr = await chargeService.getChargesByProductId(
        productId
      );
      if (!purchaseLimitArr) {
        return res
          .status(404)
          .json({ success: false, message: "Purchase limit not found" });
      }

      const userInDB = await userService.getUserById(userId);
      const hasUserPurchased = purchaseLimitArr.some((charge) => {
        return charge?.userInfo?.equals(userInDB?._id);
      });

      let OverCountToStopFromPurchasingAgain = hasUserPurchased
        ? 1000000000000000
        : 0;
      let finalLimit;

      if (productId === process.env.PRODUCT_EVENT_PACKAGE) {
        finalLimit =
          purchaseLimitArr?.length + OverCountToStopFromPurchasingAgain;
      } else if (
        productId === process.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_NEWBIE
      ) {
        finalLimit = OverCountToStopFromPurchasingAgain;
      }

      // Redis 캐싱: 1시간 TTL
      // Cache in Redis: 1 hour TTL
      // Redisにキャッシュ：1時間TTL
      await redisClient.set(
        cacheKey,
        { limit: finalLimit, hasUserPurchased },
        3600
      );

      res.status(200).json({ success: true, purchaseLimit: finalLimit });
    } catch (error) {
      console.error("Error fetching purchase limit:", error);
      next(new AppError(error?.message, commonErrors.chargeController, 500));
    }
  },

  // 사전 결제: 중복 결제 방지를 위한 Redis 락 메커니즘
  // Pre-payment: Redis lock mechanism to prevent duplicate payments
  // 事前決済：重複決済防止のためのRedisロック機構
  async postPrePaymentForToss(req, res, next) {
    try {
      const userId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = userId;

      if (!req?.isAuthenticated()) {
        return next(
          new AppError(
            commonErrors.chargeControllerPostPrePaymentForTossError,
            commonErrors.userInfoNotFoundError,
            404
          )
        );
      }

      const {
        orderId,
        paymentKey,
        orderName,
        orderHistory,
        orderVouchersArr,
        amount,
        currency,
        country,
        method,
        apiName,
      } = req.body;

      if (!orderId) return;

      // Redis 기반 중복 결제 검증
      // Redis-based duplicate payment verification
      // Redisベースの重複決済検証
      const progressKey = RedisKeys.paymentProgress(userId, orderId);
      const isInProgress = await redisClient.exists(progressKey);

      if (isInProgress) {
        return res.status(200).json({
          success: false,
          message: "Payment already in progress.",
          status: "in_progress",
          orderId,
          action: "check_status",
        });
      }

      // 결제 진행 상태 Lock: 1분 TTL
      // Payment progress lock: 1 minute TTL
      // 決済進行状態ロック：1分TTL
      await redisClient.set(progressKey, "in_progress", 60);

      try {
        const userInDB = await userService.getUserById(userId);

        let createdChargeInfo;
        const chargeData = {
          orderId,
          paymentKey,
          orderName,
          orderHistory,
          orderVouchers: orderVouchersArr,
          amount,
          currency,
          country,
          method,
          apiName,
          userInfo: userInDB,
        };

        if (method === "가상계좌") {
          chargeData.refundReceiveAccount = {
            bank: "XX",
            accountNumber: "XXXXXXXXX",
            holderName: "XXX",
          };
        }

        createdChargeInfo = await chargeService.createChargeForTossPrePayment(
          chargeData
        );

        // 성공 시 Lock 해제
        // Release lock on success
        // 成功時にロック解除
        await redisClient.del(progressKey);

        res.status(200).json({
          success: true,
          message: "PrePayment for Toss processed successfully",
          createdChargeInfo,
        });
      } catch (error) {
        // 에러 시 Lock 해제
        // Release lock on error
        // エラー時にロック解除
        await redisClient.del(progressKey);
        throw error;
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      res
        .status(500)
        .json({ success: false, message: "Payment processing failed" });
    }
  },

  async getPrePaymentForToss(req, res, next) {
    try {
      const userId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = userId;
      if (req?.isAuthenticated() === true) {
        const orderId = req?.query?.orderId ?? null;
        if (orderId === null || orderId === undefined) {
          return;
        }

        const chargeInDB = await chargeService.getChargeByOrderId(orderId);
        res.status(200).json({
          chargeInfo: chargeInDB,
        });
      } else {
        next(
          new AppError(
            commonErrors.chargeControllerGetPrePaymentForTossError,
            commonErrors.userInfoNotFoundError,
            404
          )
        );
      }
    } catch (error) {
      console.error("Error fetching pre-payment Info:", error);
      next(new AppError(error?.message, commonErrors.chargeController, 404));
    }
  },

  async deletePrePaymentForTossByOrderId(req, res, next) {
    try {
      const userId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = userId;
      if (req?.isAuthenticated() === true) {
        const orderId = req?.body?.orderId;
        if (orderId === "" || orderId === undefined) return;
        await chargeService.deleteChargeByOrderId(orderId);
        res.status(200).json({ success: true });
      } else {
        next(
          new AppError(
            commonErrors.chargeControllerDeletePrePaymentForTossByOrderIdError,
            commonErrors.userInfoNotFoundError,
            404
          )
        );
      }
    } catch (error) {
      console.error("Error deleting pre-payment Info:", error);
      res
        .status(500)
        .json({ success: false, message: "Deleting Pre-Payment Info failed" });
    }
  },

  async deletePrePaymentForTossByPaymentKey(req, res, next) {
    try {
      const userId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = userId;
      if (req?.isAuthenticated() === true) {
        const paymentKey = req?.body?.paymentKey;
        if (paymentKey === "" || paymentKey === undefined) return;
        const userInDB = await userService.getUserById(userId);
        const userObjId = userInDB._id;
        await chargeService.deleteChargeByUserObjIdAndPaymentKey(
          userObjId,
          paymentKey
        );
        res.status(200).json({ success: true });
      } else {
        next(
          new AppError(
            commonErrors.chargeControllerDeletePrePaymentForTossByPaymentKeyError,
            commonErrors.userInfoNotFoundError,
            404
          )
        );
      }
    } catch (error) {
      console.error("Error deleting pre-payment Info:", error);
      res
        .status(500)
        .json({ success: false, message: "Deleting Pre-Payment Info failed" });
    }
  },

  async putPrePaymentForToss(req, res, next) {
    try {
      const userId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = userId;
      if (req?.isAuthenticated() === true) {
        const { orderId, paymentKey } = req.body;
        if (orderId === undefined || orderId === "") return;

        const chargeInDB = await chargeService.getChargeByOrderId(orderId);

        await chargeService.putChargeByOrderId(orderId, {
          paymentKey,
          orderHistory: {
            ...Object.fromEntries(
              Object.entries(chargeInDB?.orderHistory).map(
                ([key, valueOfArray]) => {
                  valueOfArray[5] = chargeInDB.createdAt;
                  valueOfArray[8] = chargeInDB.paymentKey;
                  return [key, valueOfArray];
                }
              )
            ),
          },
        });

        const userInDB = await userService.getUserById(req.user);

        await chargeController.updateUserVouchersInDetail(
          orderId,
          chargeInDB,
          userInDB
        );

        res.status(200).json({ success: true });
      } else {
        next(
          new AppError(
            commonErrors.chargeControllerPutPrePaymentForTossError,
            commonErrors.userInfoNotFoundError,
            404
          )
        );
      }
    } catch (error) {
      console.error("Error putting pre-payment Info:", error);
      res
        .status(500)
        .json({ success: false, message: "Putting Pre-Payment Info failed" });
    }
  },

  // Toss Payments 웹훅: 결제 상태 변경 이벤트 처리
  // Toss Payments webhook: handles payment status change events
  // Toss Paymentsウェブフック：決済ステータス変更イベント処理
  async postWebHookForToss(req, res, next) {
    const status = req?.body?.data?.status;
    const orderId = req?.body?.data?.orderId;

    if (!orderId) return res.status(200).end();

    // 웹훅 중복 처리 방지: Idempotency 보장
    // Prevent duplicate webhook processing: ensures idempotency
    // ウェブフック重複処理防止：べき等性を保証
    const webhookKey = RedisKeys.webhookProcessed(orderId, status);
    const isProcessed = await redisClient.exists(webhookKey);

    if (isProcessed) {
      // console.log(`Webhook already processed: ${orderId}_${status}`);
      return res.status(200).json({ message: "Already processed" });
    }

    // 웹훅 처리 마킹: 1시간 TTL
    // Mark webhook as processed: 1 hour TTL
    // ウェブフック処理マーキング：1時間TTL
    await redisClient.set(webhookKey, "processed", 3600);

    if (process.env.NODE_ENV === "DEVELOPMENT") {
      // console.log("웹훅 호출 시 status: ", status);
      // console.log("웹훅 호출 시 method: ", req?.body?.data?.method);
    }

    const chargeInDB = await chargeService.getChargeByOrderId(orderId);
    if (!chargeInDB) return res.status(200).end();

    const userObjId = chargeInDB?.userInfo;
    const orderVouchers = chargeInDB?.orderVouchers;
    const userInDB = await userService.getUserByObjId(userObjId);

    const vouchers = userInDB?.vouchers;

    // 결제 방식에 따른 웹훅 처리 분기
    // Webhook processing branch based on payment method
    // 決済方式によるウェブフック処理分岐
    if (req?.body?.data && req?.body?.data?.method !== "가상계좌") {
      return await chargeController.handleNonVirtualAccountWebhook(req, res, {
        status,
        orderId,
        chargeInDB,
        userInDB,
        vouchers,
      });
    }

    // 가상계좌 결제: 입금 확인 후 처리
    // Virtual account payment: process after deposit confirmation
    // 仮想口座決済：入金確認後に処理
    return await chargeController.handleVirtualAccountWebhook(req, res, {
      status,
      orderId,
      chargeInDB,
      userInDB,
      vouchers,
      orderVouchers,
    });
  },

  // 일반 결제 웹훅: 카드/간편결제 등
  // Regular payment webhook: card/simple payment etc.
  // 一般決済ウェブフック：カード/簡単決済など
  async handleNonVirtualAccountWebhook(
    req,
    res,
    { status, orderId, chargeInDB, userInDB, vouchers }
  ) {
    switch (status) {
      case "DONE":
        return await chargeController.handlePaymentDone(req, res, {
          orderId,
          chargeInDB,
          userInDB,
        });

      case "CANCELED":
        return await chargeController.handlePaymentCanceled(req, res, {
          orderId,
          userInDB,
          vouchers,
        });

      case "PARTIAL_CANCELED":
        return await chargeController.handlePartialCanceled(req, res, {
          orderId,
          userInDB,
          vouchers,
        });

      default:
        return res.status(200).end();
    }
  },

  // 가상계좌 웹훅: 입금 대기 및 확인 상태 관리
  // Virtual account webhook: manages deposit waiting and confirmation status
  // 仮想口座ウェブフック：入金待機と確認ステータス管理
  async handleVirtualAccountWebhook(
    req,
    res,
    { status, orderId, chargeInDB, userInDB, vouchers, orderVouchers }
  ) {
    switch (status) {
      case "DONE":
        return await chargeController.handleVirtualAccountDone(req, res, {
          orderId,
          chargeInDB,
          userInDB,
          vouchers,
          orderVouchers,
        });

      case "CANCELED":
        if (chargeInDB.apiName === "Toss") {
          return await chargeController.handlePaymentCanceled(req, res, {
            orderId,
            userInDB,
            vouchers,
          });
        } else {
          await chargeService.deleteChargeByOrderId(orderId);
          return res.status(200).json({ status });
        }

      case "PARTIAL_CANCELED":
        return await chargeController.handlePartialCanceled(req, res, {
          orderId,
          userInDB,
          vouchers,
        });

      default:
        return res.status(200).end();
    }
  },

  // 결제 완료 처리: MongoDB 트랜잭션으로 데이터 일관성 보장
  // Payment completion: ensures data consistency with MongoDB transactions
  // 決済完了処理：MongoDBトランザクションでデータ一貫性を保証
  async handlePaymentDone(req, res, { orderId, chargeInDB, userInDB }) {
    if (process.env.NODE_ENV === "DEVELOPMENT") console.log("결제 완료 처리");

    // MongoDB 트랜잭션: 원자성 보장
    // MongoDB transaction: ensures atomicity
    // MongoDBトランザクション：原子性を保証
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        await chargeService.putChargeByOrderId(
          orderId,
          {
            apiName: "Toss",
            orderHistory: {
              ...Object.fromEntries(
                Object.entries(chargeInDB.orderHistory).map(
                  ([key, valueOfArray]) => {
                    valueOfArray[5] = chargeInDB.createdAt;
                    valueOfArray[8] = chargeInDB.paymentKey;
                    return [key, valueOfArray];
                  }
                )
              ),
            },
          },
          session
        );

        await chargeController.updateUserVouchersInDetail(
          orderId,
          chargeInDB,
          userInDB,
          session
        );

        // 트랜잭션 성공 후 캐시 삭제
        await redisClient.del(RedisKeys.userInfo(userInDB.id));
      });
    } finally {
      await session.endSession();
    }

    return res.status(200).json({ success: true });
  },

  // 가상계좌 입금 완료: 바우처 지급 및 상태 업데이트
  // Virtual account deposit completed: issue vouchers and update status
  // 仮想口座入金完了：バウチャー支給とステータス更新
  async handleVirtualAccountDone(
    req,
    res,
    { orderId, chargeInDB, userInDB, vouchers, orderVouchers }
  ) {
    // MongoDB 트랜잭션 시작
    // Start MongoDB transaction
    // MongoDBトランザクション開始
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        let updatedVouchersInDetail = Object.fromEntries(
          Object.entries(chargeInDB?.orderHistory).map(
            ([key, valueOfArray]) => {
              let vouchersInDetailOfUser;
              if (
                !userInDB?.vouchersInDetail ||
                !userInDB?.vouchersInDetail[key]
              ) {
                vouchersInDetailOfUser = { [key]: [] };
              } else {
                vouchersInDetailOfUser = userInDB?.vouchersInDetail;
              }
              const doubleArray = [...vouchersInDetailOfUser?.[key]] || [];
              doubleArray.push(valueOfArray);
              return [key, doubleArray];
            }
          )
        );

        let updatedVouchers = { ...vouchers };
        orderVouchers?.forEach((elem) => {
          const key = elem?.[0];
          updatedVouchers[key] = vouchers?.[key] + elem[1];
        });

        await userService.updateUser(
          {
            ...userInDB,
            vouchersInDetail: {
              ...userInDB?.vouchersInDetail,
              ...updatedVouchersInDetail,
            },
            vouchers: { ...updatedVouchers },
          },
          session
        );

        await chargeService.putChargeByOrderId(
          orderId,
          {
            apiName: "Toss",
            orderHistory: {
              ...Object.fromEntries(
                Object.entries(chargeInDB.orderHistory).map(
                  ([key, valueOfArray]) => {
                    valueOfArray[5] = chargeInDB.createdAt;
                    valueOfArray[8] = chargeInDB.paymentKey;
                    return [key, valueOfArray];
                  }
                )
              ),
            },
          },
          session
        );

        await chargeController.updateUserVouchersInDetail(
          orderId,
          chargeInDB,
          userInDB,
          session
        );

        // 트랜잭션 성공 후 캐시 삭제
        await redisClient.del(RedisKeys.userInfo(userInDB.id));
      });
    } finally {
      await session.endSession();
    }

    return res.status(200).json({ success: true });
  },

  // 전액 환불 처리: Redis 카운터로 중복 방지
  // Full refund processing: prevents duplicates with Redis counter
  // 全額払い戻し処理：Redisカウンターで重複防止
  async handlePaymentCanceled(req, res, { orderId, userInDB, vouchers }) {
    const countKey = RedisKeys.requestCount(orderId);
    const requestCount = (await redisClient.get(countKey)) || 0;

    if (requestCount === 0) {
      return res.status(200).json({});
    }

    if (process.env.NODE_ENV === "DEVELOPMENT") {
      console.log("전액 취소 웹훅 진입, requestCount:", requestCount);
    }

    if (requestCount === 1) {
      const vouchersKey = RedisKeys.vouchersForRefund(orderId);
      const vouchersObjForRefund = (await redisClient.get(vouchersKey)) || {};

      if (Object.keys(vouchersObjForRefund).length === 0) {
        return res.status(200).json({});
      }

      await chargeController.processRefundVouchers(
        userInDB,
        vouchersObjForRefund,
        orderId,
        req
      );

      // Redis 정리
      await redisClient.del(countKey);
      await redisClient.del(vouchersKey);
    }

    // 카운트 감소
    if (requestCount > 1) {
      await redisClient.set(countKey, requestCount - 1, 3600);
    } else {
      await redisClient.del(countKey);
    }

    return res.status(200).json({});
  },

  // 부분 환불 처리: 선택적 바우처 환불
  // Partial refund processing: selective voucher refund
  // 部分払い戻し処理：選択的バウチャー払い戻し
  async handlePartialCanceled(req, res, { orderId, userInDB, vouchers }) {
    const countKey = RedisKeys.requestCount(orderId);
    const requestCount = (await redisClient.get(countKey)) || 0;

    if (requestCount === 0) {
      return res.status(200).json({});
    }

    if (process.env.NODE_ENV === "DEVELOPMENT") {
      console.log("부분 취소 웹훅 진입, requestCount:", requestCount);
    }

    if (requestCount === 1) {
      const vouchersKey = RedisKeys.vouchersForRefund(orderId);
      const vouchersObjForRefund = (await redisClient.get(vouchersKey)) || {};

      if (Object.keys(vouchersObjForRefund).length === 0) {
        return res.status(200).json({});
      }

      await chargeController.processRefundVouchers(
        userInDB,
        vouchersObjForRefund,
        orderId,
        req
      );

      // Redis 정리
      await redisClient.del(countKey);
      await redisClient.del(vouchersKey);
    }

    // 카운트 감소
    if (requestCount > 1) {
      await redisClient.set(countKey, requestCount - 1, 3600);
    } else {
      await redisClient.del(countKey);
    }

    return res.status(200).json({});
  },

  // 환불 바우처 처리: 사용자 바우처 차감 및 트랜잭션 보장
  // Process refund vouchers: deduct user vouchers with transaction guarantee
  // 払い戻しバウチャー処理：ユーザーバウチャー減額とトランザクション保証
  async processRefundVouchers(userInDB, vouchersObjForRefund, orderId, req) {
    // MongoDB 트랜잭션으로 데이터 무결성 보장
    // Ensure data integrity with MongoDB transaction
    // MongoDBトランザクションでデータ整合性を保証
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        let updatedVouchers = { ...userInDB.vouchers };

        const keysArr = Object.keys(vouchersObjForRefund);
        const vouchersArrForRefund = keysArr.map((key) => {
          let total = 0;
          vouchersObjForRefund[key]?.forEach((arr) => {
            total += arr[0];
          });
          return [key, total];
        });

        vouchersArrForRefund.forEach((voucher) => {
          const key = voucher[0];
          const newValue = updatedVouchers[key] - voucher[1];
          updatedVouchers[key] = newValue < 0 ? 0 : newValue;
        });

        const updatedVouchersInDetail =
          chargeController.updateVouchersInDetailForRefund(
            userInDB.vouchersInDetail,
            vouchersObjForRefund
          );

        await userService.updateUser(
          {
            ...userInDB,
            vouchersInDetail: {
              ...userInDB.vouchersInDetail,
              ...updatedVouchersInDetail,
            },
            vouchers: updatedVouchers,
          },
          session
        );

        // 환불 가능 금액 확인 후 Charge 삭제 여부 결정
        // Determine Charge deletion based on refundable amount check
        // 払い戻し可能金額確認後、Charge削除可否を決定
        const minimumRefundableLimit =
          chargeController.calculateMinimumRefundableLimit(req);
        const remainingAmount =
          chargeController.getRemainingRefundableAmount(req);

        if (req?.body?.data?.cancels?.length > 0) {
          if (remainingAmount <= minimumRefundableLimit) {
            await chargeService.deleteChargeByOrderId(orderId, session);
          }
        }

        // 트랜잭션 성공 후 캐시 삭제
        await redisClient.del(RedisKeys.userInfo(userInDB.id));
      });
    } finally {
      await session.endSession();
    }
  },

  // Deprecated: 하위 호환성을 위해 유지
  // Deprecated: kept for backward compatibility
  // 非推奨：下位互換性のために維持
  async handleRefundCompletion(req, orderId) {},

  // Toss Payments 결제 승인: 최종 결제 확정
  // Toss Payments payment confirmation: final payment approval
  // Toss Payments決済承認：最終決済確定
  async postConfirmForToss(req, res, next) {
    const userId = req?.user ?? req?.session?.user?.id ?? null;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized: User ID not found" });
    }
    req.user = userId;
    const { paymentKey, orderId, amount } = req.body;
    if (!paymentKey || !orderId || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    try {
      // 결제 진행 상태 확인
      const paymentProgressKey = RedisKeys.paymentProgress(userId, orderId);
      const isProcessing = await redisClient.get(paymentProgressKey);
      if (isProcessing === "processing") {
        // console.log(`Payment already completed for orderId: ${orderId}`);
        return res.status(200).json({
          success: true,
          message: "결제가 이미 완료되었습니다",
          status: "completed",
          orderId,
          action: "redirect_to_success",
        });
      }
      if (isProcessing === "completed") {
        // console.log(`Payment already processed for paymentKey: ${paymentKey}`);
        await redisClient.set(paymentProgressKey, "completed", 3600);
        return res.status(200).json({
          success: true,
          message: "결제가 이미 완료되었습니다",
          status: "completed",
          orderId,
          action: "redirect_to_success",
        });
      }

      // Toss Payments 결제 상태 확인
      const checkPaymentStatus = async (paymentKey) => {
        try {
          const response = await axios.get(
            `https://api.tosspayments.com/v1/payments/${paymentKey}`,
            {
              headers: {
                Authorization: `Basic ${Buffer.from(
                  `${process.env.TOSS_SECRET_KEY}:`
                ).toString("base64")}`,
                "Content-Type": "application/json",
              },
            }
          );
          return (
            response.data.status === "DONE" ||
            response.data.status === "CANCELED"
          );
        } catch (error) {
          console.error("Error checking payment status:", error);
          return false;
        }
      };

      const isAlreadyProcessed = await checkPaymentStatus(paymentKey);
      if (isAlreadyProcessed) {
        // console.log(`Payment already processed for paymentKey: ${paymentKey}`);
        await redisClient.set(paymentProgressKey, "completed", 3600);
        return res
          .status(400)
          .json({ success: false, message: "Payment already processed" });
      }

      // 결제 진행 상태 설정
      await redisClient.set(paymentProgressKey, "processing", 300);

      const chargeInfo = await chargeService.getChargeByOrderId(orderId);
      if (!chargeInfo) {
        await redisClient.del(paymentProgressKey);
        return res
          .status(404)
          .json({ success: false, message: "Charge not found" });
      }

      let widgetSecretKey;
      if (
        chargeInfo?.orderHistory?.[
          Object.keys(chargeInfo?.orderHistory)?.[0]
        ]?.[7] === "KRW"
      ) {
        widgetSecretKey = process.env.TOSS_SECRET_KEY;
      } else if (
        chargeInfo?.orderHistory?.[
          Object.keys(chargeInfo?.orderHistory)?.[0]
        ]?.[7] === "USD"
      ) {
        widgetSecretKey = process.env.TOSS_SECRET_KEY_FOR_PAYPAL;
      }

      const encryptedSecretKey = `Basic ${Buffer.from(
        `${widgetSecretKey}:`
      ).toString("base64")}`;
      const idempotencyKey = `${orderId}-${paymentKey}`;

      // console.log(
      //   `Sending Toss payment confirm request: ${orderId}, ${paymentKey}`
      // );
      const response = await axios.post(
        process.env.TOSS_CONFIRM_URL,
        { orderId, amount, paymentKey },
        {
          headers: {
            Authorization: encryptedSecretKey,
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          responseType: "json",
        }
      );

      if (chargeInfo?.method === "가상계좌") {
        const refundReceiveAccount =
          response?.data?.virtualAccount?.refundReceiveAccount || {};
        await chargeService.putChargeByOrderId(orderId, {
          paymentKey,
          refundReceiveAccount: {
            bank: refundReceiveAccount?.bankCode || refundReceiveAccount?.bank,
            accountNumber: refundReceiveAccount?.accountNumber,
            holderName: refundReceiveAccount?.holderName,
          },
          apiName: "Toss(미입금상태)",
        });
        await redisClient.del(RedisKeys.userInfo(userId));
      } else {
        // 🚀 일반 결제: 트랜잭션으로 User 업데이트 보호
        const session = await mongoose.startSession();
        try {
          await session.withTransaction(async () => {
            const { orderHistory, orderVouchers } =
              await chargeService.getChargeByOrderId(orderId);
            const userInDB = await userService.getUserById(userId);
            if (!userInDB) {
              await redisClient.del(paymentProgressKey);
              throw new Error("User not found");
            }

            let updatedVouchersInDetail = Object.fromEntries(
              Object.entries(orderHistory).map(([key, valueOfArray]) => {
                const vouchersInDetailOfUser =
                  userInDB?.vouchersInDetail?.[key] || [];
                const doubleArray = [...vouchersInDetailOfUser];
                doubleArray.push(valueOfArray);
                return [key, doubleArray];
              })
            );

            const vouchers = userInDB.vouchers || {};
            let updatedVouchers = { ...vouchers };
            orderVouchers?.forEach((elem) => {
              if (elem) {
                const key = elem[0];
                updatedVouchers[key] = (vouchers[key] || 0) + elem[1];
              }
            });

            const updatedUserInfo = await userService.updateUser(
              {
                ...userInDB,
                vouchersInDetail: {
                  ...userInDB?.vouchersInDetail,
                  ...updatedVouchersInDetail,
                },
                vouchers: { ...updatedVouchers },
              },
              session
            );

            // 트랜잭션 성공 후 캐시 업데이트
            await redisClient.set(
              RedisKeys.userInfo(userId),
              updatedUserInfo,
              3600
            );
          });
        } finally {
          await session.endSession();
        }
      }

      // 결제 성공 시 상태 업데이트
      await redisClient.set(paymentProgressKey, "completed", 3600);
      res.status(200).json({ success: true, data: response.data });
    } catch (error) {
      console.error("Error in postConfirmForToss:", error);
      await redisClient.del(RedisKeys.paymentProgress(userId, orderId));
      if (error.response?.data?.code === "ALREADY_PROCESSED_PAYMENT") {
        await redisClient.set(
          RedisKeys.paymentProgress(userId, orderId),
          "completed",
          3600
        );
        return res
          .status(400)
          .json({ success: false, message: "Payment already processed" });
      }
      res.status(error.response?.status || 500).json({
        success: false,
        message: error.response?.data?.message || "Payment confirmation failed",
      });
    }
  },

  // 부분환불 (Redis 활용)
  async postPartialCancelForToss(req, res, next) {
    const userId = req?.user ?? req?.session?.user?.id ?? null;
    req.user = userId;
    await redisClient.del(RedisKeys.userInfo(userId));

    const vouchersArrForRefund = Object.values(req.body)?.flat(1);

    if (!vouchersArrForRefund?.length || !vouchersArrForRefund[0]?.length) {
      return res.status(200).json({ message: "nothing" });
    }

    const orderId = vouchersArrForRefund[0][4];

    // Redis에 환불 상태 설정
    const countKey = RedisKeys.requestCount(orderId);
    const vouchersKey = RedisKeys.vouchersForRefund(orderId);

    await redisClient.set(countKey, vouchersArrForRefund.length, 3600);

    let filteredObj = {};
    const cancelPromises = vouchersArrForRefund.map(async (voucher, index) => {
      const orderId = voucher[4];
      const paymentKey = voucher[8];
      const listPrice = voucher[1];
      const quantity = voucher[0];
      const payMethod = voucher[9];
      const totalAmount = quantity * listPrice;
      const cancelAmount =
        Math.round(totalAmount * Number(process.env.CANCEL_PERCENTAGE) * 100) /
        100;
      const currency = voucher[7];
      let cancelOption;

      // 환불 대상 이용권 필터링
      filteredObj = {
        ...filteredObj,
        ...Object.fromEntries(
          Object.entries(req.body)
            .map(([key, valueArray]) => [
              key,
              (filteredObj?.[key] || []).concat(
                valueArray?.filter(
                  (value) =>
                    value?.[4] === orderId &&
                    value?.[8] === paymentKey &&
                    value?.[0] === quantity &&
                    value?.[1] === listPrice
                )
              ),
            ])
            ?.filter(([_, filteredArray]) => filteredArray?.length > 0)
        ),
      };

      if (payMethod !== "가상계좌") {
        if (currency === "KRW") {
          cancelOption = {
            cancelReason: "고객이 취소를 원함.",
            cancelAmount: cancelAmount,
          };
        } else if (currency === "USD") {
          cancelOption = {
            cancelReason: "The customer has asked to cancel.",
            cancelAmount: cancelAmount,
            currency: currency,
          };
        }
      } else {
        const chargeInfo = await chargeService.getChargeByOrderId(orderId);
        const refundReceiveAccount = chargeInfo?.refundReceiveAccount;
        cancelOption = {
          cancelReason: "고객이 취소를 원함.",
          cancelAmount: cancelAmount,
          refundReceiveAccount: { ...refundReceiveAccount },
        };
      }

      const widgetSecretKey =
        currency === "KRW"
          ? process.env.TOSS_SECRET_KEY
          : process.env.TOSS_SECRET_KEY_FOR_PAYPAL;
      const encryptedSecretKey =
        "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

      // 요청 간격 조절
      await new Promise((resolve) => setTimeout(resolve, index * 1500));

      try {
        const response = await axios.post(
          `${process.env.TOSS_CANCEL_URL}/${paymentKey}/cancel`,
          cancelOption,
          {
            headers: {
              Authorization: encryptedSecretKey,
              "Content-Type": "application/json",
            },
          }
        );

        if (process.env.NODE_ENV === "DEVELOPMENT") {
          console.log(`환불 성공(금액: ${cancelAmount})`);
        }

        return { success: true, response };
      } catch (error) {
        if (process.env.NODE_ENV === "DEVELOPMENT") {
          console.log(
            `환불 실패(금액: ${cancelAmount})`,
            error?.response?.data
          );
        }

        // 실패 시 카운트 감소
        const currentCount = (await redisClient.get(countKey)) || 0;
        if (currentCount > 0) {
          await redisClient.set(countKey, currentCount - 1, 3600);
        }

        // 실패한 항목을 filteredObj에서 제거
        filteredObj = {
          ...Object.fromEntries(
            Object.entries(filteredObj)
              .map(([key, valueArray]) => [
                key,
                valueArray?.filter(
                  (value) =>
                    !(
                      value?.[4] === orderId &&
                      value?.[8] === paymentKey &&
                      value?.[0] === quantity &&
                      value?.[1] === listPrice
                    )
                ),
              ])
              ?.filter(([_, filteredArray]) => filteredArray?.length > 0)
          ),
        };

        return { success: false, error };
      }
    });

    try {
      const results = await Promise.all(cancelPromises);

      // 최종 환불 대상 정보를 Redis에 저장
      await redisClient.set(vouchersKey, filteredObj, 3600);

      const successResults = results?.filter((result) => result.success);
      const failureResults = results?.filter((result) => !result.success);

      if (successResults?.length > 0 && failureResults?.length === 0) {
        return res.status(200).json({
          statusCodeArr: successResults.map(
            (r) => r.response.request.res.statusCode
          ),
          dataArr: successResults.map((r) => r.response.data.cancels),
          message: "response",
        });
      } else if (successResults?.length === 0 && failureResults?.length > 0) {
        return res.status(200).json({ message: "error" });
      } else if (successResults?.length === 0 && failureResults?.length === 0) {
        return res.status(200).json({ message: "nothing" });
      } else {
        return res.status(200).json({ message: "both" });
      }
    } catch (error) {
      console.error("Error processing cancellations:", error);
      await redisClient.del(countKey);
      await redisClient.del(vouchersKey);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  // 구글 플레이 결제 (기존과 동일)
  async postChargeForGooglePayStore(req, res, next) {
    try {
      const userId = req?.user ?? req?.session?.user?.id ?? null;
      req.user = userId;
      await redisClient.del(RedisKeys.userInfo(userId));

      const {
        email,
        className,
        id,
        sourceReceiptClassName,
        transactionId,
        state,
        products,
        productId,
        platform,
        orderId,
        packageName,
        purchaseTime,
        purchaseState,
        purchaseToken,
        quantity,
        acknowledged,
        getPurchaseState,
        autoRenewing,
        accountId,
        purchaseId,
        purchaseDate,
        isPending,
        isAcknowledged,
        renewalIntent,
        sourcePlatform,
        sourcePurchaseToken,
        sourceOrderId,
        collection,
        latestReceipt,
        nativeTransactions,
        validationDate,
        zd,
        ...restOfPaymentInfo
      } = req.body;

      if (purchaseState !== 0) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid purchase state" });
      }

      const isValidPurchase = await verifyPurchaseWithGooglePlay(
        packageName,
        productId,
        purchaseToken
      );
      if (!isValidPurchase) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid purchase" });
      }

      let orderName = orderNameMaker(productId);
      if (orderName === "Unknown") {
        return res.status(406).end();
      }

      if (
        email === process.env.COS1 ||
        email === process.env.COS2 ||
        accountId === process.env.COS1 ||
        accountId === process.env.COS2
      ) {
        consoleForReceipt(req);
      }

      if (!orderId) return;

      const userInDB = await userService.getUserById(userId);
      const orderHistory = orderHistoryMaker({
        products,
        quantity,
        productId,
        orderId,
        purchaseDate,
        purchaseToken,
        packageName,
        zd,
      });
      const orderVouchersArr = orderVouchersArrMaker({ products, quantity });
      const adsFreePassExpiredDate = adsFreePassExpiredDateMaker({
        productId,
        purchaseDate,
      });
      const adsFreePass =
        adsFreePassExpiredDate !== "" && adsFreePassExpiredDate
          ? {
              name: orderName,
              expired: adsFreePassExpiredDate,
              description: [
                quantity,
                "NA",
                "NA",
                productId,
                orderId,
                purchaseDate,
                "NA",
                "NA",
                purchaseToken,
                packageName,
              ],
            }
          : {};

      const existingChargeInfo = await chargeService.getChargeByOrderId(
        orderId
      );

      if (!existingChargeInfo) {
        // 🚀 트랜잭션: Charge 생성 + User 바우처 업데이트
        const session = await mongoose.startSession();
        try {
          await session.withTransaction(async () => {
            const createdChargeInfo =
              await chargeService.createChargeForAndroidGooglePlay({
                orderId,
                purchaseToken,
                orderName,
                adsFreePass,
                orderHistory,
                orderVouchers: orderVouchersArr,
                amount: quantity,
                productId,
                packageName,
                apiName: platform,
                userInfo: userInDB,
                createdAtForIAP: purchaseDate,
              });

            const updatedVouchers = updatedVouchersMaker({
              userInDB,
              createdChargeInfo,
            });
            const updatedVouchersInDetail = updatedVouchersInDetailMaker({
              orderHistory,
              userInDB,
              orderId,
            });

            if (adsFreePassExpiredDate !== "" && adsFreePassExpiredDate) {
              await userService.updateUser(
                {
                  ...userInDB,
                  adsFreePass: {
                    name: orderName,
                    orderId: orderId,
                    expired: adsFreePassExpiredDate,
                  },
                  vouchers: updatedVouchers,
                  vouchersInDetail: updatedVouchersInDetail,
                },
                session
              );
            } else if (productId === process.env.PRODUCT_NEWBIE_PACKAGE) {
              await userService.updateUser(
                {
                  ...userInDB,
                  vouchers: updatedVouchers,
                  vouchersInDetail: updatedVouchersInDetail,
                  purchased: { ...userInDB?.purchased, packageForNewbie: true },
                },
                session
              );
            } else {
              await userService.updateUser(
                {
                  ...userInDB,
                  vouchers: updatedVouchers,
                  vouchersInDetail: updatedVouchersInDetail,
                },
                session
              );
            }
          });
        } finally {
          await session.endSession();
        }
      }
      await redisClient.del(RedisKeys.userInfo(userId));

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error processing payment:", error);
      res
        .status(500)
        .json({ success: false, message: "Payment(iap) processing failed" });
    }
  },

  // 구글 플레이 환불 처리 (Redis 활용)
  async postRefundForGooglePlayStore(req, res, next) {
    // console.log("postRefundForGooglePlayStore 호출");
    try {
      if (!req?.body || !req?.body?.message) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid request from pub/sub" });
      }

      const message = JSON.parse(
        Buffer.from(req.body.message.data, "base64").toString("utf-8")
      );
      // console.log("Refund event:", JSON.stringify(message));

      const orderId = message?.voidedPurchaseNotification?.orderId || "";

      if (orderId) {
        // Redis에 구글 주문 ID 저장
        await redisClient.set(RedisKeys.googleOrderId(), orderId, 3600);
        await processRefund(orderId);
      }

      res
        .status(200)
        .json({ success: true, message: "Refund processed successfully" });
    } catch (error) {
      console.error("Error processing refund:", error);
      res
        .status(500)
        .json({ success: false, message: "Refund processing failed" });
    }
  },

  // 헬퍼 메서드들
  async updateUserVouchersInDetail(
    orderId,
    chargeInDB,
    userInDB,
    session = null
  ) {
    const updatedChargeInDB = await chargeService.getChargeByOrderId(orderId);
    const updatedOrderHistory = updatedChargeInDB.orderHistory;
    const keysArrOfOrderHistory = Object.keys(updatedOrderHistory);
    const updatedUserInDB = await userService.getUserByObjId(userInDB._id);
    let updatedVouchersInDetail2 = { ...updatedUserInDB?.vouchersInDetail };

    keysArrOfOrderHistory?.forEach((key) => {
      const check =
        updatedVouchersInDetail2?.[key]?.[
          updatedVouchersInDetail2?.[key]?.length - 1
        ] ?? [];

      if (check?.length === 0) return;

      if (
        updatedVouchersInDetail2?.[key]?.[
          updatedVouchersInDetail2?.[key]?.length - 1
        ]?.[4] === orderId
      ) {
        updatedVouchersInDetail2[key][
          updatedVouchersInDetail2[key].length - 1
        ][5] = updatedOrderHistory?.[key]?.[5];
        updatedVouchersInDetail2[key][
          updatedVouchersInDetail2[key].length - 1
        ][8] = updatedChargeInDB?.paymentKey;
      }
    });

    await userService.updateUser(
      {
        ...updatedUserInDB,
        vouchersInDetail: updatedVouchersInDetail2,
      },
      session
    );
  },

  updateVouchersInDetailForRefund(vouchersInDetail, vouchersObjForRefund) {
    return Object.fromEntries(
      Object.entries(vouchersObjForRefund).map(([key, arrOfArray]) => {
        let vouchersInDetailOfUser = vouchersInDetail?.[key] || [];
        let doubleArray = [...vouchersInDetailOfUser];

        arrOfArray?.forEach((arr) => {
          doubleArray?.forEach((array) => {
            if (array?.[4] === arr?.[4] && Array.isArray(array)) {
              array[0] = array[0] - arr[0];
            }
          });
        });

        return [key, doubleArray.filter((array) => array[0] !== 0)];
      })
    );
  },

  calculateMinimumRefundableLimit(req) {
    return (
      (req?.body?.data?.cancels?.[0]?.cancelAmount +
        req?.body?.data?.cancels?.[0]?.refundableAmount) *
      remainingPercentage
    );
  },

  getRemainingRefundableAmount(req) {
    return req?.body?.data?.cancels[req?.body?.data?.cancels?.length - 1]
      ?.refundableAmount;
  },

  // 기존 테스트용 메서드 (그대로 유지)
  async postPartialCancelForToss1(req, res, next) {
    if (process.env.NODE_ENV === "DEVELOPMENT") console.log("들어옴 여기도");
    let widgetSecretKey = process.env.TOSS_SECRET_KEY_FOR_PAYPAL;
    let cancelReason1 = "The customer has asked to cancel.";

    const encryptedSecretKey1 =
      "Basic " + Buffer.from(widgetSecretKey + ":").toString("base64");

    if (process.env.NODE_ENV === "DEVELOPMENT") {
      console.log("widgetSecretKey : ", widgetSecretKey);
      console.log("encryptedSecretKey1 : ", encryptedSecretKey1);
    }

    try {
      const response = await axios.post(
        `${process.env.TOSS_API_BASE_URL}/payments/${process.env.TEST_PAYMENT_KEY}/cancel`,
        { cancelReason: cancelReason1 },
        {
          headers: {
            Authorization: encryptedSecretKey1,
            "Content-Type": "application/json",
          },
        }
      );

      res.status(200).json({ message: "response" });
    } catch (error) {
      if (process.env.NODE_ENV === "DEVELOPMENT") {
        console.log("환불 실패시 console : ", error?.response?.data);
      }
      res.status(200).json({ message: "error" });
    }
  },
};

// 구글 인앱결제 환불 로직 (기존과 동일하지만 일부 개선)
async function processRefund(orderId) {
  try {
    // console.log(`Processing refund for orderId: ${orderId}`);

    let chargeInDB;
    let userInDB;

    try {
      chargeInDB = await chargeService.getChargeByOrderId(orderId);
    } catch (err) {
      // console.log(`No charge found for orderId: ${orderId}`);
      await violationService.createViolation({
        violationName: "GoogleInAppRefund",
        orderId,
        refundQuantity: "N.A",
        remainingQuantity: "null",
        violationDate: new Date(),
        violationDescription: "No charge info due to out of stock",
        userObjId: "N.A",
      });
      return;
    }

    try {
      userInDB = await userService.getUserByObjId(chargeInDB?.userInfo);
    } catch (err) {
      // console.log(`No user found for orderId due to withdraw: ${orderId}`);
      await violationService.createViolation({
        violationName: "GoogleInAppRefund",
        orderId,
        refundQuantity: `${chargeInDB?.amount}` ?? "null",
        remainingQuantity: "null",
        violationDate: new Date(),
        violationDescription: "No user info due to out of stock or withdraw",
        userObjId: chargeInDB?.userInfo,
      });
      return;
    }

    let orderItem;

    if (userInDB && userInDB?.email) {
      if (
        userInDB?.vouchersInDetail &&
        typeof userInDB?.vouchersInDetail === "object"
      ) {
        try {
          const vouchersValues = Object.values(userInDB?.vouchersInDetail);

          if (chargeInDB?.productId?.split("_")?.includes("package")) {
            if (typeof orderItem !== "object") orderItem = {};
            Object.entries(userInDB?.vouchersInDetail)
              ?.filter((elem) => {
                elem[1]?.forEach((arrElem) => {
                  return arrElem?.[4] === orderId;
                });
              })
              ?.forEach(([key, values]) => {
                orderItem[key] = values?.[0]?.[0] ?? 0;
              });
          } else {
            orderItem = vouchersValues
              ?.filter((elem) => elem?.length !== 0)
              .flat()
              .find((elem) => elem?.[4] === orderId);
          }
        } catch (objectError) {
          console.error("Object.values 처리 중 에러:", objectError);
        }
      } else {
        orderItem = null;
      }

      if (!orderItem) {
        // console.log(`No order item found for orderId: ${orderId}`);
      }
    }

    let remainingQuantity;
    let refundQuantity;

    if (chargeInDB?.productId?.split("_")?.includes("package")) {
      refundQuantity = {};
      remainingQuantity = {};

      Object.entries(chargeInDB?.orderHistory || {}).forEach(
        ([type, detail]) => {
          refundQuantity[type] = detail?.[0] ?? 0;
        }
      );

      Object.entries(chargeInDB?.orderHistory || {}).forEach(
        ([type, detail]) => {
          const matchingVoucher = userInDB?.vouchersInDetail?.[type]?.find(
            (v) => v?.[4] === orderId
          );
          remainingQuantity[type] = matchingVoucher ? matchingVoucher[0] : 0;
        }
      );
    } else {
      remainingQuantity = orderItem?.[0] ?? 0;
      refundQuantity = chargeInDB?.amount ?? 0;
    }

    let result;
    if (chargeInDB?.productId?.split("_")?.includes("package")) {
      result = Object.entries(refundQuantity).some(
        ([type, qty]) => (remainingQuantity[type] ?? 0) < qty
      );
    } else {
      result =
        (remainingQuantity >= 0 &&
          refundQuantity >= 0 &&
          remainingQuantity < refundQuantity) ||
        !remainingQuantity;
    }

    if (result) {
      // console.log(
      //   `Violation detected - OrderID: ${orderId}, holding Vouchers: ${JSON.stringify(
      //     remainingQuantity
      //   )}, Requesting Amount: ${JSON.stringify(
      //     refundQuantity
      //   )}, Time: ${new Date().toISOString()}`
      // );

      await violationService.createViolation({
        violationName: "GoogleInAppRefund",
        orderId,
        refundQuantity: JSON.stringify(refundQuantity),
        remainingQuantity: JSON.stringify(remainingQuantity),
        violationDate: new Date(),
        violationDescription: `Violation: holding ${JSON.stringify(
          remainingQuantity
        )}, requesting ${JSON.stringify(refundQuantity)}`,
        userObjId: userInDB?._id ?? null,
      });

      const originalViolationsInDetail = userInDB?.violationsInDetail || [];
      const violationsInDetail = [
        ...originalViolationsInDetail,
        [
          "GoogleInAppRefund",
          orderId,
          refundQuantity,
          remainingQuantity,
          new Date(),
        ],
      ];

      if (userInDB?.id) {
        // userInDB가 null 아니면
        await redisClient.del(RedisKeys.userInfo(userInDB.id));
      }

      try {
        await userService.updateUser({
          ...userInDB,
          isInViolation: true,
          violationsInDetail,
        });
      } catch (error) {
        console.error(
          `Fail to record history of violation - OrderID: ${orderId}`,
          error
        );
      }
    }

    // 🚀 트랜잭션: User 바우처 차감 + Charge 삭제
    // 참고: 구글 Pub/Sub 8분 지연으로 인해 완벽한 방지는 불가능하며, violation 체크로 보완
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        const updatedUser = await updateUserVouchers(
          userInDB,
          chargeInDB.orderVouchers,
          chargeInDB.orderHistory
        );

        await userService.updateUser(updatedUser, session);

        await chargeService.deleteChargeByOrderId(orderId, session);

        // 트랜잭션 성공 후 캐시 삭제
        if (userInDB?.id) {
          await redisClient.del(RedisKeys.userInfo(userInDB.id));
        }
      });
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error(`Error processing refund for orderId ${orderId}:`, error);
  }
}

async function updateUserVouchers(user, orderVouchers, orderHistory) {
  const safeUser = user || {};
  const safeVouchers = safeUser?.vouchers || {};
  const safeVouchersInDetail = safeUser?.vouchersInDetail || {};
  const safeOrderHistory = orderHistory || {};

  const updatedVouchers = { ...safeVouchers };
  const updatedVouchersInDetail = { ...safeVouchersInDetail };

  let isDone = false;

  try {
    if (safeOrderHistory && typeof safeOrderHistory === "object") {
      const orderHistoryEntries = Object.entries(safeOrderHistory);

      orderHistoryEntries?.forEach(([voucherType, oneVoucherInDetail]) => {
        if (updatedVouchersInDetail[voucherType]?.length > 0) {
          if (Array.isArray(oneVoucherInDetail)) {
            oneVoucherInDetail?.forEach((detail) => {
              const index = updatedVouchersInDetail[voucherType].findIndex(
                (voucher) => {
                  if (voucher?.[4] === detail && voucher?.length === 10)
                    return true;
                  if (
                    voucher?.[4] === detail &&
                    voucher?.length > 10 &&
                    new Date(voucher?.[10]) > new Date()
                  )
                    return true;
                  if (
                    voucher?.[4] === detail &&
                    voucher?.length > 10 &&
                    (voucher?.[10] === "" || voucher?.[10] === "NA")
                  )
                    return true;
                  return false;
                }
              );

              if (index !== -1) {
                updatedVouchersInDetail[voucherType][index][0] -=
                  oneVoucherInDetail?.[0];
                if (updatedVouchersInDetail[voucherType]?.[index]?.[0] <= 0) {
                  updatedVouchersInDetail[voucherType].splice(index, 1);
                }
                isDone = true;
              }
            });
          }

          if (updatedVouchersInDetail[voucherType]?.length === 0) {
            updatedVouchersInDetail[voucherType] = [];
          }
        }
      });
    }
  } catch (entriesError) {
    console.error("Object.entries 처리 중 에러:", entriesError);
  }

  if (isDone && Array.isArray(orderVouchers)) {
    orderVouchers?.forEach(([voucherType, count]) => {
      if (updatedVouchers?.[voucherType] !== undefined) {
        updatedVouchers[voucherType] -= count;
        if (updatedVouchers?.[voucherType] < 0)
          updatedVouchers[voucherType] = 0;
      }
    });
  }

  return {
    ...safeUser,
    vouchers: { ...safeUser?.vouchers, ...updatedVouchers },
    vouchersInDetail: {
      ...safeUser?.vouchersInDetail,
      ...updatedVouchersInDetail,
    },
  };
}

module.exports = chargeController;

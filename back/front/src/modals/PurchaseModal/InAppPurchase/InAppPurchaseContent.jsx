import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './InAppPurchase.module.scss';
import { useTranslation } from 'react-i18next';
import { Capacitor } from '@capacitor/core';
import 'cordova-plugin-purchase/www/store.js';
import { TicketIcon } from './components/TicketIcon.jsx';
import Card from '../../../components/common/Card.jsx';
import CancelButton from '../../../components/common/CancelButton.jsx';
import PriceInfoModal from '../../PriceInfoModal/PriceInfoModal.jsx';
import { voucherBox } from '../../../data/voucherBox/voucherBox.jsx';
import { chargeApi } from '../../../api/chargeApi.jsx';
import { useButtonLock } from '@/hooks';
import { formattingDate } from '../../../utils/format/formatDate.jsx';
import { isAdsFreePassValid } from '../../../lib/user/isAdsFreePassValid.jsx';
import { Preferences } from '@capacitor/preferences';
import GiftBoxIcon from './components/GiftBoxIcon.jsx';
import PurchaseItem from './components/PurchaseItem.jsx';
import fontStyles from '../../../styles/scss/Font.module.scss';
import { isDevelopmentMode } from '@/utils/constants';

const { store, ProductType, Platform } = window.CdvPurchase;

const platform =
  Capacitor.getPlatform() === 'android'
    ? Platform?.GOOGLE_PLAY
    : Platform?.APPLE_APPSTORE;
// 환경변수들을 다시 배열로 만들어 사용하기
const productIds = [
  import.meta.env.VITE_COSMOS_VOUCHERS_1,
  import.meta.env.VITE_COSMOS_VOUCHERS_2,
  import.meta.env.VITE_COSMOS_VOUCHER_3,
  import.meta.env.VITE_COSMOS_VOUCHERS_4,
  import.meta.env.VITE_COSMOS_VOUCHERS_5,
  import.meta.env.VITE_COSMOS_VOUCHERS_6,
  import.meta.env.VITE_COSMOS_VOUCHERS_7,
  import.meta.env.VITE_COSMOS_VOUCHERS_8,
  import.meta.env.VITE_COSMOS_VOUCHERS_9,
  import.meta.env.VITE_COSMOS_VOUCHER_10,
  import.meta.env.VITE_COSMOS_VOUCHERS_11,
  import.meta.env.VITE_COSMOS_VOUCHERS_13,
  import.meta.env.VITE_COSMOS_VOUCHERS_ADS_REMOVER_3D,
  import.meta.env.VITE_COSMOS_VOUCHERS_EVENT_PACKAGE_EXPIRED,
  import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_NEWBIE,
  import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_1,
  import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_2,
  import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_3,
  import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_4,
  import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_5,
  import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_6,
  import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_10,
];

const InAppPurchaseContent = ({
  updatePriceInfoModalOpen,
  userInfoFromMyPage,
  isPriceInfoModalOpen,
  showInAppPurchase,
  closeChargeModal,
  browserLanguage,
  ...props
}) => {
  const { t } = useTranslation();
  const [iapProducts, setIapProducts] = useState([]);
  const [purchasing, setPurchasing] = useState(false);
  const [isOrdering, setIsOrdering] = useState(false);
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);
  const [userInfo, setUserInfo] = useState(userInfoFromMyPage || {});
  const [processedTransactions, setProcessedTransactions] = useState(new Set());
  const [totalEventPackageCount, setEventPackageCount] = useState(0);
  const [totalNewbiePackageCount, setNewbiePackageCount] = useState(0);
  let debounceTimer = null;
  const socketRef = useRef();
  const { clickCount, isLocked, remainingTime, handleClick, isLoading } =
    useButtonLock(() => {
      return {
        maxClicks: 5,
        particalLockDuration: 60 * 60 * 1000,
        lockDuration: 5 * 60 * 60 * 1000,
        uniqueId: userInfo?.email,
      };
    });

  /**
   * 스토어를 초기화하고 제품을 등록하는 함수(리스너는 이벤트 때 발생하는 거라 분리해도 될듯.)
   */
  const initializeStore = () => {
    store.verbosity = store.DEBUG;
    productIds.forEach(productId => {
      store.register({
        type: ProductType.CONSUMABLE,
        id: productId,
        platform: platform,
      });
    });

    store.initialize([platform]);
  };

  /**
   * 이전 구매 내역을 복원하는 함수
   */
  const restorePurchases = async () => {
    try {
      await store.restorePurchases();
      if (isDevelopmentMode) {
        console.log('Purchases restored successfully');
      }
    } catch (error) {
      console.error('Error restoring purchases:', error);
    }
  };

  /**
   * 서버로 구매 정보를 전송하는 함수
   * @param {object} receipt - 영수증 객체
   */
  const sendPurchaseToServer = useCallback(
    async receipt => {
      const transactionId = receipt.sourceReceipt.transactions[0].transactionId;
      const productId = receipt.sourceReceipt.transactions[0].products[0]?.id;

      // 이미 처리된 트랜잭션인지 확인
      if (processedTransactions.has(transactionId)) {
        // console.log('Transaction already processed:', transactionId);
        return;
      }

      // 유효한 productId인지 확인
      if (!productIds.includes(productId)) {
        // console.error('Invalid productId:', productId);
        return;
      }

      // 현 브라우저의 타임존 기준 UTC offset(단위: 분)
      const now = new Date();
      const offsetMinutes = now.getTimezoneOffset(); // ex) -540(서울), -240(뉴욕 여름), 0(런던)
      const zd = -offsetMinutes / 60; // 시간 단위 ZD (ex: 9, 4, 0 등, 부호 주의)

      // console.log('Sending purchase to server:', JSON.stringify(receipt));
      try {
        const result = await chargeApi.postPaymentForGooglePlayStore({
          email: userInfo?.email, // Google OAuth 이메일
          className: receipt.className,
          id: receipt?.id,
          sourceReceiptClassName: receipt.sourceReceipt.className,
          transactionId: receipt.sourceReceipt.transactions[0].transactionId,
          state: receipt.sourceReceipt.transactions[0].state,
          products: receipt.sourceReceipt.transactions[0].products,
          productId: receipt.sourceReceipt.transactions[0].products[0]?.id,
          platform: receipt.sourceReceipt.transactions[0].platform,
          orderId: receipt.sourceReceipt.transactions[0].nativePurchase.orderId,
          packageName:
            receipt.sourceReceipt.transactions[0].nativePurchase.packageName,
          purchaseTime:
            receipt.sourceReceipt.transactions[0].nativePurchase.purchaseTime,
          purchaseState:
            receipt.sourceReceipt.transactions[0].nativePurchase.purchaseState,
          purchaseToken:
            receipt.sourceReceipt.transactions[0].nativePurchase.purchaseToken,
          quantity:
            receipt.sourceReceipt.transactions[0].nativePurchase.quantity,
          acknowledged:
            receipt.sourceReceipt.transactions[0].nativePurchase.acknowledged,
          getPurchaseState:
            receipt.sourceReceipt.transactions[0].nativePurchase
              .getPurchaseState,
          autoRenewing:
            receipt.sourceReceipt.transactions[0].nativePurchase.autoRenewing,
          accountId: userInfo?.email,
          purchaseId: receipt.sourceReceipt.transactions[0].purchaseId,
          purchaseDate: receipt.sourceReceipt.transactions[0].purchaseDate,
          isPending: receipt.sourceReceipt.transactions[0].isPending,
          isAcknowledged: receipt.sourceReceipt.transactions[0].isAcknowledged,
          renewalIntent: receipt.sourceReceipt.transactions[0].renewalIntent,
          sourcePlatform: receipt.sourceReceipt.platform,
          sourcePurchaseToken: receipt.sourceReceipt.purchaseToken,
          sourceOrderId: receipt.sourceReceipt.orderId,
          collection: receipt.collection,
          latestReceipt: receipt.latestReceipt,
          nativeTransactions: receipt.nativeTransactions,
          validationDate: receipt.validationDate,
          zd: zd, // 현 브라우저의 타임존 기준 UTC offset(단위: 시간)
        });
        // console.log('Server result:', result);

        // 처리된 트랜잭션 기록
        setProcessedTransactions(prev => new Set(prev).add(transactionId));

        return result;
      } catch (error) {
        console.error('Error sending purchase to server:', error);
        throw error;
      }
    },
    [processedTransactions, userInfo?.email]
  );

  /**
   * 제품 정보를 새로 고치는 함수
   */
  const refreshUI = useCallback(async () => {
    const products = await Promise.all(
      productIds.map(productId =>
        store.get(productId, platform, ProductType.CONSUMABLE)
      )
    );
    setIapProducts(products);
  }, []); // productIds와 platform은 상수이므로 의존성에서 제거

  /**
   * 구매를 완료하고 서버로 구매 정보를 전송하는 함수
   * @param {object} receipt - 영수증 객체
   */
  const finishPurchase = useCallback(
    async receipt => {
      if (isProcessingPurchase) return;
      setIsProcessingPurchase(true);
      try {
        const transactionId =
          receipt.sourceReceipt.transactions[0].transactionId;
        // 이미 처리된 거래인지 확인
        if (processedTransactions.has(transactionId)) {
          if (isDevelopmentMode) {
            console.log('Transaction already processed:', transactionId);
          }
          setIsProcessingPurchase(false);
          return;
        }
        setPurchasing(true); //! 구매버튼 누르고 서버에서 전송이 늦어지면 버튼 락이 풀리므로 다시 락걸기 위함.
        const result = await sendPurchaseToServer(receipt);
        if (result.response.success === true) {
          // 구매 완료 후 아이템 즉시 소비(finish() 처리 하고 있음)
          await receipt.finish();
          if (isDevelopmentMode) {
            console.log('Purchase completed and consumed');
          }

          // 상점 새로고침
          await refreshUI();

          // 처리된 거래 ID 기록
          setProcessedTransactions(prev => new Set(prev).add(transactionId));
          window.location.reload();
        }
      } catch (error) {
        console.error('Error finishing purchase:', error);
      } finally {
        setPurchasing(false);
        setIsProcessingPurchase(false);
        refreshUI();
      }
    },
    [
      isProcessingPurchase,
      sendPurchaseToServer,
      processedTransactions,
      refreshUI,
    ]
  );

  /**
   * 제품을 주문하는 함수
   * @param {object} product - 제품 객체
   */
  const orderProduct = useCallback(
    product => {
      if (isOrdering) return;
      setIsOrdering(true);

      const order = async () => {
        try {
          // OAuth 계정 확인 후 안내
          const instructionOfLoginForPurchase = browserLanguage => {
            if (browserLanguage === 'en')
              return `Please log in with your Google account to proceed with the purchase.`;
            if (browserLanguage === 'ko')
              return `구매를 진행하려면 구글 계정으로 로그인해 주세요.`;
            if (browserLanguage === 'ja')
              return `購入を進めるためにGoogleアカウントでログインしてください。`;
          };
          if (!userInfo?.email) {
            alert(instructionOfLoginForPurchase(browserLanguage));
            setIsOrdering(false);
            return;
          }

          const showPaymentAlertIfNeeded = async () => {
            try {
              if (!userInfo?.email) return;

              const key = `alert_${userInfo.email}`;
              const { value } = await Preferences.get({ key });

              const now = Date.now();
              const threeDays = 3 * 24 * 60 * 60 * 1000; // 3일

              // 처음이거나 3일 지났으면 표시
              if (!value || now - Number(value) > threeDays) {
                // 알림 표시
                // Google Play 결제 호출 전에 안내
                const instructionOfChangingAccountForPay = browserLanguage => {
                  if (browserLanguage === 'en')
                    return `Payments will be processed through the account linked to Google Play. Please verify that this email and the Google Play account are the same. If you want to use a different account, you can go to "Manage accounts on this device" in the Google Play account settings, remove the payment account, and then switch to the desired account.`;
                  if (browserLanguage === 'ko')
                    return `결제는 구글 플레이에 연결된 계정으로 진행됩니다. 이 이메일과 구글 플레이 계정이 동일한지 확인해 주세요. 다른 계정을 사용하려면 구글 플레이 계정 설정에서 '이 기기에서 계정 관리'로 들어가 결제 계정을 삭제한 뒤 원하는 계정으로 변경할 수 있습니다.`;
                  if (browserLanguage === 'ja')
                    return `お支払いはグーグルプレイに紐づけられたアカウントで行われます。このメールアドレスとグーグルプレイアカウントが同一であるかご確認ください。別のアカウントを使用したい場合は、グーグルプレイのアカウント設定で「このデバイスでアカウントを管理」に進み、お支払いアカウントを削除した後、ご希望のアカウントに変更できます。`;
                };
                alert(instructionOfChangingAccountForPay(browserLanguage));

                // 현재 시간 저장
                await Preferences.set({ key, value: String(now) });
              }
            } catch (err) {
              console.error('showPaymentAlertIfNeeded error:', err);
            }
          };

          // 3일에 한번만 알림
          await showPaymentAlertIfNeeded();

          if (product?.getOffer()) {
            await product.getOffer().order(); // 여기서 Google Play 결제창이 열립니다
          } else {
            throw new Error('Product offer not available');
          }
        } catch (error) {
          console.error('Purchase error:', error);
        } finally {
          setIsOrdering(false);
        }
      };

      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(order, 500);
    },
    [isOrdering, userInfo?.email, browserLanguage]
  );

  /**
   * 환불된 제품을 처리하는 기능.
   *
   * 서버 동기화: 환불 발생 시 서버와 동기화하여 사용자의 실제 이용권 상태를 가져오는 방식으로 변경할 수 있습니다.
   * 로깅용으로 사용: 실제로 아이템을 제거하지 않고, 단순히 환불 발생을 로깅하는 용도로만 사용할 수 있습니다.
   * @param {string} productId - 제품 ID
   */
  const removeRefundedItem = useCallback(async productId => {
    try {
      if (isDevelopmentMode) {
        console.log(`Refund for ${productId} processed`);
      }
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  }, []);

  /**
   * 영수증을 처리하고 환불된 제품을 확인하는 함수
   * @param {array} receipts - 영수증 배열
   */
  const handleReceipts = useCallback(
    async receipts => {
      for (let receipt of receipts) {
        for (let transaction of receipt.transactions) {
          if (transaction.state === store.TRANSACTION_STATE_REFUNDED) {
            if (isDevelopmentMode) {
              console.log(`Product ${transaction.productId} has been refunded`);
            }
            await removeRefundedItem(transaction.productId);
          }
        }
      }
    },
    [removeRefundedItem]
  );

  // store 초기화는 한 번만 실행
  useEffect(() => {
    initializeStore();
    restorePurchases();
    
    // 컴포넌트 언마운트 시 리스너 정리
    return () => {
      store.off();
    };
  }, []); // 의존성 배열을 비워서 마운트 시 한 번만 실행

  // props 변경 시에만 restorePurchases 실행
  useEffect(() => {
    restorePurchases();
  }, [
    props?.stateGroup?.whichTarot,
    props?.stateGroup?.country,
    props?.stateGroup?.isAdsWatched,
    props?.stateGroup?.answerForm,
  ]);

  useEffect(() => {
    if (showInAppPurchase) {
      setIsOrdering(false);
      setPurchasing(false);
      refreshUI();
    }
  }, [showInAppPurchase, refreshUI]);

  // 리스너 등록과 해제를 관리할 useEffect를 추가해야 합니다:
  useEffect(() => {
    // 기존 리스너들을 모두 제거하여 중복 등록 방지
    store.off();

    // 제품 정보가 업데이트(가격 변경, 제품 가용성 변경 등)될 때마다 UI를 새로고침합(refreshUI 호출)니다.
    const productUpdatedHandler = store.when().productUpdated(refreshUI);

    // 구매가 승인되었을 때 실행됩니다.
    const approvedHandler = store.when().approved(transaction => {
      transaction.verify(); // 트랜잭션을 검증합니다.
      // transaction.finish()는 verified 핸들러에서 처리하므로 여기서는 제거
    });

    // 트랜잭션이 검증되었을 때 실행됩니다. 이는 서버 측 검증이 성공적으로 완료된 후에 호출됩니다. (finishPurchase : 구매를 완료하고 필요한 후속 처리를 수행합니다. )
    const verifiedHandler = store.when().verified(finishPurchase);

    // 트랜잭션 검증에 실패했을 때 실행됩니다. 이는 서버 측 검증이 실패했거나 오류가 발생했을 때 호출됩니다.
    // setPurchasing(false) : 구매 중 상태를 해제합니다.
    const unverifiedHandler = store
      .when()
      .unverified(() => setPurchasing(false));

    // 영수증이 준비되었을 때 실행됩니다. 이는 모든 보류 중인 트랜잭션의 영수증이 로드되었을 때 호출됩니다.
    // handleReceipts : 영수증을 처리하고 필요한 작업을 수행합니다.
    const receiptsReadyHandler = store.when().receiptsReady(handleReceipts);

    return () => {
      // 개별 핸들러들을 정리 (unregister 메서드가 있는 경우에만 호출)
      if (productUpdatedHandler && typeof productUpdatedHandler.unregister === 'function') {
        productUpdatedHandler.unregister();
      }
      if (approvedHandler && typeof approvedHandler.unregister === 'function') {
        approvedHandler.unregister();
      }
      if (verifiedHandler && typeof verifiedHandler.unregister === 'function') {
        verifiedHandler.unregister();
      }
      if (unverifiedHandler && typeof unverifiedHandler.unregister === 'function') {
        unverifiedHandler.unregister();
      }
      if (receiptsReadyHandler && typeof receiptsReadyHandler.unregister === 'function') {
        receiptsReadyHandler.unregister();
      }

      // 전체 리스너 정리 (안전장치)
      store.off();
    };
  }, []); // 의존성 배열을 비워서 컴포넌트 마운트 시 한 번만 실행

  const fetchedVoucherBox = voucherBox();

  // 번들 패키지 설정 배열
  const bundlePackages = [
    {
      id: import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_NEWBIE,
      key: 'newbie',
      color: '#EF4444',
      ribbonColor: '#FBBF24',
      buttonLockCondition: totalNewbiePackageCount >= 1,
      shouldShow: !userInfo?.purchased?.packageForNewbie,
    },
    {
      id: import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_1,
      key: '1',
      color: '#10B981',
      ribbonColor: '#F59E0B',
    },
    {
      id: import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_2,
      key: '2',
      color: '#3B82F6',
      ribbonColor: '#EF4444',
    },
    {
      id: import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_3,
      key: '3',
      color: '#F97316',
      ribbonColor: '#A855F7',
    },
    {
      id: import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_4,
      key: '4',
      color: '#14B8A6',
      ribbonColor: '#F472B6',
    },
    {
      id: import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_5,
      key: '5',
      color: '#6366F1',
      ribbonColor: '#FCD34D',
    },
    {
      id: import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_6,
      key: '6',
      color: '#EC4899',
      ribbonColor: '#10B981',
    },
    {
      id: import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_10,
      key: '10',
      color: '#8B5CF6',
      ribbonColor: '#84CC16',
    },
  ];

  // 일반 이용권 설정 배열
  const regularVouchers = [
    {
      id: import.meta.env.VITE_COSMOS_VOUCHERS_1,
      icon: 'I',
      styleClass: 'one-card',
      productKey: 'cosmos_vouchers_1',
    },
    {
      id: import.meta.env.VITE_COSMOS_VOUCHERS_2,
      icon: 'II',
      styleClass: 'two-cards',
      productKey: 'cosmos_vouchers_2',
    },
    {
      id: import.meta.env.VITE_COSMOS_VOUCHER_3,
      icon: 'III',
      styleClass: 'three-cards',
      productKey: 'cosmos_voucher_3',
    },
    {
      id: import.meta.env.VITE_COSMOS_VOUCHERS_4,
      icon: 'IV',
      styleClass: 'four-cards',
      productKey: 'cosmos_vouchers_4',
    },
    {
      id: import.meta.env.VITE_COSMOS_VOUCHERS_5,
      icon: 'V',
      styleClass: 'five-cards',
      productKey: 'cosmos_vouchers_5',
    },
    {
      id: import.meta.env.VITE_COSMOS_VOUCHERS_6,
      icon: 'VI',
      styleClass: 'six-cards',
      productKey: 'cosmos_vouchers_6',
    },
    {
      id: import.meta.env.VITE_COSMOS_VOUCHER_10,
      icon: 'X',
      styleClass: 'ten-cards',
      productKey: 'cosmos_voucher_10',
    },
  ];

  useEffect(() => {
    if (userInfo?.email && userInfo?.email !== '') {
      purchaseLimit(
        `purchase_limit_exceeded_event_package_expired_${userInfo?.email}`,
        import.meta.env.VITE_COSMOS_VOUCHERS_EVENT_PACKAGE_EXPIRED,
        userInfo,
        setEventPackageCount
      );
      purchaseLimit(
        `purchase_limit_exceeded_bundle_package_newbie_${userInfo?.email}`,
        import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_NEWBIE,
        userInfo,
        setNewbiePackageCount
      );
    }
  }, [userInfo?.email]);

  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const deadline = new Date('2025-08-25T23:59:59');
      if (now > deadline) {
        setExpired(true);
      } else {
        setExpired(false);
      }
    }, 1000); // 1초마다 체크

    // 정리(clean-up) 함수
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <>
      {isPriceInfoModalOpen === true && (
        <PriceInfoModal
          updatePriceInfoModalOpen={updatePriceInfoModalOpen}
          voucherBox={fetchedVoucherBox}
        />
      )}
      <Card className={styles['purchase-modal']}>
        <header className={styles['charge-content']}>
          <div className={styles['empty']}></div>
          <div className={styles['voucher-box']}>
            {/* //~ 번들 패키지 */}
            {bundlePackages
              .filter(pkg => pkg.shouldShow !== false)
              .map(pkg => (
                <PurchaseItem
                  key={pkg.id}
                  whichItem={'bundle-package'}
                  iapProductId={pkg.id}
                  iapProducts={iapProducts}
                  icon={
                    <GiftBoxIcon
                      size={32}
                      color={pkg.color}
                      ribbonColor={pkg.ribbonColor}
                    />
                  }
                  title={t(
                    `product.cosmos_vouchers_bundle_package_${pkg.key}_title`
                  )}
                  description={t(
                    `product.cosmos_vouchers_bundle_package_${pkg.key}`
                  )}
                  buttonLockCondition={pkg.buttonLockCondition}
                  browserLanguage={browserLanguage}
                  purchasing={purchasing}
                  setPurchasing={setPurchasing}
                  orderProduct={orderProduct}
                  t={t}
                />
              ))}
            {/* //~ 광고 */}
            {(props?.stateGroup?.isVoucherModeOn ||
              props?.stateGroup?.whichTarot !== 2) && (
              <PurchaseItem
                whichItem={'ads'}
                adProps={{
                  clickCount,
                  remainingTime,
                  admobReward: props?.admobReward,
                  setAdsWatched: props?.setAdsWatched,
                  setWhichAds: props?.setWhichAds,
                  handleClick,
                }}
                browserLanguage={browserLanguage}
                purchasing={purchasing}
                setPurchasing={setPurchasing}
                t={t}
              />
            )}
            {/* //~ 광고 리무버 */}
            <PurchaseItem
              whichItem={'ads-remover'}
              iapProductId={import.meta.env.VITE_COSMOS_VOUCHERS_ADS_REMOVER_3D}
              iapProducts={iapProducts}
              icon={
                <TicketIcon width="32" height="32" style={{ color: 'red' }} />
              }
              title={t('instruction.ads-remover-title')}
              description={t('instruction.ads-remover')}
              additionalDescription={
                isAdsFreePassValid(userInfo) &&
                `Exp. : ${formattingDate(
                  userInfo?.adsFreePass?.expired,
                  browserLanguage
                )}`
              }
              buttonLockCondition={isAdsFreePassValid(userInfo)}
              browserLanguage={browserLanguage}
              purchasing={purchasing}
              setPurchasing={setPurchasing}
              orderProduct={orderProduct}
              t={t}
            />
            {/* //~ 이용권 */}
            {regularVouchers.map(voucher => {
              const product = iapProducts?.find(p => p?.id === voucher.id);
              if (!product) return null;

              return (
                <PurchaseItem
                  key={voucher.id}
                  whichItem={voucher.id}
                  iapProductId={voucher.id}
                  iapProducts={iapProducts}
                  icon={voucher.icon}
                  iconStyleClass={voucher.styleClass}
                  title={t(`product.${voucher.productKey}_title`)}
                  description={t(`product.${voucher.productKey}`)}
                  browserLanguage={browserLanguage}
                  purchasing={purchasing}
                  setPurchasing={setPurchasing}
                  orderProduct={orderProduct}
                  t={t}
                />
              );
            })}
          </div>
          <div className={styles['empty']}></div>
        </header>
        <footer className={styles['purchase-button-box']}>
          <CancelButton
            className={styles['purchase-button']}
            onClick={(e = null) => {
              closeChargeModal();
            }}
          >
            {t('button.close')}
          </CancelButton>
        </footer>
      </Card>
    </>
  );
};
const purchaseLimit = async (key, productId, userInfo, setPurchaseCount) => {
  const { value } = (await Preferences.get({
    key,
  })) ?? { value: 'false' };
  const isExceeded = JSON.parse(value); // true or false
  if (!isExceeded) {
    let result;
    let purchased;
    let purchaseCount;
    if (
      productId === import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_NEWBIE
    ) {
      purchased = userInfo?.purchased?.packageForNewbie;
    } else {
      if (
        productId ===
          import.meta.env.VITE_COSMOS_VOUCHERS_EVENT_PACKAGE_EXPIRED &&
        new Date() > new Date('2025-08-27')
      )
        return;
      result = await chargeApi.getPurchaseLimit({
        productId,
      });
      // 숫자가 아니면 숫자로 변환
      purchaseCount =
        typeof result?.response === 'number'
          ? result?.response
          : Number(result?.response);
      setPurchaseCount(purchaseCount);
    }

    // purchaseCount가 50 이상이면 Preferences에 true 저장
    if (
      purchaseCount >= 50 &&
      productId === import.meta.env.VITE_COSMOS_VOUCHERS_EVENT_PACKAGE_EXPIRED
    ) {
      await Preferences.set({
        key,
        value: JSON.stringify(true),
      });
    } else if (
      purchased &&
      productId === import.meta.env.VITE_COSMOS_VOUCHERS_BUNDLE_PACKAGE_NEWBIE
    ) {
      setPurchaseCount(1);
      await Preferences.set({
        key,
        value: JSON.stringify(true),
      });
    } else {
      await Preferences.set({
        key,
        value: JSON.stringify(false),
      });
    }
  } else {
    setPurchaseCount(10000000000); // 이미 초과된 경우, 임의로 큰 숫자로 설정
  }
};

export default InAppPurchaseContent;

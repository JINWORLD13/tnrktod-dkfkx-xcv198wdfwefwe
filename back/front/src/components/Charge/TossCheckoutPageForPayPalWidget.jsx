// import React, { useState, useEffect, useRef } from 'react';
// import styles from './TossCheckoutPageForPayPalWidget.module.scss';
// import { loadPaymentWidget, ANONYMOUS } from '@tosspayments/payment-widget-sdk';
// import { loadTossPayments } from '@tosspayments/payment-sdk';
// import { nanoid } from 'nanoid';
// import Button from '../../components/common/Button.jsx';
// import { useLanguageChange } from '@/hooks';
// import { chargeApi } from '../../api/chargeApi.jsx';
// import { useTranslation } from 'react-i18next';
import { isDevelopmentMode, isProductionMode } from '@/utils/constants';

// const widgetClientKey = import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS;
// const clientKey = import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS_PAYPAL;
// // const customerKey = import.meta.env.VITE_CUSTOMER_KEY_FOR_TOSS;

// function TossCheckoutPageForPayPalWidget({
//   setChargeClicked,
//   totalPrice,
//   userInfo,
//   voucherBox,
//   currencyCode,
//   countryCode,
//   priceForPayPal,
//   ...props
// }) {
//   const { t } = useTranslation();
//   const [paymentWidget, setPaymentWidget] = useState(null);
//   const paymentMethodsWidgetRef = useRef(null);
//   const paymentAgreementWidgetRef = useRef(null);
//   const [priceForToss, setPriceForToss] = useState(totalPrice);
//   const [preOrderId, setPreOrderId] = useState(null);
//   const browserLanguage = useLanguageChange();
//   const orderId = nanoid();
//   const [isLoading, setIsLoading] = useState(false);
//   /**
//    * orderHistory는
//    * {
//    * '1': [10, 100, 10, 90, 'date'],
//    * '2': [20, 200, 20, 160, 'date'],...
//    * }
//    * 로 찍혀 나올것임.
//    * acc는 누적 객체
//    * reduce의 초기값은 빈 객체 {}
//    */
//   const orderHistory = {
//     ...voucherBox
//       ?.filter(elem => elem?.amount > 0)
//       .reduce((acc, elem) => {
//         if (elem?.amount > 0) {
//           acc[`${elem?.count}`] = [
//             elem?.amount,
//             elem?.listPriceForUSD,
//             elem?.salePercentage,
//             elem?.originalPriceForUSD,
//             orderId,
//             'date',
//             browserLanguage,
//             currencyCode,
//             'not yet',
//             'card',
//           ];
//         }
//         return acc;
//       }, {}),
//   };

//   const orderVouchersArr = voucherBox
//     ?.filter(elem => elem?.amount > 0)
//     ?.map((elem, i) => {
//       if (elem?.amount > 0) return [elem?.count, elem?.amount];
//     });
//   const orderName = orderVouchersArr
//     ?.filter(elem => elem !== undefined && elem !== null) // undefined 요소 제거
//     ?.map((elem, i) => {
//       if (elem[0] === 1) return `${t(`voucher.one-card-name`)} x ${elem[1]}`;
//       if (elem[0] === 2) return `${t(`voucher.two-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 3) return `${t(`voucher.three-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 4) return `${t(`voucher.four-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 5) return `${t(`voucher.five-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 6) return `${t(`voucher.six-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 7) return `${t(`voucher.seven-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 8) return `${t(`voucher.eight-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 9) return `${t(`voucher.nine-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 10) return `${t(`voucher.ten-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 11) return `${t(`voucher.eleven-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 13)
//         return `${t(`voucher.thirteen-cards-name`)} x ${elem[1]}`;
//     })
//     ?.join(', ')
//     ?.trim(','); // 마지막 쉼표 제거

//   //&
//   // const browserLanguage = useLanguageChange();
//   // const date = new Date();
//   // let formattedDate;
//   // if (browserLanguage === 'en') formattedDate = date?.toLocaleString('en-US');
//   // if (browserLanguage === 'ja') formattedDate = date?.toLocaleString('ja-JP');

//   //&
//   useEffect(() => {
//     const fetchPaymentWidget = async () => {
//       try {
//         const loadedWidget = await loadPaymentWidget(
//           widgetClientKey,
//           ANONYMOUS // customerKey // customerKey 자리
//         );
//         setPaymentWidget(loadedWidget);
//       } catch (error) {
//         console.error('Error fetching payment widget:', error);
//       }
//     };

//     fetchPaymentWidget();
//   }, []);

//   useEffect(() => {
//     if (paymentWidget == null) {
//       return;
//     }

//     //! 두번째 인자가 amount임
//     const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
//       '#payment-widget',
//       {
//         value: priceForToss,
//         currency: currencyCode,
//         country: countryCode,
//       },
//       { variantKey: 'PAYPAL' }
//       // { variantKey: 'widgetA' }
//     );

//     const paymentAgreement = paymentWidget.renderAgreement('#agreement', {
//       variantKey: 'agreement-en',
//     });

//     paymentAgreement.on('change', agreementStatus => {
//       if (agreementStatus.agreedRequiredTerms) {
//         paymentAgreementWidgetRef.current = paymentAgreement;
//         paymentMethodsWidgetRef.current = paymentMethodsWidget;
//       }
//     });
//   }, [
//     paymentWidget,
//     priceForToss,
//     paymentMethodsWidgetRef,
//     paymentAgreementWidgetRef,
//     browserLanguage,
//   ]);

//   const handlePayment = async () => {
//     const paymentAgreement = paymentAgreementWidgetRef.current;
//     const agreementStatus = paymentAgreement.getAgreementStatus();

//     //! 이용약관 클릭안돼 있으면 post 못하게 하기
//     if (agreementStatus.agreedRequiredTerms === false) return;

//     //같은 실행컨텍스트 내에 setPreviousMethods가 있으면 해당 state는 바로 반영 안됨.
//     setPreOrderId(orderId);

//     // & 같은 수단으로 클릭이 2번 되면 그땐 안됨..
//     const previousChargeInfo = await chargeApi.getPrePaymentForTossByOrderId({
//       orderId: preOrderId,
//     });

//     let resultOfPostPrePayment;
//     if (previousChargeInfo.response === undefined || previousChargeInfo.response === null) {
//       resultOfPostPrePayment = await chargeApi.postPrePaymentForToss({
//         orderId: orderId,
//         paymentKey: 'not yet',
//         orderName: orderName,
//         orderHistory: orderHistory,
//         orderVouchersArr: orderVouchersArr,
//         amount: priceForToss,
//         currency: currencyCode,
//         country: countryCode,
//         method: 'card',
//         apiName: 'Toss',
//       });
//     }
//     if (resultOfPostPrePayment?.response?.success === true) {
//       const tossPayments = await loadTossPayments(clientKey);

//       // MongoDB에서 날짜를 가져왔다고 가정
//       const mongoCreatedAtDate = new Date(
//         resultOfPostPrePayment?.response?.createdChargeInfo?.createdAt
//       );
//       const formattedCreatedAtDate = mongoCreatedAtDate
//         .toISOString()
//         .replace('Z', '-0:00');

//       try {
//         await tossPayments.requestPayment('해외간편결제', {
//           amount: priceForToss,
//           orderId: orderId,
//           orderName: orderName,
//           customerName: userInfo?.displayName,
//           successUrl: `${window.location.origin}/${browserLanguage}/toss/success`,
//           failUrl: `${window.location.origin}/${browserLanguage}/toss/fail`,
//           provider: 'PAYPAL',
//           currency: currencyCode,
//           country: countryCode,
//           paymentMethodOptions: {
//             paypal: {
//               setTransactionContext: {
//                 sender_account_id: userInfo?.email.split('@')[0],
//                 full_name: userInfo?.displayName,
//                 sender_email: userInfo?.email,
//                 // sender_phone: '(1) 123 456 7890',
//                 sender_country_code: countryCode,
//                 sender_create_date: formattedCreatedAtDate,
//               },
//             },
//           },
//           // products: orderVouchersArr.map((elem, i) =>{
//           //     return {
//           //       name: orderNameArrForPayPal[i],
//           //       quantity: orderAmountArrForPayPal[i],
//           //       unitAmount: priceForPayPal[elem[0]],
//           //       currency: 'USD',
//           //       description: `${orderNameArrForPayPal[i]} X ${orderAmountArrForPayPal[i]}`
//           //     }
//           //   }),
//           //   shipping: {
//           //     fullName: userInfo.displayName,
//           //     address: {
//           //       country: 'NA',
//           //       line1: 'NA',
//           //       line2: 'NA',
//           //       area1: 'NA',
//           //       area2: 'NA',
//           //       postalCode: 'NA'
//           //     }
//           //   },
//           //   paymentMethodOptions: {
//           //     // PayPal에서 요구하는 추가 파라미터
//           //     paypal: {
//           //       setTransactionContext: {
//           //         // PayPal STC 파라미터 예시 (구매자의 로그인 정보)
//           //         sender_account_id: userInfo.email.split('@')[0],
//           //         full_name: userInfo.displayName,
//           //         sender_email: userInfo.email,
//           //         // sender_phone: '(1) 562 254 5591',
//           //         sender_country_code: countryCode,
//           //         sender_create_date: formattedDate,
//           //       },
//           //     },
//           //   },
//         });
//       } catch (error) {
//         console.log(error);
//         // const deletePre = async () => {
//         //   await chargeApi.deletePrePaymentForTossByOrderId({ orderId });
//         // };
//         // deletePre();
//         if (error.code === 'USER_CANCEL') {
//           // 결제 고객이 결제창을 닫았을 때 에러 처리
//         } else if (error.code === 'INVALID_CARD_COMPANY') {
//           // 유효하지 않은 카드 코드에 대한 에러 처리
//         }
//       }
//     }
//   };
//   const handlePaymentRequest = async () => {
//     if (isLoading) return;
//     setIsLoading(true); // 작업 상태 변경
//     // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
//     // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
//     try {
//       await handlePayment();
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className={styles['widget-container']}>
//       {/* 할인 쿠폰 */}
//       {/* <label htmlFor="coupon-box">
//         <input
//           id="coupon-box"
//           type="checkbox"
//           onChange={event => {
//             setPriceForToss(event.target.checked ? price - 5_000 : price + 5_000);
//           }}
//         />
//         <span>5,000원 쿠폰 적용</span>
//       </label> */}
//       {/* 결제 UI, 이용약관 UI 영역 */}
//       <div id="payment-widget" />
//       {/* {browserLanguage === 'ko' ? <div id="payment-widget" /> : null} */}
//       <div id="agreement" />
//       {/* 결제하기 버튼 */}
//       <div className={styles['btn-box']}>
//         <Button className={styles['btn-pay']} onClick={handlePaymentRequest}>
//           {t(`button.pay`)}
//         </Button>
//         <Button
//           className={styles['btn-pay-cancel']}
//           onClick={() => {
//             setChargeClicked(false);
//           }}
//         >
//           {t(`button.cancel`)}
//         </Button>
//       </div>
//     </div>
//   );
// }

// export default TossCheckoutPageForPayPalWidget;

import React, { useState, useEffect, useRef } from 'react';
import styles from './TossCheckoutPageForPayPalWidget.module.scss';
import { loadPaymentWidget, ANONYMOUS } from '@tosspayments/payment-widget-sdk';
import { loadTossPayments } from '@tosspayments/payment-sdk';
import { nanoid } from 'nanoid';
import Button from '../../components/common/Button.jsx';
import { useLanguageChange } from '@/hooks';
import { chargeApi } from '../../api/chargeApi.jsx';
import { useTranslation } from 'react-i18next';

const widgetClientKey =
  isProductionMode
    ? import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS
    : import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS_TEST;
const clientKey =
  isProductionMode
    ? import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS_PAYPAL
    : import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS_PAYPAL_TEST;

function TossCheckoutPageForPayPalWidget({
  setChargeClicked,
  totalPrice,
  userInfo,
  voucherBox,
  currencyCode,
  countryCode,
  priceForPayPal,
  ...props
}) {
  const { t } = useTranslation();
  const [paymentWidget, setPaymentWidget] = useState(null);
  const paymentMethodsWidgetRef = useRef(null);
  const paymentAgreementWidgetRef = useRef(null);
  const [priceForToss, setPriceForToss] = useState(totalPrice);
  const [preOrderId, setPreOrderId] = useState(null);
  const browserLanguage = useLanguageChange(); // ✅ 오타 수정
  const orderId = nanoid();
  const [isLoading, setIsLoading] = useState(false);

  // 주문 히스토리 생성
  const orderHistory = {
    ...voucherBox
      ?.filter(elem => elem?.amount > 0)
      .reduce((acc, elem) => {
        acc[`${elem?.count}`] = [
          elem?.amount,
          elem?.listPriceForUSD,
          elem?.salePercentage,
          elem?.originalPriceForUSD,
          orderId,
          'date',
          browserLanguage, // ✅ 수정된 변수명 사용
          currencyCode,
          'not yet',
          'card',
        ];
        return acc;
      }, {}),
  };

  // ✅ 개선된 배열 처리
  const orderVouchersArr =
    voucherBox
      ?.filter(elem => elem?.amount > 0)
      ?.map(elem => [elem?.count, elem?.amount]) || [];

  const orderName = orderVouchersArr
    ?.map(elem => {
      const [count, amount] = elem;
      const voucherNames = {
        1: 'voucher.one-card-name',
        2: 'voucher.two-cards-name',
        3: 'voucher.three-cards-name',
        4: 'voucher.four-cards-name',
        5: 'voucher.five-cards-name',
        6: 'voucher.six-cards-name',
        7: 'voucher.seven-cards-name',
        8: 'voucher.eight-cards-name',
        9: 'voucher.nine-cards-name',
        10: 'voucher.ten-cards-name',
        11: 'voucher.eleven-cards-name',
        13: 'voucher.thirteen-cards-name',
      };

      return voucherNames[count]
        ? `${t(voucherNames[count])} x ${amount}`
        : null;
    })
    ?.filter(Boolean) // null/undefined 제거
    ?.join(', ');

  // ✅ 수정된 클라이언트 키 설정
  const updatedWidgetClientKey =
    userInfo?.email === import.meta.env.VITE_COS1
      ? import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS_TEST
      : widgetClientKey;

  const updatedClientKey =
    userInfo?.email === import.meta.env.VITE_COS1
      ? import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS_PAYPAL_TEST
      : clientKey;

  useEffect(() => {
    const fetchPaymentWidget = async () => {
      try {
        const loadedWidget = await loadPaymentWidget(
          updatedWidgetClientKey,
          ANONYMOUS
        );
        setPaymentWidget(loadedWidget);
      } catch (error) {
        console.error('Error fetching payment widget:', error);
      }
    };

    fetchPaymentWidget();
  }, [updatedWidgetClientKey]); // ✅ 의존성 배열 추가

  useEffect(() => {
    if (paymentWidget == null) {
      return;
    }

    const paymentMethodsWidget = paymentWidget.renderPaymentMethods(
      '#payment-widget',
      {
        value: priceForToss,
        currency: currencyCode,
        country: countryCode,
      },
      { variantKey: 'PAYPAL' }
    );

    const paymentAgreement = paymentWidget.renderAgreement('#agreement', {
      variantKey: 'agreement-en',
    });

    paymentAgreement.on('change', agreementStatus => {
      if (agreementStatus.agreedRequiredTerms) {
        paymentAgreementWidgetRef.current = paymentAgreement;
        paymentMethodsWidgetRef.current = paymentMethodsWidget;
      }
    });
  }, [paymentWidget, priceForToss, currencyCode, countryCode, browserLanguage]);

  const handlePayment = async userInfo => {
    const paymentAgreement = paymentAgreementWidgetRef.current;
    const agreementStatus = paymentAgreement.getAgreementStatus();

    if (agreementStatus.agreedRequiredTerms === false) return;

    setPreOrderId(orderId);

    const previousChargeInfo = await chargeApi.getPrePaymentForTossByOrderId({
      orderId: preOrderId,
    });

    let resultOfPostPrePayment;
    if (!previousChargeInfo.response) {
      resultOfPostPrePayment = await chargeApi.postPrePaymentForToss({
        orderId: orderId,
        paymentKey: 'not yet',
        orderName: orderName,
        orderHistory: orderHistory,
        orderVouchersArr: orderVouchersArr,
        amount: priceForToss,
        currency: currencyCode,
        country: countryCode,
        method: 'card',
        apiName: 'Toss',
      });
    }

    if (resultOfPostPrePayment?.response?.success === true) {
      const tossPayments = await loadTossPayments(updatedClientKey); // ✅ 수정된 변수 사용

      const mongoCreatedAtDate = new Date(
        resultOfPostPrePayment?.response?.createdChargeInfo?.createdAt
      );
      const formattedCreatedAtDate = mongoCreatedAtDate
        .toISOString()
        .replace('Z', '-0:00');

      try {
        await tossPayments.requestPayment('해외간편결제', {
          amount: priceForToss,
          orderId: orderId,
          orderName: orderName,
          customerName: userInfo?.displayName,
          successUrl: `${window.location.origin}/${browserLanguage}/toss/success`, // ✅ 수정된 변수명
          failUrl: `${window.location.origin}/${browserLanguage}/toss/fail`, // ✅ 수정된 변수명
          provider: 'PAYPAL',
          currency: currencyCode,
          country: countryCode,
          paymentMethodOptions: {
            paypal: {
              setTransactionContext: {
                sender_account_id: userInfo?.email.split('@')[0],
                full_name: userInfo?.displayName,
                sender_email: userInfo?.email,
                sender_country_code: countryCode,
                sender_create_date: formattedCreatedAtDate,
              },
            },
          },
        });
      } catch (error) {
        if (isDevelopmentMode) {
          console.log(error);
        }
        if (error.code === 'USER_CANCEL') {
          // 결제 취소 처리
        } else if (error.code === 'INVALID_CARD_COMPANY') {
          // 유효하지 않은 카드 처리
        }
      }
    }
  };

  const handlePaymentRequest = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await handlePayment(userInfo);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['widget-container']}>
      <div id="payment-widget" />
      <div id="agreement" />

      <div className={styles['btn-box']}>
        <Button
          className={styles['btn-pay']}
          onClick={handlePaymentRequest}
          disabled={isLoading} // ✅ 로딩 중 버튼 비활성화
        >
          {isLoading ? t('button.loading') : t('button.pay')}
        </Button>
        <Button
          className={styles['btn-pay-cancel']}
          onClick={() => setChargeClicked(false)}
        >
          {t('button.cancel')}
        </Button>
      </div>
    </div>
  );
}

export default TossCheckoutPageForPayPalWidget;

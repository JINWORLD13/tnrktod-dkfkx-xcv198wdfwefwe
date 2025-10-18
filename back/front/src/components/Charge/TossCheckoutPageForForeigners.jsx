// // Toss.js
// import React, { useState, useEffect, useRef } from 'react';
// import { loadPaymentWidget, ANONYMOUS } from '@tosspayments/payment-widget-sdk';
// import { nanoid } from 'nanoid';
// import { chargeApi } from '../../api/chargeApi.jsx';
// import { loadTossPayments } from '@tosspayments/payment-sdk';
// import { useLanguageChange } from '@/hooks';
// import { useTranslation } from 'react-i18next';

// // 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요.
// // 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// const clientKey = import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS;
// // 커스터머 키 아예 없는걸로 일단 셋.
// const customerKey = import.meta.env.VITE_CUSTOMER_KEY_FOR_TOSS;
// // const paymentWidget = PaymentWidget(widgetClientKey, PaymentWidget.ANONYMOUS) // 비회원 결제

// export default function TossCheckoutPageForForeigners({
//   setChargeClicked,
//   totalPrice,
//   userInfo,
//   card,
//   voucherBox,
//   currencyCode,
//   ...props
// }) {
//   console.log('totalPrice : ', totalPrice);
//   const { t } = useTranslation();
//   const [priceForToss, setPriceForToss] = useState(totalPrice);
//   const orderId = nanoid();
//   const browserLanguage = useLanguageChange();
//   let country;
//   if (browserLanguage === 'ja') {
//     country = 'ja';
//   }
//   if (browserLanguage === 'en') {
//     country = 'other';
//   }
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
//             'card'
//           ];
//         }
//         return acc;
//       }, {}),
//   };
//   const orderVouchersArr = voucherBox
//     ?.filter(elem => elem?.amount > 0)
//     .map((elem, i) => {
//       if (elem?.amount > 0) return [elem?.count, elem?.amount];
//     });

//   const orderNameStr = orderVouchersArr
//     ?.filter(elem => elem !== undefined && elem !== null) // undefined 요소 제거
//     .map((elem, i) => {
//       if (elem[0] === 1) return `${t(`voucher.one-card-name`)}${elem[1]}`;
//       if (elem[0] === 2) return `${t(`voucher.two-cards-name`)}${elem[1]}`;
//       if (elem[0] === 3) return `${t(`voucher.three-cards-name`)}${elem[1]}`;
//       if (elem[0] === 4) return `${t(`voucher.four-cards-name`)}${elem[1]}`;
//       if (elem[0] === 10) return `${t(`voucher.ten-cards-name`)}${elem[1]}`;
//     })
//     .join(', ')
//     .trim(','); // 마지막 쉼표 제거

//   const [orderName, setOrderName] = useState(orderNameStr);
//   const orderVouchersObj = Object.fromEntries(
//     orderVouchersArr
//       ?.filter(elem => elem !== undefined)
//       .map(elem => [elem[0], elem[1]])
//   );
//   const nameFunction = async () => {
//     try {
//       const result = await chargeApi.postPrePaymentForToss({
//         orderId: orderId,
//         paymentKey: 'not yet',
//         orderName: orderName,
//         orderHistory: orderHistory,
//         orderVouchersArr: orderVouchersArr,
//         amount: priceForToss,
//         currency: 'KRW',
//         country: country,
//         method: '카드',
//         apiName: 'Toss',
//       });
//       if (result === true) return orderName;
//       throw new Error();
//     } catch (error) {
//       console.error('Failed to post pre-payment:', error);
//       throw error;
//     }
//   };

//   useEffect(() => {
//     nameFunction()
//       .then(result => setOrderName(result))
//       .catch(error => console.error('Failed to set order name:', error));
//   }, [country, browserLanguage]);

//   // ------ 클라이언트 키로 객체 초기화 ------
//   loadTossPayments(clientKey).then(tossPayments => {
//     // ------ 결제창 띄우기 ------
//     tossPayments
//       .requestPayment('카드', {
//         // 더 많은 결제 정보 파라미터는 결제창 Javascript SDK에서 확인하세요.
//         // https://docs.tosspayments.com/reference/js-sdk
//         amount: priceForToss,
//         orderId: orderId,
//         orderName: orderName,
//         successUrl: `${window.location.origin}/toss/success`,
//         failUrl: `${window.location.origin}/toss/fail`,
//         customerName: userInfo.displayName,
//         customerEmail: userInfo.email,
//         cardCompany: card, // JCB 4J, 아메리칸 익스프레스	7A, 유니온페이	3C, 마스터카드	4M, VISA	4V
//         useInternationalCardOnly: true,
//       })
//       .catch(function (error) {
//         // const deletePre = async () => {
//         //   await chargeApi.deletePrePaymentForTossByOrderId({ orderId });
//         // };
//         // deletePre();
//         setChargeClicked(false);
//         if (error.code === 'USER_CANCEL') {
//           // 결제 고객이 결제창을 닫았을 때 에러 처리
//         }
//         if (error.code === 'INVALID_CARD_COMPANY') {
//           // 유효하지 않은 카드 코드에 대한 에러 처리
//         }
//       });
//   });
// }

// //& 포인트제
// // // Toss.js
// // import React, { useState, useEffect, useRef } from 'react';
// // import { loadPaymentWidget, ANONYMOUS } from '@tosspayments/payment-widget-sdk';
// // import { nanoid } from 'nanoid';
// // import { chargeApi } from '../../api/chargeApi';
// // import { loadTossPayments } from '@tosspayments/payment-sdk';
// // import { useLanguageChange } from '@/hooks';

// // // 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요.
// // // 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// // const clientKey = import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS;
// // // 커스터머 키 아예 없는걸로 일단 셋.
// // const customerKey = import.meta.env.VITE_CUSTOMER_KEY_FOR_TOSS;
// // // const paymentWidget = PaymentWidget(widgetClientKey, PaymentWidget.ANONYMOUS) // 비회원 결제

// // export default function TossCheckoutPageForForeigners({
// //   setChargeClicked,
// //   price,
// //   point,
// //   userInfo,
// //   card,
// //   ...props
// // }) {
// //   const [priceForToss, setPriceForToss] = useState(price);
// //   const orderId = nanoid();
// //   const [orderName, setOrderName] = useState(price);
// //   const browserLanguage = useLanguageChange();
// //   let country;
// //   if (browserLanguage === 'ja') {
// //     country = 'ja';
// //   }
// //   if (browserLanguage === 'en') {
// //     country = 'other';
// //   }

// //   const nameFunction = async () => {
// //     try {
// //       // console.log(
// //       //   'TossCheckoutPageForForeingers의 postPrePayamentForToss용 obj: ',
// //       //   {
// //       //     orderId: orderId,
// //       //     paymentKey: 'not yet',
// //       //     orderName: point + 'P',
// //       //     orderPoint: point,
// //       //     amount: priceForToss,
// //       //     currency: 'KRW',
// //       //     country: country,
// //       //     method: '카드',
// //       //     apiName: 'Toss',
// //       //   }
// //       // );
// //       const result = await chargeApi.postPrePaymentForToss({
// //         orderId: orderId,
// //         paymentKey: 'not yet',
// //         orderName: point + 'P',
// //         orderPoint: point,
// //         amount: priceForToss,
// //         currency: 'KRW',
// //         country: country,
// //         method: '카드',
// //         apiName: 'Toss',
// //       });
// //       // console.log(
// //       //   'TossCheckoutPageForForeingers의 postPrePayamentForToss의 result: ',
// //       //   result
// //       // );
// //       if (result === true) return point + 'P';
// //       throw new Error();
// //     } catch (error) {
// //       console.error('Failed to post pre-payment:', error);
// //       throw error;
// //     }
// //   };

// //   useEffect(() => {
// //     nameFunction()
// //       .then(result => setOrderName(result))
// //       .catch(error => console.error('Failed to set order name:', error));
// //   }, [point, country, browserLanguage]);

// //   // ------ 클라이언트 키로 객체 초기화 ------
// //   loadTossPayments(clientKey).then(tossPayments => {
// //     // ------ 결제창 띄우기 ------
// //     tossPayments
// //       .requestPayment('카드', {
// //         // 더 많은 결제 정보 파라미터는 결제창 Javascript SDK에서 확인하세요.
// //         // https://docs.tosspayments.com/reference/js-sdk
// //         amount: priceForToss,
// //         orderId: orderId,
// //         orderName: orderName,
// //         successUrl: `${window.location.origin}/toss/success`,
// //         failUrl: `${window.location.origin}/toss/fail`,
// //         customerName: userInfo.displayName,
// //         customerEmail: userInfo.email,
// //         cardCompany: card, // JCB 4J, 아메리칸 익스프레스	7A, 유니온페이	3C, 마스터카드	4M, VISA	4V
// //         useInternationalCardOnly: true,
// //       })
// //       .catch(function (error) {
// //         const deletePre = async () => {
// //           await chargeApi.deletePrePaymentForTossByOrderId({ orderId });
// //         };
// //         deletePre();
// //         setChargeClicked(false);
// //         if (error.code === 'USER_CANCEL') {
// //           // 결제 고객이 결제창을 닫았을 때 에러 처리
// //         }
// //         if (error.code === 'INVALID_CARD_COMPANY') {
// //           // 유효하지 않은 카드 코드에 대한 에러 처리
// //         }
// //       });
// //   });
// // }

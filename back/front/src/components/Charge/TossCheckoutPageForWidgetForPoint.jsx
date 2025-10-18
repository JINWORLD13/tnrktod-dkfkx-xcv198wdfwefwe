// & 포인트제
// // Toss.js
// import React, { useState, useEffect, useRef } from 'react';
// import styles from './';
// import { loadPaymentWidget, ANONYMOUS } from '@tosspayments/payment-widget-sdk';
// import { nanoid } from 'nanoid';
// import Button from '../components/common/Button.jsx';
// import { useLanguageChange } from '@/hooks';
// import { chargeApi } from '../../api/chargeApi.jsx';
// import { useTranslation } from 'react-i18next';

// // 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요.
// // 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// const widgetClientKey = import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS;
// // 커스터머 키 아예 없는걸로 일단 셋.
// const customerKey = import.meta.env.VITE_CUSTOMER_KEY_FOR_TOSS;
// // const paymentWidget = PaymentWidget(widgetClientKey, PaymentWidget.ANONYMOUS) // 비회원 결제

// export default function TossCheckoutPageForWidget({
//   setChargeClicked,
//   price,
//   point,
//   userInfo,
//   ...props
// }) {
//   const [paymentWidget, setPaymentWidget] = useState(null);
//   const paymentMethodsWidgetRef = useRef(null);
//   const paymentAgreementWidgetRef = useRef(null);
//   const [priceForToss, setPriceForToss] = useState(price);
//   const [preOrderId, setPreOrderId] = useState(null);
//   const browswerLanguage = useLanguageChange();
//   const orderId = nanoid();
//   const { t } = useTranslation();
//   const [isLoading, setIsLoading] = useState(false);
//   let methodToBeSavedInDB;

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
//         currency: 'KRW',
//         country: 'KR',
//       },
//       { variantKey: 'DEFAULT' }
//       // { variantKey: 'widgetA' }
//     );

//     const paymentAgreement = paymentWidget.renderAgreement('#agreement', {
//       variantKey: 'AGREEMENT',
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
//     browswerLanguage,
//   ]);

//   useEffect(() => {
//     const paymentMethodsWidget = paymentMethodsWidgetRef.current;
//     if (paymentMethodsWidget == null) {
//       return;
//     }
//     paymentMethodsWidget.updateAmount(priceForToss);
//   }, [priceForToss, browswerLanguage]);

//   //! 결제 버튼 클릭시 기능
//   const savePaymentInfo = async () => {
//     //! {type: 'NORMAL', method: '가상계좌'} => method를 db에 보내서, 이걸로 분별...
//     const paymentMethod =
//       paymentMethodsWidgetRef.current.getSelectedPaymentMethod();
//     const paymentAgreement = paymentAgreementWidgetRef.current;
//     const agreementStatus = paymentAgreement.getAgreementStatus();

//     // console.log(
//     //   'TossCheckoutPageForWidget의 savePaymentInfo()의 paymentMethod : ',
//     //   paymentMethod
//     // );
//     // console.log('TossCheckoutPageForWidget의 postPrePaymentForToss의 obj : ', {
//     //   orderId: orderId,
//     //   paymentKey: 'not yet',
//     //   orderName: point + 'P',
//     //   orderPoint: point,
//     //   amount: priceForToss,
//     //   currency: 'KRW',
//     //   country: 'ko',
//     //   method: paymentMethod?.method,
//     //   apiName: 'Toss',
//     // });

//     //! 이용약관 클릭안돼 있으면 post 못하게 하기
//     if (agreementStatus.agreedRequiredTerms === false) return;

//     //같은 실행컨텍스트 내에 setPreviousMethods가 있으면 해당 state는 바로 반영 안됨.
//     setPreOrderId(orderId);

//     // & 같은 수단으로 클릭이 2번 되면 그땐 안됨..
// const { response, cleanup } = await chargeApi.getPrePaymentForTossByOrderId({
//       orderId: preOrderId,
//     });
//     const previousChargeInfo = response

//     let resultOfPostPrePayment;
// if (previousChargeInfo === undefined || previousChargeInfo === null) {
//     const { response, cleanup } = await chargeApi.postPrePaymentForToss({
//     orderId: orderId,
//     paymentKey: 'not yet',
//     orderName: point + 'P',
//     orderPoint: point,
//     amount: priceForToss,
//     currency: 'KRW',
//     country: 'ko',
//     method: paymentMethod?.method,
//     apiName: 'Toss',
//   });
//   resultOfPostPrePayment = reponse
// }

//     if (resultOfPostPrePayment.success === true) {
//       try {
//         // then 넣는 순간 pc환경에서 밖에 처리가 안됨..
//         await paymentWidget
//           ?.requestPayment({
//             orderId: orderId,
//             orderName: point + 'P',
//             customerName: userInfo.displayName,
//             customerEmail: userInfo.email,
//             successUrl: `${window.location.origin}/toss/success`,
//             failUrl: `${window.location.origin}/toss/fail`,
//           })
//           .catch(function (error) {
//     const { response, cleanup } = async () => {
//               await chargeApi.deletePrePaymentForTossByOrderId({ orderId });
//             };
//             const deletePre = response;
// //             deletePre();
//             if (error.code === 'USER_CANCEL') {
//               // 결제 고객이 결제창을 닫았을 때 에러 처리
//             }
//             if (error.code === 'INVALID_CARD_COMPANY') {
//               // 유효하지 않은 카드 코드에 대한 에러 처리
//             }
//             if (error.code === 'INVALID_FLOW_MODE_PARAMETERS') {
//               // console.log('INVALID_FLOW_MODE_PARAMETERS');
//             }
//             if (error.code === 'NEED_CARD_PAYMENT_DETAIL') {
//               // 카드 결제 정보를 선택하지 않았을 때 처리
//             }
//           });
//       } catch (error) {
//         console.error('Error requesting payment:', error);
//       }
//     }
//   };

//   const handlePaymentRequest = async () => {
//     if (isLoading) return;
//     setIsLoading(true); // 작업 상태 변경
//     // 결제를 요청하기 전에 orderId, amount를 서버에 저장하세요.
//     // 결제 과정에서 악의적으로 결제 금액이 바뀌는 것을 확인하는 용도입니다.
//     try {
//       await savePaymentInfo();
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
//       {/* {browswerLanguage === 'ko' ? <div id="payment-widget" /> : null} */}
//       <div id="agreement" />
//       {/* 결제하기 버튼 */}
//       <div className={styles['btn-box']}>
//         <Button
//           className={styles['btn-pay']}
//           onClick={e => {
//             handlePaymentRequest();
//           }}
//         >
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

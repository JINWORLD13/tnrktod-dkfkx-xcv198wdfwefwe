// // Toss.js
// import React, { useState, useEffect, useRef } from 'react';
// import styles from './TossCheckoutPageForWidget.module.scss';
// import { loadPaymentWidget, ANONYMOUS } from '@tosspayments/payment-widget-sdk';
// import { nanoid } from 'nanoid';
// import Button from '../../components/common/Button.jsx';
// import { useLanguageChange } from '@/hooks';
// import { chargeApi } from '../../api/chargeApi.jsx';
// import { useTranslation } from 'react-i18next';
import { isProductionMode } from '@/utils/constants';

// // 구매자의 고유 아이디를 불러와서 customerKey로 설정하세요.
// // 이메일・전화번호와 같이 유추가 가능한 값은 안전하지 않습니다.
// const widgetClientKey = import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS;
// // 커스터머 키 아예 없는걸로 일단 셋.
// const customerKey = import.meta.env.VITE_CUSTOMER_KEY_FOR_TOSS;
// // const paymentWidget = PaymentWidget(widgetClientKey, PaymentWidget.ANONYMOUS) // 비회원 결제

// export default function TossCheckoutPageForWidget({
//   setChargeClicked,
//   totalPrice,
//   userInfo,
//   voucherBox,
//   currencyCode,
//   countryCode,
//   ...props
// }) {
//   const { t } = useTranslation();
//   const [paymentWidget, setPaymentWidget] = useState(null);
//   const paymentMethodsWidgetRef = useRef(null);
//   const paymentAgreementWidgetRef = useRef(null);
//   const [priceForToss, setPriceForToss] = useState(totalPrice);
//   const [preOrderId, setPreOrderId] = useState(null);
//   const browswerLanguage = useLanguageChange();
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
//             elem?.listPrice,
//             elem?.salePercentage,
//             elem?.originalPrice,
//             orderId,
//             'date',
//             browswerLanguage,
//             currencyCode,
//             'not yet',
//             'method',
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
//       if (elem[0] === 1) return `${t(`voucher.one-card-name`)}x${elem[1]}`;
//       if (elem[0] === 2) return `${t(`voucher.two-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 3) return `${t(`voucher.three-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 4) return `${t(`voucher.four-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 5) return `${t(`voucher.five-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 6) return `${t(`voucher.six-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 7) return `${t(`voucher.seven-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 8) return `${t(`voucher.eight-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 9) return `${t(`voucher.nine-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 10) return `${t(`voucher.ten-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 11)
//         return `${t(`voucher.eleven-cards-name`)} x ${elem[1]}`;
//       if (elem[0] === 13)
//         return `${t(`voucher.thirteen-cards-name`)} x ${elem[1]}`;
//     })
//     ?.join(', ')
//     ?.trim(','); // 마지막 쉼표 제거
//   const orderVouchersObj = Object.fromEntries(
//     orderVouchersArr
//       ?.filter(elem => elem !== undefined)
//       .map(elem => [elem[0], elem[1]])
//   );
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
//       { variantKey: 'DEFAULT' }
//       // { variantKey: 'widgetA' }
//     );

//     const paymentAgreement = paymentWidget.renderAgreement('#agreement', {
//       variantKey: 'agreement-kr',
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
//     const paymentMethodsWidget = paymentMethodsWidgetRef?.current;
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

//     //! 이용약관 클릭안돼 있으면 post 못하게 하기
//     if (agreementStatus.agreedRequiredTerms === false) return;

//     //같은 실행컨텍스트 내에 setPreviousMethods가 있으면 해당 state는 바로 반영 안됨.
//     setPreOrderId(orderId);

//     // & 같은 수단으로 클릭이 2번 되면 그땐 안됨..
//     const { response: existingChargeInfo, cleanup } =
//       await chargeApi.getPrePaymentForTossByOrderId({
//         orderId: preOrderId,
//       });

//     let resultOfPostPrePayment;
//     if (existingChargeInfo === undefined || existingChargeInfo === null) {
//       const { response, cleanup } = await chargeApi.postPrePaymentForToss({
//         orderId: orderId,
//         paymentKey: 'not yet',
//         orderName: orderName,
//         orderHistory: Object.fromEntries(
//           Object.entries(orderHistory).map(([key, value]) => [
//             key,
//             value.map((elem, i) => {
//               if (i === 9 && elem === 'method') {
//                 return paymentMethod?.method || elem;
//               }
//               return elem;
//             }),
//           ])
//         ), //& 새로 추가
//         orderVouchersArr: orderVouchersArr,
//         amount: priceForToss,
//         currency: currencyCode,
//         country: countryCode,
//         method: paymentMethod?.method,
//         apiName: 'Toss',
//       });
//       resultOfPostPrePayment = response;
//     }

//     if (resultOfPostPrePayment?.success === true) {
//       try {
//         // then 넣는 순간 pc환경에서 밖에 처리가 안됨..
//         await paymentWidget
//           ?.requestPayment({
//             orderId: orderId,
//             orderName: orderName,
//             customerName: userInfo.displayName,
//             customerEmail: userInfo.email,
//             successUrl: `${window.location.origin}/${browswerLanguage}/toss/success`,
//             failUrl: `${window.location.origin}/${browswerLanguage}/toss/fail`,
//           })
//           .catch(function (error) {
//             // const deletePre = async () => {
//             //   await chargeApi.deletePrePaymentForTossByOrderId({ orderId });
//             // };
//             // deletePre();
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
//       <div className={styles['payment-widget']} id="payment-widget" />
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

// Toss.js
import React, { useState, useEffect, useRef } from 'react';
import styles from './TossCheckoutPageForWidget.module.scss';
import { loadPaymentWidget, ANONYMOUS } from '@tosspayments/payment-widget-sdk';
import { nanoid } from 'nanoid';
import Button from '../../components/common/Button.jsx';
import { useLanguageChange } from '@/hooks';
import { chargeApi } from '../../api/chargeApi.jsx';
import { useTranslation } from 'react-i18next';

// 환경별 클라이언트 키 설정
const widgetClientKey =
  isProductionMode
    ? import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS
    : import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS_TEST;

const customerKey = import.meta.env.VITE_CUSTOMER_KEY_FOR_TOSS;

export default function TossCheckoutPageForWidget({
  setChargeClicked,
  totalPrice,
  userInfo,
  voucherBox,
  currencyCode,
  countryCode,
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
          elem?.listPrice,
          elem?.salePercentage,
          elem?.originalPrice,
          orderId,
          'date',
          browserLanguage, // ✅ 수정된 변수명 사용
          currencyCode,
          'not yet',
          'method',
        ];
        return acc;
      }, {}),
  };

  // ✅ 개선된 배열 처리
  const orderVouchersArr =
    voucherBox
      ?.filter(elem => elem?.amount > 0)
      ?.map(elem => [elem?.count, elem?.amount]) || [];

  // ✅ 개선된 주문명 생성
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

  // ✅ 테스트 환경 클라이언트 키 설정
  const updatedWidgetClientKey =
    userInfo?.email === import.meta.env.VITE_COS1
      ? import.meta.env.VITE_WIDGET_CLIENT_KEY_FOR_TOSS_TEST
      : widgetClientKey;

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
      { variantKey: 'DEFAULT' }
    );

    const paymentAgreement = paymentWidget.renderAgreement('#agreement', {
      variantKey: 'agreement-kr',
    });

    paymentAgreement.on('change', agreementStatus => {
      if (agreementStatus.agreedRequiredTerms) {
        paymentAgreementWidgetRef.current = paymentAgreement;
        paymentMethodsWidgetRef.current = paymentMethodsWidget;
      }
    });
  }, [
    paymentWidget,
    priceForToss,
    currencyCode, // ✅ 의존성 추가
    countryCode, // ✅ 의존성 추가
    browserLanguage, // ✅ 수정된 변수명 사용
  ]);

  useEffect(() => {
    const paymentMethodsWidget = paymentMethodsWidgetRef?.current;
    if (paymentMethodsWidget == null) {
      return;
    }
    paymentMethodsWidget.updateAmount(priceForToss);
  }, [priceForToss, browserLanguage]); // ✅ 수정된 변수명 사용

  // 결제 정보 저장 및 결제 요청
  const savePaymentInfo = async () => {
    const paymentMethod =
      paymentMethodsWidgetRef.current.getSelectedPaymentMethod();

    const paymentAgreement = paymentAgreementWidgetRef.current;
    const agreementStatus = paymentAgreement.getAgreementStatus();

    if (agreementStatus.agreedRequiredTerms === false) return;

    setPreOrderId(orderId);

    const { response: existingChargeInfo } =
      await chargeApi.getPrePaymentForTossByOrderId({
        orderId: preOrderId,
      });

    let resultOfPostPrePayment;
    if (!existingChargeInfo) {
      // ✅ 조건문 단순화
      const { response } = await chargeApi.postPrePaymentForToss({
        orderId: orderId,
        paymentKey: 'not yet',
        orderName: orderName,
        orderHistory: Object.fromEntries(
          Object.entries(orderHistory).map(([key, value]) => [
            key,
            value.map((elem, i) => {
              if (i === 9 && elem === 'method') {
                return paymentMethod?.method || elem;
              }
              return elem;
            }),
          ])
        ),
        orderVouchersArr: orderVouchersArr,
        amount: priceForToss,
        currency: currencyCode,
        country: countryCode,
        method: paymentMethod?.method,
        apiName: 'Toss',
      });
      resultOfPostPrePayment = response;
    }

    if (resultOfPostPrePayment?.success === true) {
      try {
        await paymentWidget
          ?.requestPayment({
            orderId: orderId,
            orderName: orderName,
            customerName: userInfo.displayName,
            customerEmail: userInfo.email,
            successUrl: `${window.location.origin}/${browserLanguage}/toss/success`, // ✅ 수정된 변수명
            failUrl: `${window.location.origin}/${browserLanguage}/toss/fail`, // ✅ 수정된 변수명
          })
          .catch(function (error) {
            if (error.code === 'USER_CANCEL') {
              // 결제 취소 처리
            }
            if (error.code === 'INVALID_CARD_COMPANY') {
              // 유효하지 않은 카드 처리
            }
            if (error.code === 'INVALID_FLOW_MODE_PARAMETERS') {
              // 플로우 모드 파라미터 오류 처리
            }
            if (error.code === 'NEED_CARD_PAYMENT_DETAIL') {
              // 카드 결제 정보 미선택 처리
            }
          });
      } catch (error) {
        console.error('Error requesting payment:', error);
      }
    }
  };

  const handlePaymentRequest = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      await savePaymentInfo();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['widget-container']}>
      <div className={styles['payment-widget']} id="payment-widget" />
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

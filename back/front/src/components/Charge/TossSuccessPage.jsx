import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './SuccessPage.module.scss';
import { useLanguageChange } from '@/hooks';
import { chargeApi } from '../../api/chargeApi.jsx';
import Button from '../../components/common/Button.jsx';
import { useTranslation } from 'react-i18next';

export default function SuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const browserLanguage = useLanguageChange();
  const [vouchers, setVouchers] = useState(null); // vouchers 상태 추가
  const [method, setMethod] = useState(''); // vouchers 상태 추가
  const [currency, setCurrency] = useState(''); // vouchers 상태 추가
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState(0);
  const { t } = useTranslation();

  const moveToHome = () => {
    window.location.href = `${window.location.origin}/${browserLanguage}`;
  };
  const moveToMyPage = () => {
    window.location.href = `${window.location.origin}/${browserLanguage}/mypage`;
  };

  const requestData = {
    paymentType: searchParams.get('paymentType'),
    orderId: searchParams.get('orderId'),
    amount: searchParams.get('amount'),
    paymentKey: searchParams.get('paymentKey'),
  };

  async function confirm() {
    const { response, cleanup: cleanupForPostPay } =
      await chargeApi.postPaymentForToss({
        ...requestData,
      });

    // console.log('TossSusscessPage의 confirm()의 response값 : ', response);
    // fetchAPI에서만 res.ok를 바로 쓸 수 있음.(난 axios를 썼음)
    const ok = response?.status >= 200 && response?.status < 300;
    if (!ok) {
      navigate(
        `/fail?message=${response?.data?.message}&code=${response?.data?.code}`
      );

      // // db에서 prepament 삭제
      // const result = await chargeApi.deletePrePaymentForTossByOrderId({
      //   orderId: requestData?.orderId,
      // });
      // // console.log(
      // //   'TossSusscessPage의 confirm()(deletePrePayment값)의 result값 : ',
      // //   result
      // // );
      // if (result?.success === true)
      //   navigate(
      //     `/fail?message=${response?.data?.message}&code=${response?.data?.code}`
      //   );
      return;
    }

    let cleanupForGetPre;
    const getOrderInfo = async () => {
      // console.log(
      //   'TossSusscessPage의 getOrderInfo() 내의 requestData값 : ',
      //   requestData
      // );
      const { response, cleanup: cleanup } =
        await chargeApi.getPrePaymentForTossByOrderId({
          orderId: requestData?.orderId,
        });
      cleanupForGetPre = cleanup;
      const result = response;
      const success_orderName = result?.orderName?.split('\n')?.join(', ');
      setVouchers(success_orderName);
      setMethod(result?.data?.method);
      setCurrency(result?.data?.currency);
      setOrderId(result?.data?.orderId);
      setAmount(result?.data?.amount);
    };
    await getOrderInfo(); //! await 덕분에 setState함수가 처리 되고 아래 코드들이 실행됨.
    // console.log('TossSusscessPage의 requestData값 : ', requestData);
    // console.log('TossSusscessPage의 method값 : ', method);

    if (method === '가상계좌') return;

    if (vouchers === undefined)
      navigate(
        `/fail?message=${response?.data?.message}&code=${response?.data?.code}`
      );

    const { response: responseForPutPre, cleanup: cleanupForPutPre } =
      await chargeApi.putPrePaymentForToss({
        orderId: requestData?.orderId,
        paymentKey: requestData?.paymentKey,
      });

    return () => {
      cleanupForPostPay();
      if (cleanupForGetPre) cleanupForGetPre();
      cleanupForPutPre();
    };
  }

  useEffect(() => {
    // 쿼리 파라미터 값이 결제 요청할 때 보낸 데이터와 동일한지 반드시 확인하세요.
    // 클라이언트에서 결제 금액을 조작하는 행위를 방지할 수 있습니다.
    confirm();
  }, [vouchers, searchParams, browserLanguage]); //? 첫 결제시 업뎃 안되면 chargeInfo 밖에서 선언 후 여기에도 넣기

  return (
    <div className={styles['container']}>
      {browserLanguage === 'ja' ? (
        <div className={styles['payment-container-japanese']}>
          <div className={styles['payment-box-japanese']}>
            <div className={styles['content-japanese']}>
              <h2
                className={
                  browserLanguage === 'ja'
                    ? styles['japanese-potta-font']
                    : styles['korean-dongle-font']
                }
              >
                {method === '가상계좌'
                  ? t(`order.order_pending`)
                  : t(`order.order_success`)}
              </h2>
              <p>{`${t(`order.order_number`)}: ${
                searchParams.get('orderId') || orderId
              }`}</p>
              <p>{`${t(`order.order_vouchers`)}: ${vouchers}`}</p>
              <p>{`${t(`order.order_amount`)}: ${
                currency === 'USD' ? 'USD' : '￦'
              } ${
                Number(searchParams.get('amount')).toLocaleString() || amount
              } ${
                browserLanguage === 'ko' && method === '가상계좌'
                  ? '(入金待ち中)'
                  : ''
              }`}</p>
            </div>
            <div className={styles['btn-box']}>
              <Button
                className={styles['home-btn-japanese']}
                onClick={moveToHome}
              >
                {t(`button.home`)}
              </Button>
              <Button
                className={styles['mypage-btn-japanese']}
                onClick={moveToMyPage}
              >
                {t(`button.mypage`)}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles['payment-container']}>
          <div className={styles['payment-box']}>
            <div className={styles['content']}>
              <h2
                className={
                  browserLanguage === 'ja'
                    ? styles['japanese-potta-font']
                    : styles['korean-dongle-font']
                }
              >
                {method === '가상계좌'
                  ? t(`order.order_pending`)
                  : t(`order.order_success`)}
              </h2>
              <p>{`${t(`order.order_number`)}: ${searchParams.get(
                'orderId'
              )}`}</p>
              <p>{`${t(`order.order_vouchers`)}: ${vouchers}`}</p>
              <p>{`${t(`order.order_amount`)}: ${
                currency === 'USD' ? 'USD' : '￦'
              } ${Number(searchParams.get('amount')).toLocaleString()} ${
                browserLanguage === 'ko' && method === '가상계좌'
                  ? '(입금대기중)'
                  : browserLanguage === 'en' && method === '가상계좌'
                  ? '(Pending deposit)'
                  : ''
              }`}</p>
            </div>
            <div className={styles['btn-box']}>
              <Button className={styles['home-btn']} onClick={moveToHome}>
                {t(`button.home`)}
              </Button>
              <Button className={styles['mypage-btn']} onClick={moveToMyPage}>
                {t(`button.mypage`)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// import { useEffect, useState } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import styles from './';
// import { useLanguageChange } from '@/hooks';
// import { chargeApi } from '../../api/chargeApi';
// import Button from '../components/common/Button';
// import { useTranslation } from 'react-i18next';

// export default function SuccessPage() {
//   const navigate = useNavigate();
//   const [searchParams] = useSearchParams();
//   const browserLanguage = useLanguageChange();
//   const [vouchers, setVouchers] = useState(null); // vouchers 상태 추가
//   const [method, setMethod] = useState(''); // vouchers 상태 추가
//   const { t } = useTranslation();

//   const moveToHome = () => {
//     window.location.href = `${window.location.origin}`;
//   };
//   const moveToMyPage = () => {
//     window.location.href = `${window.location.origin}/mypage`;
//   };

//   const requestData = {
//     paymentType: searchParams.get('paymentType'),
//     orderId: searchParams.get('orderId'),
//     amount: searchParams.get('amount'),
//     paymentKey: searchParams.get('paymentKey'),
//   };

//   async function confirm() {
//     //! 결제처리(유저 포인트도 업뎃하는 거).
//      const { response, cleanup } = await chargeApi.postPaymentForToss({ ...requestData });
//     // console.log('TossSusscessPage의 confirm()의 response값 : ', response);
//     // fetchAPI에서만 res.ok를 바로 쓸 수 있음.(난 axios를 썼음)
//     const ok = response?.status >= 200 && response?.status < 300;

//     //! 결제 실패 비즈니스 로직을 구현하세요.
//     if (!ok) {
//       // db에서 prepament 삭제
// const { response, cleanup } = await chargeApi.deletePrePaymentForTossByOrderId({
//   orderId: requestData?.orderId,
// });
// const result = response;
//       // console.log(
//       //   'TossSusscessPage의 confirm()(deletePrePayment값)의 result값 : ',
//       //   result
//       // );
//       if (result?.success === true)
//         navigate(
//           `/fail?message=${response?.data?.message}&code=${response?.data?.code}`
//         );
//       return;
//     }

//     //! 결제 성공 비즈니스 로직을 구현하세요.
//     const getOrderInfo = async () => {
//       // console.log(
//       //   'TossSusscessPage의 getOrderInfo() 내의 requestData값 : ',
//       //   requestData
//       // );
// const { response, cleanup } = await chargeApi.getPrePaymentForTossByOrderId({
//   orderId: requestData?.orderId,
// });
// const result = response;
//       // console.log('TossSusscessPage의 getPrePaymentForTossByOrderId의 result값 : ', result);
//       setVouchers(result?.orderVouchers);
//       setMethod(result?.method);
//     };
//     await getOrderInfo();
//     // console.log('TossSusscessPage의 requestData값 : ', requestData);
//     // console.log('TossSusscessPage의 method값 : ', method);
//     if (method === '가상계좌') return;
//     await chargeApi.putPrePaymentForToss({
//       orderId: requestData?.orderId,
//       paymentKey: requestData?.paymentKey,
//     });
//   }

//   useEffect(() => {
//     // 쿼리 파라미터 값이 결제 요청할 때 보낸 데이터와 동일한지 반드시 확인하세요.
//     // 클라이언트에서 결제 금액을 조작하는 행위를 방지할 수 있습니다.
//     confirm();
//   }, [vouchers, searchParams, browserLanguage]); //? 첫 결제시 업뎃 안되면 chargeInfo 밖에서 선언 후 여기에도 넣기

//   return (
//     <div className={styles['container']}>
//       {browserLanguage === 'ja' ? (
//         <div className={styles['payment-container-japanese']}>
//           <div className={styles['payment-box-japanese']}>
//             <div className={styles['content-japanese']}>
//               <h2>
//                 {method === '가상계좌'
//                   ? t(`order.order_pending`)
//                   : t(`order.order_success`)}
//               </h2>
//               <p>{`${t(`order.order_number`)}: ${searchParams.get(
//                 'orderId'
//               )}`}</p>
//               <p>{`${t(`order.order_vouchers`)}: ${vouchers} P${
//                 browserLanguage === 'ko' && method === '가상계좌'
//                   ? '(入金待ち中)'
//                   : ''
//               }`}</p>
//               <p>{`${t(`order.order_amount`)}: ￦ ${Number(
//                 searchParams.get('amount')
//               ).toLocaleString()}`}</p>
//             </div>
//             <div className={styles['btn-box']}>
//               <Button
//                 className={styles['home-btn-japanese']}
//                 onClick={moveToHome}
//               >
//                 {t(`button.home`)}
//               </Button>
//               <Button
//                 className={styles['mypage-btn-japanese']}
//                 onClick={moveToMyPage}
//               >
//                 {t(`button.mypage`)}
//               </Button>
//             </div>
//           </div>
//         </div>
//       ) : (
//         <div className={styles['payment-container']}>
//           <div className={styles['payment-box']}>
//             <div className={styles['content']}>
//               <h2>
//                 {method === '가상계좌'
//                   ? t(`order.order_pending`)
//                   : t(`order.order_success`)}
//               </h2>
//               <p>{`${t(`order.order_number`)}: ${searchParams.get(
//                 'orderId'
//               )}`}</p>
//               <p>{`${t(`order.order_vouchers`)}: ${vouchers} P${
//                 browserLanguage === 'ko' && method === '가상계좌'
//                   ? '(입금대기중)'
//                   : browserLanguage === 'en' && method === '가상계좌'
//                   ? '(Pending deposit)'
//                   : ''
//               }`}</p>
//               <p>{`${t(`order.order_amount`)}: ￦ ${Number(
//                 searchParams.get('amount')
//               ).toLocaleString()}`}</p>
//             </div>
//             <div className={styles['btn-box']}>
//               <Button className={styles['home-btn']} onClick={moveToHome}>
//                 {t(`button.home`)}
//               </Button>
//               <Button className={styles['mypage-btn']} onClick={moveToMyPage}>
//                 {t(`button.mypage`)}
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useEffect, useState } from 'react';
import Card from '../../../components/common/Card.jsx';
import styles from './ChargeModal.module.scss';
import { useLanguageChange } from '@/hooks';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/common/Button.jsx';
import { chargeApi } from '../../../../api/chargeApi.jsx';
// import GooglePayButton from '@google-pay/button-react.jsx';
import TossCheckoutPageForWidget from '../../../Charge/TossCheckoutPageForWidget.jsx';
import TossCheckoutPageForForeigners from '../../../Charge/TossCheckoutPageForForeigners.jsx';
import RefundPolicyModal from '../../RefundPolicyModal/RefundPolicyModal.jsx';
import { useFetchUserAndTarotData } from '@/hooks';
import { userApi } from '../../../../api/userApi.jsx';
import { spreadPriceObjForVoucher } from '../../../../data/spreadList/spreadPrice.jsx';
import PriceInfoModal from '../../PriceInfoModal/PriceInfoModal.jsx';
import TossCheckoutPageForPayPalWidget from '../../../Charge/TossCheckoutPageForPayPalWidget.jsx';
import { isDevelopmentMode } from '@/utils/constants';

const ChargeModal = ({
  isRefundPolicyOpen,
  updateRefundPolicyOpen,
  ...props
}) => {
  const browserLanguage = useLanguageChange();
  const { t } = useTranslation();
  const [userInfo, setUserInfo] = useState({});
  const [isConfirmClicked, setConfirmClicked] = useState(false);
  const [isChargeClicked, setChargeClicked] = useState(false);
  const [idForCurrency, setIdForCurrency] = useState(0);
  // const minimumPointForGooglePay = 0;
  // const [point, setPoint] = useState(minimumPointForGooglePay);
  const minimumPointForStripe = 10;
  const [point, setPoint] = useState(minimumPointForStripe);
  const [rate, setRate] = useState({}); //& 1USD 기준 각 화폐 RATE & 미국 기준 하루 혹은 내부 사정에 따른 특정 기준 단위로 업데이트됨.
  const [price, setPrice] = useState(0);
  const [convertedUSD, setConvertedUSD] = useState(0); //~ usd 환율용(stripe엔 필수)
  const [convertedKRW, setConvertedKRW] = useState(0); //~ usd 환율용(stripe엔 필수)
  const [convertedJPY, setConvertedJPY] = useState(0); //~ usd 환율용(stripe엔 필수)
  const [card, setCard] = useState('');
  // const fetchStripeCurrencyRate = async () => {
  //   const rateData = await chargeApi.getRate(); // chargeApi에 대한 호출
  //   setRate(rateData);
  //   if (browserLanguage === 'en') {
  //     setConvertedUSD(prev => {
  //       return (point * rateData?.USD) / 100;
  //     });
  //     setIdForCurrency(1);
  //     setPrice(convertedUSD); //~ usd 환율용(stripe엔 필수)
  //   }
  //   if (browserLanguage === 'ko') {
  //     setConvertedKRW(prev => {
  //       return Math.ceil((point * (Math.ceil(rate?.KRW * 10) / 10)) / 100);
  //     });
  //     setIdForCurrency(2);
  //     setPrice(convertedKRW); //~ usd 환율용(stripe엔 필수)
  //   }
  //   if (browserLanguage === 'ja') {
  //     setConvertedJPY(prev => {
  //       return Math.ceil((point * (Math.ceil(rate?.JPY * 10) / 10)) / 100);
  //     });
  //     setIdForCurrency(3);
  //     setPrice(convertedJPY); //~ usd 환율용(stripe엔 필수)
  //   }

  //   // 달러
  //   // const calculatedUSD = (point * rateData?.USD) / 100;
  //   // setConvertedUSD(calculatedUSD);

  //   // 한화 : 소수점에서 올림
  //   // const calculatedKRW = Math.ceil(
  //   //   (point * (Math.ceil(rate?.KRW * 10) / 10)) / 100
  //   // );
  //   // setConvertedKRW(calculatedKRW);

  //   // 엔화 : 소수점에서 올림
  //   // const calculatedJPY = Math.ceil(
  //   //   (point * (Math.ceil(rate?.JPY * 10) / 10)) / 100
  //   // );
  //   // setConvertedJPY(calculatedJPY);
  // };

  const getUser = useFetchUserData(userApi, setUserInfo);
  useEffect(() => {
    getUser();
  }, []);
  const fetchGooglePayCurrencyRate = async () => {
    const rateData = await chargeApi.getRate(); // chargeApi에 대한 호출
    setRate(rateData);
    if (browserLanguage === 'en') {
      setIdForCurrency(1);
      const calculatedUSD = point * 0.01;
      setConvertedUSD(calculatedUSD);
      setPrice(convertedUSD); //~ usd 환율용(stripe엔 필수)
    }
    if (browserLanguage === 'ko') {
      setIdForCurrency(2);
      const calculatedKRW = point * 10;
      setConvertedKRW(calculatedKRW);
      setPrice(convertedKRW); //~ usd 환율용(stripe엔 필수)
    }
    if (browserLanguage === 'ja') {
      setIdForCurrency(3);
      const calculatedJPY = point * 1;
      setConvertedJPY(calculatedJPY);
      setPrice(convertedJPY); //~ usd 환율용(stripe엔 필수)
    }
  };
  const fetchTossCurrencyRate = async () => {
    const calculatedKRW = point * 10;
    setConvertedKRW(calculatedKRW);
    setPrice(convertedKRW); //~ usd 환율용(stripe엔 필수)
  };

  useEffect(() => {
    const updatePriceAndPoint = async () => {
      await fetchTossCurrencyRate(); // ! toss용(only KRW)
    };
    updatePriceAndPoint();
  }, [point, convertedKRW, browserLanguage]);

  // //! only KRW(toss용) - 환율 설정;;
  // const fetchTossCurrencyRate = async () => {
  //   const rateData = await chargeApi.getRate(); // chargeApi에 대한 호출
  //   setRate(rateData);
  //   const calculatedKRW = point * 10 + (rate?.KRW - rate?.KRW);
  //   setConvertedKRW(calculatedKRW);
  //   setPrice(convertedKRW); //~ usd 환율용(stripe엔 필수)
  // };

  // //! 환율 설정;;
  // useEffect(() => {
  //   const updatePriceAndPoint = async () => {
  //     // await fetchGooglePayCurrencyRate(); // ? googlepay용(고정 환율)
  //     // await fetchStripeCurrencyRate(); // ~ stripe용 (환율)
  //     await fetchTossCurrencyRate(); // ! toss용(only KRW) - 종속성 point 넣어야 반영되지만 느리기 때문에 rate.KRW 넣고 빼고 함.
  //   };
  //   updatePriceAndPoint();
  // }, [rate, browserLanguage]);
  // const handleChargePointsForStripe = async () => {
  //   try {
  //     // 서버로 충전할 포인트 정보 전송
  //     await chargeApi.postPaymentForStripe({
  //       items: [{ id: idForCurrency, quantity: point, unit_amount: price }], //~ usd 환율용(stripe엔 필수)
  //       // items: [{ id: idForCurrency, quantity: point }], // 단일 가격용
  //     });
  //   } catch (error) {
  //     console.error('error while charging point:', error);
  //   }
  // };

  const points = {
    reset: 'reset',
    '1p': 1,
    '-1': -1,
    '10p': 10,
    '-1': -10,
    '100p': 100,
    '-1': -100,
    '1000p': 1000,
    '-1': -1000,
  };
  let currencyCode;
  let countryCode;
  // let totalPrice;
  if (idForCurrency === 1) {
    currencyCode = 'USD';
    countryCode = 'US';
    // totalPrice = (point * 0.01).toString();
  }
  if (idForCurrency === 2) {
    currencyCode = 'KRW';
    countryCode = 'KR';
    // totalPrice = (point * 10).toString();
  }

  if (idForCurrency === 3) {
    currencyCode = 'JPY';
    countryCode = 'JP';
    // totalPrice = (point * 1).toString();
  }
  // const handleGooglePaymentSuccess = async paymentResult => {
  //   // 결제 정보를 서버로 전송
  //   await chargeApi.postPaymentForGooglePay(paymentResult, countryCode);
  // };

  const closeChargeModal = () => {
    if (
      props?.updateChargeModalOpen !== undefined &&
      props?.updateChargeModalOpen !== null
    )
      props?.updateChargeModalOpen(false);
  };

  const openRefundPolicyModal = () => {
    updateRefundPolicyOpen(true);
  };

  const openChargePage = () => {
    setConfirmClicked(true);
  };

  const deletePrePaymentByPaymentKey = async () => {
    await chargeApi.deletePrePaymentForTossByPaymentKey({
      paymentKey: 'not yet',
    });
  };

  useEffect(() => {
    if (isChargeClicked && browserLanguage !== 'ko') {
      closeChargeModal();
    }
  }, [isChargeClicked, browserLanguage, isRefundPolicyOpen]);

  return (
    <>
      <div
        className={`${styles['backdrop']} ${
          isRefundPolicyOpen ? styles['no-scroll'] : ''
        } `}
      />
      {isConfirmClicked === false &&
        isChargeClicked === false &&
        isRefundPolicyOpen === true && (
          <RefundPolicyModal updateRefundPolicyOpen={updateRefundPolicyOpen} />
        )}
      {isChargeClicked && (
        <div
          className={
            browserLanguage === 'ja'
              ? styles['toss-payment-japanese']
              : styles['toss-payment']
          }
        >
          {browserLanguage === 'ko' ? (
            <TossCheckoutPageForWidget
              setChargeClicked={setChargeClicked}
              price={price}
              point={point}
              userInfo={userInfo}
            />
          ) : card === '3C' ? (
            <TossCheckoutPageForForeigners
              setChargeClicked={setChargeClicked}
              price={price}
              point={point}
              userInfo={userInfo}
              card={card}
            />
          ) : (
            <TossCheckoutPageForWidget
              setChargeClicked={setChargeClicked}
              price={price}
              point={point}
              userInfo={userInfo}
            />
          )}
        </div>
      )}
      {isConfirmClicked === true && isChargeClicked === false && (
        <Card className={styles['purchase-modal']}>
          {/* <div
            className={
              browserLanguage === 'ja'
                ? styles['comming-soon-japanese']
                : styles['comming-soon']
            }
          >
            {t(`charge_modal.comming-soon`)}
          </div> */}
          <header className={styles['charge-content']}>
            <TossPointPurchase
              convertedKRW={convertedKRW}
              convertedJPY={convertedJPY}
              convertedUSD={convertedUSD}
              point={point}
              setPoint={setPoint}
              points={points}
              minimumPointForStripe={minimumPointForStripe}
            />
          </header>
          <footer className={styles['button-box']}>
            <TossPointPurchaseButton
              deletePrePaymentByPaymentKey={deletePrePaymentByPaymentKey}
              setChargeClicked={setChargeClicked}
              setCard={setCard}
              closeChargeModal={closeChargeModal}
            />
            ;
          </footer>
        </Card>
      )}
      {isConfirmClicked === false && isRefundPolicyOpen === false && (
        <Card className={styles['modal']}>
          <header
            className={`${
              browserLanguage === 'ja'
                ? styles['title-japanese']
                : styles['title']
            }`}
          >
            <p>{t(`alert_modal.notice`)}</p>
          </header>
          <div
            className={`${
              browserLanguage === 'ja'
                ? styles['modal-content-japanese']
                : styles['modal-content']
            }`}
          >
            <p>{props?.children}</p>
          </div>
          {/* footer는 div지만 명시적으로 아래에 있는 div로 설정. 그리고 width는 자동으로 100%; */}
          <footer className={styles['button-box']}>
            <Button
              className={styles['button']}
              onClick={() => {
                openRefundPolicyModal();
              }}
            >
              {t(`button.refund-policy`)}
            </Button>
            <Button
              className={styles['button']}
              onClick={() => {
                deletePrePaymentByPaymentKey({ paymentKey: 'not yet' });
                openChargePage();
              }}
            >
              {t(`button.confirm`)}
            </Button>
            <Button
              className={styles['button']}
              onClick={() => {
                deletePrePaymentByPaymentKey({ paymentKey: 'not yet' });
                closeChargeModal();
              }}
            >
              {t(`button.close`)}
            </Button>
          </footer>
        </Card>
      )}
    </>
  );
};

export default ChargeModal;

const TossPointPurchase = ({
  convertedKRW,
  convertedJPY,
  convertedUSD,
  point,
  setPoint,
  points,
  minimumPointForStripe,
  ...props
}) => {
  const browserLanguage = useLanguageChange();
  return (
    <>
      <div className={styles['empty']}></div>
      <div className={styles['empty']}></div>
      {browserLanguage === 'en' && (
        <>
          <div className={styles['point']}>CHARGE POINT : {point}P</div>
          <div className={styles['price']}>
            (CHARGE PRICE : {convertedKRW}KRW)
          </div>
          {/* <div className={styles['price']}>
                    (CHARGE PRICE : {convertedUSD}USD)
                  </div> */}
        </>
      )}
      {browserLanguage === 'ko' && (
        <>
          <div className={styles['point']}>충전 포인트 : {point}P</div>
          <div className={styles['price']}>(충전 가격 : {convertedKRW}원)</div>
          {/* <div className={styles['price']}>
                    (충전 가격(수수료 포함) : {convertedKRW}원)
                  </div>
                  <div className={styles['price']}>
                    (환율 : {Math.ceil(rate?.KRW * 10) / 10}원/USD)
                  </div> */}
        </>
      )}
      {browserLanguage === 'ja' && (
        <>
          <div className={styles['point-japanese']}>
            チャージポイント : {point}P
          </div>
          <div className={styles['price-japanese']}>
            (チャージ料金 : {convertedKRW}ウォン)
          </div>
          {/* <div className={styles['price-japanese']}>
                    (チャージ料金(手数料を含む) : {convertedJPY}円)
                  </div>
                  <div className={styles['price-japanese']}>
                    (為替 : {Math.ceil(rate?.JPY)}円/USD)
                  </div> */}
        </>
      )}
      <div className={styles['empty']}></div>
      <div className={styles['point-button-box']}>
        <div>
          <Button
            className={styles['point-button']}
            onClick={() => {
              setPoint(prev => {
                if (point === minimumPointForStripe)
                  return minimumPointForStripe;
                if (prev + -1 < minimumPointForStripe)
                  return minimumPointForStripe;
                return prev + -1;
              });
            }}
          >
            {voucherAmount['-1']}
          </Button>
          <Button
            className={styles['point-button']}
            onClick={() => {
              setPoint(prev => {
                if (point === minimumPointForStripe)
                  return minimumPointForStripe;
                if (prev + -1 < minimumPointForStripe)
                  return minimumPointForStripe;
                return prev + -1;
              });
            }}
          >
            {voucherAmount['-1']}
          </Button>
          <Button
            className={styles['point-button']}
            onClick={() => {
              setPoint(prev => {
                if (point === minimumPointForStripe)
                  return minimumPointForStripe;
                if (prev + -1 < minimumPointForStripe)
                  return minimumPointForStripe;
                return prev + -1;
              });
            }}
          >
            {voucherAmount['-1']}
          </Button>
          <Button
            className={styles['point-button']}
            onClick={() => {
              setPoint(prev => {
                if (point === minimumPointForStripe)
                  return minimumPointForStripe;
                if (prev + -1 < minimumPointForStripe)
                  return minimumPointForStripe;
                return prev + -1;
              });
            }}
          >
            {voucherAmount['-1']}
          </Button>
        </div>
        <Button
          className={styles['point-button']}
          onClick={() => {
            setPoint(minimumPointForStripe);
          }}
        >
          {voucherAmount['reset']}
        </Button>
        <div>
          <Button
            className={styles['point-button']}
            onClick={() => {
              setPoint(prev => prev + 1);
            }}
          >
            {voucherAmount['1p']}
          </Button>
          <Button
            className={styles['point-button']}
            onClick={() => {
              setPoint(prev => prev + 10);
            }}
          >
            {voucherAmount['10p']}
          </Button>
          <Button
            className={styles['point-button']}
            onClick={() => {
              setPoint(prev => prev + 10);
            }}
          >
            {voucherAmount['100p']}
          </Button>
          <Button
            className={styles['point-button']}
            onClick={() => {
              setPoint(prev => prev + 10);
            }}
          >
            {voucherAmount['1000p']}
          </Button>
        </div>
      </div>
      <div className={styles['empty']}></div>
    </>
  );
};

const TossPointPurchaseButton = ({
  deletePrePaymentByPaymentKey,
  setChargeClicked,
  setCard,
  closeChargeModal,
  ...props
}) => {
  const browserLanguage = useLanguageChange();
  const { t } = useTranslation();
  return (
    <>
      {browserLanguage === 'ko' && (
        <Button
          onClick={() => {
            deletePrePaymentByPaymentKey({ paymentKey: 'not yet' });
            const timerId = setTimeout(() => {
              setChargeClicked(true);
            }, 1000);
            return () => clearTimeout(timerId); // 컴포넌트 언마운트 시 타이머 제거
          }}
        >
          {t(`button.charge`)}
        </Button>
      )}
      {browserLanguage === 'ja' && (
        <>
          {/* <Button
                  onClick={() => {
                    deletePrePaymentByPaymentKey({ paymentKey: 'not yet' });
                    setCard('4M');
                    const timerId = setTimeout(() => {
                      setChargeClicked(true);
                    }, 1000);
                    return () => clearTimeout(timerId); // 컴포넌트 언마운트 시 타이머 제거
                  }}
                >
                  {t(`card.master`)}
                </Button>
                <Button
                  onClick={() => {
                    deletePrePaymentByPaymentKey({ paymentKey: 'not yet' });
                    setCard('4V');
                    const timerId = setTimeout(() => {
                      setChargeClicked(true);
                    }, 1000);
                    return () => clearTimeout(timerId); // 컴포넌트 언마운트 시 타이머 제거
                  }}
                >
                  {t(`card.visa`)}
                </Button>
                <Button
                  onClick={() => {
                    deletePrePaymentByPaymentKey({ paymentKey: 'not yet' });
                    setCard('4J');
                    const timerId = setTimeout(() => {
                      setChargeClicked(true);
                    }, 1000);
                    return () => clearTimeout(timerId); // 컴포넌트 언마운트 시 타이머 제거
                  }}
                >
                  {t(`card.jcb`)}
                </Button> */}
          <Button
            onClick={() => {
              deletePrePaymentByPaymentKey({ paymentKey: 'not yet' });
              const timerId = setTimeout(() => {
                setChargeClicked(true);
              }, 1000);
              return () => clearTimeout(timerId); // 컴포넌트 언마운트 시 타이머 제거
            }}
          >
            {t(`button.paypal`)}
          </Button>
        </>
      )}
      {browserLanguage === 'en' && (
        <>
          {/* <Button
                  onClick={() => {
                    deletePrePaymentByPaymentKey({ paymentKey: 'not yet' });
                    setCard('4M');
                    const timerId = setTimeout(() => {
                      setChargeClicked(true);
                    }, 1000);
                    return () => clearTimeout(timerId); // 컴포넌트 언마운트 시 타이머 제거
                  }}
                >
                  {t(`card.master`)}
                </Button>
                <Button
                  onClick={() => {
                    deletePrePaymentByPaymentKey({ paymentKey: 'not yet' });
                    setCard('4V');
                    const timerId = setTimeout(() => {
                      setChargeClicked(true);
                    }, 1000);
                    return () => clearTimeout(timerId); // 컴포넌트 언마운트 시 타이머 제거
                  }}
                >
                  {t(`card.visa`)}
                </Button> */}
          {/* <Button
                  onClick={() => {
                    setCard('7A');
                    const timerId = setTimeout(() => {
                      setChargeClicked(true);
                    }, 1000);
                    return () => clearTimeout(timerId); // 컴포넌트 언마운트 시 타이머 제거
                  }}
                >
                  {t(`card.american_express`)}
                </Button> */}
          <Button
            onClick={() => {
              deletePrePaymentByPaymentKey({ paymentKey: 'not yet' });
              const timerId = setTimeout(() => {
                setChargeClicked(true);
              }, 1000);
              return () => clearTimeout(timerId); // 컴포넌트 언마운트 시 타이머 제거
            }}
          >
            {t(`button.paypal`)}
          </Button>
          <Button
            onClick={() => {
              deletePrePaymentByPaymentKey({ paymentKey: 'not yet' });
              setCard('3C');
              const timerId = setTimeout(() => {
                setChargeClicked(true);
              }, 1000);
              return () => clearTimeout(timerId); // 컴포넌트 언마운트 시 타이머 제거
            }}
          >
            {t(`card.union_pay`)}
          </Button>
        </>
      )}
      {/* <Button
              className={styles['button']}
              onClick={() => {
                handleChargePointsForStripe();
              }}
            >
              {t(`button.charge`)}
            </Button> */}
      {/* <GooglePayButton
              environment="PRODUCTION"
              paymentRequest={{
                apiVersion: 2,
                apiVersionMinor: 0,
                allowedPaymentMethods: [
                  {
                    type: 'CARD',
                    parameters: {
                      allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                      allowedCardNetworks: ['MASTERCARD', 'VISA'],
                    },
                    tokenizationSpecification: {
                      type: 'PAYMENT_GATEWAY',
                      parameters: {
                        gateway: 'stripe', // 게이트웨이
                        gatewayMerchantId: 'exampleGatewayMerchantId', //가맹점 ID
                      },
                    },
                  },
                ],
                merchantInfo: {
                  merchantId: 'BCR2DN4TQGYPPXJW',
                  merchantName: 'Cosmos Tarot',
                },
                transactionInfo: {
                  totalPriceStatus: 'FINAL',
                  totalPriceLabel: 'Total',
                  totalPrice: totalPrice,
                  currencyCode: currencyCode,
                  countryCode: countryCode,
                },
              }}
              onLoadPaymentData={paymentRequest => {
                // 주로 디버깅 및 결제 데이터의 유효성 검사 등에 사용
                if (isDevelopmentMode) {
                  console.log('load payment data', paymentRequest);
                }
              }}
              onPaymentSuccess={handleGooglePaymentSuccess} // 결제 성공 시 콜백 함수
            /> */}
      <Button
        className={styles['button']}
        onClick={() => {
          deletePrePaymentByPaymentKey({ paymentKey: 'not yet' });
          closeChargeModal();
        }}
      >
        {t(`button.close`)}
      </Button>
    </>
  );
};

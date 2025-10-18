import React, { useEffect, useState } from 'react';
import styles from './ChargeModal.module.scss';
import { useLanguageChange } from '@/hooks';
import { useTranslation } from 'react-i18next';
import Button from '../../../components/common/Button.jsx';
import CancelButton from '../../../components/common/CancelButton.jsx';
import { chargeApi } from '../../../api/chargeApi.jsx';
import TossCheckoutPageForWidget from '../../../components/Charge/TossCheckoutPageForWidget.jsx';
import RefundPolicyModal from '../../RefundPolicyModal/RefundPolicyModal.jsx';
import { spreadPriceObjForVoucher } from '../../../data/spreadList/spreadPrice.jsx';
import PriceInfoModal from '../../PriceInfoModal/PriceInfoModal.jsx';
import TossCheckoutPageForPayPalWidget from '../../../components/Charge/TossCheckoutPageForPayPalWidget.jsx';
import { voucherBox } from '../../../data/voucherBox/voucherBox.jsx';
import Card from '../../../components/common/Card.jsx';

const ChargeModal = ({
  isRefundPolicyOpen,
  updateRefundPolicyOpen,
  isPriceInfoModalOpen,
  updatePriceInfoModalOpen,
  setBlinkModalForChargingKRWOpen,
  setBlinkModalForChargingUSDOpen,
  userInfoFromMyPage,
  setUnavailableVoucher,
  requiredVoucherInfo,
  ...props
}) => {
  const browserLanguage = useLanguageChange();
  const { t } = useTranslation();

  const [userInfo, setUserInfo] = useState(userInfoFromMyPage || {});
  const [requiredVoucherName, serRequiredVoucherName] = useState(prev => {
    if (requiredVoucherInfo?.name === 1) return 'I';
    if (requiredVoucherInfo?.name === 2) return 'II';
    if (requiredVoucherInfo?.name === 3) return 'III';
    if (requiredVoucherInfo?.name === 4) return 'IV';
    if (requiredVoucherInfo?.name === 5) return 'V';
    if (requiredVoucherInfo?.name === 6) return 'VI';
    if (requiredVoucherInfo?.name === 7) return 'VII';
    if (requiredVoucherInfo?.name === 8) return 'VIII';
    if (requiredVoucherInfo?.name === 9) return 'IX';
    if (requiredVoucherInfo?.name === 10) return 'X';
    if (requiredVoucherInfo?.name === 11) return 'XI';
    if (requiredVoucherInfo?.name === 13) return 'XIII';
  });
  const [isConfirmClicked, setConfirmClicked] = useState(false);
  const [isChargeClicked, setChargeClicked] = useState(false);

  const [voucherAmount, setVoucherAmount] = useState({
    'one-card': 0,
    'two-cards': 0,
    'three-cards': 0,
    'four-cards': 0,
    'five-cards': 0,
    'six-cards': 0,
    'seven-cards': 0,
    'eight-cards': 0,
    'nine-cards': 0,
    'ten-cards': 0,
    'eleven-cards': 0,
    'thirteen-cards': 0,
  });

  const [price, setPrice] = useState({
    'one-card': 0,
    'two-cards': 0,
    'three-cards': 0,
    'four-cards': 0,
    'five-cards': 0,
    'six-cards': 0,
    'seven-cards': 0,
    'eight-cards': 0,
    'nine-cards': 0,
    'ten-cards': 0,
    'eleven-cards': 0,
    'thirteen-cards': 0,
  });

  const [totalPrice, setTotalPrice] = useState(0);
  const [priceForPayPal, setPriceForPayPal] = useState(0);
  const [card, setCard] = useState('');

  useEffect(() => {
    setUserInfo(userInfo || {});
  }, []);

  const calculatePrice = async () => {
    setPrice(prev => {
      let newPrice;
      if (browserLanguage === 'ko') {
        newPrice = {
          'one-card':
            voucherAmount['one-card'] *
            spreadPriceObjForVoucher[1]['listPrice'],
          'two-cards':
            voucherAmount['two-cards'] *
            spreadPriceObjForVoucher[2]['listPrice'],
          'three-cards':
            voucherAmount['three-cards'] *
            spreadPriceObjForVoucher[3]['listPrice'],
          'four-cards':
            voucherAmount['four-cards'] *
            spreadPriceObjForVoucher[4]['listPrice'],
          'five-cards':
            voucherAmount['five-cards'] *
            spreadPriceObjForVoucher[5]['listPrice'],
          'six-cards':
            voucherAmount['six-cards'] *
            spreadPriceObjForVoucher[6]['listPrice'],
          'seven-cards':
            voucherAmount['seven-cards'] *
            spreadPriceObjForVoucher[7]['listPrice'],
          'eight-cards':
            voucherAmount['eight-cards'] *
            spreadPriceObjForVoucher[8]['listPrice'],
          'nine-cards':
            voucherAmount['nine-cards'] *
            spreadPriceObjForVoucher[9]['listPrice'],
          'ten-cards':
            voucherAmount['ten-cards'] *
            spreadPriceObjForVoucher[10]['listPrice'],
          'eleven-cards':
            voucherAmount['eleven-cards'] *
            spreadPriceObjForVoucher[11]['listPrice'],
          'thirteen-cards':
            voucherAmount['thirteen-cards'] *
            spreadPriceObjForVoucher[13]['listPrice'],
        };
        const totalPriceWithNewPrices =
          newPrice['one-card'] +
          newPrice['two-cards'] +
          newPrice['three-cards'] +
          newPrice['four-cards'] +
          newPrice['five-cards'] +
          newPrice['six-cards'] +
          newPrice['seven-cards'] +
          newPrice['eight-cards'] +
          newPrice['nine-cards'] +
          newPrice['ten-cards'] +
          newPrice['eleven-cards'] +
          newPrice['thirteen-cards'];

        setTotalPrice(totalPriceWithNewPrices);
      } else {
        newPrice = {
          'one-card':
            Math.round(
              voucherAmount['one-card'] *
                spreadPriceObjForVoucher[1]['listPriceForUSD'] *
                100
            ) / 100,
          'two-cards':
            Math.round(
              voucherAmount['two-cards'] *
                spreadPriceObjForVoucher[2]['listPriceForUSD'] *
                100
            ) / 100,
          'three-cards':
            Math.round(
              voucherAmount['three-cards'] *
                spreadPriceObjForVoucher[3]['listPriceForUSD'] *
                100
            ) / 100,
          'four-cards':
            Math.round(
              voucherAmount['four-cards'] *
                spreadPriceObjForVoucher[4]['listPriceForUSD'] *
                100
            ) / 100,
          'five-cards':
            Math.round(
              voucherAmount['five-cards'] *
                spreadPriceObjForVoucher[5]['listPriceForUSD'] *
                100
            ) / 100,
          'six-cards':
            Math.round(
              voucherAmount['six-cards'] *
                spreadPriceObjForVoucher[6]['listPriceForUSD'] *
                100
            ) / 100,
          'seven-cards':
            Math.round(
              voucherAmount['seven-cards'] *
                spreadPriceObjForVoucher[7]['listPriceForUSD'] *
                100
            ) / 100,
          'eight-cards':
            Math.round(
              voucherAmount['eight-cards'] *
                spreadPriceObjForVoucher[8]['listPriceForUSD'] *
                100
            ) / 100,
          'nine-cards':
            Math.round(
              voucherAmount['nine-cards'] *
                spreadPriceObjForVoucher[9]['listPriceForUSD'] *
                100
            ) / 100,
          'ten-cards':
            Math.round(
              voucherAmount['ten-cards'] *
                spreadPriceObjForVoucher[10]['listPriceForUSD'] *
                100
            ) / 100,
          'eleven-cards':
            Math.round(
              voucherAmount['eleven-cards'] *
                spreadPriceObjForVoucher[11]['listPriceForUSD'] *
                100
            ) / 100,
          'thirteen-cards':
            Math.round(
              voucherAmount['thirteen-cards'] *
                spreadPriceObjForVoucher[13]['listPriceForUSD'] *
                100
            ) / 100,
        };
        setPriceForPayPal({
          1: newPrice['one-card'],
          2: newPrice['two-cards'],
          3: newPrice['three-cards'],
          4: newPrice['four-cards'],
          5: newPrice['five-cards'],
          6: newPrice['six-cards'],
          7: newPrice['seven-cards'],
          8: newPrice['eight-cards'],
          9: newPrice['nine-cards'],
          10: newPrice['ten-cards'],
          11: newPrice['eleven-cards'],
          13: newPrice['thirteen-cards'],
        });
        const totalPriceWithNewPrices =
          newPrice['one-card'] +
          newPrice['two-cards'] +
          newPrice['three-cards'] +
          newPrice['four-cards'] +
          newPrice['five-cards'] +
          newPrice['six-cards'] +
          newPrice['seven-cards'] +
          newPrice['eight-cards'] +
          newPrice['nine-cards'] +
          newPrice['ten-cards'] +
          newPrice['eleven-cards'] +
          newPrice['thirteen-cards'];

        setTotalPrice(Math.round(totalPriceWithNewPrices * 100) / 100);
      }

      return newPrice;
    });
  };

  useEffect(() => {
    calculatePrice();
  }, [voucherAmount, browserLanguage]);

  let currencyCode;
  let countryCode;
  if (browserLanguage === 'en') {
    currencyCode = 'USD';
    countryCode = 'US';
  }
  if (browserLanguage === 'ko') {
    currencyCode = 'KRW';
    countryCode = 'KR';
  }
  if (browserLanguage === 'ja') {
    currencyCode = 'USD';
    countryCode = 'JP';
  }

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

  const openPriceInfoModal = () => {
    updatePriceInfoModalOpen(true);
  };

  const openChargePage = () => {
    setConfirmClicked(true);
  };

  const deletePrePaymentByPaymentKey = async () => {
    await chargeApi.deletePrePaymentForTossByPaymentKey({
      paymentKey: 'not yet',
    });
  };

  const fetchedVoucherBox = voucherBox(voucherAmount, price);

  return (
    <>
      <div
        className={`${styles['backdrop']} ${
          isRefundPolicyOpen ? styles['no-scroll'] : ''
        } `}
      />
      {isConfirmClicked === true &&
        isChargeClicked === false &&
        isRefundPolicyOpen === false &&
        isPriceInfoModalOpen === true && (
          <PriceInfoModal
            updatePriceInfoModalOpen={updatePriceInfoModalOpen}
            voucherBox={fetchedVoucherBox}
          />
        )}
      {isConfirmClicked === false &&
        isChargeClicked === false &&
        isPriceInfoModalOpen === false &&
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
              totalPrice={totalPrice}
              userInfo={userInfo}
              voucherBox={fetchedVoucherBox}
              currencyCode={currencyCode}
              countryCode={countryCode}
            />
          ) : (
            <TossCheckoutPageForPayPalWidget
              setChargeClicked={setChargeClicked}
              totalPrice={totalPrice}
              userInfo={userInfo}
              voucherBox={fetchedVoucherBox}
              currencyCode={currencyCode}
              countryCode={countryCode}
              priceForPayPal={priceForPayPal}
            />
          )}
        </div>
      )}
      {isConfirmClicked === true &&
        isChargeClicked === false &&
        isPriceInfoModalOpen === false && (
          <Card className={styles['purchase-modal']}>
            <header className={styles['charge-content']}>
              <TossVoucherPurchaseNew
                voucherAmount={voucherAmount}
                setVoucherAmount={setVoucherAmount}
                price={price}
                totalPrice={totalPrice}
                browserLanguage={browserLanguage}
                setUnavailableVoucher={setUnavailableVoucher}
              />
            </header>
            <footer className={styles['purchase-button-box']}>
              <TossVoucherPurchaseButton
                voucherBox={fetchedVoucherBox}
                deletePrePaymentByPaymentKey={deletePrePaymentByPaymentKey}
                setChargeClicked={setChargeClicked}
                setCard={setCard}
                closeChargeModal={closeChargeModal}
                openPriceInfoModal={openPriceInfoModal}
                totalPrice={totalPrice}
                setBlinkModalForChargingKRWOpen={
                  setBlinkModalForChargingKRWOpen
                }
                setBlinkModalForChargingUSDOpen={
                  setBlinkModalForChargingUSDOpen
                }
              />
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
            {requiredVoucherInfo && (
              <p>{`${t(
                `voucher.required-voucher`
              )}  : ${requiredVoucherName}${t(`unit.kind-of-voucher`)} x ${
                requiredVoucherInfo?.requiredAmount -
                requiredVoucherInfo?.remainingAmount
              }${t(`unit.ea`)}`}</p>
            )}
            {requiredVoucherInfo && (
              <p>{`${t(`voucher.remaining-voucher`)} : ${
                requiredVoucherInfo?.remainingAmount
              }${t(`unit.ea`)}`}</p>
            )}
          </div>
          <footer className={styles['purchase-button-box']}>
            <Button
              className={styles['purchase-button']}
              onClick={() => {
                openRefundPolicyModal();
              }}
            >
              {t(`button.refund-policy`)}
            </Button>
            <Button
              className={styles['purchase-button']}
              onClick={() => {
                openChargePage();
              }}
            >
              {t(`button.confirm`)}
            </Button>
            <CancelButton
              className={styles['purchase-button']}
              onClick={(e = null) => {
                closeChargeModal();
              }}
            >
              {t(`button.close`)}
            </CancelButton>
          </footer>
        </Card>
      )}
    </>
  );
};

export default ChargeModal;

//////////////////////////////////////////& NEW VERSION - 수량 조절 방식

const TossVoucherPurchaseNew = ({
  voucherAmount,
  setVoucherAmount,
  price,
  totalPrice,
  browserLanguage,
  setUnavailableVoucher,
}) => {
  const { t } = useTranslation();

  // 이용권 아이템 정의
  const voucherItems = [
    {
      key: 'one-card',
      name: 'I',
      number: 1,
      available: true,
      description: {
        ko: '1장 스프레드 질문 가능',
        en: 'Available for 1-card spread',
        ja: '1枚スプレッド質問可能',
      },
    },
    {
      key: 'two-cards',
      name: 'II',
      number: 2,
      available: true,
      description: {
        ko: '2장 스프레드 질문 가능',
        en: 'Available for 2-card spread',
        ja: '2枚スプレッド質問可能',
      },
    },
    {
      key: 'three-cards',
      name: 'III',
      number: 3,
      available: true,
      description: {
        ko: '3장 스프레드 질문 가능',
        en: 'Available for 3-card spread',
        ja: '3枚スプレッド質問可能',
      },
    },
    {
      key: 'four-cards',
      name: 'IV',
      number: 4,
      available: true,
      description: {
        ko: '4장 스프레드 질문 가능',
        en: 'Available for 4-card spread',
        ja: '4枚スプレッド質問可能',
      },
    },
    {
      key: 'five-cards',
      name: 'V',
      number: 5,
      available: true,
      description: {
        ko: '5장 스프레드 질문 가능',
        en: 'Available for 5-card spread',
        ja: '5枚スプレッド質問可能',
      },
    },
    {
      key: 'six-cards',
      name: 'VI',
      number: 6,
      available: true,
      description: {
        ko: '6장 스프레드 질문 가능',
        en: 'Available for 6-card spread',
        ja: '6枚スプレッド質問可能',
      },
    },
    {
      key: 'seven-cards',
      name: 'VII',
      number: 7,
      available: false,
      description: {
        ko: '7장 스프레드 (준비중)',
        en: '7-card spread (Coming soon)',
        ja: '7枚スプレッド（準備中）',
      },
    },
    {
      key: 'eight-cards',
      name: 'VIII',
      number: 8,
      available: false,
      description: {
        ko: '8장 스프레드 (준비중)',
        en: '8-card spread (Coming soon)',
        ja: '8枚スプレッド（準備中）',
      },
    },
    {
      key: 'nine-cards',
      name: 'IX',
      number: 9,
      available: false,
      description: {
        ko: '9장 스프레드 (준비중)',
        en: '9-card spread (Coming soon)',
        ja: '9枚スプレッド（準備中）',
      },
    },
    {
      key: 'ten-cards',
      name: 'X',
      number: 10,
      available: true,
      description: {
        ko: '10장 스프레드 질문 가능',
        en: 'Available for 10-card spread',
        ja: '10枚スプレッド質問可能',
      },
    },
    {
      key: 'eleven-cards',
      name: 'XI',
      number: 11,
      available: false,
      description: {
        ko: '11장 스프레드 (준비중)',
        en: '11-card spread (Coming soon)',
        ja: '11枚スプレッド（準備中）',
      },
    },
    {
      key: 'thirteen-cards',
      name: 'XIII',
      number: 13,
      available: false,
      description: {
        ko: '13장 스프레드 (준비중)',
        en: '13-card spread (Coming soon)',
        ja: '13枚スプレッド（準備中）',
      },
    },
  ];

  const handleIncrease = key => {
    setVoucherAmount(prev => ({
      ...prev,
      [key]: prev[key] + 1,
    }));
  };

  const handleDecrease = key => {
    setVoucherAmount(prev => ({
      ...prev,
      [key]: Math.max(0, prev[key] - 1),
    }));
  };

  const getCurrency = () => {
    if (browserLanguage === 'ko') return '원';
    if (browserLanguage === 'en') return 'USD';
    if (browserLanguage === 'ja') return 'USD';
    return 'USD';
  };

  const getQuantityLabel = () => {
    if (browserLanguage === 'ko') return '장';
    if (browserLanguage === 'ja') return '枚';
    return 'EA';
  };

  return (
    <>
      {/* 스크롤 가능한 아이템 리스트 */}
      <div className={styles['item-list']}>
        {voucherItems
          .filter(item => item.available)
          .map(item => (
            <div key={item.key} className={styles['item-row']}>
              {/* 왼쪽: 아이템 정보 박스 */}
              <div className={styles['item-info-box']}>
                <div className={styles['item-header']}>
                  {/* 아이템 이름 */}
                  <div
                    className={`${styles['item-name']} ${
                      browserLanguage === 'ja'
                        ? styles['item-name-japanese']
                        : ''
                    } ${styles[item.key]}`}
                  >
                    {item.name} {t(`unit.kind-of-voucher`)}
                  </div>

                  {/* 개별 단가 */}
                  <div
                    className={`${styles['unit-price']} ${
                      browserLanguage === 'ja'
                        ? styles['unit-price-japanese']
                        : ''
                    } ${styles[item.key]}`}
                  >
                    {browserLanguage === 'ko'
                      ? `${
                          spreadPriceObjForVoucher[item.number]['listPrice']
                        }원`
                      : `${
                          spreadPriceObjForVoucher[item.number][
                            'listPriceForUSD'
                          ]
                        }USD`}
                  </div>
                </div>

                {/* 아이템 설명 */}
                <div
                  className={`${styles['item-description']} ${
                    browserLanguage === 'ja'
                      ? styles['item-description-japanese']
                      : ''
                  }`}
                >
                  {item.description[browserLanguage]}
                </div>
              </div>

              {/* 오른쪽: 수량+가격 섹션 */}
              <div className={styles['right-section']}>
                {/* 수량 섹션 (왼쪽) */}
                <div className={styles['quantity-section']}>
                  {/* 선택된 수량 표시 */}
                  <div
                    className={`${styles['quantity-display']} ${
                      browserLanguage === 'ja'
                        ? styles['quantity-display-japanese']
                        : ''
                    }`}
                  >
                    {voucherAmount[item.key]} {getQuantityLabel()}
                  </div>

                  {/* 수량 조절 버튼 */}
                  <div className={styles['quantity-controls']}>
                    <button
                      className={`${styles['quantity-btn']} ${
                        browserLanguage === 'ja'
                          ? styles['quantity-btn-japanese']
                          : ''
                      }`}
                      onClick={() => {
                        if (item.available) {
                          handleDecrease(item.key);
                        } else {
                          setUnavailableVoucher(true);
                        }
                      }}
                      disabled={
                        !item.available || voucherAmount[item.key] === 0
                      }
                    >
                      -
                    </button>
                    <button
                      className={`${styles['quantity-btn']} ${
                        browserLanguage === 'ja'
                          ? styles['quantity-btn-japanese']
                          : ''
                      }`}
                      onClick={() => {
                        if (item.available) {
                          handleIncrease(item.key);
                        } else {
                          setUnavailableVoucher(true);
                        }
                      }}
                      disabled={!item.available}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 가격 (오른쪽) */}
                <div
                  className={`${styles['item-price']} ${
                    browserLanguage === 'ja'
                      ? styles['item-price-japanese']
                      : ''
                  }`}
                >
                  {price[item.key]} {getCurrency()}
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* 고정된 총합계 섹션 */}
      <div className={styles['total-section']}>
        <div
          className={`${styles['total-label']} ${
            browserLanguage === 'ja' ? styles['total-label-japanese'] : ''
          }`}
        >
          {browserLanguage === 'ko' && '합 계'}
          {browserLanguage === 'en' && 'TOTAL'}
          {browserLanguage === 'ja' && '合 計'}
        </div>
        <div
          className={`${styles['total-price']} ${
            browserLanguage === 'ja' ? styles['total-price-japanese'] : ''
          }`}
        >
          {totalPrice} {getCurrency()}
        </div>
      </div>
    </>
  );
};

const TossVoucherPurchaseButton = ({
  voucherBox,
  deletePrePaymentByPaymentKey,
  setChargeClicked,
  setCard,
  closeChargeModal,
  openPriceInfoModal,
  totalPrice,
  setBlinkModalForChargingKRWOpen,
  setBlinkModalForChargingUSDOpen,
  ...props
}) => {
  const browserLanguage = useLanguageChange();
  const { t } = useTranslation();
  const [isButtonClicked, setButtonClicked] = useState(false);

  const purchase = (limitedAmount, currency) => {
    if (isButtonClicked) return;
    setButtonClicked(true);
    try {
      if (totalPrice < limitedAmount) {
        if (currency === 'KRW') setBlinkModalForChargingKRWOpen(true);
        if (currency === 'USD') setBlinkModalForChargingUSDOpen(true);
        return;
      }
      const timerId = setTimeout(() => {
        setChargeClicked(true);
      }, 1000);
      return () => clearTimeout(timerId);
    } catch (error) {
      console.error(error);
    } finally {
      setButtonClicked(false);
    }
  };

  return (
    <>
      <Button
        className={styles['purchase-button']}
        onClick={() => {
          openPriceInfoModal();
        }}
      >
        {t(`button.price-info`)}
      </Button>
      {browserLanguage === 'ko' && (
        <Button
          className={styles['purchase-button']}
          onClick={() => {
            purchase(1000, 'KRW');
          }}
        >
          {t(`button.pay`)}
        </Button>
      )}
      {browserLanguage === 'ja' && (
        <Button
          className={styles['purchase-button']}
          onClick={() => {
            purchase(1, 'USD');
          }}
        >
          {t(`button.pay`)}
        </Button>
      )}
      {browserLanguage === 'en' && (
        <Button
          className={styles['purchase-button']}
          onClick={() => {
            purchase(1, 'USD');
          }}
        >
          {t(`button.pay`)}
        </Button>
      )}
      <CancelButton
        className={styles['purchase-button']}
        onClick={(e = null) => {
          closeChargeModal();
        }}
      >
        {t(`button.close`)}
      </CancelButton>
    </>
  );
};

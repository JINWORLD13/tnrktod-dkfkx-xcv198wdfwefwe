import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './';
import { cardPositionInfo } from '../../lib/tarot/card/cardPositionInfo';
import Card from '../../components/common/Card.jsx';
import stylesBlink from './';
const BlinkModalsForHome = ({
  isBlinkModalForLoginOpen,
  updateBlinkModalForLoginOpen,
  isBlinkModalForCopyOpen,
  updateBlinkModalForCopyOpen,
  isBlinkModalForSaveOpen,
  updateBlinkModalForSaveOpen,
  isBlinkModalForChargingKRWOpen,
  setBlinkModalForChargingKRWOpen,
  isBlinkModalForChargingUSDOpen,
  setBlinkModalForChargingUSDOpen,
  isFilledInTheQuestion,
  setFilledInTheQuestion,
  isUnavailableVoucher,
  setUnavailableVoucher,
  isUnavailableWhichTarot,
  setUnavailableWhichTarot,
  whichCardPosition,
  setWhichCardPosition,
  whichSpread,
  setWhichSpread,
  whichTarot,
  questionForm,
  isVoucherModeOn,
  isAdsWatched,
  browserLanguage,
}) => {
  const { t } = useTranslation();

  const modalConfigs = [
    {
      isOpen: isBlinkModalForLoginOpen,
      updateOpen: updateBlinkModalForLoginOpen,
      content: t(`blink_modal.login`),
    },
    {
      isOpen: isBlinkModalForCopyOpen,
      updateOpen: updateBlinkModalForCopyOpen,
      content: t(`blink_modal.copy`),
    },
    {
      isOpen: isBlinkModalForSaveOpen,
      updateOpen: updateBlinkModalForSaveOpen,
      content: t(`blink_modal.save`),
    },
    {
      isOpen: isBlinkModalForChargingKRWOpen,
      updateOpen: setBlinkModalForChargingKRWOpen,
      content: t(`blink_modal.charging_KRW`),
      className: styles['charging'],
    },
    {
      isOpen: isBlinkModalForChargingUSDOpen,
      updateOpen: setBlinkModalForChargingUSDOpen,
      content: t(`blink_modal.charging_USD`),
      className: styles['charging'],
    },
    {
      isOpen: !isFilledInTheQuestion,
      updateOpen: value => setFilledInTheQuestion(!value),
      content: t(`blink_modal.fill-in-on-question`),
      className: styles['fill-in-the-question'],
    },
    {
      isOpen: isUnavailableVoucher,
      updateOpen: setUnavailableVoucher,
      content: t(`blink_modal.unavailable-voucher`),
      className: styles['unavailable-voucher'],
    },
    {
      isOpen: isUnavailableWhichTarot,
      updateOpen: setUnavailableWhichTarot,
      content: t(`blink_modal.unavailable-which-tarot`),
      className: styles['unavailable-which-tarot'],
    },
    {
      isOpen: whichCardPosition.isClicked,
      updateOpen: setWhichCardPosition,
      content: cardPositionInfo(
        whichTarot,
        whichCardPosition,
        browserLanguage,
        t
      ),
      className: styles['which-spread'],
    },
    {
      isOpen:
        (whichSpread &&
          whichTarot !== 1 &&
          questionForm?.spreadTitle?.length > 0 &&
          !(whichTarot === 2 && !isVoucherModeOn)) ||
        isAdsWatched,
      updateOpen: setWhichSpread,
      content:
        t(`blink_modal.spread`) +
        `${
          questionForm?.spreadTitle?.length > 0 && whichTarot !== 1
            ? questionForm?.spreadTitle
            : t(`blink_modal.none`)
        }`,
      className: styles['which-spread'],
    },
  ];

  return (
    <>
      {modalConfigs.map(
        (config, index) =>
          config.isOpen && (
            <BlinkModal key={index} {...config}>
              {config.content}
            </BlinkModal>
          )
      )}
    </>
  );
};

const BlinkModal = ({ isOpen, updateOpen, className, children }) => {
  const closeModal = () => {
    if (typeof updateOpen === 'function') {
      updateOpen(true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const closeModalTimeout = setTimeout(() => {
        closeModal();
      }, 1500);

      return () => {
        clearTimeout(closeModalTimeout);
      };
    }
  }, [isOpen, updateOpen]);

  return (
    <>
      {isOpen && (
        <Card className={`${stylesBlink['blink-modal']} ${className || ''}`}>
          <div>{children}</div>
        </Card>
      )}
    </>
  );
};

export default BlinkModalsForHome;

// <BlinkModalsForHome
//         isBlinkModalForLoginOpen={isBlinkModalForLoginOpen}
//         updateBlinkModalForLoginOpen={updateBlinkModalForLoginOpen}
//         isBlinkModalForCopyOpen={isBlinkModalForCopyOpen}
//         updateBlinkModalForCopyOpen={updateBlinkModalForCopyOpen}
//         isBlinkModalForSaveOpen={isBlinkModalForSaveOpen}
//         updateBlinkModalForSaveOpen={updateBlinkModalForSaveOpen}
//         isBlinkModalForChargingKRWOpen={isBlinkModalForChargingKRWOpen}
//         setBlinkModalForChargingKRWOpen={setBlinkModalForChargingKRWOpen}
//         isBlinkModalForChargingUSDOpen={isBlinkModalForChargingUSDOpen}
//         setBlinkModalForChargingUSDOpen={setBlinkModalForChargingUSDOpen}
//         isFilledInTheQuestion={isFilledInTheQuestion}
//         setFilledInTheQuestion={setFilledInTheQuestion}
//         isUnavailableVoucher={isUnavailableVoucher}
//         setUnavailableVoucher={setUnavailableVoucher}
//         isUnavailableWhichTarot={isUnavailableWhichTarot}
//         setUnavailableWhichTarot={setUnavailableWhichTarot}
//         whichCardPosition={whichCardPosition}
//         setWhichCardPosition={setWhichCardPosition}
//         whichSpread={whichSpread}
//         setWhichSpread={setWhichSpread}
//         whichTarot={whichTarot}
//         questionForm={questionForm}
//         isVoucherModeOn={isVoucherModeOn}
//         isAdsWatched={isAdsWatched}
//         browserLanguage={browserLanguage}
//       />

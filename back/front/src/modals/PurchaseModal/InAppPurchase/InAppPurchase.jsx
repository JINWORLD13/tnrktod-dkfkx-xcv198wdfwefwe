import React, { useState } from 'react';
import styles from './InAppPurchase.module.scss';
import { useLanguageChange } from '@/hooks';
import { useTranslation } from 'react-i18next';
import AlertModal from './components/AlertModal.jsx';
import InAppPurchaseContent from './InAppPurchaseContent.jsx';

const InAppPurchase = ({
  updateRefundPolicyOpen,
  updatePriceInfoModalOpen,
  userInfoFromMyPage,
  isPriceInfoModalOpen,
  showInAppPurchase,
  setShowInAppPurchase,
  setUnavailableVoucher,
  ...props
}) => {
  const { t } = useTranslation();
  const [isConfirmClicked, setConfirmClicked] = useState(false);
  const [requiredVoucherName, serRequiredVoucherName] = useState(prev => {
    if (props?.stateGroup?.requiredVoucherInfo?.name === 1) return `I`;
    if (props?.stateGroup?.requiredVoucherInfo?.name === 2) return `II`;
    if (props?.stateGroup?.requiredVoucherInfo?.name === 3) return `III`;
    if (props?.stateGroup?.requiredVoucherInfo?.name === 4) return `IV`;
    if (props?.stateGroup?.requiredVoucherInfo?.name === 5) return `V`;
    if (props?.stateGroup?.requiredVoucherInfo?.name === 6) return `VI`;
    if (props?.stateGroup?.requiredVoucherInfo?.name === 7) return `VII`;
    if (props?.stateGroup?.requiredVoucherInfo?.name === 8) return `VIII`;
    if (props?.stateGroup?.requiredVoucherInfo?.name === 9) return `IX`;
    if (props?.stateGroup?.requiredVoucherInfo?.name === 10) return `X`;
    if (props?.stateGroup?.requiredVoucherInfo?.name === 11) return `XI`;
    if (props?.stateGroup?.requiredVoucherInfo?.name === 13) return `XIII`;
  });

  const browserLanguage = useLanguageChange();

  const openChargePage = () => {
    setConfirmClicked(true);
  };

  const closeChargeModal = () => {
    setConfirmClicked(false);
    setShowInAppPurchase(false);
  };

  return (
    <>
      <div className={`${styles['backdrop']}`} />
      {isConfirmClicked === true && (
        <InAppPurchaseContent
          updatePriceInfoModalOpen={updatePriceInfoModalOpen}
          userInfoFromMyPage={userInfoFromMyPage}
          isPriceInfoModalOpen={isPriceInfoModalOpen}
          showInAppPurchase={showInAppPurchase}
          closeChargeModal={closeChargeModal}
          browserLanguage={browserLanguage}
          {...props}
        />
      )}
      {isConfirmClicked === false && (
        <AlertModal
          t={t}
          browserLanguage={browserLanguage}
          children={props?.children}
          stateGroup={props?.stateGroup}
          requiredVoucherName={requiredVoucherName}
          openChargePage={openChargePage}
          closeChargeModal={closeChargeModal}
          styles={styles}
        />
      )}
    </>
  );
};

export default InAppPurchase;

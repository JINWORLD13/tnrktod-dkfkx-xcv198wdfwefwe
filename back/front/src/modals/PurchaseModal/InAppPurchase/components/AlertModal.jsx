import React from 'react';
import Card from '../../../../components/common/Card';
import CancelButton from '../../../../components/common/CancelButton';
import Button from '../../../../components/common/Button';

const AlertModal = ({
  t, // 번역 함수
  browserLanguage, // 브라우저 언어
  children, // 모달에 표시할 기본 메시지
  stateGroup, // 바우처 정보 등 상태 그룹
  requiredVoucherName, // 필요 바우처 이름
  openChargePage, // 확인 버튼 클릭 시 실행
  closeChargeModal, // 닫기 버튼 클릭 시 실행
  styles,
}) => {
  const requiredVoucherInfo = stateGroup?.requiredVoucherInfo;

  return (
    <Card className={styles['modal']}>
      <header
        className={`${
          browserLanguage === 'ja' ? styles['title-japanese'] : styles['title']
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
        <p>{children}</p>
        {requiredVoucherInfo && (
          <p>
            {`${t(`voucher.required-voucher`)} : ${requiredVoucherName}${t(
              `unit.kind-of-voucher`
            )} x ${
              requiredVoucherInfo.requiredAmount -
              requiredVoucherInfo.remainingAmount
            }${t(`unit.ea`)}`}
          </p>
        )}
        {requiredVoucherInfo && (
          <p>
            {`${t(`voucher.remaining-voucher`)} : ${
              requiredVoucherInfo.remainingAmount
            }${t(`unit.ea`)}`}
          </p>
        )}
      </div>
      {/* footer는 div지만 명시적으로 아래에 있는 div로 설정. 그리고 width는 자동으로 100%; */}
      <footer className={styles['purchase-button-box']}>
        <Button
          className={styles['purchase-button']}
          onClick={() => {
            // //& 임시조치로 paymentKey가 "not yet"인거 지우기
            // deletePrePaymentByPaymentKey({ paymentKey: 'not yet' });
            openChargePage();
          }}
        >
          {t(`button.confirm`)}
        </Button>
        <CancelButton
          className={styles['purchase-button']}
          onClick={(e = null) => {
            // //& 임시조치로 paymentKey가 "not yet"인거 지우기
            // deletePrePaymentByPaymentKey({ paymentKey: 'not yet' });
            closeChargeModal();
          }}
        >
          {t(`button.close`)}
        </CancelButton>
      </footer>
    </Card>
  );
};

export default AlertModal;

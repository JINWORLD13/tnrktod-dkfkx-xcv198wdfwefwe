import React from 'react';
import styles from './AlertModal.module.scss';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import CancelButton from '../../components/common/CancelButton.jsx';
import { useLanguageChange } from '@/hooks';
import { useTranslation } from 'react-i18next';

const AlertModal = ({ ...props }) => {
  const browserLanguage = useLanguageChange();
  const { t } = useTranslation();

  const closeAlertModal = e => {
    if (props?.updateTarotAlertModalOpen)
      props?.updateTarotAlertModalOpen(false);
    if (props?.updateUserAlertModalOpen) props?.updateUserAlertModalOpen(false);
  };

  const handleConfirmClick = async e => {
    try {
      if (props?.handleDeleteTarotHistory && props?.tarotAndIndexInfo) {
        await props?.handleDeleteTarotHistory(props?.tarotAndIndexInfo);
      } else if (props?.deleteUserInfo) {
        await props?.deleteUserInfo(e);
      } else if (props?.handleDeleteAllTarotHistory) {
        await props?.handleDeleteAllTarotHistory();
      }
    } catch (error) {
      console.error('Error during delete operation:', error);
      // Add error handling logic here if needed
    } finally {
      closeAlertModal();
    }
  };

  return (
    <div>
      <div className={styles['backdrop']} onClick={closeAlertModal} />
      <Card className={styles['modal']}>
        <header
          className={
            browserLanguage === 'ja'
              ? styles['title-japanese']
              : styles['title']
          }
        >
          <p>{t(`alert_modal.notice`)}</p>
        </header>
        <div
          className={
            browserLanguage === 'ja'
              ? styles['modal-content-japanese']
              : styles['modal-content']
          }
        >
          <p>{props?.children}</p>
        </div>
        <footer className={styles['button-box']}>
          <Button
            className={styles['button']}
            onClick={handleConfirmClick}
            autoFocus={true}
          >
            {t(`button.confirm`)}
          </Button>
          <CancelButton
            className={styles['button']}
            onClick={(e = null) => {
              closeAlertModal(e);
            }}
          >
            {t(`button.close`)}
          </CancelButton>
        </footer>
      </Card>
    </div>
  );
};

export default AlertModal;
// import React from 'react';
// import styles from './AlertModal.module.scss';
// import Card from '../components/common/Card.jsx';
// import Button from '../components/common/Button.jsx';
// import { useLanguageChange } from '@/hooks';
// import { useTranslation } from 'react-i18next';

// const AlertModal = ({ ...props }) => {
//   const browserLanguage = useLanguageChange();
//   const { t } = useTranslation();

//   const closeAlertModal = () => {
//     if (props?.updateTarotAlertModalOpen) props?.updateTarotAlertModalOpen(false);
//     if (props?.updateUserAlertModalOpen) props?.updateUserAlertModalOpen(false);
//   };

//   //! onClick에서는 async, await 못쓰니 여기서 따로 빼니까 모든 컨텐츠 삭제버튼 빠르게 누를 때 충돌에러 안나옴. 삭제되는 과정에서 tarotHistory 안에 이미 삭제처리된 게 있는 채 삭제 했을때 충돌이 나니 await으로 기다리도록 함.
//   const handleConfirmClick = async (e) => {
//     try {
//       if (props?.handleDeleteTarotHistory && props?.tarotAndIndexInfo) {
//         await props?.handleDeleteTarotHistory(props?.tarotAndIndexInfo);
//       } else if (props?.deleteUserInfo) {
//         await props?.deleteUserInfo(e);
//       } else if (props?.handleDeleteAllTarotHistory) {
//         await props?.handleDeleteAllTarotHistory();
//       }
//     } catch (error) {
//       console.error("Error during delete operation:", error);
//       // 여기에 에러 처리 로직을 추가할 수 있습니다.
//     } finally {
//       // 작업이 성공하든 실패하든 모달을 닫습니다.
//       closeAlertModal();
//     }
//   };

//   return (
//     <div>
//       <div className={styles['backdrop']} onClick={closeAlertModal} />
//       <Card className={styles['modal']}>
//         <header
//           className={browserLanguage === 'ja' ? styles['title-japanese'] : styles['title']}
//         >
//           <p>{t(`alert_modal.notice`)}</p>
//         </header>
//         <div
//           className={browserLanguage === 'ja' ? styles['modal-content-japanese'] : styles['modal-content']}
//         >
//           <p>{props?.children}</p>
//         </div>
//         <footer className={styles['button-box']}>
//           <Button
//             className={styles['button']}
//             onClick={handleConfirmClick}
//           >
//             {t(`button.confirm`)}
//           </Button>
//           <Button
//             className={styles['button']}
//             onClick={closeAlertModal}
//           >
//             {t(`button.close`)}
//           </Button>
//         </footer>
//       </Card>
//     </div>
//   );
// };

// export default AlertModal;

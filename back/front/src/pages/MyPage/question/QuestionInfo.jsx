import React, { useState, useEffect, useRef } from 'react';
import styles from './QuestionForm.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  isWithinThisDay,
  isWithinThisWeek,
  isWithinThisMonth,
  isWithinThisThreeMonth,
} from '../../../utils/format/isTimeAgo.js';
import { useLanguageChange } from '@/hooks';
import Button from '../../../components/common/Button.jsx';
import { formattingDate } from '../../../utils/format/formatDate.jsx';

const QuestionInfo = ({
  tarotHistory = [],
  updateTarotHistory,
  setAnswerModalOpen,
  updateAnswerForm,
  updateTarotAlertModalOpen,
  updateTarotAndIndexInfo,
  isClickedForInvisible = [],
}) => {
  const [selectedHistory, setSelectedHistory] = useState(1);
  const [isWideScreen, setIsWideScreen] = useState(
    window.matchMedia('(min-width: 480px)').matches
  );
  const navigate = useNavigate();
  const { t } = useTranslation();
  const browserLanguage = useLanguageChange();
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 480px)');
    const handleWidthChange = e => setIsWideScreen(e.matches);
    mediaQuery.addEventListener('change', handleWidthChange);
    return () => mediaQuery.removeEventListener('change', handleWidthChange);
  }, []);

  const timeFilters = {
    1: isWithinThisDay,
    2: isWithinThisWeek,
    3: isWithinThisMonth,
    4: isWithinThisThreeMonth,
  };

  const renderTarotHistory = filterFn => {
    if (!tarotHistory?.length) return null;
    return tarotHistory
      ?.filter(
        tarot =>
          browserLanguage === tarot?.language && (!filterFn || filterFn(tarot))
      )
      .map((tarot, i) => {
        const formattedDate = formattingDate(
          tarot?.timeOfCounselling ?? tarot?.createdAt,
          browserLanguage
        );

        return (
          <div
            key={i}
            className={`${styles['tarot-history-item']} ${
              browserLanguage === 'ja'
                ? styles['tarot-history-item-japanese']
                : ''
            } ${isClickedForInvisible.includes(i) ? styles['invisible'] : ''}`}
            onClick={() => {
              setAnswerModalOpen(prev => !prev);
              updateAnswerForm(tarot);
            }}
          >
            <div>
              <div>
                <div>{t('mypage.question')}</div>
                <div
                  className={`${
                    tarot.language === 'ja' && browserLanguage !== 'ja'
                      ? styles['font-japanese']
                      : ''
                  } ${
                    tarot.language !== 'ja' && browserLanguage === 'ja'
                      ? styles['font-english']
                      : ''
                  }`}
                >
                  {tarot?.questionInfo?.question}
                </div>
              </div>
              <div>{formattedDate}</div>
            </div>
            <div>
              <Button
                onClick={e => {
                  e.stopPropagation();
                  updateTarotAlertModalOpen(true);
                  updateTarotAndIndexInfo({ tarot, index: i });
                }}
              >
                {t('button.delete')}
              </Button>
            </div>
          </div>
        );
      })
      .reverse();
  };

  const getHistoryCount = filterFn => {
    if (!tarotHistory?.length) return 0;
    return tarotHistory?.filter(
      tarot =>
        browserLanguage === tarot?.language && (!filterFn || filterFn(tarot))
    ).length;
  };

  const handleScroll = event => {
    event.preventDefault();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop += event.deltaY > 0 ? 10 : -10;
    }
  };

  const menuItems = [
    { id: 1, label: t('mypage.question-today') },
    { id: 2, label: t('mypage.question-this-week') },
    { id: 3, label: t('mypage.question-this-month') },
    { id: 4, label: t('mypage.question-three-months') },
  ];

  return (
    <div
      className={`${styles['user-info3-body']} ${
        browserLanguage === 'ja' ? styles['user-info3-body-japanese'] : ''
      }`}
    >
      <div
        className={`${styles['user-info3-body-center']} ${
          browserLanguage === 'ja'
            ? styles['user-info3-body-center-japanese']
            : ''
        }`}
      >
        {isWideScreen && (
          <div
            className={`${styles['tarot-history-record']} ${
              browserLanguage === 'ja'
                ? styles['tarot-history-record-japanese']
                : ''
            }`}
          >
            <div>
              <span>
                {t(
                  `mypage.tarot-history-${
                    selectedHistory === 1
                      ? 'today'
                      : selectedHistory === 2
                      ? 'this-week'
                      : selectedHistory === 3
                      ? 'this-month'
                      : 'total'
                  }`
                )}
              </span>
              <span>
                {': '}
                {getHistoryCount(timeFilters[selectedHistory])}
                {t('mypage.times')}
              </span>
            </div>
          </div>
        )}
        <div
          className={`${styles['tarot-info']} ${
            browserLanguage === 'ja' ? styles['tarot-info-japanese'] : ''
          }`}
        >
          <div
            className={`${styles['tarot-history-menu-container']} ${
              browserLanguage === 'ja'
                ? styles['tarot-history-menu-container-japanese']
                : ''
            }`}
          >
            {menuItems.map(item => (
              <div
                key={item.id}
                className={`${styles['tarot-history-menu-box']} ${
                  browserLanguage === 'ja'
                    ? styles['tarot-history-menu-box-japanese']
                    : ''
                } ${
                  selectedHistory === item.id
                    ? browserLanguage === 'ja'
                      ? styles['tarot-history-menu-box-clicked-japanese']
                      : styles['tarot-history-menu-box-clicked']
                    : ''
                }`}
                onClick={() => setSelectedHistory(item.id)}
              >
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div
            className={`${styles['tarot-history']} ${
              browserLanguage === 'ja' ? styles['tarot-history-japanese'] : ''
            }`}
            ref={scrollContainerRef}
            onWheel={handleScroll}
          >
            {renderTarotHistory(timeFilters[selectedHistory])}
          </div>
          {!isWideScreen && (
            <div
              className={`${styles['tarot-history-record-bottom']} ${
                browserLanguage === 'ja'
                  ? styles['tarot-history-record-bottom-japanese']
                  : ''
              }`}
            >
              <div>
                <span>
                  {t(
                    `mypage.tarot-history-${
                      selectedHistory === 1
                        ? 'today'
                        : selectedHistory === 2
                        ? 'this-week'
                        : selectedHistory === 3
                        ? 'this-month'
                        : 'total'
                    }`
                  )}
                </span>
                <span>
                  {': '}
                  {getHistoryCount(timeFilters[selectedHistory])}
                  {t('mypage.times')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionInfo;

// /*eslint-disable*/
// import React, { useState, useEffect, useRef } from 'react';
// import styles from './';
// // import { hasAccessToken } from '../../../utils/storage/tokenLocalStorage.jsx';
// import { Link, useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import {
//   isWithinThisDay,
//   isWithinThisMonth,
//   isWithinThisWeek,
//   isWithinThisYear,
//   isWithinThisThreeMonth,
// } from '../../utils/format/isTimeAgo.js';
// import { useLanguageChange } from '@/hooks';
// import Button from '../../../components/common/Button.jsx';
// import { formattingDate } from '../../utils/format/formatDate.jsx';

// const QuestionInfo = ({
//   tarotHistory,
//   updateTarotHistory,
//   setAnswerModalOpen,
//   updateAnswerForm,
//   updateTarotAlertModalOpen,
//   updateTarotAndIndexInfo,
//   isClickedForInvisible,
//   ...props
// }) => {
//   // tarotHistory[0]?.userInfo == ObjId가 나옴.
//   //setState는 비동기적으로 동작하며, 이로 인해 예상치 못한 re-render가 발생할 수 있습니다. 모든 상태를 업데이트할 때는 함수형 업데이트를 사용하여 이전 상태를 활용해야 합니다.
//   const [whichHistory, setWhichHistory] = useState(1);
//   const [isClicked, setIsClicked] = useState(1);
//   const [isWideScreen, setIsWideScreen] = useState(
//     window.matchMedia('(min-width: 480px)').matches
//   );
//   // const dispatch = useDispatch();
//   // const tarotHistoryForRedux = useSelector(
//   //   state => state?.tarotHistoryStore?.tarotHistory
//   // );
//   useEffect(() => {
//     const mediaQuery = window.matchMedia('(min-width: 480px)');

//     const handleWidthChange = e => {
//       setIsWideScreen(e.matches);
//     };

//     mediaQuery.addEventListener('change', handleWidthChange);

//     return () => {
//       mediaQuery.removeEventListener('change', handleWidthChange);
//     };
//   }, []);

//   const navigate = useNavigate();
//   const { t } = useTranslation();
//   const handleHistory = state => {
//     setWhichHistory(prev => state);
//     setIsClicked(prev => state);
//   };
//   const browserLanguage = useLanguageChange();

//   const openAlertModal = () => {
//     updateTarotAlertModalOpen(true);
//   };

//   // onClick ={()=>{setState()}} 말고 onClick ={setState()}해서 리렌더 발생생
//   const renderTarotHistory = timeCondition => {
//     return tarotHistory
//       .map((tarot, i) => {
//         if (timeCondition(tarot)) {
//           let formattedDate =
//             tarot?.timeOfCounselling === undefined
//               ? formattingDate(tarot?.createdAt, browserLanguage)
//               : formattingDate(tarot?.timeOfCounselling, browserLanguage);
//           if (browserLanguage !== tarot?.language) return;
//           return (
//             <div
//               key={i}
//               className={`${
//                 browserLanguage === 'ja'
//                   ? styles['tarot-history-item-japanese']
//                   : styles['tarot-history-item']
//               }`}
//               //! handleDeleteTarotHistory 함수 내 updateTarotHistory 함수 없으면 위의 것 비활성시키고 아래 활성화
//               // className={`${
//               //   browserLanguage === 'ja'
//               //     ? styles['tarot-history-item-japanese']
//               //     : styles['tarot-history-item']
//               // } ${
//               //   isClickedForInvisible?.includes(i) ? styles['invisible'] : ''
//               // }`}
//               onClick={() => {
//                 setAnswerModalOpen(prev => !prev);
//                 updateAnswerForm(tarot);
//               }}
//             >
//               <div>
//                 <div>
//                   <div>{t(`mypage.question`)} </div>
//                   <div
//                     className={`${
//                       tarot.language === 'ja' && browserLanguage !== 'ja'
//                         ? styles['font-japanese']
//                         : ''
//                     }${
//                       tarot.language !== 'ja' && browserLanguage === 'ja'
//                         ? styles['font-english']
//                         : ''
//                     }`}
//                   >
//                     {tarot?.questionInfo?.question}
//                   </div>
//                 </div>
//                 <div>{formattedDate}</div>
//               </div>
//               <div>
//                 <Button
//                   onClick={e => {
//                     e.stopPropagation();
//                     openAlertModal();
//                     updateTarotAndIndexInfo({ tarot, index: i });
//                     // tarot 값과 일치하는 인덱스 찾기
//                     const indexToRemove = tarotHistory.indexOf(tarot);
//                     // indexToRemove가 -1이 아니면 (요소가 존재하면) 해당 인덱스에서 1개의 요소 제거
//                     if (indexToRemove !== -1) {
//                       tarotHistory?.splice(indexToRemove, 1); // 무의미함.
//                     }
//                   }}
//                 >
//                   {t(`button.delete`)}
//                 </Button>
//               </div>
//             </div>
//           );
//         }
//         return null; // 조건을 만족하지 않을 경우 null 반환
//       })
//       .reverse();
//   };

//   const renderTotalTarotHistory = () => {
//     if (tarotHistory?.length === 0) {
//       return null; // tarotHistory가 비어있을 때 불필요한 렌더링 방지
//     }
//     return tarotHistory
//       .map((tarot, i) => {
//         let formattedDate =
//           tarot?.timeOfCounselling === undefined
//             ? formattingDate(tarot?.createdAt, browserLanguage)
//             : formattingDate(tarot?.timeOfCounselling, browserLanguage);
//         if (browserLanguage !== tarot?.language) return;
//         return (
//           <div
//             key={i}
//             className={`${
//               browserLanguage === 'ja'
//                 ? styles['tarot-history-item-japanese']
//                 : styles['tarot-history-item']
//             }`}
//             //! handleDeleteTarotHistory 함수 내 updateTarotHistory 함수 없으면 위의 것 비활성시키고 아래 활성화
//             // className={`${
//             //   browserLanguage === 'ja'
//             //     ? styles['tarot-history-item-japanese']
//             //     : styles['tarot-history-item']
//             // } ${isClickedForInvisible.includes(i) ? styles['invisible'] : ''}`}
//             onClick={() => {
//               setAnswerModalOpen(prev => !prev);
//               updateAnswerForm(tarot);
//             }}
//           >
//             <div>
//               <div>
//                 <div>{t(`mypage.question`)} </div>
//                 <div
//                   className={`${
//                     tarot.language === 'ja' && browserLanguage !== 'ja'
//                       ? styles['font-japanese']
//                       : ''
//                   }${
//                     tarot.language !== 'ja' && browserLanguage === 'ja'
//                       ? styles['font-english']
//                       : ''
//                   }`}
//                 >
//                   {tarot?.questionInfo?.question}
//                 </div>
//               </div>
//               <div>{formattedDate}</div>
//             </div>
//             <div>
//               <button
//                 onClick={e => {
//                   e.stopPropagation();
//                   openAlertModal();
//                   updateTarotAndIndexInfo({ tarot, index: i });
//                   // tarot 값과 일치하는 인덱스 찾기
//                   const indexToRemove = tarotHistory.indexOf(tarot);
//                   // indexToRemove가 -1이 아니면 (요소가 존재하면) 해당 인덱스에서 1개의 요소 제거
//                   if (indexToRemove !== -1) {
//                     tarotHistory?.splice(indexToRemove, 1); // 무의미함.
//                   }
//                 }}
//               >
//                 {t(`button.delete`)}
//               </button>
//             </div>
//           </div>
//         );
//       })
//       .reverse();
//   };
//   const scrollContainerRef = useRef(null);
//   const scrollAmount = 10;

//   const handleScroll = event => {
//     event.preventDefault();
//     const delta = event.deltaY;

//     if (scrollContainerRef.current) {
//       scrollContainerRef.current.scrollTop +=
//         delta > 0 ? scrollAmount : -scrollAmount;
//     }
//   };
//   return (
//     <>
//       {/* <h2
//         className={`${
//           browserLanguage === 'ja' ? styles['h2-japanese'] : styles['h2']
//         } ${
//           browserLanguage === 'ja'
//             ? styles['japanese-potta-font']
//             : styles['korean-dongle-font']
//         }`}
//       >
//         {t(`mypage.tarot-history`)}
//       </h2> */}

//       <div
//         className={`${
//           browserLanguage === 'ja'
//             ? styles['user-info3-body-japanese']
//             : styles['user-info3-body']
//         }`}
//       >
//         <div
//           className={`${
//             browserLanguage === 'ja'
//               ? styles['user-info3-body-center-japanese']
//               : styles['user-info3-body-center']
//           }`}
//         >
//           {isWideScreen && (
//             <>
//               {/* 오른쪽으로 바싹 붙이고 상담회수넣기 */}
//               {whichHistory === 1 && (
//                 <div
//                   className={`${
//                     browserLanguage === 'ja'
//                       ? styles['tarot-history-record-japanese']
//                       : styles['tarot-history-record']
//                   }`}
//                 >
//                   <div>
//                     <span>{t(`mypage.tarot-history-today`)}</span>
//                     <span>
//                       {': '}
//                       {tarotHistory
//                         .map((tarot, i) => {
//                           if (isWithinThisDay(tarot)) {
//                             if (browserLanguage !== tarot.language) return;
//                             return tarot;
//                           }
//                         })
//                         .reduce((acc, current) => {
//                           if (current !== undefined && current !== null) {
//                             return acc + 1;
//                           }
//                           // reduce 함수 내부에서는 반드시 어떤 값을 반환
//                           return acc;
//                         }, 0)}
//                       {t(`mypage.times`)}
//                     </span>
//                   </div>
//                 </div>
//               )}
//               {whichHistory === 2 && (
//                 <div
//                   className={`${
//                     browserLanguage === 'ja'
//                       ? styles['tarot-history-record-japanese']
//                       : styles['tarot-history-record']
//                   }`}
//                 >
//                   <div>
//                     <span>{t(`mypage.tarot-history-this-week`)}</span>
//                     <span>
//                       {': '}
//                       {tarotHistory
//                         .map((tarot, i) => {
//                           if (isWithinThisWeek(tarot)) {
//                             if (browserLanguage !== tarot.language) return;
//                             return tarot;
//                           }
//                         })
//                         .reduce((acc, current) => {
//                           if (current !== undefined && current !== null) {
//                             return acc + 1;
//                           }
//                           // reduce 함수 내부에서는 반드시 어떤 값을 반환
//                           return acc;
//                         }, 0)}
//                       {t(`mypage.times`)}
//                     </span>
//                   </div>
//                 </div>
//               )}
//               {whichHistory === 3 && (
//                 <div
//                   className={`${
//                     browserLanguage === 'ja'
//                       ? styles['tarot-history-record-japanese']
//                       : styles['tarot-history-record']
//                   }`}
//                 >
//                   <div>
//                     <span>{t(`mypage.tarot-history-this-month`)}</span>
//                     <span>
//                       {': '}
//                       {tarotHistory
//                         .map((tarot, i) => {
//                           if (isWithinThisMonth(tarot)) {
//                             if (browserLanguage !== tarot.language) return;
//                             return tarot;
//                           }
//                         })
//                         .reduce((acc, current) => {
//                           if (current !== undefined && current !== null) {
//                             return acc + 1;
//                           }
//                           // reduce 함수 내부에서는 반드시 어떤 값을 반환
//                           return acc;
//                         }, 0)}
//                       {t(`mypage.times`)}
//                     </span>
//                   </div>
//                 </div>
//               )}
//               {whichHistory === 4 && (
//                 <div
//                   className={`${
//                     browserLanguage === 'ja'
//                       ? styles['tarot-history-record-japanese']
//                       : styles['tarot-history-record']
//                   } `}
//                 >
//                   <div>
//                     <span>{t(`mypage.tarot-history-total`)}</span>
//                     <span>
//                       {': '}
//                       {tarotHistory
//                         .map((tarot, i) => {
//                           if (browserLanguage !== tarot.language) return;
//                           return tarot;
//                         })
//                         .reduce((acc, current) => {
//                           if (current !== undefined && current !== null) {
//                             return acc + 1;
//                           }
//                           // reduce 함수 내부에서는 반드시 어떤 값을 반환
//                           return acc;
//                         }, 0)}
//                       {t(`mypage.times`)}
//                     </span>
//                   </div>
//                 </div>
//               )}
//             </>
//           )}
//           <div
//             className={`${
//               browserLanguage === 'ja'
//                 ? styles['tarot-info-japanese']
//                 : styles['tarot-info']
//             }`}
//           >
//             <div
//               className={`${
//                 browserLanguage === 'ja'
//                   ? styles['tarot-history-menu-container-japanese']
//                   : styles['tarot-history-menu-container']
//               }`}
//             >
//               <div
//                 className={`${
//                   browserLanguage === 'ja'
//                     ? styles['tarot-history-menu-box-japanese']
//                     : styles['tarot-history-menu-box']
//                 } ${
//                   isClicked === 1 &&
//                   browserLanguage !== 'ja' &&
//                   styles['tarot-history-menu-box-clicked']
//                 } ${
//                   isClicked === 1 &&
//                   browserLanguage === 'ja' &&
//                   styles['tarot-history-menu-box-clicked-japanese']
//                 }`}
//                 onClick={() => {
//                   handleHistory(1);
//                 }}
//               >
//                 <span>{t(`mypage.question-today`)}</span>
//               </div>
//               <div
//                 className={`${
//                   browserLanguage === 'ja'
//                     ? styles['tarot-history-menu-box-japanese']
//                     : styles['tarot-history-menu-box']
//                 } ${
//                   isClicked === 2 &&
//                   browserLanguage !== 'ja' &&
//                   styles['tarot-history-menu-box-clicked']
//                 } ${
//                   isClicked === 2 &&
//                   browserLanguage === 'ja' &&
//                   styles['tarot-history-menu-box-clicked-japanese']
//                 }`}
//                 onClick={() => {
//                   handleHistory(2);
//                 }}
//               >
//                 <span>{t(`mypage.question-this-week`)}</span>
//               </div>
//               <div
//                 className={`${
//                   browserLanguage === 'ja'
//                     ? styles['tarot-history-menu-box-japanese']
//                     : styles['tarot-history-menu-box']
//                 } ${
//                   isClicked === 3 &&
//                   browserLanguage !== 'ja' &&
//                   styles['tarot-history-menu-box-clicked']
//                 } ${
//                   isClicked === 3 &&
//                   browserLanguage === 'ja' &&
//                   styles['tarot-history-menu-box-clicked-japanese']
//                 }`}
//                 onClick={() => {
//                   handleHistory(3);
//                 }}
//               >
//                 <span>{t(`mypage.question-this-month`)}</span>
//               </div>
//               <div
//                 className={`${
//                   browserLanguage === 'ja'
//                     ? styles['tarot-history-menu-box-japanese']
//                     : styles['tarot-history-menu-box']
//                 } ${
//                   isClicked === 4 &&
//                   browserLanguage !== 'ja' &&
//                   styles['tarot-history-menu-box-clicked']
//                 } ${
//                   isClicked === 4 &&
//                   browserLanguage === 'ja' &&
//                   styles['tarot-history-menu-box-clicked-japanese']
//                 }`}
//                 onClick={() => {
//                   handleHistory(4);
//                 }}
//               >
//                 <span>{t(`mypage.question-three-months`)}</span>
//               </div>
//               {/* <div
//                 className={`${
//                   browserLanguage === 'ja'
//                     ? styles['tarot-history-menu-box-japanese']
//                     : styles['tarot-history-menu-box']
//                 } ${
//                   isClicked === 5 &&
//                   browserLanguage !== 'ja' &&
//                   styles['tarot-history-menu-box-clicked']
//                 } ${
//                   isClicked === 5 &&
//                   browserLanguage === 'ja' &&
//                   styles['tarot-history-menu-box-clicked-japanese']
//                 }`}
//                 onClick={() => {
//                   handleHistory(5);
//                 }}
//               >
//                 <span>{t(`mypage.question-this-year`)}</span>
//               </div>
//               <div
//                 className={`${
//                   browserLanguage === 'ja'
//                     ? styles['tarot-history-menu-box-japanese']
//                     : styles['tarot-history-menu-box']
//                 } ${
//                   isClicked === 6 &&
//                   browserLanguage !== 'ja' &&
//                   styles['tarot-history-menu-box-clicked']
//                 } ${
//                   isClicked === 6 &&
//                   browserLanguage === 'ja' &&
//                   styles['tarot-history-menu-box-clicked-japanese']
//                 }`}
//                 onClick={() => {
//                   handleHistory(6);
//                 }}
//               >
//                 <span>{t(`mypage.question-total`)}</span>
//               </div> */}
//             </div>
//             <div
//               className={`${
//                 browserLanguage === 'ja'
//                   ? styles['tarot-history-japanese']
//                   : styles['tarot-history']
//               }`}
//               ref={scrollContainerRef}
//               onWheel={e => {
//                 handleScroll(e);
//               }}
//             >
//               {whichHistory === 1 && renderTarotHistory(isWithinThisDay)}
//               {whichHistory === 2 && renderTarotHistory(isWithinThisWeek)}
//               {whichHistory === 3 && renderTarotHistory(isWithinThisMonth)}
//               {whichHistory === 4 && renderTarotHistory(isWithinThisThreeMonth)}
//               {/* {whichHistory === 5 && renderTarotHistory(isWithinThisYear)}
//               {whichHistory === 6 && renderTotalTarotHistory()} */}
//             </div>
//             {isWideScreen === false && (
//               <>
//                 {/* 오른쪽으로 바싹 붙이고 상담회수넣기 */}
//                 {whichHistory === 1 && (
//                   <div
//                     className={`${
//                       browserLanguage === 'ja'
//                         ? styles['tarot-history-record-bottom-japanese']
//                         : styles['tarot-history-record-bottom']
//                     }`}
//                   >
//                     <div>
//                       <span>{t(`mypage.tarot-history-today`)}</span>
//                       <span>
//                         {': '}
//                         {tarotHistory
//                           .map((tarot, i) => {
//                             if (isWithinThisDay(tarot)) {
//                               if (browserLanguage !== tarot.language) return;
//                               return tarot;
//                             }
//                           })
//                           .reduce((acc, current) => {
//                             if (current !== undefined && current !== null) {
//                               return acc + 1;
//                             }
//                             // reduce 함수 내부에서는 반드시 어떤 값을 반환
//                             return acc;
//                           }, 0)}
//                         {t(`mypage.times`)}
//                       </span>
//                     </div>
//                   </div>
//                 )}
//                 {whichHistory === 2 && (
//                   <div
//                     className={`${
//                       browserLanguage === 'ja'
//                         ? styles['tarot-history-record-bottom-japanese']
//                         : styles['tarot-history-record-bottom']
//                     }`}
//                   >
//                     <div>
//                       <span>{t(`mypage.tarot-history-this-week`)}</span>
//                       <span>
//                         {': '}
//                         {tarotHistory
//                           .map((tarot, i) => {
//                             if (isWithinThisWeek(tarot)) {
//                               if (browserLanguage !== tarot.language) return;
//                               return tarot;
//                             }
//                           })
//                           .reduce((acc, current) => {
//                             if (current !== undefined && current !== null) {
//                               return acc + 1;
//                             }
//                             // reduce 함수 내부에서는 반드시 어떤 값을 반환
//                             return acc;
//                           }, 0)}
//                         {t(`mypage.times`)}
//                       </span>
//                     </div>
//                   </div>
//                 )}
//                 {whichHistory === 3 && (
//                   <div
//                     className={`${
//                       browserLanguage === 'ja'
//                         ? styles['tarot-history-record-bottom-japanese']
//                         : styles['tarot-history-record-bottom']
//                     }`}
//                   >
//                     <div>
//                       <span>{t(`mypage.tarot-history-this-month`)}</span>
//                       <span>
//                         {': '}
//                         {tarotHistory
//                           .map((tarot, i) => {
//                             if (isWithinThisMonth(tarot)) {
//                               if (browserLanguage !== tarot.language) return;
//                               return tarot;
//                             }
//                           })
//                           .reduce((acc, current) => {
//                             if (current !== undefined && current !== null) {
//                               return acc + 1;
//                             }
//                             // reduce 함수 내부에서는 반드시 어떤 값을 반환
//                             return acc;
//                           }, 0)}
//                         {t(`mypage.times`)}
//                       </span>
//                     </div>
//                   </div>
//                 )}
//                 {whichHistory === 4 && (
//                   <div
//                     className={`${
//                       browserLanguage === 'ja'
//                         ? styles['tarot-history-record-bottom-japanese']
//                         : styles['tarot-history-record-bottom']
//                     } `}
//                   >
//                     <div>
//                       <span>{t(`mypage.tarot-history-total`)}</span>
//                       <span>
//                         {': '}
//                         {tarotHistory
//                           .map((tarot, i) => {
//                             if (browserLanguage !== tarot.language) return;
//                             return tarot;
//                           })
//                           .reduce((acc, current) => {
//                             if (current !== undefined && current !== null) {
//                               return acc + 1;
//                             }
//                             // reduce 함수 내부에서는 반드시 어떤 값을 반환
//                             return acc;
//                           }, 0)}
//                         {t(`mypage.times`)}
//                       </span>
//                     </div>
//                   </div>
//                 )}
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default QuestionInfo;

import { useTranslation } from 'react-i18next';
import styles from './ChartAnalysisDurumagiModal.module.scss';
import { copyText } from '../../utils/dom/copyText.jsx';
import { renderAnswerAsLines } from '../../lib/tarot/answer/renderAnswerAsLines.jsx';
import { useLanguageChange } from '@/hooks';
import Button from '../../components/common/Button.jsx';
import React, { useEffect, useRef } from 'react';
import { detectComputer } from '../../utils/device/detectComputer.js';

export const ChartAnalysisDurumagiModal = ({ ...props }) => {
  const { t } = useTranslation();
  const browserLanguage = useLanguageChange();
  const JSXTagArr = [...renderAnswerAsLines(t(`content.chart_content`))];
  const scrollContainerRef = useRef(null);
  const scrollAmount = 5;
  useEffect(() => {
    return () => {
      scrollContainerRef.current = null;
    };
  }, []);

  const handleScroll = event => {
    event.preventDefault();
    const delta = event.deltaY;

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop +=
        delta > 0 ? scrollAmount : -scrollAmount;
    }
  };
  const openBlinkModalForCopy = () => {
    if (
      props?.updateBlinkModalForCopyOpen !== undefined &&
      props?.updateBlinkModalForCopyOpen !== null &&
      detectComputer() === true
    )
      props?.updateBlinkModalForCopyOpen(true);
  };
  const openBlinkModalForSave = () => {
    if (
      props?.updateBlinkModalForSaveOpen !== undefined &&
      props?.updateBlinkModalForSaveOpen !== null
    )
      props?.updateBlinkModalForSaveOpen(true);
  };

  return (
    <>
      <div className={styles['chart-analyze-durumagi']}>
        <div className={`${styles['durumagi-box']}`}>
          {browserLanguage === 'ja' ? (
            <div
              className={styles['content-japanese']}
              ref={scrollContainerRef}
              onWheel={e => {
                handleScroll(e);
              }}
            >
              {JSXTagArr}
            </div>
          ) : (
            <div
              className={styles['content']}
              ref={scrollContainerRef}
              onWheel={e => {
                handleScroll(e);
              }}
            >
              {JSXTagArr}
            </div>
          )}

          <div className={styles['btn-box']}>
            {browserLanguage === 'ja' ? (
              <>
                <Button
                  className={styles['text-save-btn-japanese']}
                  onClick={() => {
                    copyText(JSXTagArr);
                    openBlinkModalForCopy();
                  }}
                >
                  {t(`button.copy`)}
                </Button>
                {/* <Button
                  className={styles['text-save-btn-japanese']}
                  onClick={() => {
                    openBlinkModalForSave();
                  }}
                >
                  {t(`button.text-save`)}
                </Button> */}
              </>
            ) : (
              <>
                <Button
                  className={styles['text-save-btn']}
                  onClick={() => {
                    copyText(JSXTagArr);
                    openBlinkModalForCopy();
                  }}
                >
                  {t(`button.copy`)}
                </Button>
                {/* <Button
                  className={styles['text-save-btn']}
                  onClick={() => {
                    openBlinkModalForSave();
                  }}
                >
                  {t(`button.text-save`)}
                </Button> */}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

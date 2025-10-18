/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import styles from './TarotPrincipleSideMenuForm.module.scss';
import fontStyles from '../../../styles/scss/Font.module.scss';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLanguageChange } from '@/hooks';

const TarotPrincipleSideMenuForm = ({ setPathName, ...props }) => {
  const { t } = useTranslation();
  const browserLanguage = useLanguageChange();

  return (
    <div className={styles['menu']}>
      <div>
        <h2
          className={`${
            browserLanguage === 'ja'
              ? fontStyles['japanese-font-title']
              : fontStyles['korean-font-title']
          }`}
        >
          {t(`header.principle`)}
        </h2>
      </div>
      <ul>
        <li
          onClick={() => {
            setPathName('');
          }}
        >
          <Link
            to={`/${browserLanguage}/tarot/principle`}
            className={`${styles['link-style']} ${
              browserLanguage === 'ja'
                ? fontStyles['japanese-font-content']
                : fontStyles['korean-font-content']
            }`}
          >
            <div>{t(`mypage.tarot-principle`)}</div>
          </Link>
        </li>
        <li
          onClick={() => {
            setPathName('explanation');
          }}
        >
          <Link
            to={`/${browserLanguage}/tarot/principle/explanation`}
            className={`${styles['link-style']} ${
              browserLanguage === 'ja'
                ? fontStyles['japanese-font-content']
                : fontStyles['korean-font-content']
            }`}
          >
            <div>{t(`mypage.tarot-explanation`)}</div>
          </Link>
        </li>
        <li
          onClick={() => {
            setPathName('learning');
          }}
        >
          <Link
            to={`/${browserLanguage}/tarot/principle/learning`}
            className={`${styles['link-style']} ${
              browserLanguage === 'ja'
                ? fontStyles['japanese-font-content']
                : fontStyles['korean-font-content']
            }`}
          >
            <div>{t(`mypage.tarot-learning`)}</div>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default TarotPrincipleSideMenuForm;

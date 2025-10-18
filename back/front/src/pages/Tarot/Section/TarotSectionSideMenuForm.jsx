/*eslint-disable*/
import React from 'react';
import styles from './TarotSectionSideMenuForm.module.scss';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  TAROT_PRINCIPLE_PATH,
  TAROT_EXPLANATION_PATH,
  TAROT_LEARNING_PATH,
} from '../../../config/route/UrlPaths.jsx';
import { useLanguageChange } from '@/hooks';

const TarotSectionSideMenuForm = ({ setPathName, ...props }) => {
  const { t } = useTranslation();
  const browserLanguage = useLanguageChange();

  return (
    <div className={styles['menu']}>
      <div>
        <h2
          className={`${
            browserLanguage === 'ja'
              ? styles['japanese-potta-font']
              : styles['korean-dongle-font']
          }`}
        >
          {t(`header.tarot`)}
        </h2>
      </div>
      <ul>
        <li
          onClick={() => {
            setPathName(TAROT_PRINCIPLE_PATH);
          }}
        >
          <Link
            to={`/${browserLanguage}/${TAROT_PRINCIPLE_PATH}`}
            className={`${styles['link-style']} ${
              browserLanguage === 'ja'
                ? styles['japanese-potta-font2']
                : styles['korean-dongle-font2']
            }`}
          >
            <div>{t(`mypage.tarot-principle`)}</div>
          </Link>
        </li>
        <li
          onClick={() => {
            setPathName(TAROT_EXPLANATION_PATH);
          }}
        >
          <Link
            to={`/${browserLanguage}/${TAROT_EXPLANATION_PATH}`}
            className={`${styles['link-style']} ${
              browserLanguage === 'ja'
                ? styles['japanese-potta-font2']
                : styles['korean-dongle-font2']
            }`}
          >
            <div>{t(`mypage.tarot-explanation`)}</div>
          </Link>
        </li>
        <li
          onClick={() => {
            setPathName(TAROT_LEARNING_PATH);
          }}
        >
          <Link
            to={`/${browserLanguage}/${TAROT_LEARNING_PATH}`}
            className={`${styles['link-style']} ${
              browserLanguage === 'ja'
                ? styles['japanese-potta-font2']
                : styles['korean-dongle-font2']
            }`}
          >
            <div>{t(`mypage.tarot-learning`)}</div>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default TarotSectionSideMenuForm;

/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import styles from './MyPageSideMenuForm.module.scss';
import fontStyles from '../../../styles/scss/Font.module.scss';
// import { hasAccessToken } from '../../../utils/storage/tokenLocalStorage.jsx';
import { hasAccessToken } from '../../../utils/storage/tokenCookie.jsx';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getPathWithLang,
  MYPAGE_READINGINFO_PATH,
  MYPAGE_CHART_PATH,
  MYPAGE_TOTALCHART_PATH,
  MYPAGE_USERINFO_WITHDRAW_PATH,
} from '../../../config/route/UrlPaths.jsx';
import { useLanguageChange } from '@/hooks';

const MyPageSideMenuForm = ({ setPathName, setAnswerModalOpen, ...props }) => {
  const { t } = useTranslation();
  const browserLanguage = useLanguageChange();
  const PATHS = getPathWithLang(browserLanguage);

  const handleLinkClick = pathname => {
    if (setPathName) setPathName(pathname);
    if (setAnswerModalOpen) setAnswerModalOpen(false);
  };

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
          {t(`page_title.mypage`)}
        </h2>
      </div>
      <ul>
        <li onClick={() => handleLinkClick('')}>
          <Link
            to={PATHS.MYPAGE}
            className={`${styles['link-style']} ${
              browserLanguage === 'ja'
                ? fontStyles['japanese-font-content']
                : fontStyles['korean-font-content']
            }`}
          >
            <div>{t(`mypage.user`)}</div>
          </Link>
        </li>
        <li onClick={() => handleLinkClick(MYPAGE_READINGINFO_PATH)}>
          <Link
            to={PATHS.MYPAGE_READING_INFO}
            className={`${styles['link-style']} ${
              browserLanguage === 'ja'
                ? fontStyles['japanese-font-content']
                : fontStyles['korean-font-content']
            }`}
          >
            <div>{t(`mypage.tarot-history-info`)}</div>
          </Link>
        </li>
        <li
          onClick={() =>
            handleLinkClick(`${MYPAGE_CHART_PATH}/${MYPAGE_TOTALCHART_PATH}`)
          }
        >
          <Link
            to={PATHS.MYPAGE_CHART_TOTAL}
            className={`${styles['link-style']} ${
              browserLanguage === 'ja'
                ? fontStyles['japanese-font-content']
                : fontStyles['korean-font-content']
            }`}
          >
            <div>{t(`mypage.statistics`)}</div>
          </Link>
        </li>
        <li onClick={() => handleLinkClick(MYPAGE_USERINFO_WITHDRAW_PATH)}>
          <Link
            to={PATHS.MYPAGE_WITHDRAW}
            className={`${styles['link-style']} ${
              browserLanguage === 'ja'
                ? fontStyles['japanese-font-content']
                : fontStyles['korean-font-content']
            }`}
          >
            <div>{t(`mypage.user-info-withdraw`)}</div>
          </Link>
        </li>
        {/* <li
          onClick={() => {
            setPathName(`${MORE_TERMS_OF_SERVICE_PATH}`);
            setAnswerModalOpen(false);
          }}
        >
          <Link
            to={`${MORE_TERMS_OF_SERVICE_PATH}`}
            className={`${styles['link-style']} ${
              browserLanguage === 'ja'
              ? fontStyles['japanese-font-content']
              : fontStyles['korean-font-content']
            }`}
          >
            <div>{t(`mypage.terms-of-service`)}</div>
          </Link>
        </li>
        <li
          onClick={() => {
            setPathName(`${MORE_BUSINESS_INFO_PATH}`);
            setAnswerModalOpen(false);
          }}
        >
          <Link
            to={`${MORE_BUSINESS_INFO_PATH}`}
            className={`${styles['link-style']} ${
              browserLanguage === 'ja'
              ? fontStyles['japanese-font-content']
              : fontStyles['korean-font-content']
            }`}
          >
            <div>{t(`mypage.business-info`)}</div>
          </Link>
        </li>*/}
      </ul>
    </div>
  );
};

export default MyPageSideMenuForm;

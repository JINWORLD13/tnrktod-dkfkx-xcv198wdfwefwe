/*eslint-disable*/
import React, { useState, useEffect } from 'react';
import styles from './ETCSideMenuForm.module.scss';
import fontStyles from '../../styles/scss/Font.module.scss';
// import { hasAccessToken } from '../../utils/storage/tokenLocalStorage.jsx';
import { hasAccessToken } from '../../utils/storage/tokenCookie.jsx';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getPathWithLang,
  MORE_BUSINESS_INFO_PATH,
  MORE_TERMS_OF_SERVICE_PATH,
} from '../../config/route/UrlPaths.jsx';
import { useLanguageChange } from '@/hooks';

const ETCSideMenuForm = ({ setPathName, ...props }) => {
  const { t } = useTranslation();
  const browserLanguage = useLanguageChange();
  const PATHS = getPathWithLang(browserLanguage);

  const handleLinkClick = pathname => {
    if (setPathName) setPathName(pathname);
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
          {t(`header.more`)}
        </h2>
      </div>
      <ul>
        <li onClick={() => handleLinkClick(MORE_TERMS_OF_SERVICE_PATH)}>
          <Link
            to={PATHS.ETC}
            className={`${styles['link-style']} ${
              browserLanguage === 'ja'
                ? fontStyles['japanese-font-content']
                : fontStyles['korean-font-content']
            }`}
          >
            <div>{t(`mypage.terms-of-service`)}</div>
          </Link>
        </li>
        <li onClick={() => handleLinkClick(MORE_BUSINESS_INFO_PATH)}>
          <Link
            to={PATHS.ETC_BUSINESS_INFO}
            className={`${styles['link-style']} ${
              browserLanguage === 'ja'
                ? fontStyles['japanese-font-content']
                : fontStyles['korean-font-content']
            }`}
          >
            <div>{t(`mypage.business-info`)}</div>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default ETCSideMenuForm;


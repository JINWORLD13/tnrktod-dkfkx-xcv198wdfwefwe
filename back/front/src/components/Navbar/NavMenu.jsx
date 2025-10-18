import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import { useLanguageChange } from '@/hooks';
import { getPathWithLang } from '../../config/route/UrlPaths.jsx';
import styles from './Navbar.module.scss';
// import { MusicControlDesktop } from './MusicControl.jsx';
import {
  LanguageOptionMenu,
  LanguageOptionMenuForIcon,
} from './LanguageSelector.jsx';

/**
 * 데스크톱 네비게이션 메뉴
 */
export const NavContentMenu = ({
  isAnsweredForRedux,
  isWaitingForRedux,
  isToken,
  isCheckingToken,
  browserLanguageRef,
  changeLanguage,
  logout,
  isLanguageMenuOpen,
  setLanguageMenuOpen,
  signin,
  // browserMusicRef,
  // isMusicMenuOpen,
  // setMusicMenuOpen,
  // isMusicPlaying,
  // toggleMusic,
  // musicVolume,
  // handleVolumeChange,
  // getVolumeIcon,
  // needsInteraction,
}) => {
  const { t } = useTranslation();
  const browserLanguage = useLanguageChange();
  const PATHS = getPathWithLang(browserLanguage);

  return (
    <>
      {/* <MusicControlDesktop
        browserMusicRef={browserMusicRef}
        isMusicMenuOpen={isMusicMenuOpen}
        setMusicMenuOpen={setMusicMenuOpen}
        getVolumeIcon={getVolumeIcon}
        musicVolume={musicVolume}
        handleVolumeChange={handleVolumeChange}
        needsInteraction={needsInteraction}
      /> */}
      <div className={styles['empty']}></div>

      <div className={styles['menu-box']}>
        {isAnsweredForRedux || isWaitingForRedux ? (
          <div>{t(`header.principle`)}</div>
        ) : (
          <Link
            className={styles['link-tag-font-style']}
            to={PATHS.TAROT_PRINCIPLE}
          >
            <div>{t(`header.principle`)}</div>
          </Link>
        )}
      </div>
      <div className={styles['empty']}></div>

      {!isCheckingToken && isToken === true && (
        <>
          <div className={styles['menu-box']}>
            {isAnsweredForRedux || isWaitingForRedux ? (
              <div>{t(`header.mypage`)}</div>
            ) : (
              <Link className={styles['link-tag-font-style']} to={PATHS.MYPAGE}>
                <div>{t(`header.mypage`)}</div>
              </Link>
            )}
          </div>
          <div className={styles['empty']}></div>
        </>
      )}

      {!isCheckingToken && isToken === true && (
        <>
          <div className={styles['menu-box']}>
            <Link
              className={styles['link-tag-font-style']}
              onClick={() => logout(isAnsweredForRedux, isWaitingForRedux)}
            >
              <div>{t(`header.logout`)}</div>
            </Link>
          </div>
          <div className={styles['empty']}></div>
        </>
      )}

      {!isCheckingToken && isToken === false && (
        <>
          <div className={styles['menu-box']}>
            <Link
              className={styles['link-tag-font-style']}
              onClick={() => signin(isAnsweredForRedux, isWaitingForRedux)}
            >
              <div>{t(`header.login`)}</div>
            </Link>
          </div>
          <div className={styles['empty']}></div>
        </>
      )}

      {!isCheckingToken && (isToken === true || isToken === false) && (
        <>
          <div className={styles['menu-box']}>
            {isAnsweredForRedux || isWaitingForRedux ? (
              <div>{t(`header.more`)}</div>
            ) : (
              <Link className={styles['link-tag-font-style']} to={PATHS.ETC}>
                <div>{t(`header.more`)}</div>
              </Link>
            )}
          </div>
          <div className={styles['empty']}></div>
        </>
      )}

      <div
        ref={browserLanguageRef}
        className={`${styles['menu-box']} ${styles['language-dropDown-container']}`}
        onClick={() => {
          setLanguageMenuOpen(prev => !prev);
        }}
      >
        <div>{t(`header.language`)}</div>
      </div>
      <LanguageOptionMenu
        isLanguageMenuOpen={isLanguageMenuOpen}
        changeLanguage={changeLanguage}
      />
    </>
  );
};

/**
 * 모바일 햄버거 메뉴 (아이콘 메뉴)
 */
export const MobileIconMenu = ({
  isAnsweredForRedux,
  isWaitingForRedux,
  isToken,
  isCheckingToken,
  browserLanguageRef,
  browserIconRef,
  browserDropBoxRef,
  isIconMenuOpen,
  setIconMenuOpen,
  isLanguageMenuOpen,
  setLanguageMenuOpen,
  changeLanguage,
  signin,
  logout,
  browserLanguage,
}) => {
  const { t } = useTranslation();
  const PATHS = getPathWithLang(browserLanguage);

  return (
    <>
      <FontAwesomeIcon
        className={`${
          browserLanguage === 'ja'
            ? styles['icon-dropDown-container-japanese']
            : styles['icon-dropDown-container']
        }`}
        icon={faBars}
        size={'xs'}
        style={{ color: '#FFD43B' }}
        onClick={() => {
          setIconMenuOpen(prev => !prev);
        }}
        ref={browserIconRef}
      />
      {isIconMenuOpen === true && (
        <>
          <div className={styles['icon-dropDown-box']} ref={browserDropBoxRef}>
            <div className={styles['icon-dropDown-item']}>
              {isAnsweredForRedux || isWaitingForRedux ? (
                <div>{t(`header.principle`)}</div>
              ) : (
                <Link
                  className={styles['link-tag-font-style']}
                  to={PATHS.TAROT_PRINCIPLE}
                >
                  <div>{t(`header.principle`)}</div>
                </Link>
              )}
            </div>

            {!isCheckingToken && isToken === true && (
              <div className={styles['icon-dropDown-item']}>
                {isAnsweredForRedux || isWaitingForRedux ? (
                  <div>{t(`header.mypage`)}</div>
                ) : (
                  <Link
                    className={styles['link-tag-font-style']}
                    to={PATHS.MYPAGE}
                  >
                    <div>{t(`header.mypage`)}</div>
                  </Link>
                )}
              </div>
            )}

            {!isCheckingToken && isToken === true && (
              <div className={styles['icon-dropDown-item']}>
                <Link
                  className={styles['link-tag-font-style']}
                  onClick={() => logout(isAnsweredForRedux, isWaitingForRedux)}
                >
                  <div>{t(`header.logout`)}</div>
                </Link>
              </div>
            )}

            {!isCheckingToken && isToken === false && (
              <div className={styles['icon-dropDown-item']}>
                <Link
                  className={styles['link-tag-font-style']}
                  onClick={() => signin(isAnsweredForRedux, isWaitingForRedux)}
                >
                  <div>{t(`header.login`)}</div>
                </Link>
              </div>
            )}

            {!isCheckingToken && (isToken === true || isToken === false) && (
              <>
                <div className={styles['icon-dropDown-item']}>
                  {isAnsweredForRedux || isWaitingForRedux ? (
                    <div>{t(`header.more`)}</div>
                  ) : (
                    <Link
                      className={styles['link-tag-font-style']}
                      to={PATHS.ETC}
                    >
                      <div>{t(`header.more`)}</div>
                    </Link>
                  )}
                </div>
              </>
            )}

            <div
              ref={browserLanguageRef}
              className={styles['icon-dropDown-item']}
              onClick={() => setLanguageMenuOpen(prev => !prev)}
            >
              <div>{t(`header.language`)}</div>
            </div>

            <LanguageOptionMenuForIcon
              isLanguageMenuOpen={isLanguageMenuOpen}
              changeLanguage={changeLanguage}
            />
          </div>
        </>
      )}
    </>
  );
};

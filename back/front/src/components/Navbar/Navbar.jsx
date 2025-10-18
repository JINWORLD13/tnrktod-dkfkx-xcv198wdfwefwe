import React from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import i18n from '../../locales/i18n.js';
import styles from './Navbar.module.scss';
import {
  setIsAnswered,
  setIsWaiting,
  setIsDoneAnimationOfBackground,
  setIsReadyToShowDurumagi,
} from '../../store/booleanStore.jsx';
import { getPathWithLang } from '../../config/route/UrlPaths.jsx';
import { useLanguageChange } from '@/hooks';
import { useWindowSizeState } from '@/hooks';
import { useAuth } from '@/hooks';
// import { useMusicControl } from '@/hooks';
import { useMenuManager } from '@/hooks';
import { useDeepLink } from '@/hooks';
import { NavContentMenu, MobileIconMenu } from './NavMenu.jsx';

// Navbar: 다국어 지원, 로그인/로그아웃, 딥링크 처리
// Navbar: multi-language support, login/logout, deep link handling
// Navbar：多言語サポート、ログイン/ログアウト、ディープリンク処理
const Navbar = props => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang: currentLang } = useParams();
  const { t } = useTranslation();

  const isWaitingForRedux = useSelector(state => state.booleanStore.isWaiting);
  const isAnsweredForRedux = useSelector(
    state => state.booleanStore.isAnswered
  );

  const { windowWidth } = useWindowSizeState();
  const browserLanguage = useLanguageChange();
  const PATHS = getPathWithLang(browserLanguage);

  const { isToken, isCheckingToken, signin, logout } = useAuth();

  const {
    isLanguageMenuOpen,
    setLanguageMenuOpen,
    isIconMenuOpen,
    setIconMenuOpen,
    isMusicMenuOpen,
    setMusicMenuOpen,
    browserLanguageRef,
    browserIconRef,
    browserDropBoxRef,
    browserMusicRef,
  } = useMenuManager();

  // 딥링크: 네이티브 앱 URL 스킴 처리
  // Deep link: native app URL scheme handling
  // ディープリンク：ネイティブアプリURLスキーム処理
  useDeepLink('cosmostarot', 'cosmos-tarot.com');

  // 다국어 전환: 경로 변경 + i18n 업데이트
  // Language switching: path change + i18n update
  // 多言語切り替え：パス変更 + i18n更新
  const changeLanguage = lan => {
    if (isAnsweredForRedux || isWaitingForRedux) return;

    const pathname = location.pathname;
    const nextPath = pathname.replace(/^\/(en|ja|ko)/, `/${lan}`);

    i18n.changeLanguage(lan);
    navigate(nextPath, { replace: false });
    setLanguageMenuOpen(false);
  };

  // 로고 클릭: 상태 초기화 + 홈으로 이동
  // Logo click: reset state + navigate to home
  // ロゴクリック：状態初期化 + ホームへ移動
  const handleLogoClick = () => {
    if (isAnsweredForRedux || isWaitingForRedux) return;

    dispatch(setIsAnswered(false));
    dispatch(setIsWaiting(false));

    if (props?.setAnswerFormForApp)
      props?.setAnswerFormForApp(prev => ({
        ...prev,
        isSubmitted: false,
        isWaiting: false,
        isAnswered: false,
      }));

    if (props?.setAdsWatchedForApp) props?.setAdsWatchedForApp(false);

    dispatch(setIsDoneAnimationOfBackground(false));
    dispatch(setIsReadyToShowDurumagi(false));

    if ('/' + currentLang === location.pathname) window.location.reload();
  };

  return (
    <nav
      className={`${
        browserLanguage === 'ja' ? styles['navbar-japanese'] : styles['navbar']
      }`}
    >
      <div className={styles['container']}>
        <div className={styles['title-wrapper']} onClick={handleLogoClick}>
          <Link className={styles['title-link']} to={PATHS.HOME}>
            <div className={styles['title-text']}>{t(`header.logo`)}</div>
          </Link>
        </div>

        <div className={styles['spacer']}></div>

        <div className={styles['menu-container']}>
          {/* 데스크톱 메뉴 (1366px 초과) */}
          {windowWidth > 1366 && (
            <NavContentMenu
              isAnsweredForRedux={isAnsweredForRedux}
              isWaitingForRedux={isWaitingForRedux}
              isToken={isToken}
              isCheckingToken={isCheckingToken}
              browserLanguageRef={browserLanguageRef}
              changeLanguage={changeLanguage}
              logout={logout}
              isLanguageMenuOpen={isLanguageMenuOpen}
              setLanguageMenuOpen={setLanguageMenuOpen}
              signin={signin}
              // browserMusicRef={browserMusicRef}
              // isMusicMenuOpen={isMusicMenuOpen}
              // setMusicMenuOpen={setMusicMenuOpen}
              // isMusicPlaying={isMusicPlaying}
              // toggleMusic={toggleMusic}
              // musicVolume={musicVolume}
              // handleVolumeChange={handleVolumeChange}
              // getVolumeIcon={getVolumeIcon}
              // needsInteraction={needsInteraction}
            />
          )}

          {/* 모바일 메뉴 (1366px 이하) */}
          {windowWidth <= 1366 && (
            <>
              {/* <MusicControlMobile
                browserMusicRef={browserMusicRef}
                isMusicMenuOpen={isMusicMenuOpen}
                setMusicMenuOpen={setMusicMenuOpen}
                getVolumeIcon={getVolumeIcon}
                musicVolume={musicVolume}
                handleVolumeChange={handleVolumeChange}
                needsInteraction={needsInteraction}
                browserLanguage={browserLanguage}
                windowWidth={windowWidth}
                isLandscape={isLandscape}
                isIconMenuOpen={isIconMenuOpen}
              /> */}

              <MobileIconMenu
                isAnsweredForRedux={isAnsweredForRedux}
                isWaitingForRedux={isWaitingForRedux}
                isToken={isToken}
                isCheckingToken={isCheckingToken}
                browserLanguageRef={browserLanguageRef}
                browserIconRef={browserIconRef}
                browserDropBoxRef={browserDropBoxRef}
                isIconMenuOpen={isIconMenuOpen}
                setIconMenuOpen={setIconMenuOpen}
                isLanguageMenuOpen={isLanguageMenuOpen}
                setLanguageMenuOpen={setLanguageMenuOpen}
                changeLanguage={changeLanguage}
                signin={signin}
                logout={logout}
                browserLanguage={browserLanguage}
              />
            </>
          )}

          <div className={styles['empty']}></div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

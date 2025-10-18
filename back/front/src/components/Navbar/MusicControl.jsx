import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './Navbar.module.scss';

/**
 * 음악 컨트롤 컴포넌트 (데스크톱용)
 */
export const MusicControlDesktop = ({
  browserMusicRef,
  isMusicMenuOpen,
  setMusicMenuOpen,
  getVolumeIcon,
  musicVolume,
  handleVolumeChange,
  needsInteraction,
}) => {
  return (
    <div className={styles['menu-box']} style={{ position: 'relative' }}>
      <FontAwesomeIcon
        icon={getVolumeIcon()}
        style={{
          color: '#FFD43B',
          cursor: 'pointer',
          fontSize: '1.25rem',
          animation: needsInteraction
            ? 'pulse 2s ease-in-out infinite'
            : 'none',
        }}
        onClick={() => setMusicMenuOpen(prev => !prev)}
        ref={browserMusicRef}
      />
      {isMusicMenuOpen && (
        <div className={styles['music-volume-box-desktop']}>
          <div className={styles['music-control-item']}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                width: '100%',
                paddingLeft: '10px',
                paddingRight: '10px',
              }}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={handleVolumeChange}
                className={styles['volume-slider']}
                style={{ flex: 1 }}
              />
              <span
                style={{
                  fontSize: '1.5rem',
                  minWidth: '45px',
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 음악 컨트롤 컴포넌트 (모바일용)
 */
export const MusicControlMobile = ({
  browserMusicRef,
  isMusicMenuOpen,
  setMusicMenuOpen,
  getVolumeIcon,
  musicVolume,
  handleVolumeChange,
  needsInteraction,
  browserLanguage,
  windowWidth,
  isLandscape,
  isIconMenuOpen,
}) => {
  return (
    <>
      {/* 933px 미만 가로모드: 메뉴 닫힐 때만 보임, 그 외: 항상 보임 */}
      {(windowWidth >= 933 || !isLandscape || !isIconMenuOpen) && (
        <FontAwesomeIcon
          className={`${
            browserLanguage === 'ja'
              ? styles['music-icon-container-japanese']
              : styles['music-icon-container']
          } ${needsInteraction ? styles['needs-interaction'] : ''}`}
          icon={getVolumeIcon()}
          style={{
            color: '#FFD43B',
            cursor: 'pointer',
            fontSize: '1rem',
          }}
          onClick={() => setMusicMenuOpen(prev => !prev)}
          ref={browserMusicRef}
        />
      )}
      {isMusicMenuOpen && (
        <div className={styles['music-volume-box']}>
          <div className={styles['music-control-item']}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                width: '100%',
                paddingLeft: '8px',
                paddingRight: '8px',
              }}
            >
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={musicVolume}
                onChange={handleVolumeChange}
                className={styles['volume-slider']}
                style={{ flex: 1 }}
              />
              <span
                style={{
                  fontSize: '1.4rem',
                  minWidth: '45px',
                  fontWeight: '600',
                  textAlign: 'center',
                }}
              >
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

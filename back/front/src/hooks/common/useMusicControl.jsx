import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setIsMusicPlaying, setMusicVolume } from '../../store/booleanStore.jsx';
import {
  saveMusicVolume,
  saveMusicPlayingState,
} from '../../utils/storage/musicPreference.jsx';
import {
  faVolumeHigh,
  faVolumeLow,
  faVolumeXmark,
} from '@fortawesome/free-solid-svg-icons';

/**
 * 음악 제어 로직을 처리하는 커스텀 훅
 * @returns {Object} { isMusicPlaying, musicVolume, needsInteraction, toggleMusic, handleVolumeChange, getVolumeIcon }
 */
const useMusicControl = () => {
  const dispatch = useDispatch();
  const isMusicPlaying = useSelector(
    state => state.booleanStore.isMusicPlaying
  );
  const musicVolume = useSelector(state => state.booleanStore.musicVolume);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [isLandscape, setIsLandscape] = useState(false);

  // 가로/세로 모드 감지
  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // 사용자 상호작용 필요 여부 체크
  useEffect(() => {
    const hasInteracted = localStorage.getItem('hasInteractedWithMusic');
    if (!hasInteracted && isMusicPlaying && musicVolume > 0) {
      setNeedsInteraction(true);
    }

    // 첫 클릭 시 펄스 애니메이션 제거
    const handleFirstClick = () => {
      setNeedsInteraction(false);
      localStorage.setItem('hasInteractedWithMusic', 'true');
    };

    document.addEventListener('click', handleFirstClick, { once: true });

    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, [isMusicPlaying, musicVolume]);

  // 음악 토글
  const toggleMusic = () => {
    const newPlayingState = !isMusicPlaying;
    dispatch(setIsMusicPlaying(newPlayingState));
    saveMusicPlayingState(newPlayingState);
  };

  // 음량 조절
  const handleVolumeChange = e => {
    const newVolume = parseFloat(e.target.value);
    dispatch(setMusicVolume(newVolume));
    saveMusicVolume(newVolume);

    // 볼륨이 0보다 크면 자동으로 음악 켜기
    if (newVolume > 0 && !isMusicPlaying) {
      dispatch(setIsMusicPlaying(true));
      saveMusicPlayingState(true);
    }
    // 볼륨이 0이면 자동으로 음악 끄기
    else if (newVolume === 0 && isMusicPlaying) {
      dispatch(setIsMusicPlaying(false));
      saveMusicPlayingState(false);
    }
  };

  // 볼륨에 따른 아이콘 결정
  const getVolumeIcon = () => {
    if (musicVolume === 0 || !isMusicPlaying) {
      return faVolumeXmark;
    } else if (musicVolume > 0 && musicVolume < 0.5) {
      return faVolumeLow;
    } else {
      return faVolumeHigh;
    }
  };

  return {
    isMusicPlaying,
    musicVolume,
    needsInteraction,
    isLandscape,
    toggleMusic,
    handleVolumeChange,
    getVolumeIcon,
  };
};

export default useMusicControl;

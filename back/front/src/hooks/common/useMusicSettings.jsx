import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  setIsMusicPlaying,
  setMusicVolume,
  setMusicSource,
} from '../../store/booleanStore.jsx';
import { getMusicVolume, getMusicSource } from '../../utils/storage/musicPreference.jsx';

/**
 * 음악 설정을 불러오고 Redux 스토어에 저장하는 커스텀 훅
 * @returns {boolean} isMusicSettingsLoaded - 음악 설정 로딩 완료 여부
 */
const useMusicSettings = () => {
  const dispatch = useDispatch();
  const [isMusicSettingsLoaded, setIsMusicSettingsLoaded] = useState(false);

  useEffect(() => {
    const loadMusicSettings = async () => {
      try {
        // 저장된 음악 설정 불러오기
        const volume = await getMusicVolume();
        const source = await getMusicSource();

        // Redux 스토어에 볼륨 설정
        dispatch(setMusicVolume(volume));

        // 볼륨이 0보다 크면 음악 켜기, 0이면 끄기
        if (volume > 0) {
          dispatch(setIsMusicPlaying(true));
        } else {
          dispatch(setIsMusicPlaying(false));
        }

        // 저장된 음악 소스가 있으면 설정
        if (source) {
          dispatch(setMusicSource(source));
        }

        // 💡 mp3 파일이나 URL을 사용하려면 아래 주석을 해제하세요
        // dispatch(setMusicSource('/assets/music/cosmos-tarot.mp3')); // 로컬 mp3
        // dispatch(setMusicSource('https://example.com/music.mp3')); // URL
        // dispatch(setMusicSource(null)); // Web Audio API로 되돌리기 (기본 멜로디)

        // 설정 로드 완료
        setIsMusicSettingsLoaded(true);
      } catch (error) {
        console.error('Failed to load music settings:', error);
        // 에러가 나도 일단 로드 완료로 표시
        setIsMusicSettingsLoaded(true);
      }
    };

    loadMusicSettings();
  }, [dispatch]);

  return isMusicSettingsLoaded;
};

export default useMusicSettings;

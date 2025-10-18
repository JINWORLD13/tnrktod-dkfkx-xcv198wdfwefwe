import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const MusicPlayer = () => {
  const isMusicPlaying = useSelector(
    state => state.booleanStore.isMusicPlaying
  );
  const musicVolume = useSelector(state => state.booleanStore.musicVolume);
  const musicSource = useSelector(state => state.booleanStore.musicSource);

  // HTML Audio 태그 (mp3/URL용)
  const audioRef = useRef(null);

  // Web Audio API (합성음용)
  const audioContextRef = useRef(null);
  const activeNodesRef = useRef([]);
  const masterGainRef = useRef(null);
  const melodyIntervalRef = useRef(null);
  const bellIntervalRef = useRef(null);

  // 음악 소스 변경 시 리셋
  useEffect(() => {
    if (musicSource) {
      // mp3나 URL을 사용할 경우 Web Audio 정지
      stopWebAudio();

      // HTML Audio 준비
      if (!audioRef.current) {
        const audio = new Audio();
        audio.loop = true;
        audio.volume = musicVolume;
        audioRef.current = audio;
      }

      // 소스 설정
      audioRef.current.src = musicSource;

      if (isMusicPlaying) {
        // Autoplay policy 우회: 사용자 상호작용 대기
        const playAudio = () => {
          audioRef.current.play().catch(e => {
            console.log('Audio play failed, waiting for user interaction:', e);
            // 첫 클릭 시 재생 시도
            const retryPlay = () => {
              audioRef.current
                .play()
                .catch(err => console.log('Retry failed:', err));
              document.removeEventListener('click', retryPlay);
            };
            document.addEventListener('click', retryPlay, { once: true });
          });
        };
        playAudio();
      }
    } else {
      // Web Audio API 사용 (기본 멜로디)
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      if (isMusicPlaying) {
        startWebAudio();
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      stopWebAudio();
    };
  }, [musicSource]);

  // 재생/정지
  useEffect(() => {
    if (musicSource) {
      // HTML Audio 제어
      if (audioRef.current) {
        if (isMusicPlaying) {
          audioRef.current.play().catch(e => {
            console.log('Audio play failed, waiting for user interaction:', e);
            // 첫 클릭 시 재생 시도
            const retryPlay = () => {
              audioRef.current
                .play()
                .catch(err => console.log('Retry failed:', err));
              document.removeEventListener('click', retryPlay);
            };
            document.addEventListener('click', retryPlay, { once: true });
          });
        } else {
          audioRef.current.pause();
        }
      }
    } else {
      // Web Audio API 제어
      if (isMusicPlaying) {
        startWebAudio();
      } else {
        stopWebAudio();
      }
    }
  }, [isMusicPlaying]);

  // 음량 조절
  useEffect(() => {
    if (musicSource && audioRef.current) {
      audioRef.current.volume = musicVolume;
    } else if (masterGainRef.current) {
      masterGainRef.current.gain.value = musicVolume;
    }
  }, [musicVolume, musicSource]);

  // Web Audio API 초기화
  const initWebAudio = () => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();

      // 마스터 게인 노드 생성
      const masterGain = audioContextRef.current.createGain();
      masterGain.gain.value = musicVolume;
      masterGain.connect(audioContextRef.current.destination);
      masterGainRef.current = masterGain;
    }

    // AudioContext가 suspended 상태면 resume 시도
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().catch(e => {
        console.log('AudioContext resume failed:', e);
      });
    }
  };

  // 브라우저 Autoplay Policy 우회: 첫 클릭 시 AudioContext resume
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (
        audioContextRef.current &&
        audioContextRef.current.state === 'suspended'
      ) {
        audioContextRef.current
          .resume()
          .then(() => {
            console.log('AudioContext resumed after user interaction');
          })
          .catch(e => {
            console.log('AudioContext resume failed:', e);
          });
      }
    };

    // document 전체에 이벤트 리스너 추가 (한 번만 실행)
    document.addEventListener('click', handleFirstInteraction, { once: true });
    document.addEventListener('touchstart', handleFirstInteraction, {
      once: true,
    });
    document.addEventListener('keydown', handleFirstInteraction, {
      once: true,
    });

    return () => {
      document.removeEventListener('click', handleFirstInteraction);
      document.removeEventListener('touchstart', handleFirstInteraction);
      document.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  const startWebAudio = () => {
    if (melodyIntervalRef.current) return; // 이미 재생 중

    initWebAudio();
    const ctx = audioContextRef.current;

    // "Moonlit Cabin" - 깊은 밤 오두막의 타로 마스터
    // A Minor (어둡고 신비로운 조성, 낮은 음역)
    const hymnMelody = [
      // 첫 프레이즈 - 어둠 속의 속삭임
      440.0, // A4
      493.88, // B4
      523.25, // C5
      493.88, // B4
      440.0, // A4
      392.0, // G4

      // 두 번째 프레이즈 - 촛불의 그림자
      440.0, // A4
      523.25, // C5
      587.33, // D5
      523.25, // C5
      493.88, // B4
      440.0, // A4

      // 세 번째 프레이즈 - 신비로운 계시
      523.25, // C5
      587.33, // D5
      659.25, // E5
      587.33, // D5
      523.25, // C5
      493.88, // B4

      // 네 번째 프레이즈 - 깊은 명상
      440.0, // A4
      392.0, // G4
      349.23, // F4
      392.0, // G4
      440.0, // A4

      // 다섯 번째 프레이즈 - 어둠의 울림
      493.88, // B4
      523.25, // C5
      493.88, // B4
      440.0, // A4
      392.0, // G4
      440.0, // A4

      // 마지막 프레이즈 - 밤의 여운
      493.88, // B4
      440.0, // A4
      392.0, // G4
      349.23, // F4
      329.63, // E4
      349.23, // F4
      440.0, // A4
    ];

    // 각 멜로디 음에 맞는 베이스 음 (A Minor 조성, 깊고 어두운)
    const hymn_bass = [
      // 첫 프레이즈
      220.0, // A3 (Am 코드)
      246.94, // B3 (Bdim 코드)
      261.63, // C3 (C 코드)
      246.94, // B3 (Bdim 코드)
      220.0, // A3 (Am 코드)
      196.0, // G3 (G 코드)

      // 두 번째 프레이즈
      220.0, // A3 (Am 코드)
      261.63, // C3 (C 코드)
      293.66, // D3 (Dm 코드)
      261.63, // C3 (C 코드)
      246.94, // B3 (Bdim 코드)
      220.0, // A3 (Am 코드)

      // 세 번째 프레이즈
      261.63, // C3 (C 코드)
      293.66, // D3 (Dm 코드)
      329.63, // E3 (Em 코드)
      293.66, // D3 (Dm 코드)
      261.63, // C3 (C 코드)
      246.94, // B3 (Bdim 코드)

      // 네 번째 프레이즈
      220.0, // A3 (Am 코드)
      196.0, // G3 (G 코드)
      174.61, // F3 (F 코드)
      196.0, // G3 (G 코드)
      220.0, // A3 (Am 코드)

      // 다섯 번째 프레이즈
      246.94, // B3 (Bdim 코드)
      261.63, // C3 (C 코드)
      246.94, // B3 (Bdim 코드)
      220.0, // A3 (Am 코드)
      196.0, // G3 (G 코드)
      220.0, // A3 (Am 코드)

      // 마지막 프레이즈
      246.94, // B3 (Bdim 코드)
      220.0, // A3 (Am 코드)
      196.0, // G3 (G 코드)
      174.61, // F3 (F 코드)
      164.81, // E3 (Em 코드)
      174.61, // F3 (F 코드)
      220.0, // A3 (Am 코드)
    ];

    let noteIndex = 0;

    // 하프 음색 (깊은 밤, 따뜻하고 신비로운)
    const playHarpNote = (frequency, duration = 1.5, velocity = 0.8) => {
      // 하프의 풍부한 배음 구조 (더 어둡고 따뜻한 소리)
      const harmonics = [
        { mult: 1, vol: 1.0, phase: 0 }, // 기본음 (강조)
        { mult: 2, vol: 0.48, phase: 0.12 }, // 2배음 (약간 억제)
        { mult: 3, vol: 0.32, phase: 0.18 }, // 3배음 (따뜻함)
        { mult: 4, vol: 0.25, phase: 0.24 }, // 4배음 (깊이)
        { mult: 5, vol: 0.18, phase: 0.3 }, // 5배음 (풍부함)
        { mult: 6, vol: 0.12, phase: 0.36 }, // 6배음 (깊이감)
        { mult: 8, vol: 0.08, phase: 0.42 }, // 8배음 (희미한 반짝임)
      ];

      // 휴먼화: 미세한 타이밍 변화 (±15ms, 더 자연스럽게)
      const humanTiming = (Math.random() - 0.5) * 0.03;

      // 휴먼화: 미세한 볼륨 변화 (±8%, 촛불처럼)
      const humanVelocity = velocity * (0.92 + Math.random() * 0.16);

      harmonics.forEach(({ mult, vol, phase }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const filter2 = ctx.createBiquadFilter();

        // 휴먼화: 미세한 디튠 (±3센트, 오두막의 자연스러운 울림)
        const detune = (Math.random() - 0.5) * 6;
        osc.type = 'sine'; // 하프는 사인파 기반
        osc.frequency.value = frequency * mult;
        osc.detune.value = detune;

        // 하프 특유의 따뜻하고 어두운 필터 체인
        filter.type = 'lowpass';
        filter.frequency.value = frequency * mult * 3.5; // 더 어두운 음색
        filter.Q.value = 1.4; // 더 강한 공명 (나무 오두막의 울림)

        // 두 번째 필터로 부드럽고 따뜻한 롤오프
        filter2.type = 'lowpass';
        filter2.frequency.value = frequency * mult * 5.0;
        filter2.Q.value = 0.4;

        // 하프 ADSR (느리고 부드러운 어택, 긴 여운)
        const maxVolume = (0.2 * vol * humanVelocity) / Math.pow(mult, 0.65);
        // startTime이 음수가 되지 않도록 보장
        const startTime = Math.max(
          ctx.currentTime + phase * 0.025,
          ctx.currentTime + humanTiming + phase * 0.025
        );

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(maxVolume * 0.25, startTime + 0.018); // 더 부드러운 초기 어택
        gain.gain.linearRampToValueAtTime(maxVolume, startTime + 0.08); // 천천히 펼쳐지는 메인 어택
        gain.gain.exponentialRampToValueAtTime(
          maxVolume * 0.8,
          startTime + 0.25
        ); // 긴 서스테인
        gain.gain.exponentialRampToValueAtTime(
          maxVolume * 0.55,
          startTime + duration * 0.45
        );
        gain.gain.exponentialRampToValueAtTime(
          maxVolume * 0.3,
          startTime + duration * 0.75
        );
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // 매우 긴 릴리즈

        osc.connect(filter);
        filter.connect(filter2);
        filter2.connect(gain);
        gain.connect(masterGainRef.current);

        osc.start(startTime);
        osc.stop(startTime + duration);

        activeNodesRef.current.push(osc);
      });
    };

    // 하프 스타일 화음 (깊은 밤의 신비로운 아르페지오)
    const playHarpChord = melody_freq => {
      // 베이스 (저음부) - 깊고 어두운 베이스 강조
      const bass_freq = hymn_bass[noteIndex % hymn_bass.length];
      playHarpNote(bass_freq, 5.0, 0.55); // 더 긴 지속, 더 강한 베이스

      // 낮은 옥타브 추가 (어둠의 깊이)
      setTimeout(() => {
        playHarpNote(bass_freq * 0.5, 5.5, 0.42); // 한 옥타브 아래
      }, 120 + (Math.random() - 0.5) * 30);

      // 3도음 (중저음부) - 천천히 펼쳐지는 화음
      setTimeout(() => {
        playHarpNote(bass_freq * 1.25, 4.5, 0.38); // 장3도
      }, 280 + (Math.random() - 0.5) * 40);

      // 5도음 (중음부) - 아르페지오 효과
      setTimeout(() => {
        playHarpNote(bass_freq * 1.5, 4.2, 0.35); // 완전 5도
      }, 450 + (Math.random() - 0.5) * 50);

      // 옥타브 (고음부) - 은은하게 빛나듯
      setTimeout(() => {
        playHarpNote(bass_freq * 2, 3.8, 0.28); // 부드럽게
      }, 620 + (Math.random() - 0.5) * 60);

      // 가끔 높은 배음 (별빛처럼)
      if (Math.random() < 0.6) {
        setTimeout(() => {
          playHarpNote(bass_freq * 3, 3.0, 0.18); // 희미한 고음
        }, 800 + (Math.random() - 0.5) * 80);
      }
    };

    // 하프 공명 효과 (깊은 밤의 신비로운 울림)
    const playResonance = (frequency, duration = 6) => {
      // 여러 레이어의 깊은 공명음 (오두막의 나무 벽이 울리듯)
      const resonances = [
        { mult: 0.25, vol: 0.035, filter: 1.8 }, // 매우 깊은 저음
        { mult: 0.5, vol: 0.038, filter: 2.2 }, // 저음 공명
        { mult: 0.75, vol: 0.028, filter: 2.8 }, // 중저음 공명
        { mult: 1.0, vol: 0.022, filter: 3.2 }, // 기본 공명
        { mult: 1.5, vol: 0.018, filter: 3.8 }, // 중고음 공명
        { mult: 2.0, vol: 0.015, filter: 4.2 }, // 고음 공명 (희미한 별빛)
      ];

      resonances.forEach(({ mult, vol, filter: filterMult }, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.value = frequency * mult;
        osc.detune.value = (Math.random() - 0.5) * 5; // 더 넓은 디튠 (신비로운 느낌)

        filter.type = 'lowpass';
        filter.frequency.value = frequency * filterMult;
        filter.Q.value = 0.8; // 더 강한 공명

        // 안전한 시작 시간 (레이어마다 천천히 지연)
        const safeStartTime = Math.max(
          ctx.currentTime + index * 0.15,
          ctx.currentTime + 0.01
        );

        gain.gain.setValueAtTime(0, safeStartTime);
        gain.gain.linearRampToValueAtTime(vol * 0.2, safeStartTime + 0.6); // 천천히 시작
        gain.gain.linearRampToValueAtTime(vol, safeStartTime + 1.2); // 천천히 부풀어오름
        gain.gain.exponentialRampToValueAtTime(
          vol * 0.7,
          safeStartTime + duration * 0.6
        );
        gain.gain.exponentialRampToValueAtTime(0.001, safeStartTime + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterGainRef.current);

        osc.start(safeStartTime);
        osc.stop(safeStartTime + duration);

        activeNodesRef.current.push(osc);
      });
    };

    // 하프 스타일 연주 (Adagio - 매우 느리고 신비롭게, 타로 마스터의 오두막)
    const playNote = () => {
      // 깊은 밤의 느린 템포 (매우 느리게)
      // 촛불이 깜빡이듯 불규칙한 리듬
      let humanRubato = 1400 + (Math.random() - 0.5) * 200;

      // 프레이즈의 끝부분에서 훨씬 더 느려지기 (명상적)
      if (noteIndex % 6 === 5) {
        humanRubato += 300; // 깊은 여운
      }

      // 가끔 더 긴 쉼표 (신비로운 분위기)
      if (Math.random() < 0.15) {
        humanRubato += 400; // 생각에 잠기는 순간
      }

      // 주 멜로디 (낮고 신비로운 하프 소리)
      const harpVelocity = 0.65 + (Math.random() - 0.5) * 0.12; // 볼륨 변화 증가
      playHarpNote(hymnMelody[noteIndex], 4.5, harpVelocity); // 더 긴 지속시간

      // 아르페지오 화음 (분산화음) - 더 천천히 펼쳐짐
      setTimeout(() => {
        playHarpChord(hymnMelody[noteIndex]);
      }, 250 + (Math.random() - 0.5) * 80);

      // 공명 효과 (더 자주, 깊은 밤의 울림)
      if (noteIndex % 2 === 0) {
        setTimeout(() => {
          playResonance(hymnMelody[noteIndex], 7.0); // 더 긴 공명
        }, 150 + (Math.random() - 0.5) * 50);
      }

      noteIndex = (noteIndex + 1) % hymnMelody.length;

      // 다음 노트 (rubato 적용)
      melodyIntervalRef.current = setTimeout(playNote, humanRubato);
    };

    // 첫 노트 시작
    playNote();
  };

  const stopWebAudio = () => {
    if (melodyIntervalRef.current) {
      clearTimeout(melodyIntervalRef.current);
      melodyIntervalRef.current = null;
    }

    activeNodesRef.current.forEach(node => {
      try {
        node.stop();
      } catch (e) {}
    });
    activeNodesRef.current = [];
  };

  return null; // UI는 Navbar에서 처리
};

export default MusicPlayer;

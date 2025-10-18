
/**
 * 원래 방식(let timer;)에서는 useEffect가 재실행될 때마다 timer, timerOfMagic, interval이 새로 정의되어 이전에 설정된 타이머/인터벌에 대한 참조가 손실될 수 있었습니다. 이로 인해 clearTimeout이나 clearInterval로 정리되지 않은 타이머가 남아 메모리 누수를 유발할 가능성이 있었습니다.
 * useRef를 사용하면 컴포넌트가 언마운트되거나 useEffect가 재실행될 때까지 동일한 참조를 유지하므로, cleanup 시 정확히 이전 타이머를 정리할 수 있습니다.
 * useRef로 관리된 변수를 사용하면, useEffect의 cleanup 함수에서 정확히 이전에 설정된 타이머와 인터벌을 참조하여 정리할 수 있습니다. 원래 방식에서는 변수가 재정의될 수 있어 이전 타이머가 누락될 가능성이 있었습니다.*/

import { useCallback, useEffect, useRef } from 'react';

export const useCrystalAction = (
  initialActions,
  isTarotAnswerWaitingState,
  isTarotAnsweredState,
  isReadyToShowDurumagiState,
  setMagicOn = undefined
) => {
  const actionsRef = useRef(initialActions);
  const timerRef = useRef(null);
  const timerOfMagicRef = useRef(null);
  const intervalRef = useRef(null);
  const currentActionRef = useRef(null);

  useEffect(() => {
    actionsRef.current = initialActions;
    return () => {
      actionsRef.current = null;
    };
  }, [initialActions]);

  const crystalAction = useCallback(() => {
    const actions = actionsRef.current;

    const transitionAnimation = (targetAction, timeScale, fadeOutActions) => {
      const parts = [
        'Head',
        'Body',
        'LeftArm',
        'LeftLeg',
        'RightArm',
        'RightLeg',
      ];
      parts.forEach(part => {
        fadeOutActions.forEach(actionType => {
          const action = actions?.[`${actionType}${part}`];
          if (action) action.fadeOut(1);
        });
        const action = actions?.[`${targetAction}${part}`];
        if (action) {
          action.timeScale = timeScale;
          action.reset().fadeIn(2).play();
        }
      });
    };

    const greetingAction = () => {
      if (currentActionRef.current === 'greeting') return;
      currentActionRef.current = 'greeting';
      transitionAnimation('GreetingAction', 0.7, [
        'MagicAction',
        'WaitingAction',
      ]);
      if (setMagicOn) {
        setMagicOn(false);
        actions?.MagicSetAction?.fadeOut(1);
      }
    };

    const magicAction = () => {
      if (currentActionRef.current === 'magic') return;
      currentActionRef.current = 'magic';
      transitionAnimation('MagicAction', 0.5, [
        'GreetingAction',
        'WaitingAction',
      ]);
      if (setMagicOn) {
        timerOfMagicRef.current = setTimeout(() => {
          setMagicOn(true);
          actions?.MagicSetAction?.reset().fadeIn(2).play();
        }, 1500);
      }
    };

    const waitingAction = () => {
      if (currentActionRef.current === 'waiting') return;
      currentActionRef.current = 'waiting';
      transitionAnimation('WaitingAction', 0.5, [
        'GreetingAction',
        'MagicAction',
      ]);
      if (setMagicOn) {
        setMagicOn(false);
        actions?.MagicSetAction?.fadeOut(1);
      }
    };

    // Clear existing timers to prevent overlaps
    if (timerRef.current) clearTimeout(timerRef.current);
    if (timerOfMagicRef.current) clearTimeout(timerOfMagicRef.current);

    if (
      isTarotAnswerWaitingState ||
      (!isReadyToShowDurumagiState && isTarotAnsweredState)
    ) {
      waitingAction();
    } else {
      const executeSequence = () => {
        greetingAction();
        timerRef.current = setTimeout(magicAction, 8000);
      };
      executeSequence();
    }

    actions?.LightInCrystalBallAction?.play();
  }, [
    isTarotAnswerWaitingState,
    isTarotAnsweredState,
    isReadyToShowDurumagiState,
    setMagicOn,
  ]);

  useEffect(() => {
    if (!isReadyToShowDurumagiState && isTarotAnsweredState) return;

    crystalAction();

    // Set interval only if not already set
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        if (
          !isTarotAnswerWaitingState &&
          !(isTarotAnsweredState && !isReadyToShowDurumagiState)
        ) {
          crystalAction();
        }
      }, 13000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (timerOfMagicRef.current) clearTimeout(timerOfMagicRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [crystalAction]);

  return null;
};
// import { useCallback, useEffect, useRef } from 'react';

//   export const useCrystalAction = (
//     initialActions,
//     isTarotAnswerWaitingState,
//     isTarotAnsweredState,
//     isReadyToShowDurumagiState,
//     setMagicOn = undefined
//   ) => {
//     const actionsRef = useRef(initialActions);
//     //~ useRef를 사용하여 변수가 컴포넌트의 생명주기 동안 단일 참조를 유지
//     /**
//      * 원래 방식(let timer;)에서는 useEffect가 재실행될 때마다 timer, timerOfMagic, interval이 새로 정의되어 이전에 설정된 타이머/인터벌에 대한 참조가 손실될 수 있었습니다. 이로 인해 clearTimeout이나 clearInterval로 정리되지 않은 타이머가 남아 메모리 누수를 유발할 가능성이 있었습니다.
//      * useRef를 사용하면 컴포넌트가 언마운트되거나 useEffect가 재실행될 때까지 동일한 참조를 유지하므로, cleanup 시 정확히 이전 타이머를 정리할 수 있습니다.
//      * useRef로 관리된 변수를 사용하면, useEffect의 cleanup 함수에서 정확히 이전에 설정된 타이머와 인터벌을 참조하여 정리할 수 있습니다. 원래 방식에서는 변수가 재정의될 수 있어 이전 타이머가 누락될 가능성이 있었습니다.*/
//     const timerRef = useRef(null);
//     const timerOfMagicRef = useRef(null);
//     const intervalRef = useRef(null);

//     useEffect(() => {
//       actionsRef.current = initialActions;
//     }, [initialActions]);

//     const crystalAction = useCallback(() => {
//       const actions = actionsRef.current;

//       const greetingAction = () => {
//         actions.GreetingActionHead.timeScale = 0.7;
//         actions.GreetingActionBody.timeScale = 0.7;
//         actions.GreetingActionLeftArm.timeScale = 0.7;
//         actions.GreetingActionLeftLeg.timeScale = 0.7;
//         actions.GreetingActionRightArm.timeScale = 0.7;
//         actions.GreetingActionRightLeg.timeScale = 0.7;
//         if (setMagicOn) {
//           setMagicOn(false);
//           actions?.MagicSetAction?.fadeOut(1);
//         }
//         actions?.MagicActionHead?.fadeOut(1);
//         actions?.WaitingActionHead?.fadeOut(1);
//         actions?.GreetingActionHead?.reset();
//         actions?.GreetingActionHead?.fadeIn(2);
//         actions?.GreetingActionHead?.play();
//         actions?.MagicActionBody?.fadeOut(1);
//         actions?.WaitingActionBody?.fadeOut(1);
//         actions?.GreetingActionBody?.reset();
//         actions?.GreetingActionBody?.fadeIn(2);
//         actions?.GreetingActionBody?.play();
//         actions?.MagicActionLeftArm?.fadeOut(1);
//         actions?.WaitingActionLeftArm?.fadeOut(1);
//         actions?.GreetingActionLeftArm?.reset();
//         actions?.GreetingActionLeftArm?.fadeIn(2);
//         actions?.GreetingActionLeftArm?.play();
//         actions?.MagicActionLeftLeg?.fadeOut(1);
//         actions?.WaitingActionLeftLeg?.fadeOut(1);
//         actions?.GreetingActionLeftLeg?.reset();
//         actions?.GreetingActionLeftLeg?.fadeIn(2);
//         actions?.GreetingActionLeftLeg?.play();
//         actions?.MagicActionRightArm?.fadeOut(1);
//         actions?.WaitingActionRightArm?.fadeOut(1);
//         actions?.GreetingActionRightArm?.reset();
//         actions?.GreetingActionRightArm?.fadeIn(2);
//         actions?.GreetingActionRightArm?.play();
//         actions?.MagicActionRightLeg?.fadeOut(1);
//         actions?.WaitingActionRightLeg?.fadeOut(1);
//         actions?.GreetingActionRightLeg?.reset();
//         actions?.GreetingActionRightLeg?.fadeIn(2);
//         actions?.GreetingActionRightLeg?.play();
//       };

//       const magicAction = () => {
//         actions.MagicActionHead.timeScale = 0.5;
//         actions.MagicActionBody.timeScale = 0.5;
//         actions.MagicActionLeftArm.timeScale = 0.5;
//         actions.MagicActionLeftLeg.timeScale = 0.5;
//         actions.MagicActionRightArm.timeScale = 0.5;
//         actions.MagicActionRightLeg.timeScale = 0.5;
//         if (setMagicOn) {
//           timerOfMagicRef.current = setTimeout(() => {
//             setMagicOn(true);
//           }, 1500);
//           actions?.MagicSetAction?.reset();
//           actions.MagicSetAction.startAt(0);
//           actions?.MagicSetAction?.fadeIn(2);
//           actions?.MagicSetAction?.play();
//         }
//         actions?.GreetingActionHead?.fadeOut(1);
//         actions?.MagicActionHead?.reset();
//         actions?.MagicActionHead?.fadeIn(2);
//         actions?.MagicActionHead?.play();
//         actions?.GreetingActionBody?.fadeOut(1);
//         actions?.MagicActionBody?.reset();
//         actions?.MagicActionBody?.fadeIn(2);
//         actions?.MagicActionBody?.play();
//         actions?.GreetingActionLeftArm?.fadeOut(1);
//         actions?.MagicActionLeftArm?.reset();
//         actions?.MagicActionLeftArm?.fadeIn(2);
//         actions?.MagicActionLeftArm?.play();
//         actions?.GreetingActionLeftLeg?.fadeOut(1);
//         actions?.MagicActionLeftLeg?.reset();
//         actions?.MagicActionLeftLeg?.fadeIn(2);
//         actions?.MagicActionLeftLeg?.play();
//         actions?.GreetingActionRightArm?.fadeOut(1);
//         actions?.MagicActionRightArm?.reset();
//         actions?.MagicActionRightArm?.fadeIn(2);
//         actions?.MagicActionRightArm?.play();
//         actions?.GreetingActionRightLeg?.fadeOut(1);
//         actions?.MagicActionRightLeg?.reset();
//         actions?.MagicActionRightLeg?.fadeIn(2);
//         actions?.MagicActionRightLeg?.play();
//       };

//       const waitingAction = () => {
//         actions.WaitingActionHead.timeScale = 0.5;
//         actions.WaitingActionBody.timeScale = 0.5;
//         actions.WaitingActionLeftArm.timeScale = 0.5;
//         actions.WaitingActionLeftLeg.timeScale = 0.5;
//         actions.WaitingActionRightArm.timeScale = 0.5;
//         actions.WaitingActionRightLeg.timeScale = 0.5;
//         if (setMagicOn) {
//           setMagicOn(false);
//           actions?.MagicSetAction?.fadeOut(1);
//         }
//         actions?.GreetingActionHead?.fadeOut(1);
//         actions?.MagicActionHead?.fadeOut(1);
//         actions?.WaitingActionHead?.reset();
//         actions?.WaitingActionHead?.fadeIn(2);
//         actions?.WaitingActionHead?.play();
//         actions?.GreetingActionBody?.fadeOut(1);
//         actions?.MagicActionBody?.fadeOut(1);
//         actions?.WaitingActionBody?.reset();
//         actions?.WaitingActionBody?.fadeIn(2);
//         actions?.WaitingActionBody?.play();
//         actions?.GreetingActionLeftArm?.fadeOut(1);
//         actions?.MagicActionLeftArm?.fadeOut(1);
//         actions?.WaitingActionLeftArm?.reset();
//         actions?.WaitingActionLeftArm?.fadeIn(2);
//         actions?.WaitingActionLeftArm?.play();
//         actions?.GreetingActionLeftLeg?.fadeOut(1);
//         actions?.MagicActionLeftLeg?.fadeOut(1);
//         actions?.WaitingActionLeftLeg?.reset();
//         actions?.WaitingActionLeftLeg?.fadeIn(2);
//         actions?.WaitingActionLeftLeg?.play();
//         actions?.GreetingActionRightArm?.fadeOut(1);
//         actions?.MagicActionRightArm?.fadeOut(1);
//         actions?.WaitingActionRightArm?.reset();
//         actions?.WaitingActionRightArm?.fadeIn(2);
//         actions?.WaitingActionRightArm?.play();
//         actions?.GreetingActionRightLeg?.fadeOut(1);
//         actions?.MagicActionRightLeg?.fadeOut(1);
//         actions?.WaitingActionRightLeg?.reset();
//         actions?.WaitingActionRightLeg?.fadeIn(2);
//         actions?.WaitingActionRightLeg?.play();
//       };

//       if (
//         isTarotAnswerWaitingState ||
//         (!isReadyToShowDurumagiState && isTarotAnsweredState)
//       ) {
//         waitingAction();
//       } else {
//         const executeSequence = () => {
//           greetingAction();
//           timerRef.current = setTimeout(() => {
//             magicAction();
//           }, 8000);
//         };

//         intervalRef.current = setInterval(executeSequence, 13000);
//         executeSequence();
//       }
//       actions?.LightInCrystalBallAction?.play();
//     }, [
//       isTarotAnswerWaitingState,
//       isTarotAnsweredState,
//       isReadyToShowDurumagiState,
//       setMagicOn,
//     ]);

//     useEffect(() => {
//       if (!isReadyToShowDurumagiState && isTarotAnsweredState) return;

//       crystalAction();

//       return () => {
//         if (timerRef.current) clearTimeout(timerRef.current);
//         if (timerOfMagicRef.current) clearTimeout(timerOfMagicRef.current);
//         if (intervalRef.current) clearInterval(intervalRef.current);
//       };
//     }, [crystalAction]);

//     return null;
//   };

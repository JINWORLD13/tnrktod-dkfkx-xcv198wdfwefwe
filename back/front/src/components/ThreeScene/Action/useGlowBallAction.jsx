import { useThree } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';

export let useGlowBallAction = (
  initialActions,
  isTarotAnswerWaitingState,
  isTarotAnsweredState,
  isReadyToShowDurumagiState
) => {
  let actionsRef = useRef(initialActions);

  useEffect(() => {
    actionsRef.current = initialActions;
    return () => {
      // actionsRef.current?.GlowBallAction?.reset();
      // actionsRef.current?.GlowBallAction001?.reset();
      // actionsRef.current?.GlowBallAction002?.reset();
      // actionsRef.current?.GlowBallAction003?.reset();
      // actionsRef.current?.GlowBallAction004?.reset();
      actionsRef.current = null;
    };
  }, [initialActions]);

  let glowBallAction = useCallback(() => {
    let actions = actionsRef.current;

    actions?.GlowBallAction?.play();
    actions?.GlowBallAction001?.play();
    actions?.GlowBallAction002?.play();
    actions?.GlowBallAction003?.play();
    actions?.GlowBallAction004?.play();
  }, [
    isTarotAnswerWaitingState,
    isTarotAnsweredState,
    isReadyToShowDurumagiState,
  ]);

  useEffect(() => {
    if (!isReadyToShowDurumagiState && isTarotAnsweredState) return;
    glowBallAction();

  }, [glowBallAction]);

  return null;
};

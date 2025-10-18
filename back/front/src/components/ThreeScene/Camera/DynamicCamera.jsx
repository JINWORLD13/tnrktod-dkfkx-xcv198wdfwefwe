import React from 'react';

import { useFrame, useThree, extend } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { PerspectiveCamera } from 'three';
import { MathUtils, Vector3 } from 'three';
extend({ PerspectiveCamera: PerspectiveCamera });
export const DynamicCamera = ({
  isWaiting = false,
  isAnswered = false,
  answer,
  isReadyToShowDurumagi = false,
  isDoneAnimationOfBackground,
  whichTarot,
  isVoucherModeOn,
  targetPositionWhenMagicCircleVisible = [0, 1.2, 5.2],
  targetPositionWhenMagicCircleInvisible = [0, 1.7, 3],
  lookAtPositionWhenMagicCircleVisible = [0, 1.25, 1],
  lookAtPositionWhenMagicCircleInvisible = [0, 1.5, 1],
}) => {
  const { camera } = useThree();
  const targetPositionRef = useRef(new Vector3());
  const targetFovRef = useRef(30);
  const [isMagicCircleVisible, setMagicCircleVisible] = useState(true);
  const notInitialAdsMode = !(
    whichTarot === 2 &&
    !isVoucherModeOn &&
    !isWaiting &&
    isAnswered &&
    !isReadyToShowDurumagi &&
    !isDoneAnimationOfBackground &&
    answer?.length === 0
  );

  useEffect(() => {
    setMagicCircleVisible(prev => {
      if (!notInitialAdsMode) return prev;
      return isWaiting || (isAnswered && !isReadyToShowDurumagi);
    });
    // isWaiting 상태가 변경될 때마다 목표 위치 업데이트
    // { position: new THREE.Vector3(0, 0.03, 0.22), fov: 15 }
    // const targetPosition = isMagicCircleVisible ? [0, 1.2, 5.2] : [0, 0.05, 0.14];
    const targetPosition = isMagicCircleVisible
      ? targetPositionWhenMagicCircleVisible
      : targetPositionWhenMagicCircleInvisible;
    targetPositionRef.current.set(...targetPosition);
  }, [isMagicCircleVisible, isWaiting, isAnswered, isReadyToShowDurumagi]); //! isMagicCircleVisible 값이 바뀌면 반응하도록 의존성 설정 => useFrame 내부도 내용이 바뀌니 다시 호출(?).

  useFrame(() => {
    // 매 프레임마다 카메라 위치와 FOV를 부드럽게 업데이트
    // lerp의 두번째 매개변수 : 현재 값에서 목표 값으로 얼마나 빠르게 이동할지를 결정(0: 전혀 움직이지 않음 (현재 값 유지), 1: 즉시 목표 값으로 점프)
    camera.position.lerp(targetPositionRef.current, 0.1);
    camera.fov = MathUtils.lerp(camera.fov, targetFovRef.current, 0.1);
    camera.updateProjectionMatrix();
    const lookAtPosition = isMagicCircleVisible
      ? lookAtPositionWhenMagicCircleVisible
      : lookAtPositionWhenMagicCircleInvisible;
    camera.lookAt(...lookAtPosition);
  });

  // useFrame(limitFPS((state, delta) => {}));

  return null;
};  
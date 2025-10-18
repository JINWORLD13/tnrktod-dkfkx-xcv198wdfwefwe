import React, {
  useRef,
  useState,
  useEffect,
  Suspense,
  memo,
  useMemo,
} from 'react';
import styles from '../../../TarotMasterScene.module.scss';
import * as THREE from 'three';
import { OrbitControls, Stars, Float, Text3D, Stats } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { useWindowSizeState } from '@/hooks';
// const GlowingLantern = lazy(() => import('./Model/GlowingLantern.jsx'));
// const GlowingSparkle = lazy(() => import('./Model/GlowingSparkle.jsx'));
// const TalkBubble = lazy(() => import('./Model/TalkBubble.jsx'));
// const CharacterAllCrystalScene = lazy(() =>
//   import('./Model/CharacterAllCrystalSceneWithoutTongue.jsx')
// );
import GlowingLantern from './Props/GlowingLantern.jsx';
import TalkBubbleForVertical from './Props/TalkBubbleForVertical.jsx';
import { Model } from '../../../../../public/assets/model/character-fbx/Character_all_crystal_scene_without_tongue';
import { detectHorizon } from '../../../../utils/device/detectHorizon.js';
import TalkBubble from './Props/TalkBubble.jsx';
import { GlowingSparkle } from '../../Effect/GlowingSparkle.jsx';
import { MysticalLight } from '../../Effect/MysticalLight.jsx';
import { BigMagicCircle } from '../../Effect/BigMagicCircle.jsx';
import { ExplodingGlow } from '../../Effect/ExplodingGlow.jsx';
import { DynamicCamera } from '../../Camera/DynamicCamera.jsx';
import { setTotalCardsNumber } from '../store/tarotCardStore.jsx';
import CanvasPerformanceWrapper from '../../../../components/Performance/CanvasPerformanceWrapper.jsx';
// import { MagicCircleGroupUsingBlenderForBackground } from '../../Effect/MagicCircleUsingBlenderForBackgroundWithInstances.jsx';
import { MagicCircleGroupUsingBlenderForBackground } from '../../Effect/MagicCircleUsingBlenderForBackground.jsx';
import { MagicCircleUsingBlenderGroup } from '../../Effect/MagicCircleUsingBlender.jsx';
// import { MagicCircleGroupForBackground } from '../../Effect/MagicCircleForBackground.jsx';
// import { MagicCircleGroup } from '../../Effect/MagicCircle.jsx';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary.jsx';
import { Capacitor } from '@capacitor/core';
import { isProductionMode } from '@/utils/constants';
const isNative = Capacitor.isNativePlatform();

export default function TarotMasterScene({
  stateGroup,
  toggleModalGroup,
  handleStateGroup,
  updateTarotManualModalOpen,
  setReadyToShowDurumagi,
  setDoneAnimationOfBackground,
  ...props
}) {
  const {
    answerForm,
    cardForm,
    questionForm,
    modalForm,
    whichTarot,
    cssInvisible,
    country,
    isReadyToShowDurumagi,
    isDoneAnimationOfBackground,
    ...rest
  } = stateGroup;
  const {
    handleAnsweredState,
    handleCardForm,
    handleQuestionForm,
    handleResetAll,
    handleResetDeck,
    handleSpreadValue,
    handleWhichTarot,
    ...rest2
  } = handleStateGroup;
  let camera = { position: [0, 1.7, 3], fov: 30 };
  const [isTalkBubbleClosed, setTalkBubbleClosed] = useState(false);
  const { windowWidth, windowHeight } = useWindowSizeState();
  const [clickStatusForTalkBubble, setClickStatusForTalkBubble] =
    useState(true);
  const [isLightOn, setLightOn] = useState(true);
  const [invisibleDuringPlaying, setInvisibleDuringPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [visibleForExplosion, setVisibleForExplosion] = useState(false);

  useEffect(() => {
    // console.log('isTalkBubbleClosed : ', isTalkBubbleClosed);
    // console.log('isReadyToShowDurumagi : ', isReadyToShowDurumagi);
    // console.log('clickStatusForTalkBubble : ', clickStatusForTalkBubble);
    setTalkBubbleClosed(prev => {
      // if (!isReadyToShowDurumagi && !clickStatusForTalkBubble) return false;
      if (clickStatusForTalkBubble) return false;
      return true;
    });
  }, [windowWidth, isReadyToShowDurumagi]);

  useEffect(() => {
    setInvisibleDuringPlaying(prev => {
      return (
        (!answerForm?.isWaiting && !answerForm?.isAnswered) ||
        (answerForm?.isAnswered &&
          isDoneAnimationOfBackground &&
          isReadyToShowDurumagi)
      );
    });
    setVisible(prev => {
      return (
        answerForm?.isWaiting ||
        (answerForm?.isAnswered && !isReadyToShowDurumagi)
      );
    });
    setVisibleForExplosion(prev => {
      return answerForm?.isAnswered && isDoneAnimationOfBackground;
    });
  }, [
    answerForm?.isWaiting,
    answerForm?.isAnswered,
    isDoneAnimationOfBackground,
    isReadyToShowDurumagi,
  ]);

  return (
    <ErrorBoundary>
      <Canvas id={'myCanvas'} gl={{ antialias: false }} camera={camera}>
        {!isProductionMode && (
          <Stats
            style={{
              position: 'fixed',
              top: '0px',
              left: '0px',
              zIndex: 1000000,
            }}
          />
        )}
        <Suspense fallback={null}>
          <DynamicCamera
            isWaiting={answerForm?.isWaiting}
            isAnswered={answerForm?.isAnswered}
            isReadyToShowDurumagi={isReadyToShowDurumagi}
          />
          <Model
            scale={0.03}
            stateGroup={stateGroup}
            toggleModalGroup={toggleModalGroup}
            handleStateGroup={handleStateGroup}
            setTalkBubbleClosed={setTalkBubbleClosed}
            setClickStatusForTalkBubble={setClickStatusForTalkBubble}
            updateTarotManualModalOpen={updateTarotManualModalOpen}
            isDoneAnimationOfBackground={isDoneAnimationOfBackground}
            visible={invisibleDuringPlaying}
          />
          {invisibleDuringPlaying && (
            <group>
              <GlowingLantern
                color="lightpink"
                amount={20}
                emissive="orange"
                glow="#ff9f50"
                size={0.2}
                position={[0.23, 1.13, 0.7]}
                setLightOn={setLightOn}
                visible={invisibleDuringPlaying}
              />
            </group>
          )}
          {visibleForExplosion && (
            <ExplodingGlow
              isAnswered={answerForm?.isAnswered}
              isDoneAnimationOfBackground={isDoneAnimationOfBackground}
              isReadyToShowDurumagi={isReadyToShowDurumagi}
              setReadyToShowDurumagi={setReadyToShowDurumagi}
              visibleForExplosion={visibleForExplosion}
            />
          )}
          {visible && (
            <group>
              <ambientLight intensity={10} />
              <BigMagicCircle visible={visible} />
              {/* <MysticalLight count={100} visible={visible} /> */}
              <GlowingSparkle visible={visible} />
            </group>
          )}
          {visible && (
            <group>
              <MagicCircleGroupUsingBlenderForBackground
                setDoneAnimationOfBackground={setDoneAnimationOfBackground}
                visible={visible}
              />
              <MagicCircleUsingBlenderGroup visible={visible} />
            </group>
          )}
          {isTalkBubbleClosed === false &&
            !answerForm?.isWaiting &&
            !answerForm?.isAnswered && (
              <group>
                {/* Add your components here */}
                {detectHorizon() === true && (
                  <TalkBubble
                    size={[1, 1, 1]}
                    radius={0.1}
                    answerForm={answerForm}
                    stateGroup={stateGroup}
                    isLightOn={isLightOn}
                  />
                )}
                {/* <PointLight position={[0, 0, 5]} intensity={1} color="white" /> */}
                {detectHorizon() === false && (
                  <TalkBubbleForVertical
                    size={[1, 1, 1]}
                    radius={0.1}
                    answerForm={answerForm}
                    stateGroup={stateGroup}
                    isLightOn={isLightOn}
                  />
                )}
              </group>
            )}
        </Suspense>
        <StartSpin />
        <color attach="background" args={['#000000']} />
        {/* <Float floatIntensity={1} speed={3}></Float> */}
        {/* <OrbitControls />  */}
        {/* <axesHelper args={[10]} /> */}
      </Canvas>
    </ErrorBoundary>
  );
}

function StartSpin(props) {
  const startRef = useRef();
  useFrame((state, delta) => {
    startRef.current.rotation.x += 0.0005 * delta;
    startRef.current.rotation.y += 0.005 * delta;
  });
  return (
    <>
      <Stars
        ref={startRef}
        radius={1}
        depth={5}
        count={1000}
        factor={0.6}
        saturation={1}
        fade
        speed={0.5}
      />
    </>
  );
}

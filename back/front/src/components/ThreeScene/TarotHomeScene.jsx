// components/ThreeScene/TarotHomeScene.jsx
import React from 'react';
import TarotMasterScene from './Model/TarotMasterSceneFirstEdition/TarotMasterScene.jsx';

const TarotHomeScene = ({
  stateGroup,
  setStateGroup,
  toggleModalGroup,
  handleStateGroup,
  updateTarotManualModalOpen,
  setReadyToShowDurumagi,
  setDoneAnimationOfBackground,
  userInfo,
  isClickedForTodayCard,
  ...props
}) => {
  return (
    <>
      {/* ✅ SEO 메타태그는 Home.jsx에서 처리하므로 여기서는 제거 */}

      {/* ✅ TarotMasterScene만 렌더링 */}
      <TarotMasterScene
        position={[0, 0, 0]}
        stateGroup={stateGroup}
        setStateGroup={setStateGroup}
        toggleModalGroup={toggleModalGroup}
        handleStateGroup={handleStateGroup}
        setReadyToShowDurumagi={setReadyToShowDurumagi}
        updateTarotManualModalOpen={updateTarotManualModalOpen}
        setDoneAnimationOfBackground={setDoneAnimationOfBackground}
        userInfo={userInfo}
        isClickedForTodayCard={isClickedForTodayCard}
      />
    </>
  );
};

export default TarotHomeScene;

import { useState } from 'react';

const useWhichTarotState = (inputState) => {
  const initialState = inputState !== null && inputState !== undefined ? inputState : 2; //! 보통타로로 설정(어른들이 스피드 타로가 먼저 뜨니까 해석이 안나온다고 함. - 사용자 경험)
  const [whichTarot, setWhichTarot] = useState(initialState);

  const updateWhichTarot = (newWhichTarot) => {
    setWhichTarot(newWhichTarot);
  };

  return [whichTarot, updateWhichTarot];
};

export default useWhichTarotState;

// import { useState } from 'react';

// const useWhichTarotState = inputState => {
//   if (inputState === null || inputState === undefined) {
//     const initialState = 1;
//     const [whichTarot, setWhichTarot] = useState(initialState);
//     return [whichTarot, setWhichTarot];
//   }
//   const [whichTarot, setWhichTarot] = useState(inputState);
//   return [whichTarot, setWhichTarot];
// };

// export default useWhichTarotState;

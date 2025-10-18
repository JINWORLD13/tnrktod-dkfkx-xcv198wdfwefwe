import { useState } from 'react';

const useCSSInvisibleState = (inputState) => {
  const initialState = inputState !== null && inputState !== undefined ? inputState : false;
  const [IsCSSInvisible, setIsCSSInvisible] = useState(initialState);

  const updateCSSInvisible = (newCSSInvisible) => {
    setIsCSSInvisible(newCSSInvisible);
  };

  return [IsCSSInvisible, updateCSSInvisible];
};

export default useCSSInvisibleState;


// import { useState } from 'react';

// const useCSSInvisibleState = inputState => {
//   if (inputState === null || inputState === undefined) {
//     const initialState = false;
//     const [IsCSSInvisible, setIsCSSInvisible] = useState(initialState);
//     return [IsCSSInvisible, setIsCSSInvisible];
//   }
//   const [IsCSSInvisible, setIsCSSInvisible] = useState(inputState);
//   return [IsCSSInvisible, setIsCSSInvisible];
// };


// export default useCSSInvisibleState;
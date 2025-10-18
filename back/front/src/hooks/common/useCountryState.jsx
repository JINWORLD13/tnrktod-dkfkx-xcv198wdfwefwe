import { useState } from 'react';

const useCountryState = (inputState) => {
  const initialState = inputState !== null && inputState !== undefined ? inputState : '';
  const [country, setCountry] = useState(initialState);

  const updateCountry = (newCountry) => {
    setCountry(newCountry);
  };

  return [country, updateCountry];
};

export default useCountryState;

// import { useState } from 'react';

// const useCountryState = inputState => {
//   if (inputState === null || inputState === undefined) {
//     const initialState = '';
//     const [country, setCountry] = useState(initialState);
//     return [country, setCountry];
//   }
//   const [country, setCountry] = useState(inputState);
//   return [country, setCountry];
// };


// export default useCountryState;
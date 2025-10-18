import { useState } from 'react';

const useModalFormState = (inputState) => {
  const initialState = inputState || { spread: false, tarot: false };
  const [modalForm, setModalForm] = useState(initialState);

  const updateModalForm = (newModalForm) => {
    setModalForm(newModalForm);
  };

  return [modalForm, updateModalForm];
};

export default useModalFormState;


// import { useState } from 'react';


// const useModalFormState = inputState => {
//   if (inputState === null || inputState === undefined) {
//     const initialState = { spread: false, tarot: false };
//     const [modalForm, setModalForm] = useState(initialState);
//     return [modalForm, setModalForm];
//   }
//   const [modalForm, setModalForm] = useState(inputState);
//   return [modalForm, setModalForm];
// };


// export default useModalFormState;
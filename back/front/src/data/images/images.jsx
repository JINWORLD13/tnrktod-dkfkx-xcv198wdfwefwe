import React from 'react';

// import.meta.glob 함수는 Vite에서 지원하는 동적 임포트 함수
// glob함수 매개변수로는 오로지 string(literal)만 올 수 있음. 동적 literal(``${})이나 변수에 string 넣어서 매개변수로 하면 안됨.
const imagesPathObj = import.meta.glob('/public/assets/images/deck/*');
const imagesPathArr = Object.keys(imagesPathObj);

// & tarotDeck의 카드파일별 파일명(카드명 앞에 숫자도 있음. jpg는 없앰.)과 일치시킴.
export const tarotCardImageFilesList = imagesPathArr.map(elem => {
  return elem.split('/').reverse()[0].split('.')[0];
});
export const tarotCardImageFilesNameList = imagesPathArr.map(elem => {
  return elem.split('/').reverse()[0].split('.')[0].split('_').slice(1).join('_');
});

// imagesPathArr는 /public부터 시작. tarotCardImagesFilesPathList는 /images부터 시작
export const tarotCardImageFilesPathList = imagesPathArr.map(elem => {
  return elem.substring(7);
});

export const tarotCardImageFileFolderPath = imagesPathArr[0].substring(7).split('/').slice(0, -1).join('/');

export const backImagePath = '/assets/images/tarot_card_back.jpg'

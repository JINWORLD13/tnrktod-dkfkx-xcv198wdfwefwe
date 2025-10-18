// country : fetchData.jsx의 tarotApi로부터 가져오기.
export const mapCountryToLanguage = country => {
  switch (country) {
    case 'US':
      return 'en';
    case 'KR':
      return 'ko';
    case 'JP':
      return 'ja';
    default:
      return;
  }
};

// 이렇게 사용
// useEffect(() => {
  //   // fetchData();
  //   const language = mapCountryToLanguage(country);
  //   if (language !== null && language !== undefined)
  //     i18n.changeLanguage(language);
  // }, [country]);
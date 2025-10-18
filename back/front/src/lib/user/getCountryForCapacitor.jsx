
// import { Device } from '@capacitor/device';
// import { Geolocation } from '@capacitor/geolocation';

// async function getDeviceCountry() {
//   try {
//     // 1. 먼저 디바이스 언어 설정에서 국가 코드 확인
//     const languageCode = await Device.getLanguageCode();
//     if (languageCode.value.includes('-')) {
//       const country = languageCode.value.split('-')[1];
//       return country.toUpperCase();
//     }

//     // 2. 디바이스 지역 설정 확인
//     const locale = await Device.getInfo();
//     if (locale.locale && locale.locale.includes('_')) {
//       const country = locale.locale.split('_')[1];
//       return country.toUpperCase();
//     }

//     // 3. 위치 기반 국가 코드 확인 (선택적)
//     // <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />해야 함.
//     try {
//       const coordinates = await Geolocation.getCurrentPosition();
//       const response = await fetch(
//         `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.coords.latitude}&lon=${coordinates.coords.longitude}`
//       );
//       const data = await response.json();
//       if (data.address?.country_code) {
//         return data.address.country_code.toUpperCase();
//       }
//     } catch (geoError) {
//       console.log('Geolocation error:', geoError);
//     }

//     // 4. 기본값 반환
//     return 'US';  // 기본값 설정
//   } catch (error) {
//     console.error('Error getting device country:', error);
//     return 'US';  // 오류 시 기본값
//   }
// }

// const COUNTRY_CODE_CACHE_KEY = 'device_country_code';

// export async function getDeviceCountryWithCache() {
//   try {
//     // 캐시된 값 확인
//     const cachedCountry = localStorage.getItem(COUNTRY_CODE_CACHE_KEY);
//     if (cachedCountry) {
//       return cachedCountry;
//     }

//     // 새로운 값 가져오기
//     const countryCode = await getDeviceCountry();

//     // 캐시에 저장
//     localStorage.setItem(COUNTRY_CODE_CACHE_KEY, countryCode);

//     return countryCode;
//   } catch (error) {
//     console.error('Error in getDeviceCountryWithCache:', error);
//     return 'US';
//   }
// }

// // 오프라인 대응
// export async function getDeviceCountryWithFallback() {
//   try {
//     const network = await Device.getInfo();
//     if (network.connected) {
//       return await getDeviceCountry();
//     } else {
//       // 오프라인일 경우 캐시된 값이나 기본값 사용
//       const cachedCountry = localStorage.getItem(COUNTRY_CODE_CACHE_KEY);
//       return cachedCountry || 'US';
//     }
//   } catch (error) {
//     console.error('Error in getDeviceCountryWithFallback:', error);
//     return 'US';
//   }
// }

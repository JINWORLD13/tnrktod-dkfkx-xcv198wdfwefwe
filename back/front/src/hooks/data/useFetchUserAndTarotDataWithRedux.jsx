import { useCallback, useState } from 'react';
import { setTarotHistoryAction } from '../../store/tarotHistoryStore.jsx';
import { setUserInfoAction } from '../../store/userInfoStore.jsx';

export const userCacheForRedux = new Map();
export const tarotCacheForRedux = new Map();
const useFetchUserAndTarotDataWithRedux = (tarotApi, userApi, dispatch) => {
  const cleanupInterceptorArr = [];

  const [isActivated, setActivated] = useState(false);
  
  /**
   * 사용자 및 타로 데이터 가져오기
   * @param {Object} cancelToken - axios CancelToken (선택적)
   */
  const getUserAndTarot = async (cancelToken = null) => {
    if (isActivated === true) return;
    setActivated(true);
    try {
      // 타로 히스토리 가져오기
      if (
        tarotCacheForRedux?.get('/tarot/history') === undefined ||
        tarotCacheForRedux?.get('/tarot/history') === null
      ) {
        let fetchedTarotData;
        
        // cancelToken이 있으면 전달, 없으면 null
        const { response, cleanup: cleanupForGetHistory } =
          await tarotApi.getHistory(cancelToken);
        cleanupInterceptorArr.push(cleanupForGetHistory);
        fetchedTarotData = response;
        
        // cancelToken으로 취소된 경우 대비 (getHistoryForSub은 cancelToken 없이)
        if (fetchedTarotData === undefined || fetchedTarotData === null) {
          const { response, cleanup: cleanupForGetHistorySub } =
            await tarotApi.getHistoryForSub();
          cleanupInterceptorArr.push(cleanupForGetHistorySub);
          fetchedTarotData = response;
        }
        
        tarotCacheForRedux?.set('/tarot/history', fetchedTarotData);
        dispatch(setTarotHistoryAction(fetchedTarotData));
      }

      // 사용자 정보 가져오기
      if (
        userCacheForRedux?.get('/user/userinfo') === undefined ||
        userCacheForRedux?.get('/user/userinfo') === null
      ) {
        let fetchedUserData;
        
        // cancelToken이 있으면 전달, 없으면 null
        const { response, cleanup: cleanupForGetUser } = 
          await userApi.get(cancelToken);
        cleanupInterceptorArr.push(cleanupForGetUser);
        fetchedUserData = response;
        
        // cancelToken으로 취소된 경우 대비 (getForSub은 cancelToken 없이)
        if (fetchedUserData === undefined || fetchedUserData === null) {
          const { response, cleanup: cleanupForGetUserSub } =
            await userApi.getForSub();
          cleanupInterceptorArr.push(cleanupForGetUserSub);
          fetchedUserData = response;
        }
        
        userCacheForRedux?.set('/user/userinfo', fetchedUserData);
        dispatch(setUserInfoAction(fetchedUserData));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActivated(false);
    }
  };

  // const saveUserAndTarotInRedux = async () => {
  //   await getUserAndTarot();
  // };
  // useEffect(() => {
  //   saveUserAndTarotInRedux();
  // }, [getUserAndTarot]);

  const clearCaches = useCallback(() => {
    tarotCacheForRedux.clear();
    userCacheForRedux.clear();
  }, []);

  return { getUserAndTarot, clearCaches, cleanupInterceptorArr };
};

export default useFetchUserAndTarotDataWithRedux;
// const useFetchUserAndTarotData = (tarotApi, userApi, updateTarotHistory, setUserInfo) => {
//   const getUser = useCallback(async () => {
//     try {
//       const tarotHistory = await tarotApi.getHistory();
//       if (tarotHistory !== null && tarotHistory !== undefined) {
//         updateTarotHistory(tarotHistory);
//         const userInfo = await userApi.get();
//         setUserInfo(userInfo);
//       } else {
//         // Handle the case when tarotHistory is null or undefined
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }, [tarotApi, userApi, updateTarotHistory, setUserInfo]);

//   // useEffect(() => {
//   //   getUser();

//   // }, [getUser]);

//   return getUser;
// };

// export default useFetchUserAndTarotData;

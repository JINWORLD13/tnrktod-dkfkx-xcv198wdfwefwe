import { useCallback, useMemo } from 'react';

// 데이터 Fetching Hook: 사용자 정보 + 타로 히스토리 (Map 캐싱)
// Data Fetching Hook: user info + tarot history (Map caching)
// データ取得フック：ユーザー情報 + タロット履歴（Mapキャッシング）
const useFetchUserAndTarotData = (
  tarotApi,
  userApi,
  updateTarotHistory,
  setUserInfo
) => {
  const tarotCache = new Map();
  const userCache = new Map();
  const memoizedTarotData = useMemo(
    () => tarotCache.get('/tarot/history'),
    [tarotCache.size]
  );
  const memoizedUserData = useMemo(
    () => userCache.get('/user/userinfo'),
    [userCache.size]
  );

  const getUserAndTarot = useCallback(async () => {
    try {
      if (memoizedTarotData === undefined || memoizedTarotData === null) {
        const fetchedTarotData = await tarotApi.getHistory();
        tarotCache.set('/tarot/history', fetchedTarotData);
        updateTarotHistory(fetchedTarotData);
      }

      if (memoizedUserData === undefined || memoizedUserData === null) {
        const fetchedUserData = await userApi.get();
        userCache.set('/user/userinfo', fetchedUserData);
        setUserInfo(fetchedUserData);
      }
    } catch (err) {
      console.error(err);
    }
  }, [memoizedTarotData, memoizedUserData]);

  const clearCaches = useCallback(() => {
    tarotCache.clear();
    userCache.clear();
  }, []);

  return { getUserAndTarot, clearCaches };
};

export default useFetchUserAndTarotData;

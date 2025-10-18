/*eslint-disable*/
import React, { useState, useEffect, memo } from 'react';
import styles from './UserVoucherRefundForm.module.scss';
// import { hasAccessToken } from '../../../utils/storage/tokenLocalStorage.jsx';
import { hasAccessToken } from '../../../utils/storage/tokenCookie.jsx';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguageChange } from '@/hooks';
import { UserVoucherRefund } from './UserVoucherRefund.jsx';
import { Capacitor } from '@capacitor/core';
const isNative = Capacitor.isNativePlatform();

const UserVoucherRefundForm = memo(
  ({
    userInfo,
    isClickedForVoucherMenu,
    setTotalPriceOfRefund,
    setTotalPriceOfRefundForUSD,
    bucketForRefund,
    setBucketForRefund,
    ...props
  }) => {
    const navigate = useNavigate();
    const browserLanguage = useLanguageChange();
    useEffect(() => {
      const handleOrientationChange = () => {
        if (window.screen.width < window.screen.height) {
          window.scrollTo(0, 0);
        }
      };

      window.addEventListener('orientationchange', handleOrientationChange);

      return () => {
        window.removeEventListener(
          'orientationchange',
          handleOrientationChange
        );
      };
    }, []);

    let defaultObj = {
      1: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      2: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      3: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      4: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      5: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      6: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      7: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      8: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      9: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      10: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      11: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
      13: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]],
    };
    let defaultArr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    let refundableVouchersObj = { ...defaultObj };
    if (
      userInfo?.vouchersInDetail !== undefined &&
      userInfo?.vouchersInDetail !== null &&
      Object.values(userInfo?.vouchersInDetail).flat(1)?.length >= 1
    ) {
      refundableVouchersObj = { ...userInfo?.vouchersInDetail } || {
        ...defaultObj,
      };
    } else {
      refundableVouchersObj = { ...defaultObj };
    }

    if (refundableVouchersObj[isClickedForVoucherMenu] === undefined)
      refundableVouchersObj[isClickedForVoucherMenu] = [[...defaultArr]];

    const [totalCountForRefund, setTotalCountForRefund] = useState({
      1: [0],
      2: [0],
      3: [0],
      4: [0],
      5: [0],
      6: [0],
      7: [0],
      8: [0],
      9: [0],
      10: [0],
      11: [0],
      13: [0],
    });
    const [totalPriceForRefundAsObj, setTotalPriceForRefundAsObj] = useState({
      1: [0],
      2: [0],
      3: [0],
      4: [0],
      5: [0],
      6: [0],
      7: [0],
      8: [0],
      9: [0],
      10: [0],
      11: [0],
      13: [0],
    });
    let maxLength = Object.values(refundableVouchersObj).reduce((max, arr) => {
      return arr?.length > max ? arr?.length : max;
    }, 0);
    let length;
    let currency;
    if (browserLanguage === 'ko') {
      length =
        refundableVouchersObj[isClickedForVoucherMenu]?.filter(
          elem => elem[7] === 'KRW' || elem[7] === 0
        )?.length ?? 0;
      currency = 'KRW';
    }
    if (browserLanguage === 'ja') {
      length =
        refundableVouchersObj[isClickedForVoucherMenu]?.filter(
          elem => elem[7] === 'USD' || elem[7] === 0
        )?.length ?? 0;
      currency = 'USD';
    }
    if (browserLanguage === 'en') {
      length =
        refundableVouchersObj[isClickedForVoucherMenu]?.filter(
          elem => elem[7] === 'USD' || elem[7] === 0
        )?.length ?? 0;
      currency = 'USD';
    }
    // console.log('length', length);
    // console.log('refundableVouchersObj', refundableVouchersObj);
    // console.log('maxLength', maxLength);

    for (let i = 0; i < maxLength - length; i++) {
      refundableVouchersObj[isClickedForVoucherMenu] = [
        ...refundableVouchersObj[isClickedForVoucherMenu],
        [...defaultArr],
      ];
    }
    useEffect(() => {
      setTotalPriceOfRefund(prev => {
        return {
          ...prev,
          [isClickedForVoucherMenu]: totalPriceForRefundAsObj[
            isClickedForVoucherMenu
          ].reduce((acc, curr) => acc + curr, 0),
        };
      });
    }, [isClickedForVoucherMenu, totalPriceForRefundAsObj]);
    const [totalCountForRefundForUSD, setTotalCountForRefundForUSD] = useState({
      1: [0],
      2: [0],
      3: [0],
      4: [0],
      5: [0],
      6: [0],
      7: [0],
      8: [0],
      9: [0],
      10: [0],
      11: [0],
      13: [0],
    });
    const [totalPriceForRefundAsObjForUSD, setTotalPriceForRefundAsObjForUSD] =
      useState({
        1: [0],
        2: [0],
        3: [0],
        4: [0],
        5: [0],
        6: [0],
        7: [0],
        8: [0],
        9: [0],
        10: [0],
        11: [0],
        13: [0],
      });
    useEffect(() => {
      setTotalPriceOfRefundForUSD(prev => {
        return {
          ...prev,
          [isClickedForVoucherMenu]: totalPriceForRefundAsObjForUSD[
            isClickedForVoucherMenu
          ].reduce((acc, curr) => acc + curr, 0),
        };
      });
    }, [isClickedForVoucherMenu, totalPriceForRefundAsObjForUSD]);

    if (hasAccessToken() === false && isNative === false) return;

    return (
      <div
        className={`${
          browserLanguage === 'ja'
            ? styles['user-info-container-japanese']
            : styles['user-info-container']
        }`}
      >
        <div
          className={`${
            browserLanguage === 'ja'
              ? styles['user-info1-japanese']
              : styles['user-info1']
          }`}
        >
          {refundableVouchersObj[isClickedForVoucherMenu]
            .filter(elem => elem[7] === currency || elem[7] === 0)
            .map((refundableVoucher, i) => {
              if (refundableVoucher[8] === 'NA') return;
              return (
                <div
                  key={i} // 고유 key 값 추가
                  className={`${
                    browserLanguage === 'ja'
                      ? styles['user-info1-box2-japanese']
                      : styles['user-info1-box2']
                  } ${refundableVoucher[0] === 0 && styles['invisible']}`}
                >
                  <UserVoucherRefund
                    userInfo={userInfo}
                    refundableVoucher={refundableVoucher}
                    isClickedForVoucherMenu={isClickedForVoucherMenu}
                    totalPriceForRefundAsObj={totalPriceForRefundAsObj}
                    setTotalPriceForRefundAsObj={setTotalPriceForRefundAsObj}
                    totalCountForRefund={totalCountForRefund}
                    setTotalCountForRefund={setTotalCountForRefund}
                    totalPriceForRefundAsObjForUSD={
                      totalPriceForRefundAsObjForUSD
                    }
                    setTotalPriceForRefundAsObjForUSD={
                      setTotalPriceForRefundAsObjForUSD
                    }
                    totalCountForRefundForUSD={totalCountForRefundForUSD}
                    setTotalCountForRefundForUSD={setTotalCountForRefundForUSD}
                    i={i}
                    bucketForRefund={bucketForRefund}
                    setBucketForRefund={setBucketForRefund}
                  />
                </div>
              );
            })}
        </div>
      </div>
    );
  }
);

export default UserVoucherRefundForm;

// withCredentials: true는 서버에 요청 시에 인증 정보를 함께 보내도록 하는 옵션일 것입니다. 보통 쿠키를 사용하는 세션 기반 인증에서 필요한 옵션입니다.
// data.user._json은 일반적으로 OAuth 인증을 통해 얻은 사용자 정보에서 사용자의 추가 정보(사용자의 이메일, 이름, 프로필 사진 URL 등)를 담고 있는 객체
// 언더스코어(_)는 객체의 프로퍼티 이름. 즉,  _json은 단순히 객체의 속성 이름
// 추출한 userInfo 객체의 _json 속성
// _json이라는 이름의 속성은 주로 OAuth 인증 프로세스에서 사용됩니다. 일반적으로 OAuth 공급자로부터 반환되는 사용자 정보가 JSON 형식으로 제공되는데, 이 정보는 _json이라는 속성에 담겨 있을 수 있습니다.
// {
//   "login": "example_user",
//   "id": 123456,
//   "name": "John Doe",
//   "email": "john@example.com"
//   // ... 기타 사용자 정보
// }
// 이런식으로 나옴.

// console.log('tarotHistory._json : ', tarotHistory._json);
// 네, 주요 변경사항과 그 이유에 대해 더 구체적으로 설명드리겠습니다:

// 1. refundableVouchersObj를 useState로 관리:

// ```javascript
// const [refundableVouchersObj, setRefundableVouchersObj] = useState(() => {
//   // 초기화 로직
// });
// ```

// 이렇게 변경한 이유:
// - 기존에는 refundableVouchersObj가 일반 변수로 선언되어 있어 React의 렌더링 사이클과 잘 맞지 않았습니다.
// - useState를 사용함으로써 이 객체의 변경이 컴포넌트의 리렌더링을 트리거할 수 있게 되었습니다.
// - 읽기 전용 속성 문제를 해결할 수 있습니다. 상태 업데이트 함수를 통해 객체를 안전하게 수정할 수 있기 때문입니다.

// 2. 초기 refundableVouchersObj 설정 로직 변경:

// ```javascript
// useState(() => {
//   const defaultObj = {
//     1: [[0, 0, 0, 0, 0, 0, 0, 0, 0]],
//     // ... 다른 키들
//   };

//   if (userInfo?.vouchersInDetail !== undefined && /* 다른 조건들 */) {
//     return userInfo?.vouchersInDetail ?? defaultObj;
//   } else {
//     return defaultObj;
//   }
// });
// ```

// 이렇게 변경한 이유:
// - 초기화 로직을 useState의 초기화 함수로 이동함으로써, 컴포넌트가 마운트될 때 한 번만 실행되도록 최적화했습니다.
// - 조건부 로직을 그대로 유지하면서 더 깔끔하게 초기 상태를 설정할 수 있게 되었습니다.

// 3. isClickedForVoucherMenu에 해당하는 배열이 없을 경우 추가하는 useEffect:

// ```javascript
// useEffect(() => {
//   if (refundableVouchersObj[isClickedForVoucherMenu] === undefined) {
//     setRefundableVouchersObj(prev => ({
//       ...prev,
//       [isClickedForVoucherMenu]: [[0, 0, 0, 0, 0, 0, 0, 0, 0]],
//     }));
//   }
// }, [isClickedForVoucherMenu]);
// ```

// 이렇게 변경한 이유:
// - 기존 코드에서는 객체에 직접 접근하여 수정하려 했지만, 이는 읽기 전용 속성 문제를 일으켰습니다.
// - useEffect를 사용하여 isClickedForVoucherMenu가 변경될 때마다 확인하고, 필요한 경우에만 상태를 업데이트합니다.
// - setRefundableVouchersObj를 사용하여 안전하게 상태를 업데이트합니다.

// 4. 배열 길이 조정 로직을 useEffect로 이동:

// ```javascript
// useEffect(() => {
//   if (maxLength - length > 0) {
//     setRefundableVouchersObj(prev => {
//       const newArray = [...prev[isClickedForVoucherMenu]];
//       for (let i = 0; i < maxLength - length; i++) {
//         newArray.push([0, 0, 0, 0, 0, 0, 0, 0, 0]);
//       }
//       return {
//         ...prev,
//         [isClickedForVoucherMenu]: newArray,
//       };
//     });
//   }
// }, [maxLength, length, isClickedForVoucherMenu]);
// ```

// 이렇게 변경한 이유:
// - 기존 코드에서는 렌더링 중에 직접 객체를 수정하려 했습니다. 이는 React의 렌더링 규칙을 위반하고 예기치 않은 동작을 일으킬 수 있습니다.
// - useEffect를 사용하여 렌더링 후에 필요한 경우에만 상태를 업데이트합니다.
// - setRefundableVouchersObj를 사용하여 안전하게 상태를 업데이트합니다.

// 이러한 변경을 통해 코드의 안정성과 예측 가능성이 향상되었습니다. React의 상태 관리 원칙을 더 잘 따르게 되었고, 읽기 전용 속성 문제를 해결했습니다. 또한, 성능 최적화 측면에서도 개선이 이루어졌습니다.
// 이해하기 어려우셨다면 죄송합니다. 더 자세히 설명해 드리겠습니다.

// 1. 읽기 전용(Read-only) 속성:
//    JavaScript에서 일부 객체나 속성은 읽기 전용으로 설정될 수 있습니다. 이는 해당 객체나 속성의 값을 변경할 수 없다는 의미입니다. React에서는 특히 props나 state를 직접 수정하는 것을 권장하지 않습니다.

// 2. 일반 변수 vs React 상태(state):
//    - 일반 변수: 컴포넌트 내에서 `let` 또는 `const`로 선언된 변수입니다. 이 변수들의 값이 변경되어도 React는 이를 감지하지 못하고 컴포넌트를 다시 렌더링하지 않습니다.
//    - React 상태(state): `useState` 훅으로 생성된 상태 변수입니다. 이 상태가 변경되면 React는 이를 감지하고 컴포넌트를 다시 렌더링합니다.

// 3. 왜 일반 변수로 선언하면 안되는가:
//    - 반응성(Reactivity): 일반 변수를 사용하면 값이 변경되어도 React가 이를 감지하지 못해 UI가 업데이트되지 않습니다.
//    - 불변성(Immutability): React는 상태의 불변성을 유지하는 것을 권장합니다. 일반 변수를 직접 수정하는 것은 이 원칙을 위반할 수 있습니다.
//    - 최적화: React의 상태 관리 시스템을 사용하면 불필요한 렌더링을 방지하고 성능을 최적화할 수 있습니다.

// 4. useState를 사용하는 이유:
//    - 반응성: 상태가 변경될 때 자동으로 컴포넌트가 다시 렌더링됩니다.
//    - 불변성 유지: `setState` 함수를 통해 상태를 업데이트함으로써 불변성을 쉽게 유지할 수 있습니다.
//    - 생명주기 관리: 컴포넌트의 생명주기 동안 상태를 안전하게 관리할 수 있습니다.

// 예를 들어, 다음과 같은 코드는 문제가 될 수 있습니다:

// ```javascript
// let obj = { count: 0 };
// obj.count += 1; // 이렇게 변경해도 React는 변화를 감지하지 못함
// ```

// 대신 이렇게 사용하는 것이 좋습니다:

// ```javascript
// const [obj, setObj] = useState({ count: 0 });
// setObj(prev => ({ ...prev, count: prev.count + 1 })); // React가 변화를 감지하고 컴포넌트를 다시 렌더링함
// ```

// 이렇게 하면 React의 상태 관리 시스템을 활용하여 더 안정적이고 예측 가능한 방식으로 데이터를 관리할 수 있습니다.

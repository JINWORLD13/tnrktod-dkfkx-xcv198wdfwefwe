/*eslint-disable*/
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import styles from './ETCForm.module.scss';
// import { hasAccessToken } from '../../../utils/storage/tokenLocalStorage.jsx';
import { useTranslation } from 'react-i18next';
import ETCSideMenuForm from './ETCSideMenuForm.jsx';
import {
  ETC_PATH,
  MORE_BUSINESS_INFO_PATH,
  MORE_TERMS_OF_SERVICE_PATH,
} from '@/config/route/UrlPaths';
import BusinessInfoForm from './Business/BusinessInfoForm';
import TermsOfServiceForm from './Terms/TermsOfServiceForm';
import LoadingForm from '@/components/Loading/Loading';
import { useLanguageChange } from '@/hooks';

const ETCForm = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const [pathName, setPathName] = useState('');
  const browserLanguage = useLanguageChange();

  useEffect(() => {
    const pathname = location.pathname;

    // URL 경로에서 현재 페이지 판단
    if (pathname.includes(`/${ETC_PATH}/${MORE_BUSINESS_INFO_PATH}`)) {
      setPathName(MORE_BUSINESS_INFO_PATH);
    } else if (pathname.endsWith(`/${ETC_PATH}`)) {
      setPathName(MORE_TERMS_OF_SERVICE_PATH);
    } else {
      setPathName(MORE_TERMS_OF_SERVICE_PATH);
    }
  }, [location.pathname, browserLanguage]);

  return (
    <Suspense fallback={<LoadingForm />}>
      <div className={styles['container']}>
        <div className={styles['container-box1']}>
          <ETCSideMenuForm />
        </div>
        <div className={styles['container-box2']}>
          {pathName === MORE_TERMS_OF_SERVICE_PATH ? (
            <TermsOfServiceForm />
          ) : null}
          {pathName === MORE_BUSINESS_INFO_PATH ? <BusinessInfoForm /> : null}
        </div>
        {/* 숨겨진 SEO 콘텐츠 */}
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
          <h1>{t('page.etc.mainHeading')}</h1>
          <section>
            <p>{t('page.etc.intro.paragraph1')}</p>
            <p>{t('page.etc.intro.paragraph2')}</p>
          </section>
        </div>
        {/* <div
          style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}
          aria-hidden="true"
        >
          <h1>{t('page.etc.mainHeading')}</h1>

          <section>
            <p>{t('page.etc.intro.paragraph1')}</p>
            <p>{t('page.etc.intro.paragraph2')}</p>
          </section>

          <section>
            <h2>{t('page.etc.sections.title')}</h2>
            <ul>
              <li>{t('page.etc.sections.learnTarot')}</li>
              <li>{t('page.etc.sections.terms')}</li>
              <li>{t('page.etc.sections.history')}</li>
            </ul>
          </section>

          <section>
            <h2>{t('page.etc.features.title')}</h2>

            <div>
              <h3>{t('page.etc.features.learnTarot.title')}</h3>
              <p>{t('page.etc.features.learnTarot.description')}</p>
            </div>

            <div>
              <h3>{t('page.etc.features.termsService.title')}</h3>
              <p>{t('page.etc.features.termsService.description')}</p>
            </div>

            <div>
              <h3>{t('page.etc.features.tarotHistory.title')}</h3>
              <p>{t('page.etc.features.tarotHistory.description')}</p>
            </div>
          </section>

          <section>
            <h2>{t('page.etc.educational.title')}</h2>
            <p>{t('page.etc.educational.description')}</p>
          </section>

          <section>
            <h2>{t('page.etc.transparency.title')}</h2>
            <p>{t('page.etc.transparency.description')}</p>
          </section>
        </div> */}
      </div>
    </Suspense>
  );
};

export default ETCForm;

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

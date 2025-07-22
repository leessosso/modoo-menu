import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 개발 환경에서만 디버깅 도구 로드
if (import.meta.env.DEV) {
  import('./utils/devTools').then(() => {
    console.log('🔧 개발자 도구가 로드되었습니다.');
    console.log('사용 가능한 디버깅 함수들:');
    console.log('- window.debugAuth.getCurrentUser() : 현재 사용자 정보 확인');
    console.log('- window.debugAuth.changeMyRole("store_owner") : 내 역할을 매장관리자로 변경');
    console.log('- window.debugAuth.changeMyRole("customer") : 내 역할을 고객으로 변경');
    console.log('- window.debugAuth.fixTestAccounts() : 테스트 계정 역할 자동 수정');
    console.log('- window.debugAuth.createStoreOwner(email, password, name) : 새 매장관리자 계정 생성');
    console.log('- window.debugAuth.changeUserRole(uid, role) : 특정 사용자 역할 변경');
    console.log('- window.debugAuth.checkUserRole(uid) : 사용자 역할 확인');
  }).catch((error) => {
    console.warn('개발자 도구 로드 실패:', error);
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

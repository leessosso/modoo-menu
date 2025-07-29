# 모두의 메뉴 - 실시간 위치 기반 메뉴 주문 시스템

## 🚀 프로젝트 개요

"모두의 메뉴"는 실시간 위치 기반 메뉴 주문 시스템입니다. 사용자의 현재 위치를 기반으로 가까운 매장을 찾고, 실시간으로 메뉴를 주문할 수 있는 플랫폼입니다.

## 🛠️ 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI) v7
- **State Management**: Zustand
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Maps & Location**: Google Maps Geocoding API
- **Deployment**: Flutter WebView

## 📋 환경 설정

### 1. Firebase 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Web 앱 추가 후 설정 정보 복사
3. `.env` 파일에 Firebase 설정 추가:

```env
# Firebase 설정
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Google Maps API 설정

실제 거리 측정을 위해 Google Maps Geocoding API가 필요합니다:

1. [Google Cloud Console](https://console.cloud.google.com/)에서 새 프로젝트 생성
2. Maps JavaScript API 및 Geocoding API 활성화
3. API 키 생성 후 `.env` 파일에 추가:

```env
# Google Maps API 설정
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 3. 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 🎯 주요 기능

### Phase 3 (완료 ✅)
- **인증 시스템**: 로그인/회원가입, 역할 기반 접근 제어
- **사용자 관리**: 프로필 관리, 계정 정보
- **매장 관리**: CRUD, 실시간 동기화
- **메뉴 시스템**: 카테고리/메뉴 관리
- **WebView 최적화**: Flutter WebView 환경 최적화

### Phase 4 (진행 중 🚧)
- **실시간 거리 측정**: GPS 위치 기반 정확한 거리 계산
- **위치 기반 매장 검색**: 사용자 위치에서 가까운 순으로 정렬
- **매장 등록 시 위치 정보**: 자동 GPS 위치 설정 및 주소-좌표 변환
- **거리 포맷팅**: 1km 미만은 m 단위, 이상은 km 단위 표시

## 📱 WebView 환경 최적화

이 프로젝트는 Flutter WebView 환경에서 실행되도록 최적화되어 있습니다:

- **즉시 응답성**: 메모이제이션보다 사용자 경험 우선
- **화면 전환 최적화**: `optimizeWebViewTransition()` 함수 활용
- **리스트 렌더링 최적화**: GPU 가속 및 터치 이벤트 시뮬레이션
- **MUI v7 호환**: 최신 문법 사용으로 안정성 향상

## 🔧 개발자 도구

개발 환경에서 사용 가능한 전역 함수들:

```javascript
// 사용자 정보 확인
window.debugAuth.getCurrentUser()

// 역할 변경
window.debugAuth.changeMyRole("store_owner")

// 테스트 계정 수정
window.debugAuth.fixTestAccounts()

// 기존 매장 위치 정보 일괄 업데이트
window.debugAuth.updateExistingStoresLocation()
```

## 📊 프로젝트 상태

- **Phase 3 완성도**: 100% ✅
- **Phase 4 진행도**: 30% 🚧
- **TypeScript 오류**: 0개 ✅
- **WebView 최적화**: 완료 ✅

## 🎯 다음 목표

1. **QR코드 스캔 기능** 구현
2. **장바구니 시스템** 개발
3. **주문 처리 플로우** 완성
4. **실시간 알림** 시스템 구축

## 📄 라이선스

MIT License

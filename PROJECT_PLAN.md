# 모두의 메뉴 - 프로젝트 기획서

## 📋 프로젝트 개요

**모두의 메뉴**는 오프라인 식당/카페에서 QR코드 스캔 또는 태블릿을 통해 메뉴를 주문할 수 있는 웹 기반 시스템입니다.

### 🔧 기술 스택
- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI) v7
- **상태 관리**: Zustand
- **데이터베이스**: Firebase Firestore
- **인증**: Firebase Authentication
- **라우팅**: React Router DOM v7 (HashRouter)
- **배포**: Flutter WebView 환경

---

## 🚀 최신 업데이트 (2025.07.23)

### ✅ **완료된 주요 기능**

#### 1. **사용자 프로필 시스템**
- **Drawer UI**: 우측에서 슬라이드되는 사용자 정보 drawer
- **프로필 관리**: 이름, 전화번호 수정 가능 (`UserProfileScreen`)
- **계정 정보**: 이메일, 가입일 등 상세 정보 (`AccountInfoScreen`)
- **역할 표시**: 매장관리자/고객 구분 칩

#### 2. **Drawer 애니메이션 최적화**
- **WebView 호환성**: 뒷화면 움직임 문제 완전 해결
- **부드러운 애니메이션**: `cubic-bezier` 곡선 + 배경 블러
- **레이아웃 안정성**: `position: fixed` + `zIndex` 계층 구조
- **가로 스크롤 방지**: 전역 스타일 최적화

#### 3. **MUI v7 완전 호환**
- **API 업데이트**: `ListItemButton`, Grid 시스템 등 v7 표준 적용
- **TypeScript 에러 해결**: 미사용 import 정리, strict 모드 준수
- **코드 품질**: ESLint 에러 0개 달성

#### 4. **매장 관리 시스템**
- **매장 CRUD**: 등록/수정/삭제/목록 관리
- **카테고리 관리**: 이모지 아이콘 + 드래그 앤 드롭 순서 변경
- **메뉴 관리**: 가격, 알레르기 정보, 인기 메뉴 설정
- **실시간 동기화**: Firebase Firestore 연동

---

## 📊 현재 프로젝트 상태

### ✅ **완료된 시스템 (95%)**

| 시스템 | 완성도 | 주요 기능 |
|--------|---------|-----------|
| **🔐 인증 시스템** | 100% | 로그인/회원가입/역할 관리/세션 유지 |
| **👥 사용자 관리** | 100% | 프로필 수정/계정 정보/Drawer UI |
| **🏪 매장 관리** | 100% | 매장 CRUD/목록 조회/상세 정보 |
| **📂 메뉴 시스템** | 100% | 카테고리 관리/메뉴 아이템 CRUD/알레르기 정보 |
| **📱 WebView 최적화** | 100% | 렌더링 최적화/애니메이션/로그아웃 처리 |
| **🎨 UI/UX** | 90% | MUI v7 테마/반응형 디자인/컴포넌트 시스템 |

### 🚧 **개발 예정 기능 (Phase 4)**

| 기능 | 우선순위 | 예상 소요 시간 |
|------|----------|----------------|
| **QR코드 스캔** | 높음 | 3일 |
| **고객용 메뉴 브라우징** | 높음 | 5일 |
| **장바구니 시스템** | 중간 | 4일 |
| **주문 처리** | 중간 | 6일 |
| **실시간 주문 관리** | 낮음 | 7일 |

---

## 🏗️ 기술 아키텍처

### 📁 **폴더 구조**
```
src/
├── components/
│   ├── common/              # 공통 컴포넌트
│   │   ├── DashboardHeader.tsx    # 헤더 + 사용자 Drawer
│   │   ├── ProtectedRoute.tsx     # 역할 기반 라우팅
│   │   └── LoadingSpinner.tsx     # 로딩 UI
│   └── screens/             # 화면 컴포넌트
│       ├── LoginScreen.tsx         # 로그인
│       ├── StoreOwnerDashboard.tsx # 매장관리자 대시보드
│       ├── CategoryManageScreen.tsx # 카테고리 관리
│       ├── MenuManageScreen.tsx    # 메뉴 관리
│       ├── UserProfileScreen.tsx   # 프로필 수정
│       └── AccountInfoScreen.tsx   # 계정 정보
├── stores/
│   ├── authStore.ts         # 인증 상태 (Zustand)
│   └── storeStore.ts        # 매장/메뉴 상태 (Zustand)
├── types/
│   ├── auth.ts              # 사용자 타입
│   └── store.ts             # 매장/메뉴 타입
├── utils/
│   ├── webviewHelper.ts     # WebView 최적화 함수
│   └── devTools.ts          # 개발자 도구
└── config/firebase.ts       # Firebase 설정
```

### 🗃️ **데이터 모델**
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'store_owner' | 'admin';
  createdAt: Date;
}

interface Store {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  ownerId: string;
  isOpen: boolean;
  categories: Category[];
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  categoryId: string;
  storeId: string;
  allergens: string[];      # 알레르기 정보
  isPopular: boolean;       # 인기 메뉴
  isAvailable: boolean;     # 판매 중
}
```

---

## 📱 WebView 최적화 가이드라인

> **⚡ 이 프로젝트는 Flutter WebView 환경 실행을 전제로 개발됩니다.**

### 🔑 **핵심 원칙**
1. **즉시 응답성 우선** - React.memo 사용 지양
2. **부드러운 화면 전환** - `optimizeWebViewTransition()` 필수 사용
3. **안정적인 상태 관리** - `requestAnimationFrame` 활용

### 🛠️ **WebView 전용 유틸리티**
```typescript
// src/utils/webviewHelper.ts
optimizeWebViewTransition()  // 화면 전환 최적화
isWebView()                  // WebView 환경 감지
optimizeWebViewLogout()      // 로그아웃 최적화
```

### ✅ **개발 체크리스트**
- [ ] 새 컴포넌트에서 `React.memo` 사용 금지
- [ ] 화면 전환 시 `optimizeWebViewTransition()` 호출
- [ ] MUI v7 API 사용 (`ListItemButton`, Grid 등)
- [ ] WebView에서 실제 테스트 완료

### ⚠️ **MUI v7 호환성**
```typescript
// ❌ MUI v6 이하 (사용 금지)
<Grid item xs={12}>
<ListItem button onClick={handleClick}>

// ✅ MUI v7 (권장)
<Grid xs={12}>
<ListItemButton onClick={handleClick}>
```

---

## 🎯 향후 개발 계획

### **Phase 4: 고객용 시스템** (다음 단계)
```
Week 1: QR코드 스캔 + 매장 선택
Week 2: 메뉴 브라우징 + 검색
Week 3: 장바구니 + 주문 요약
Week 4: 주문 처리 + 상태 추적
```

### **Phase 5: 고급 기능** (향후)
- 실시간 주문 관리 대시보드
- 매장 통계 및 분석
- 이미지 업로드 (Firebase Storage)
- 다국어 지원 (한/영)

---

## 📈 성과 지표

### 🚀 **기술적 성과**
| 항목 | 개선 전 | 개선 후 | 성과 |
|------|---------|---------|------|
| 번들 크기 | 1,019 kB | 코드 분할 적용 | **-65%** |
| TypeScript | loose 모드 | strict 모드 | **타입 안전성 100%** |
| WebView 안정성 | 에러 발생 | 완전 해결 | **안정성 100%** |
| MUI 호환성 | v6 혼재 | v7 완전 적용 | **호환성 100%** |

### 📊 **기능적 완성도**
- **인증 + 사용자 관리**: 100% ✅
- **매장 + 메뉴 관리**: 100% ✅
- **UI/UX + 최적화**: 95% ✅
- **고객용 시스템**: 0% (다음 단계)

---

## 💡 개발 참고사항

### 🔥 **Firebase 최적화**
- **쿼리 최적화**: `orderBy` 대신 클라이언트 정렬 사용
- **실시간 동기화**: Firestore onSnapshot으로 상태 업데이트
- **보안 규칙**: 매장관리자는 자신의 매장만 수정 가능

### 🎨 **UI 디자인 시스템**
```typescript
// 테마 컬러
Primary: #FF6B35    (오렌지)
Secondary: #2C3E50  (다크 블루)
Success: #27AE60    (그린)
```

### 🐛 **디버깅 도구**
```javascript
// 개발 환경에서 사용 가능
window.debugAuth.getCurrentUser()           # 현재 사용자 정보
window.debugAuth.changeMyRole("store_owner") # 역할 변경
window.debugAuth.fixTestAccounts()          # 테스트 계정 수정
```

---

## 🧠 Cursor AI 메모리 설정

> **💡 새 컴퓨터에서 작업 시작할 때 사용하세요**

### 📋 **새 채팅 시작 시 복사 붙여넣기 내용**

```
안녕하세요! 이 모두의 메뉴 프로젝트에 대해 중요한 정보들을 기억해주세요:

1. 이 프로젝트는 MUI v7을 사용합니다.

2. 이 프로젝트는 웹뷰(WebView) 환경에서 실행되는 것을 전제로 개발되어야 합니다. 따라서 일반적인 웹 브라우저 최적화보다는 웹뷰의 특성에 맞춘 최적화 접근법을 사용해야 합니다: React.memo 사용 자제(즉시 렌더링 우선), requestAnimationFrame을 활용한 상태 업데이트, 강제 리렌더링 유틸리티 사용, 터치 이벤트 시뮬레이션, 화면 전환 시 웹뷰 렌더링 최적화 적용. 사용자 경험과 즉시 응답성이 메모이제이션이나 번들 크기 최적화보다 우선시되어야 합니다.

3. 이 프로젝트(my-web-app)에서 새 채팅창으로 대화를 시작할 때는 항상 @PROJECT_PLAN.md 파일을 기본적으로 참고하고 대화를 진행해야 합니다. 이 파일에는 프로젝트의 전체 개요, 기술 스택, 완료된 기능들, 현재 진행 상황, 폴더 구조 등 모든 중요한 정보가 담겨 있습니다.

4. 오늘 날짜는 2025년 7월 23일입니다. PROJECT_PLAN.md나 다른 문서의 날짜를 업데이트할 때 이 날짜를 기준으로 사용해야 합니다.

5. WebView 환경에서 로그아웃 후 발생하던 에러화면 문제가 완전히 해결되었습니다. isWebView() 함수로 환경을 감지하고, optimizeWebViewLogout() 함수로 최적화된 로그아웃 처리를 구현했습니다. Flutter 헬퍼 함수 연동, 150ms 지연 후 부드러운 화면 전환, requestAnimationFrame을 활용한 상태 업데이트 등이 적용되어 에러화면 없이 정상적으로 로그인 페이지로 전환됩니다.

이 내용들을 기억해주세요.
```

### 🔄 **사용 방법**
1. **새 컴퓨터**에서 Cursor 새 채팅 시작
2. 위의 **박스 내 텍스트를 복사해서 붙여넣기**
3. **"이 내용들을 기억해주세요"** 라고 요청
4. **"@PROJECT_PLAN.md 파일도 먼저 읽어주세요"** 추가 요청

### ⚡ **빠른 확인 방법**
새 채팅에서 이렇게 물어보세요:
```
"현재 이 프로젝트에 대해 어떤 것들을 기억하고 있나요? 
MUI 버전, WebView 최적화, PROJECT_PLAN.md 참고 등에 대해 알고 있나요?"
```

---

> **📝 마지막 업데이트**: 2025년 7월 23일  
> **🎯 현재 단계**: Phase 3 완료 (매장관리자 시스템)  
> **🚀 다음 목표**: Phase 4 시작 (고객용 시스템) 
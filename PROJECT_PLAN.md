# 모두의 메뉴 - 프로젝트 기획서

## 📋 프로젝트 개요

### 프로젝트명
**모두의 메뉴** - 오프라인 식당/카페 메뉴 주문 시스템

### 프로젝트 목적
오프라인 식당이나 카페에서 고객이 QR코드를 스캔하거나 태블릿을 통해 매장을 선택하고, 해당 매장의 메뉴를 확인하여 주문할 수 있는 웹 기반 시스템을 개발합니다.

### 기술 스택
- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI) v7
- **배포**: Flutter WebView 내장
- **상태 관리**: Zustand (Context API에서 마이그레이션 완료)
- **데이터 저장**: Firebase Firestore + LocalStorage
- **인증 시스템**: Firebase Authentication
- **라우팅**: React Router DOM v7 (HashRouter)

## 🚀 최신 최적화 완료 사항 ✅ (2025.07.21)

### 🎯 종합 최적화 결과

#### 1. 번들 크기 최적화 ✅
- **이전**: 1,019.14 kB (단일 번들)
- **이후**: 코드 분할 + Lazy Loading
  - 각 화면별 개별 청크: 2-6 kB
  - React 라이브러리: 44.8 kB
  - MUI 라이브러리: 249.95 kB  
  - Firebase 라이브러리: 469.69 kB
  - **총 개선율**: ~65% 감소 (초기 로딩 크기 기준)

#### 2. 성능 최적화 ✅
- **React.memo** 적용: 모든 주요 화면 컴포넌트
- **useCallback** 적용: 이벤트 핸들러 최적화
- **useMemo** 적용: 계산 비용이 높은 값들
- **코드 분할**: React.lazy로 동적 import
- **선택자 최적화**: Zustand 스토어 세분화

#### 3. 개발 경험 개선 ✅
- **TypeScript strict 모드** 활성화
- **ESLint 규칙** 강화 (실용적 수준)
- **빌드 최적화**: Vite 설정 개선
- **성능 모니터링**: 번들 분석 도구 추가

#### 4. 코드 품질 향상 ✅
- **타입 안전성** 강화
- **리렌더링 최적화** 완료
- **메모리 효율성** 개선
- **디버깅 도구** 추가

#### 5. 코드 리팩토링 완료 ✅ (2025.07.20 추가)
- **상수 중앙화**: 하드코딩된 값들 통합 관리
- **공통 컴포넌트**: 중복 코드 제거 및 재사용성 향상
- **코드 일관성**: 표준화된 스타일링 및 패턴 적용
- **유지보수성**: 단일 소스 원칙으로 개선

#### 6. WebView 로그아웃 에러 해결 ✅ (2025.07.21 완료)
- **환경 감지**: Flutter/Android/iOS WebView 자동 식별
- **최적화된 로그아웃**: 에러화면 없는 부드러운 화면 전환
- **Flutter 연동**: 헬퍼 함수 지원으로 네이티브 앱과 연동
- **안정성 향상**: WebView에서 완전히 안정적인 로그아웃 처리

### 📊 최적화 성과 요약

| 항목 | 최적화 전 | 최적화 후 | 개선율 |
|------|-----------|-----------|--------|
| **초기 번들 크기** | 1,019 kB | 코드 분할 | -65% |
| **TypeScript 안전성** | strict: false | strict: true | 100% |
| **성능 최적화** | 미적용 | 전면 적용 | 신규 |
| **ESLint 품질** | 관대함 | 실용적 강화 | 개선 |
| **빌드 시간** | 5.28s | 5.08s | -4% |
| **중복 코드** | 여러 곳 분산 | 공통 컴포넌트화 | -100% |
| **하드코딩** | 분산 관리 | 중앙 집중 | 통합 |
| **WebView 로그아웃** | 에러화면 발생 | 부드러운 전환 | ✅ 해결 |

### 🛠️ 적용된 최적화 기술

1. **Code Splitting & Lazy Loading**
   - React.lazy를 활용한 동적 import
   - Suspense 컴포넌트로 로딩 상태 관리
   - 라우트별 번들 분할

2. **React 성능 최적화**
   - React.memo로 불필요한 리렌더링 방지
   - useCallback으로 함수 메모이제이션
   - useMemo로 계산 비용 최적화

3. **Vite 빌드 최적화**
   - Manual Chunks로 라이브러리별 분할
   - Tree Shaking 최적화
   - Asset 파일명 최적화

4. **상태 관리 최적화**
   - Zustand 선택자 세분화
   - 불필요한 구독 방지
   - 메모리 누수 방지

5. **개발 도구 개선**
   - 번들 분석 스크립트 추가
   - 성능 측정 도구 통합
   - 타입 체크 강화

6. **코드 리팩토링 (신규 추가)**
   - **상수 파일 분리**: `src/constants/index.ts`로 중앙 집중 관리
   - **공통 컴포넌트**: `DashboardHeader`, `EmptyState` 분리
   - **코드 표준화**: 일관된 스타일링 및 네이밍 적용
   - **재사용성 향상**: 컴포넌트 기반 아키텍처 강화

7. **WebView 로그아웃 최적화 (신규 완료)**
   - **환경 감지**: `isWebView()` 함수로 WebView 환경 자동 식별
   - **최적화된 처리**: `optimizeWebViewLogout()` 함수로 에러 없는 로그아웃
   - **부드러운 전환**: 150ms 지연 + `requestAnimationFrame` 활용
   - **Flutter 연동**: `window.flutterLogoutHelper` 지원

### 🎯 리팩토링 상세 성과 (2025.07.20)

#### 새로 생성된 공통 컴포넌트
```bash
# 리팩토링으로 새로 분리된 청크들 (2025.07.20 빌드)
dist/assets/js/index-CXoCok03.js              0.62 kB  # 상수 파일
dist/assets/js/EmptyState-V76Gae6V.js         0.67 kB  # EmptyState 컴포넌트
dist/assets/js/DashboardHeader-Bf271Edx.js    1.04 kB  # DashboardHeader 컴포넌트
```

#### 중앙화된 상수 관리
- **UI 상수**: 아이콘 크기, 간격, 그리드 브레이크포인트
- **테스트 계정**: 개발용 계정 정보 안전 관리
- **메시지**: 에러/성공 메시지 일관성 확보
- **앱 설정**: 라우트, 역할 등 핵심 설정값

#### 재사용 가능한 컴포넌트
- **DashboardHeader**: 모든 대시보드 화면에서 공통 사용
- **EmptyState**: 빈 상태 표시용 범용 컴포넌트
- **일관된 스타일링**: UI_CONSTANTS를 통한 표준화

## 📋 **WebView 최적화 개발 가이드라인**

> **⚡ 이 프로젝트는 웹뷰(WebView) 환경에서 실행되는 것을 전제로 개발됩니다.**

### 🎯 **핵심 개발 원칙**

#### **1. 렌더링 최적화 우선순위**

| **순위** | **웹뷰 최적화** | **일반 웹 최적화** |
|---|---|---|
| **1순위** | 🎯 **즉시 응답성** | Bundle Size 최적화 |
| **2순위** | 🎯 **화면 전환 부드러움** | Memory 효율성 |
| **3순위** | 🎯 **터치 반응성** | CPU 사용량 절약 |
| **4순위** | Bundle Size 최적화 | 즉시 응답성 |

#### **2. 권장 패턴 (✅ DO)**

##### **컴포넌트 작성**
```typescript
// ✅ 즉시 렌더링을 위한 일반 함수 컴포넌트
const Component = () => {
  useEffect(() => {
    optimizeWebViewTransition(); // WebView 전용 최적화
  }, []);
  return <UI />;
};

// ✅ requestAnimationFrame을 활용한 상태 업데이트
requestAnimationFrame(() => setState(newState));

// ✅ 화면 전환 시 WebView 렌더링 보장
const handleNavigation = () => {
  optimizeWebViewTransition(() => navigate('/target'));
};
```

##### **상태 관리**
```typescript
// ✅ Zustand store에서 WebView 최적화
// authStore.ts, storeStore.ts 등
requestAnimationFrame(() => {
  set({ user, isAuthenticated: true });
});
```

#### **3. 지양해야 할 패턴 (❌ DON'T)**

```typescript
// ❌ React.memo는 웹뷰에서 응답성 저하 원인
const Component = memo(() => <UI />);

// ❌ 동기적 상태 업데이트는 웹뷰에서 지연 발생  
setState(newState);

// ❌ 단순 라우팅은 웹뷰에서 화면 정지 원인
navigate('/target');
```

#### **4. WebView Helper 함수 적극 활용**

```typescript
// src/utils/webviewHelper.ts 필수 사용
import { 
  optimizeWebViewTransition, 
  forceRerender, 
  ensureRender 
} from '../utils/webviewHelper';

// 🎯 화면 전환마다 필수 호출
optimizeWebViewTransition(() => {
  // 네비게이션이나 상태 변경 로직
});

// 🎯 렌더링이 멈춘 것 같을 때
forceRerender();

// 🎯 중요한 상태 변경 후  
ensureRender();
```

### ⚡ **개발 시 필수 체크리스트**

#### **새 컴포넌트 작성 시**
- [ ] `React.memo` 사용하지 않았는가?
- [ ] `useEffect`에서 `optimizeWebViewTransition()` 호출했는가?
- [ ] 상태 변화 시 `requestAnimationFrame` 사용했는가?

#### **화면 전환 구현 시**
- [ ] 모든 네비게이션에 `optimizeWebViewTransition()` 적용했는가?
- [ ] 버튼 클릭 시 강제 렌더링 호출했는가?
- [ ] 웹뷰에서 실제 테스트해봤는가?

#### **상태 관리 시**
- [ ] Store 업데이트 시 `requestAnimationFrame` 사용했는가?
- [ ] 로그인/로그아웃 후 화면 전환이 자연스러운가?
- [ ] 터치 없이도 자동으로 화면이 전환되는가?

### 🛠️ **WebView 최적화 적용 현황**

#### **✅ 이미 적용된 컴포넌트**
- `LoginScreen.tsx` - 로그인 성공 시 WebView 렌더링 최적화
- `DashboardScreen.tsx` - 컴포넌트 마운트 시 최적화
- `StoreOwnerDashboard.tsx` - 대시보드 + 네비게이션 최적화
- `authStore.ts` - 모든 상태 업데이트에 `requestAnimationFrame` 적용
- **로그아웃 최적화** ✅ - WebView에서 로그아웃 후 에러화면 문제 해결 완료

#### **🔧 WebView 전용 유틸리티**
- `src/utils/webviewHelper.ts` - 강제 리렌더링, 터치 활성화, 렌더링 보장
  - **WebView 환경 감지**: `isWebView()` - Flutter/Android/iOS WebView 자동 식별
  - **최적화된 로그아웃**: `optimizeWebViewLogout()` - 에러화면 없는 부드러운 로그아웃
- `src/index.css` - WebView 렌더링 최적화 CSS 추가 (`translateZ(0)` 하드웨어 가속)
- `App.tsx` - 경량화된 Suspense fallback

### 💡 **WebView vs 일반 웹 차이점 이해**

#### **일반 브라우저 환경**
```typescript
// 일반적인 최적화: 메모이제이션 중심
const Component = memo(() => {
  const value = useMemo(() => calculation(), [deps]);
  const handler = useCallback(() => action(), [deps]);
  return <UI />;
});
```

#### **웹뷰 환경**  
```typescript
// 웹뷰 최적화: 즉시 응답성 중심
const Component = () => {
  useEffect(() => {
    optimizeWebViewTransition(); // 핵심!
  }, []);
  
  const handler = () => {
    optimizeWebViewTransition(() => action()); // 핵심!
  };
  
  return <UI />;
};
```

---

## 🎯 핵심 기능

### 1. 사용자 인증 시스템 ✅
- 로그인/회원가입 기능
- 역할 기반 접근 제어 (고객/매장관리자)
- 세션 관리 및 자동 로그인

### 2. 매장관리자 시스템 ✅
- 매장관리자 대시보드
- 매장 목록 관리
- 매장 등록 및 수정 기능
- 실시간 통계 및 주문 관리

### 3. 매장 선택 기능 (예정)
- QR코드 스캔을 통한 매장 자동 선택
- 매장 목록에서 수동 선택
- 매장 정보 표시 (이름, 설명, 영업시간 등)

### 4. 메뉴 브라우징 (예정)
- 카테고리별 메뉴 분류
- 메뉴 상세 정보 (가격, 설명, 이미지, 알레르기 정보)
- 메뉴 검색 기능
- 인기 메뉴 하이라이트

### 5. 주문 시스템 (예정)
- 장바구니 기능
- 수량 조절
- 옵션 선택 (사이드 메뉴, 음료 크기 등)
- 주문 요약 및 확인
- 주문 완료 화면

### 6. 사용자 경험
- 직관적인 터치 인터페이스
- 빠른 로딩 속도
- 오프라인 환경 지원
- 다국어 지원 (한국어/영어)

## 📱 화면 구성

### ✅ 구현 완료된 화면

#### 1. 인증 화면
- **로그인 화면**: 이메일/비밀번호 로그인, 테스트 계정 제공
- **회원가입 화면**: 사용자 정보 입력, 역할 선택
- **로딩 화면**: 앱 시작 시 로딩 스피너

#### 2. 대시보드 화면
- **고객 대시보드**: QR코드 스캔, 매장 선택, 주문 내역, 즐겨찾기
- **매장관리자 대시보드**: 매장 목록, 빠른 액션 메뉴, 통계 요약

### 🚧 구현 예정 화면

#### 3. 매장 관리 화면
- **매장 등록 화면**: 새 매장 정보 입력
- **매장 수정 화면**: 기존 매장 정보 편집
- **메뉴 관리 화면**: 카테고리 및 메뉴 관리

#### 4. 고객 화면
- **매장 선택 화면**: QR코드 스캔, 매장 목록
- **매장 정보 화면**: 매장 상세 정보
- **메뉴 목록 화면**: 카테고리별 메뉴 표시
- **메뉴 상세 화면**: 메뉴 상세 정보 및 옵션 선택
- **장바구니 화면**: 선택한 메뉴 관리
- **주문 확인 화면**: 주문 내역 요약
- **주문 완료 화면**: 주문 성공 메시지

## 🎨 UI/UX 디자인 가이드

### 디자인 원칙
- **모바일 우선**: 태블릿과 모바일에서 최적화
- **직관성**: 누구나 쉽게 사용할 수 있는 인터페이스
- **접근성**: 다양한 사용자를 고려한 디자인
- **일관성**: 전체 앱에서 일관된 디자인 언어

### MUI 테마 설정 ✅
- **Primary**: #FF6B35 (따뜻한 오렌지)
- **Secondary**: #2C3E50 (다크 블루)
- **Error**: #E74C3C (빨간색)
- **Success**: #27AE60 (초록색)
- **Warning**: #F39C12 (주황색)
- **Info**: #3498DB (파란색)

### 컴포넌트 스타일
- **Button**: 그라데이션 배경, 호버 효과
- **Card**: 둥근 모서리, 그림자 효과
- **Paper**: 일관된 패딩과 마진
- **Typography**: 계층적 텍스트 스타일

## 📊 데이터 구조

### 사용자 정보 ✅
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'customer' | 'store_owner' | 'admin';
  stores?: string[]; // 매장관리자의 경우
  createdAt: Date;
  lastLoginAt: Date;
}
```

### 매장 정보 ✅
```typescript
interface Store {
  id: string;
  name: string;
  description: string;
  logo?: string;
  address: string;
  phone: string;
  businessHours: string;
  categories: Category[];
  isOpen: boolean;
  ownerId: string; // 매장관리자 ID
  createdAt: Date;
  updatedAt: Date;
}
```

### 카테고리
```typescript
interface Category {
  id: string;
  name: string;
  icon: string;
  items: MenuItem[];
}
```

### 메뉴 아이템
```typescript
interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  options: MenuOption[];
  allergens: string[];
  isPopular: boolean;
  isAvailable: boolean;
}
```

### 주문 정보
```typescript
interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  orderNumber: string;
  estimatedWaitTime: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}
```

## 🚀 개발 단계

### Phase 1: 기본 구조 및 인증 시스템 ✅ (완료)
- [x] 프로젝트 설정 (React + TypeScript + Vite)
- [x] MUI 설치 및 테마 설정
- [x] 기본 컴포넌트 구조 설계
- [x] 라우팅 시스템 구축 (React Router DOM)
- [x] 인증 시스템 구현 (Context API → Zustand 마이그레이션 완료)
- [x] 역할 기반 라우팅 (고객/매장관리자)
- [x] 로그인/회원가입 화면
- [x] 대시보드 화면 (고객/매장관리자)

### Phase 2: 매장관리자 시스템 ✅ (완료)
- [x] 매장관리자 대시보드
- [x] 매장 목록 표시
- [x] 빠른 액션 메뉴
- [x] 통계 요약

### Phase 2.5: 상태 관리 최적화 ✅ (완료)
- [x] Zustand 설치 및 설정
- [x] AuthStore 구현 (Context API → Zustand)
- [x] 컴포넌트 마이그레이션 (LoginScreen, RegisterScreen, DashboardScreen, StoreOwnerDashboard, ProtectedRoute)
- [x] 성능 최적화 및 디버깅 개선
- [x] Redux DevTools 지원 추가

### Phase 2.7: 코드 리팩토링 ✅ (2025.07.20 완료)
- [x] 상수 파일 분리 (`src/constants/index.ts`)
- [x] 공통 컴포넌트 분리 (`DashboardHeader`, `EmptyState`)
- [x] 하드코딩된 값들 중앙 집중 관리
- [x] 중복 코드 제거 및 재사용성 향상
- [x] 코드 일관성 및 표준화 적용
- [x] 유지보수성 개선 (단일 소스 원칙)

## 📁 현재 폴더 구조

```
src/
├── components/
│   ├── common/
│   │   ├── LoadingSpinner.tsx
│   │   ├── ProtectedRoute.tsx
│   │   ├── ErrorBoundary.tsx ✅ (웹뷰 오류 처리)
│   │   ├── DashboardHeader.tsx ✅ (신규 - 공통 헤더)
│   │   └── EmptyState.tsx ✅ (신규 - 빈 상태 컴포넌트)
│   └── screens/
│       ├── LoginScreen.tsx ✅ (HashRouter 연동 + 리팩토링)
│       ├── RegisterScreen.tsx ✅ (역할 선택 + HashRouter 연동)
│       ├── DashboardScreen.tsx ✅ (리팩토링 완료)
│       ├── StoreOwnerDashboard.tsx ✅ (Firebase 연동 + 리팩토링)
│       ├── StoreRegisterScreen.tsx ✅ (신규)
│       └── StoreListScreen.tsx ✅ (신규 + 리팩토링)
├── stores/
│   ├── authStore.ts ✅ (Firebase Auth 연동 + 웹뷰 안전 로그아웃)
│   ├── storeStore.ts ✅ (신규 - 매장 관리)
│   └── index.ts
├── types/
│   ├── auth.ts ✅ (역할 선택 추가)
│   └── store.ts ✅ (신규)
├── constants/
│   └── index.ts ✅ (신규 - 중앙화된 상수 관리)
├── config/
│   └── firebase.ts ✅ (환경변수 적용)
├── theme/
│   └── index.ts
├── App.tsx ✅ (HashRouter + ErrorBoundary + 라우팅 업데이트)
├── main.tsx
└── index.css
```

## 🔄 Zustand 마이그레이션 완료 사항

### ✅ 성공적으로 마이그레이션된 항목
- **AuthStore**: Context API → Zustand 완료
- **성능 최적화**: 24% 코드량 감소 (197줄 → ~150줄)
- **개발자 경험**: Redux DevTools 지원, 더 나은 디버깅
- **타입 안전성**: TypeScript와 완벽한 통합
- **지속성**: localStorage 자동 동기화

### 📊 마이그레이션 효과
| 항목 | 이전 (Context API) | 현재 (Zustand) | 개선율 |
|------|-------------------|----------------|--------|
| **코드 라인** | 197줄 | ~150줄 | -24% |
| **번들 크기** | 보통 | 작음 | 개선 |
| **리렌더링** | 전체 컴포넌트 | 필요한 부분만 | 최적화 |
| **디버깅** | 어려움 | 쉬움 | 개선 |
| **학습 곡선** | 높음 | 낮음 | 개선 |

### 🚀 Firebase 연동 및 웹뷰 최적화 완료 ✅
- Firebase Auth로 사용자 인증 구현
- Firestore로 사용자/매장 정보 저장
- 실시간 상태 동기화 구현
- 매장 관리 기능 완전 연동
- 웹뷰 환경에서 안정적인 로그아웃 처리
- GitHub Pages 배포 최적화

## 🎯 개발 진행 상황

### Phase 3: 매장 관리 기능 ✅ (완료)
- [x] 매장 등록 화면
- [x] 매장 목록 화면
- [x] 매장 수정/삭제 기능
- [x] Firestore 데이터 모델 설계
- [x] 매장 관리 Store (Zustand)
- [ ] 메뉴 관리 화면 (진행 예정)
- [ ] 카테고리 관리 (진행 예정)

### Phase 4: Firebase 연동 ✅ (완료)
- [x] Firebase 프로젝트 설정
- [x] Firebase Authentication 연동
- [x] Firestore Database 연동
- [x] 사용자 정보 Firestore 저장
- [x] 매장 정보 Firestore 저장
- [x] 실시간 데이터 동기화
- [x] 환경변수를 통한 Firebase 설정 보안
- [ ] Firebase Storage (이미지) 연동 (진행 예정)

## 🎯 다음 개발 단계

### Phase 3.5: 메뉴 관리 기능 (진행 예정)
- [ ] 카테고리 관리 화면
- [ ] 메뉴 아이템 관리 화면
- [ ] 메뉴 옵션 관리
- [ ] 메뉴 순서 관리

### Phase 4.5: 주문 관리 기능 (진행 예정)
- [ ] 실시간 주문 목록
- [ ] 주문 상태 관리
- [ ] 주문 상세 정보
- [ ] 주문 통계

### Phase 5: 고객 기능 (진행 예정)
- [ ] 매장 선택 화면
- [ ] 매장 정보 화면
- [ ] 메뉴 목록 화면
- [ ] 메뉴 상세 화면
- [ ] 장바구니 기능
- [ ] 주문 시스템

### Phase 4.7: 웹뷰 최적화 및 안정화 ✅ (완료)
- [x] GitHub Pages 배포 최적화 (HashRouter 적용)
- [x] 웹뷰 환경에서 안전한 로그아웃 처리
- [x] ErrorBoundary 컴포넌트 추가
- [x] 라우팅 문제 해결 (BrowserRouter → HashRouter)
- [x] 로컬스토리지 완전 삭제 처리
- [x] 페이지 리로드 방식 안전 처리

### Phase 4.8: WebView 로그아웃 에러 해결 ✅ (2025.07.21 완료)
- [x] WebView 환경 감지 함수 구현 (`isWebView()`)
- [x] Flutter/Android/iOS WebView 자동 식별
- [x] 최적화된 로그아웃 처리 (`optimizeWebViewLogout()`)
- [x] Flutter 헬퍼 함수 연동 지원 (`window.flutterLogoutHelper`)
- [x] 150ms 지연 후 부드러운 화면 전환
- [x] **로그아웃 후 에러화면 문제 완전 해결** ✅

### Phase 6: 최적화 및 테스트 (지속적 개선) 🔄

#### 6.1: 성능 최적화 ✅ (2025.07.19 완료)
- [x] 성능 최적화 (React.memo, useCallback, useMemo)
- [x] 코드 분할 및 Lazy Loading
- [x] 번들 크기 최적화 (65% 감소)
- [x] TypeScript strict 모드 활성화
- [x] ESLint 규칙 강화

#### 6.2: 코드 리팩토링 ✅ (2025.07.20 완료)
- [x] 상수 파일 분리 및 중앙 집중 관리
- [x] 공통 컴포넌트 분리 (`DashboardHeader`, `EmptyState`)
- [x] 중복 코드 제거 (100% 감소)
- [x] 코드 일관성 및 표준화 적용
- [x] 유지보수성 개선 (단일 소스 원칙)

#### 6.3: 다음 최적화 계획 (예정)
- [ ] 커스텀 훅 분리 (useAuth, useStores 등)
- [ ] 더 큰 컴포넌트 세분화 (카드, 폼 컴포넌트)
- [ ] 스토어 에러 처리 표준화
- [ ] 오프라인 지원
- [ ] 사용자 테스트
- [ ] 버그 수정

> 💡 **Phase 6는 주기적으로 진행되는 지속적 개선 단계입니다.**  
> 각 리팩토링 완료 시마다 날짜를 업데이트하여 이력을 추적합니다. 
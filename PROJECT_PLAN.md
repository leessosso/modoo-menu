# 모두의 메뉴 - 프로젝트 기획서

## 📋 프로젝트 개요

### 프로젝트명
**모두의 메뉴** - 오프라인 식당/카페 메뉴 주문 시스템

### 프로젝트 목적
오프라인 식당이나 카페에서 고객이 QR코드를 스캔하거나 태블릿을 통해 매장을 선택하고, 해당 매장의 메뉴를 확인하여 주문할 수 있는 웹 기반 시스템을 개발합니다.

### 기술 스택
- **Frontend**: React 19 + TypeScript + Vite
- **UI Framework**: Material-UI (MUI) v5
- **배포**: Flutter WebView 내장
- **상태 관리**: Zustand (Context API에서 마이그레이션 완료)
- **데이터 저장**: Firebase Firestore + LocalStorage
- **인증 시스템**: Firebase Authentication
- **라우팅**: React Router DOM v7 (HashRouter)

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



## 📁 현재 폴더 구조

```
src/
├── components/
│   ├── common/
│   │   ├── LoadingSpinner.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── ErrorBoundary.tsx ✅ (신규 - 웹뷰 오류 처리)
│   └── screens/
│       ├── LoginScreen.tsx ✅ (HashRouter 연동)
│       ├── RegisterScreen.tsx ✅ (역할 선택 + HashRouter 연동)
│       ├── DashboardScreen.tsx
│       ├── StoreOwnerDashboard.tsx ✅ (Firebase 연동 + 안전한 로그아웃)
│       ├── StoreRegisterScreen.tsx ✅ (신규)
│       └── StoreListScreen.tsx ✅ (신규)
├── stores/
│   ├── authStore.ts ✅ (Firebase Auth 연동 + 웹뷰 안전 로그아웃)
│   ├── storeStore.ts ✅ (신규 - 매장 관리)
│   └── index.ts
├── types/
│   ├── auth.ts ✅ (역할 선택 추가)
│   └── store.ts ✅ (신규)
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

### Phase 6: 최적화 및 테스트 (진행 예정)
- [ ] 성능 최적화
- [ ] 오프라인 지원
- [ ] 사용자 테스트
- [ ] 버그 수정 
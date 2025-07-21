// UI 관련 상수
export const UI_CONSTANTS = {
    ICON_SIZES: {
        SMALL: 16,
        MEDIUM: 24,
        LARGE: 40,
        XLARGE: 64,
    },
    SPACING: {
        XS: 1,
        SM: 2,
        MD: 3,
        LG: 4,
        XL: 6,
    },
    AVATAR_SIZES: {
        SMALL: { width: 24, height: 24 },
        MEDIUM: { width: 32, height: 32 },
        LARGE: { width: 40, height: 40 },
    },
    GRID_BREAKPOINTS: {
        MOBILE: { xs: '1fr' },
        TABLET: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        DESKTOP: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
        DESKTOP_4COL: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
    },
} as const;

// 테스트 계정 정보
export const TEST_ACCOUNTS = {
    CUSTOMER: {
        email: 'sso3@naver.com',
        password: 'password',
        label: '고객 계정',
    },
    STORE_OWNER: {
        email: 'store@example.com',
        password: 'password',
        label: '매장관리자 계정',
    },
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
    AUTH: {
        LOGIN_FAILED: '로그인에 실패했습니다.',
        USER_NOT_FOUND: '등록되지 않은 이메일입니다.',
        WRONG_PASSWORD: '비밀번호가 올바르지 않습니다.',
        INVALID_EMAIL: '올바르지 않은 이메일 형식입니다.',
        TOO_MANY_REQUESTS: '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
        EMAIL_ALREADY_IN_USE: '이미 사용 중인 이메일입니다.',
        WEAK_PASSWORD: '비밀번호가 너무 약합니다. (최소 6자)',
        PASSWORD_MISMATCH: '비밀번호가 일치하지 않습니다.',
        REGISTER_FAILED: '회원가입에 실패했습니다.',
    },
    STORE: {
        FETCH_FAILED: '매장 목록을 가져오는데 실패했습니다.',
        CREATE_FAILED: '매장 생성에 실패했습니다.',
        UPDATE_FAILED: '매장 수정에 실패했습니다.',
        DELETE_FAILED: '매장 삭제에 실패했습니다.',
        NOT_FOUND: '매장 정보를 가져오는데 실패했습니다.',
    },
    GENERAL: {
        UNEXPECTED_ERROR: '예상치 못한 오류가 발생했습니다.',
        NETWORK_ERROR: '네트워크 연결을 확인해주세요.',
        TRY_AGAIN_LATER: '잠시 후 다시 시도해주세요.',
    },
} as const;

// 성공 메시지
export const SUCCESS_MESSAGES = {
    AUTH: {
        LOGIN_SUCCESS: '로그인되었습니다.',
        REGISTER_SUCCESS: '회원가입이 완료되었습니다.',
        LOGOUT_SUCCESS: '로그아웃되었습니다.',
    },
    STORE: {
        CREATED: '매장이 성공적으로 등록되었습니다.',
        UPDATED: '매장 정보가 업데이트되었습니다.',
        DELETED: '매장이 삭제되었습니다.',
    },
} as const;

// 앱 관련 상수
export const APP_CONFIG = {
    NAME: '모두의 메뉴',
    VERSION: '1.0.0',
    ROLES: {
        CUSTOMER: 'customer',
        STORE_OWNER: 'store_owner',
        ADMIN: 'admin',
    },
    ROUTES: {
        LOGIN: '/login',
        REGISTER: '/register',
        DASHBOARD: '/dashboard',
        STORE_DASHBOARD: '/store-dashboard',
        STORE_REGISTER: '/store-register',
        STORE_LIST: '/store-list',
    },
} as const;

// 스테퍼 단계
export const STEPPER_STEPS = {
    STORE_REGISTER: ['매장 기본 정보', '매장 상세 정보', '완료'],
} as const; 
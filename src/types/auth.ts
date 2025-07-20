export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    createdAt: Date;
    lastLoginAt: Date;
    role: 'customer' | 'store_owner' | 'admin'; // 역할 추가
    stores?: string[]; // 매장관리자의 경우 소유한 매장 ID 목록
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials {
    email: string;
    password: string;
    confirmPassword: string;
    name: string;
    phone?: string;
    role?: 'customer' | 'store_owner'; // 역할 선택 추가
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    clearError: () => void;
} 
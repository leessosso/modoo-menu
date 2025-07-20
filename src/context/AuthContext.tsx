import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { AuthContextType, AuthState, LoginCredentials, RegisterCredentials, User } from '../types/auth';

// 초기 상태
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// 액션 타입
type AuthAction =
    | { type: 'AUTH_START' }
    | { type: 'AUTH_SUCCESS'; payload: User }
    | { type: 'AUTH_FAILURE'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'CLEAR_ERROR' };

// 리듀서
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'AUTH_START':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'AUTH_SUCCESS':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case 'AUTH_FAILURE':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        default:
            return state;
    }
};

// Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider 컴포넌트
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // 로컬 스토리지에서 사용자 정보 복원
    useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                dispatch({ type: 'AUTH_SUCCESS', payload: user });
            } catch (error) {
                localStorage.removeItem('user');
            }
        } else {
            dispatch({ type: 'AUTH_FAILURE', payload: '' });
        }
    }, []);

    // 로그인 함수
    const login = async (credentials: LoginCredentials): Promise<void> => {
        dispatch({ type: 'AUTH_START' });

        try {
            // 실제로는 API 호출이 여기에 들어갑니다
            // 지금은 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 테스트 계정들
            if (credentials.email === 'test@example.com' && credentials.password === 'password') {
                const user: User = {
                    id: '1',
                    email: credentials.email,
                    name: '테스트 사용자',
                    role: 'customer',
                    createdAt: new Date(),
                    lastLoginAt: new Date(),
                };

                localStorage.setItem('user', JSON.stringify(user));
                dispatch({ type: 'AUTH_SUCCESS', payload: user });
            } else if (credentials.email === 'store@example.com' && credentials.password === 'password') {
                const user: User = {
                    id: '2',
                    email: credentials.email,
                    name: '매장관리자',
                    role: 'store_owner',
                    stores: ['1', '2'],
                    createdAt: new Date(),
                    lastLoginAt: new Date(),
                };

                localStorage.setItem('user', JSON.stringify(user));
                dispatch({ type: 'AUTH_SUCCESS', payload: user });
            } else {
                throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
            }
        } catch (error) {
            dispatch({
                type: 'AUTH_FAILURE',
                payload: error instanceof Error ? error.message : '로그인에 실패했습니다.'
            });
        }
    };

    // 회원가입 함수
    const register = async (credentials: RegisterCredentials): Promise<void> => {
        dispatch({ type: 'AUTH_START' });

        try {
            // 실제로는 API 호출이 여기에 들어갑니다
            // 지금은 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (credentials.password !== credentials.confirmPassword) {
                throw new Error('비밀번호가 일치하지 않습니다.');
            }

            const user: User = {
                id: Date.now().toString(),
                email: credentials.email,
                name: credentials.name,
                phone: credentials.phone,
                role: credentials.role || 'customer',
                createdAt: new Date(),
                lastLoginAt: new Date(),
            };

            localStorage.setItem('user', JSON.stringify(user));
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
        } catch (error) {
            dispatch({
                type: 'AUTH_FAILURE',
                payload: error instanceof Error ? error.message : '회원가입에 실패했습니다.'
            });
        }
    };

    // 로그아웃 함수
    const logout = (): void => {
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
    };

    // 에러 클리어 함수
    const clearError = (): void => {
        dispatch({ type: 'CLEAR_ERROR' });
    };

    const value: AuthContextType = {
        ...state,
        login,
        register,
        logout,
        clearError,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 
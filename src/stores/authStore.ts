import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';

interface AuthState {
    // 상태
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    isHydrated: boolean; // persist 미들웨어 초기화 완료 여부
}

interface AuthActions {
    // 액션
    login: (credentials: LoginCredentials) => Promise<void>;
    register: (credentials: RegisterCredentials) => Promise<void>;
    logout: () => void;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
}

interface AuthSelectors {
    // 선택자
    isStoreOwner: () => boolean;
    isCustomer: () => boolean;
    isAdmin: () => boolean;
    getUserStores: () => string[];
}

type AuthStore = AuthState & AuthActions & AuthSelectors;

export const useAuthStore = create<AuthStore>()(
    devtools(
        persist(
            (set, get) => ({
                // 초기 상태
                user: null,
                isAuthenticated: false,
                isLoading: true,
                error: null,
                isHydrated: false,

                // 액션
                login: async (credentials: LoginCredentials) => {
                    set({ isLoading: true, error: null });

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

                            set({
                                user,
                                isAuthenticated: true,
                                isLoading: false,
                                error: null,
                            });
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

                            set({
                                user,
                                isAuthenticated: true,
                                isLoading: false,
                                error: null,
                            });
                        } else {
                            throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
                        }
                    } catch (error) {
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: error instanceof Error ? error.message : '로그인에 실패했습니다.',
                        });
                    }
                },

                register: async (credentials: RegisterCredentials) => {
                    set({ isLoading: true, error: null });

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

                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        });
                    } catch (error) {
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: error instanceof Error ? error.message : '회원가입에 실패했습니다.',
                        });
                    }
                },

                logout: () => {
                    set({
                        user: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null,
                    });
                },

                clearError: () => {
                    set({ error: null });
                },

                setLoading: (loading: boolean) => {
                    set({ isLoading: loading });
                },

                // 선택자
                isStoreOwner: () => {
                    const { user } = get();
                    return user?.role === 'store_owner';
                },

                isCustomer: () => {
                    const { user } = get();
                    return user?.role === 'customer';
                },

                isAdmin: () => {
                    const { user } = get();
                    return user?.role === 'admin';
                },

                getUserStores: () => {
                    const { user } = get();
                    return user?.stores || [];
                },
            }),
            {
                name: 'auth-storage',
                partialize: (state) => ({
                    user: state.user,
                    isAuthenticated: state.isAuthenticated,
                }),
                onRehydrateStorage: () => (state) => {
                    // persist 미들웨어가 초기화되면 로딩 상태를 false로 설정
                    console.log('AuthStore rehydrated:', state);
                    if (state) {
                        state.isLoading = false;
                        state.isHydrated = true;
                        console.log('AuthStore state updated:', {
                            user: state.user,
                            isAuthenticated: state.isAuthenticated,
                            isLoading: state.isLoading,
                            isHydrated: state.isHydrated
                        });
                    }
                },
            }
        ),
        {
            name: 'auth-store',
        }
    )
); 
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

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
    logout: () => Promise<void>;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
    initializeAuth: () => (() => void) | undefined;
}

interface AuthSelectors {
    // 선택자
    isStoreOwner: () => boolean;
    isCustomer: () => boolean;
    isAdmin: () => boolean;
    getUserStores: () => string[];
}

type AuthStore = AuthState & AuthActions & AuthSelectors;

// Firebase User를 우리 앱의 User 타입으로 변환하는 함수
const convertFirebaseUser = (firebaseUser: FirebaseUser): User => {
    return {
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '사용자',
        role: 'customer', // 기본값, 나중에 Firestore에서 사용자 역할을 가져올 수 있음
        createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
        lastLoginAt: new Date(),
    };
};

// Firestore에 사용자 정보 저장
const saveUserToFirestore = async (user: User) => {
    try {
        await setDoc(doc(db, 'users', user.id), {
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
            stores: user.stores || [],
            createdAt: user.createdAt,
            lastLoginAt: user.lastLoginAt,
        });
        console.log('Firestore에 사용자 정보 저장 완료:', user.id);
    } catch (error) {
        console.error('Firestore 사용자 정보 저장 실패:', error);
        throw error;
    }
};

// Firestore에서 사용자 정보 가져오기
const getUserFromFirestore = async (uid: string): Promise<User | null> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            return {
                id: uid,
                email: data.email,
                name: data.name,
                phone: data.phone,
                role: data.role,
                stores: data.stores || [],
                createdAt: data.createdAt?.toDate() || new Date(),
                lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
            };
        }
        return null;
    } catch (error) {
        console.error('Firestore에서 사용자 정보 가져오기 실패:', error);
        return null;
    }
};

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
                        const userCredential = await signInWithEmailAndPassword(
                            auth,
                            credentials.email,
                            credentials.password
                        );

                        const user = convertFirebaseUser(userCredential.user);

                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        });
                    } catch (error: any) {
                        let errorMessage = '로그인에 실패했습니다.';

                        switch (error.code) {
                            case 'auth/user-not-found':
                                errorMessage = '등록되지 않은 이메일입니다.';
                                break;
                            case 'auth/wrong-password':
                                errorMessage = '비밀번호가 올바르지 않습니다.';
                                break;
                            case 'auth/invalid-email':
                                errorMessage = '올바르지 않은 이메일 형식입니다.';
                                break;
                            case 'auth/too-many-requests':
                                errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
                                break;
                        }

                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: errorMessage,
                        });
                    }
                },

                register: async (credentials: RegisterCredentials) => {
                    set({ isLoading: true, error: null });

                    try {
                        console.log('회원가입 시작:', credentials.email);

                        if (credentials.password !== credentials.confirmPassword) {
                            throw new Error('비밀번호가 일치하지 않습니다.');
                        }

                        const userCredential = await createUserWithEmailAndPassword(
                            auth,
                            credentials.email,
                            credentials.password
                        );

                        console.log('Firebase 사용자 생성 성공:', userCredential.user.uid);

                        // 사용자 프로필 업데이트 (이름 설정) - 선택적
                        try {
                            if (userCredential.user) {
                                await (userCredential.user as any).updateProfile({
                                    displayName: credentials.name
                                });
                                console.log('프로필 업데이트 성공');
                            }
                        } catch (profileError) {
                            console.warn('프로필 업데이트 실패 (무시됨):', profileError);
                            // 프로필 업데이트 실패는 회원가입 실패로 처리하지 않음
                        }

                        const user = convertFirebaseUser(userCredential.user);
                        user.name = credentials.name;
                        user.phone = credentials.phone;
                        user.role = credentials.role || 'customer';

                        console.log('사용자 정보 설정:', user);

                        // Firestore에 사용자 정보 저장
                        await saveUserToFirestore(user);

                        set({
                            user,
                            isAuthenticated: true,
                            isLoading: false,
                            error: null,
                        });

                        console.log('회원가입 완료 - 상태 업데이트됨');
                    } catch (error: any) {
                        console.error('회원가입 오류:', error);

                        let errorMessage = '회원가입에 실패했습니다.';

                        switch (error.code) {
                            case 'auth/email-already-in-use':
                                errorMessage = '이미 사용 중인 이메일입니다.';
                                break;
                            case 'auth/weak-password':
                                errorMessage = '비밀번호가 너무 약합니다. (최소 6자)';
                                break;
                            case 'auth/invalid-email':
                                errorMessage = '올바르지 않은 이메일 형식입니다.';
                                break;
                        }

                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: errorMessage,
                        });
                    }
                },

                logout: async () => {
                    try {
                        await signOut(auth);
                        set({
                            user: null,
                            isAuthenticated: false,
                            isLoading: false,
                            error: null,
                        });
                    } catch (error) {
                        console.error('로그아웃 오류:', error);
                    }
                },

                clearError: () => {
                    set({ error: null });
                },

                setLoading: (loading: boolean) => {
                    set({ isLoading: loading });
                },

                initializeAuth: () => {
                    return onAuthStateChanged(auth, async (firebaseUser) => {
                        if (firebaseUser) {
                            // Firestore에서 사용자 정보 가져오기 시도
                            let user = await getUserFromFirestore(firebaseUser.uid);

                            // Firestore에 정보가 없으면 기본 정보 사용
                            if (!user) {
                                user = convertFirebaseUser(firebaseUser);
                                console.log('Firestore에 사용자 정보 없음, 기본 정보 사용:', user);
                            } else {
                                console.log('Firestore에서 사용자 정보 가져옴:', user);
                            }

                            set({
                                user,
                                isAuthenticated: true,
                                isLoading: false,
                            });
                        } else {
                            set({
                                user: null,
                                isAuthenticated: false,
                                isLoading: false,
                            });
                        }
                    });
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
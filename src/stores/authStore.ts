import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User, LoginCredentials, RegisterCredentials } from '../types/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { isWebView, optimizeWebViewLogout } from '../utils/webviewHelper';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => (() => void) | undefined;
}

interface AuthSelectors {
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
    role: 'customer', // 기본값, Firestore에서 실제 역할을 가져옴
    createdAt: new Date(firebaseUser.metadata.creationTime || Date.now()),
    lastLoginAt: new Date(),
  };
};

// Firestore 관련 유틸리티 함수들
const firestoreUtils = {
  async saveUser(user: User): Promise<void> {
    await setDoc(doc(db, 'users', user.id), {
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      stores: user.stores || [],
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    });
  },

  async getUser(uid: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return null;

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
};

// 에러 메시지 매핑
const getAuthErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'auth/user-not-found': '등록되지 않은 이메일입니다.',
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/invalid-email': '올바르지 않은 이메일 형식입니다.',
    'auth/too-many-requests': '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.',
    'auth/email-already-in-use': '이미 사용 중인 이메일입니다.',
    'auth/weak-password': '비밀번호가 너무 약합니다. (최소 6자)',
  };
  return errorMessages[errorCode] || '인증 처리 중 오류가 발생했습니다.';
};

// 상태 업데이트 유틸리티
const updateState = (set: any, updates: Partial<AuthState>) => {
  requestAnimationFrame(() => set(updates));
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
              credentials.password,
            );

            const user = convertFirebaseUser(userCredential.user);
            updateState(set, {
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            updateState(set, {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: getAuthErrorMessage(error.code),
            });
          }
        },

        register: async (credentials: RegisterCredentials) => {
          set({ isLoading: true, error: null });

          try {
            if (credentials.password !== credentials.confirmPassword) {
              throw new Error('비밀번호가 일치하지 않습니다.');
            }

            const userCredential = await createUserWithEmailAndPassword(
              auth,
              credentials.email,
              credentials.password,
            );

            // 프로필 업데이트 (선택적)
            if (userCredential.user && credentials.name) {
              try {
                await (userCredential.user as any).updateProfile({
                  displayName: credentials.name,
                });
              } catch (profileError) {
                console.warn('프로필 업데이트 실패 (무시됨):', profileError);
              }
            }

            const user = convertFirebaseUser(userCredential.user);
            user.name = credentials.name;
            if (credentials.phone) {
              user.phone = credentials.phone;
            }
            user.role = credentials.role || 'customer';

            // Firestore에 사용자 정보 저장
            await firestoreUtils.saveUser(user);

            updateState(set, {
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } catch (error: any) {
            console.error('회원가입 오류:', error);
            updateState(set, {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: error.message || getAuthErrorMessage(error.code),
            });
          }
        },

        logout: async () => {
          const clearState = () => {
            updateState(set, {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          };

          try {
            if (isWebView()) {
              // WebView용 최적화된 로그아웃
              await optimizeWebViewLogout(async () => {
                try {
                  await signOut(auth);
                } catch (firebaseError) {
                  console.warn('WebView: Firebase Auth 로그아웃 실패 (무시됨):', firebaseError);
                }
                clearState();
              });
            } else {
              // 일반 브라우저용 로그아웃
              try {
                await signOut(auth);
              } catch (firebaseError) {
                console.warn('Firebase Auth 로그아웃 실패 (무시됨):', firebaseError);
              }

              clearState();

              // 저장소 정리
              try {
                localStorage.removeItem('auth-storage');
                localStorage.removeItem('store-storage');
                sessionStorage.clear();
              } catch (storageError) {
                console.warn('저장소 삭제 실패 (무시됨):', storageError);
              }
            }
          } catch (error) {
            console.error('❌ 로그아웃 중 예상치 못한 오류:', error);
            // 오류가 발생해도 로컬 상태는 초기화
            clearState();

            // 비상 스토리지 정리
            try {
              localStorage.removeItem('auth-storage');
              localStorage.removeItem('store-storage');
              sessionStorage.clear();
            } catch (storageError) {
              console.warn('비상 스토리지 정리 실패 (무시됨):', storageError);
            }
          }
        },

        clearError: () => set({ error: null }),
        setLoading: (loading: boolean) => set({ isLoading: loading }),

        initializeAuth: () => {
          return onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              try {
                // Firestore에서 사용자 정보 가져오기
                let user = await firestoreUtils.getUser(firebaseUser.uid);

                // Firestore에 정보가 없으면 기본 정보 사용
                if (!user) {
                  user = convertFirebaseUser(firebaseUser);
                }

                updateState(set, {
                  user,
                  isAuthenticated: true,
                  isLoading: false,
                  error: null,
                });
              } catch (error) {
                console.error('사용자 정보 가져오기 실패:', error);
                updateState(set, {
                  user: null,
                  isAuthenticated: false,
                  isLoading: false,
                  error: '사용자 정보를 불러올 수 없습니다.',
                });
              }
            } else {
              // 로그아웃 상태
              updateState(set, {
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              });
            }
          });
        },

        // 선택자
        isStoreOwner: () => get().user?.role === 'store_owner',
        isCustomer: () => get().user?.role === 'customer',
        isAdmin: () => get().user?.role === 'admin',
        getUserStores: () => get().user?.stores || [],
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.isLoading = false;
            state.isHydrated = true;
          }
        },
      },
    ),
    { name: 'auth-store' },
  ),
);

// 성능 최적화를 위한 선택자들
export const useAuthUser = () => useAuthStore(state => state.user);
export const useAuthStatus = () => useAuthStore(state => ({
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
}));
export const useAuthError = () => useAuthStore(state => state.error);
export const useAuthActions = () => useAuthStore(state => ({
  login: state.login,
  register: state.register,
  logout: state.logout,
  clearError: state.clearError,
})); 
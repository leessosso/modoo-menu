// WebView 환경 감지 및 최적화 유틸리티

interface WebViewInterface {
    flutterLogoutHelper?: () => void;
    [key: string]: any;
}

declare global {
    interface Window extends WebViewInterface { }
}

/**
 * WebView 환경 여부를 감지합니다.
 * @returns WebView 환경이면 true, 일반 브라우저면 false
 */
export const isWebView = (): boolean => {
    const userAgent = navigator.userAgent.toLowerCase();
    const webViewIndicators = [
        'wv',
        'webview',
        'app',
        'flutter',
        'react-native',
        'cordova',
        'phonegap'
    ];

    return webViewIndicators.some(indicator => userAgent.includes(indicator)) ||
        Boolean(window.flutterLogoutHelper) ||
        window.location.protocol === 'file:' ||
        (window.navigator as any).standalone === true;
};

/**
 * 강제로 화면을 다시 렌더링합니다.
 * WebView에서 UI 업데이트가 제대로 반영되지 않을 때 사용합니다.
 */
const forceRerender = (): void => {
    try {
        // 스타일 변경으로 강제 리플로우 유발
        document.body.style.display = 'none';
        document.body.offsetHeight; // 강제 리플로우
        document.body.style.display = '';
    } catch (error) {
        console.warn('강제 리렌더링 실패 (무시됨):', error);
    }
};

/**
 * 터치 이벤트를 시뮬레이션하여 WebView의 응답성을 개선합니다.
 */
const activateWebViewTouch = (): void => {
    try {
        const touchEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: []
        });
        document.body.dispatchEvent(touchEvent);
    } catch (error) {
        // TouchEvent를 지원하지 않는 환경에서는 무시
        console.warn('터치 이벤트 시뮬레이션 실패 (무시됨):', error);
    }
};

/**
 * 렌더링이 완료될 때까지 대기하고 콜백을 실행합니다.
 * @param callback 실행할 콜백 함수 (선택적)
 */
const ensureRender = (callback?: () => void): void => {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            if (callback) {
                callback();
            }
        });
    });
};

/**
 * WebView 환경에서 화면 전환 시 렌더링을 최적화합니다.
 * @param callback 최적화 완료 후 실행할 콜백 함수 (선택적)
 */
export const optimizeWebViewTransition = (callback?: () => void): void => {
    if (!isWebView()) {
        if (callback) callback();
        return;
    }

    try {
        // 1. 터치 이벤트 활성화
        activateWebViewTouch();

        // 2. 렌더링 보장
        ensureRender(() => {
            // 3. 강제 리렌더링 (필요한 경우)
            forceRerender();

            if (callback) {
                callback();
            }
        });
    } catch (error) {
        console.warn('WebView 전환 최적화 실패 (무시됨):', error);
        if (callback) callback();
    }
};

/**
 * WebView용 최적화된 로그아웃 처리
 * @param logoutCallback Firebase 로그아웃 함수
 * @returns Promise<void>
 */
export const optimizeWebViewLogout = (logoutCallback: () => Promise<void>): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            // Flutter 헬퍼 함수 호출 (있다면)
            if (window.flutterLogoutHelper) {
                window.flutterLogoutHelper();
            }

            // WebView에서는 즉시 스토리지 클리어
            const clearStorage = (): void => {
                try {
                    localStorage.clear();
                    sessionStorage.clear();
                } catch (storageError) {
                    console.warn('WebView: 스토리지 클리어 실패 (무시됨):', storageError);
                }
            };

            clearStorage();

            // 150ms 지연 후 부드러운 화면 전환
            setTimeout(async () => {
                try {
                    await logoutCallback();
                    resolve();
                } catch (error) {
                    console.warn('WebView: 로그아웃 콜백 실패 (무시됨):', error);
                    resolve(); // 에러가 발생해도 성공으로 처리
                }
            }, 150);

        } catch (error) {
            console.error('WebView 로그아웃 최적화 실패:', error);
            reject(error);
        }
    });
};

// 사용자 역할 관리 유틸리티 함수들
/**
 * Firestore에서 사용자 역할을 확인합니다.
 * @param uid 사용자 ID
 * @returns 사용자 역할 또는 null
 */
export const checkUserRole = async (uid: string): Promise<string | null> => {
    try {
        const { doc, getDoc } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');

        const userDoc = await getDoc(doc(db, 'users', uid));
        return userDoc.exists() ? userDoc.data()?.role || null : null;
    } catch (error) {
        console.error('사용자 역할 확인 실패:', error);
        return null;
    }
};

/**
 * Firestore에서 사용자 역할을 업데이트합니다.
 * @param uid 사용자 ID
 * @param newRole 새로운 역할
 * @returns 성공 여부
 */
export const updateUserRole = async (
    uid: string,
    newRole: 'customer' | 'store_owner' | 'admin'
): Promise<boolean> => {
    try {
        const { doc, updateDoc } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');

        await updateDoc(doc(db, 'users', uid), {
            role: newRole,
            lastUpdated: new Date(),
        });

        return true;
    } catch (error) {
        console.error('사용자 역할 업데이트 실패:', error);
        return false;
    }
};

/**
 * 새로운 매장관리자 계정을 생성합니다.
 * @param email 이메일
 * @param password 비밀번호
 * @param name 이름
 * @returns 성공 여부
 */
export const createStoreOwnerAccount = async (
    email: string,
    password: string,
    name: string
): Promise<boolean> => {
    try {
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        const { auth } = await import('../config/firebase');
        const { doc, setDoc } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');

        // Firebase Auth로 사용자 생성
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Firestore에 매장관리자 정보 저장
        await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            name: name,
            role: 'store_owner',
            stores: [],
            createdAt: new Date(),
            lastLoginAt: new Date(),
        });

        return true;
    } catch (error) {
        console.error('매장관리자 계정 생성 실패:', error);
        return false;
    }
};
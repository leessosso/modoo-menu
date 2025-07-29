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
        activateWebViewTouch();
        ensureRender(() => {
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
 * WebView 환경에서 데이터 로딩을 최적화합니다.
 * @param loadFunction 데이터를 로드하는 함수
 * @param delay 지연 시간 (밀리초, 기본값: 100ms)
 */
export const optimizeWebViewDataLoading = (
    loadFunction: () => void | Promise<void>,
    delay: number = 100
): void => {
    if (!isWebView()) {
        if (typeof loadFunction === 'function') {
            loadFunction();
        }
        return;
    }

    try {
        setTimeout(() => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    try {
                        if (typeof loadFunction === 'function') {
                            loadFunction();
                        }
                    } catch (error) {
                        console.warn('WebView 데이터 로딩 실패 (무시됨):', error);
                    }
                });
            });
        }, delay);
    } catch (error) {
        console.warn('WebView 데이터 로딩 최적화 실패, 기본 로딩으로 대체:', error);
        if (typeof loadFunction === 'function') {
            loadFunction();
        }
    }
};

/**
 * WebView 환경에서 리스트 렌더링을 최적화합니다.
 * @param containerSelector 리스트 컨테이너의 CSS 선택자
 * @param callback 최적화 완료 후 실행할 콜백 함수 (선택적)
 */
export const optimizeWebViewListRendering = (
    containerSelector: string = '[data-testid="list-container"]',
    callback?: () => void
): void => {
    if (!isWebView()) {
        if (callback) callback();
        return;
    }

    try {
        const performOptimization = () => {
            try {
                const container = document.querySelector(containerSelector);
                if (container instanceof HTMLElement) {
                    container.style.opacity = '0.99';
                    container.offsetHeight;

                    requestAnimationFrame(() => {
                        container.style.opacity = '1';
                        container.style.transform = 'translateZ(0)';
                        container.style.willChange = 'opacity, transform';

                        const touchEvent = new TouchEvent('touchstart', {
                            bubbles: true,
                            cancelable: true,
                            touches: []
                        });
                        container.dispatchEvent(touchEvent);

                        if (callback) {
                            callback();
                        }
                    });
                } else {
                    if (callback) callback();
                }
            } catch (error) {
                console.warn('WebView 리스트 렌더링 최적화 실패 (무시됨):', error);
                if (callback) callback();
            }
        };

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                performOptimization();
            });
        });

    } catch (error) {
        console.warn('WebView 리스트 렌더링 최적화 초기화 실패:', error);
        if (callback) callback();
    }
};

/**
 * WebView 환경에서 스크롤 성능을 최적화합니다.
 * @param containerSelector 스크롤 컨테이너의 CSS 선택자
 */
export const optimizeWebViewScrolling = (containerSelector: string): void => {
    if (!isWebView()) {
        return;
    }

    try {
        const container = document.querySelector(containerSelector);
        if (container instanceof HTMLElement) {
            (container.style as any).webkitOverflowScrolling = 'touch';
            (container.style as any).overflowScrolling = 'touch';
            container.style.willChange = 'scroll-position';

            let scrollTimeout: NodeJS.Timeout;
            const handleScroll = () => {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    container.style.willChange = 'auto';
                }, 150);
            };

            container.addEventListener('scroll', handleScroll, { passive: true });
        }
    } catch (error) {
        console.warn('WebView 스크롤 최적화 실패 (무시됨):', error);
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
            if (window.flutterLogoutHelper) {
                window.flutterLogoutHelper();
            }

            const clearStorage = (): void => {
                try {
                    localStorage.clear();
                    sessionStorage.clear();
                } catch (storageError) {
                    console.warn('WebView: 스토리지 클리어 실패 (무시됨):', storageError);
                }
            };

            clearStorage();

            setTimeout(async () => {
                try {
                    await logoutCallback();
                    resolve();
                } catch (error) {
                    console.warn('WebView: 로그아웃 콜백 실패 (무시됨):', error);
                    resolve();
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

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

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
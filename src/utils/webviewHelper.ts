// WebView 환경 감지 및 최적화 유틸리티
import type { Location } from '../types/store';

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

    setTimeout(() => {
        try {
            if (typeof loadFunction === 'function') {
                loadFunction();
            }
        } catch (error) {
            console.warn('WebView 데이터 로딩 최적화 실패:', error);
        }
    }, delay);
};

/**
 * WebView 환경에서 리스트 렌더링을 최적화합니다.
 * @param containerSelector 컨테이너 선택자
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
 * WebView 환경에서 스크롤을 최적화합니다.
 * @param containerSelector 컨테이너 선택자
 */
export const optimizeWebViewScrolling = (containerSelector: string): void => {
    if (!isWebView()) return;

    try {
        const container = document.querySelector(containerSelector);
        if (container instanceof HTMLElement) {
            (container.style as any).webkitOverflowScrolling = 'touch';
            (container.style as any).overflowScrolling = 'touch';

            const handleScroll = () => {
                container.style.transform = 'translateZ(0)';
                container.style.willChange = 'transform';
            };

            container.addEventListener('scroll', handleScroll, { passive: true });
        }
    } catch (error) {
        console.warn('WebView 스크롤 최적화 실패 (무시됨):', error);
    }
};

/**
 * WebView 환경에서 로그아웃을 최적화합니다.
 * @param logoutCallback 로그아웃 콜백 함수
 */
export const optimizeWebViewLogout = (logoutCallback: () => Promise<void>): Promise<void> => {
    return new Promise(async (resolve) => {
        try {
            if (isWebView() && window.flutterLogoutHelper) {
                const clearStorage = (): void => {
                    try {
                        localStorage.clear();
                        sessionStorage.clear();
                    } catch (error) {
                        console.warn('스토리지 정리 실패:', error);
                    }
                };

                clearStorage();
                window.flutterLogoutHelper();

                setTimeout(() => {
                    requestAnimationFrame(() => {
                        logoutCallback().finally(resolve);
                    });
                }, 150);
            } else {
                await logoutCallback();
                resolve();
            }
        } catch (error) {
            console.warn('WebView 로그아웃 최적화 실패:', error);
            await logoutCallback();
            resolve();
        }
    });
};

/**
 * Flutter에서 전달받은 위치 정보를 처리하는 함수
 * @param locationData Flutter에서 전달받은 위치 데이터
 * @returns Location 객체
 */
export const handleFlutterLocationData = (locationData: any): Location | null => {
    try {
        // Flutter에서 전달받은 데이터 형식에 따라 처리
        if (locationData && typeof locationData === 'object') {
            // URL 파라미터로 전달된 경우
            if (locationData.lat && locationData.lng) {
                return {
                    latitude: parseFloat(locationData.lat),
                    longitude: parseFloat(locationData.lng),
                };
            }

            // JavaScript Bridge로 전달된 경우
            if (locationData.latitude && locationData.longitude) {
                return {
                    latitude: parseFloat(locationData.latitude),
                    longitude: parseFloat(locationData.longitude),
                };
            }

            // 권한 상태만 전달된 경우
            if (locationData.permissionGranted === true) {
                console.log('📍 Flutter에서 위치 권한이 허용되었습니다.');
                return null; // 실제 위치는 별도로 가져와야 함
            }
        }

        return null;
    } catch (error) {
        console.warn('Flutter 위치 데이터 처리 실패:', error);
        return null;
    }
};

/**
 * Flutter에서 전달받은 권한 상태를 확인하는 함수
 * @returns Promise<boolean>
 */
export const checkFlutterLocationPermission = async (): Promise<boolean> => {
    try {
        // Flutter JavaScript Bridge 확인
        if (typeof window !== 'undefined' && (window as any).flutterLocationBridge) {
            const result = await (window as any).flutterLocationBridge.getLocationPermission();
            return result.granted === true;
        }

        // URL 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const permissionParam = urlParams.get('locationPermission');
        if (permissionParam === 'true') {
            return true;
        }

        return false;
    } catch (error) {
        console.warn('Flutter 권한 확인 실패:', error);
        return false;
    }
};

/**
 * Flutter에서 전달받은 위치 정보를 가져오는 함수
 * @returns Promise<Location | null>
 */
export const getFlutterLocation = async (): Promise<Location | null> => {
    try {
        // Flutter JavaScript Bridge 확인
        if (typeof window !== 'undefined' && (window as any).flutterLocationBridge) {
            const result = await (window as any).flutterLocationBridge.getCurrentLocation();
            if (result.success) {
                return {
                    latitude: result.latitude,
                    longitude: result.longitude,
                };
            }
        }

        // URL 파라미터에서 위치 정보 확인
        const urlParams = new URLSearchParams(window.location.search);
        const lat = urlParams.get('lat');
        const lng = urlParams.get('lng');

        if (lat && lng) {
            return {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng),
            };
        }

        return null;
    } catch (error) {
        console.warn('Flutter 위치 정보 가져오기 실패:', error);
        return null;
    }
};
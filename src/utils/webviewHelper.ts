// WebView 렌더링 최적화 유틸리티

// WebView 환경 감지
export const isWebView = (): boolean => {
    // Flutter WebView 환경 감지
    if ((window as any).isFlutterWebView) {
        return true;
    }

    // Android WebView 감지
    const userAgent = navigator.userAgent;
    if (/Android.+wv|Version.+Chrome\/\d+\.\d+\.\d+\.\d+ Mobile/i.test(userAgent)) {
        return true;
    }

    // iOS WebView 감지 추가
    if (/iPhone|iPad|iPod/.test(userAgent) && !(window as any).MSStream) {
        // iOS Safari가 아닌 WebView 환경
        if (!(userAgent.includes('Safari') && !userAgent.includes('CriOS') && !userAgent.includes('FxiOS'))) {
            return true;
        }
    }

    return false;
};

export const forceRerender = () => {
    // DOM을 강제로 다시 그리도록 함
    document.body.style.transform = 'translateZ(0)';

    // 다음 프레임에서 원래 상태로 복원
    requestAnimationFrame(() => {
        document.body.style.transform = '';
    });
};

// 화면 전환 시 렌더링 보장
export const ensureRender = (callback?: () => void) => {
    // 강제 리플로우
    document.body.offsetHeight;

    // 강제 리렌더
    forceRerender();

    // 콜백 실행
    if (callback) {
        requestAnimationFrame(() => {
            callback();
        });
    }
};

// WebView에서 터치 이벤트 활성화
export const activateWebViewTouch = () => {
    // 빈 터치 이벤트를 강제 발생시켜 WebView 활성화
    const touchEvent = new TouchEvent('touchstart', {
        bubbles: true,
        cancelable: true,
    });

    document.body.dispatchEvent(touchEvent);
};

// 화면 전환 시 사용할 통합 함수
export const optimizeWebViewTransition = (callback?: () => void) => {
    // 1. 강제 리렌더
    forceRerender();

    // 2. 화면 활성화
    activateWebViewTouch();

    // 3. 렌더링 보장
    ensureRender(callback);
};

// WebView용 최적화된 로그아웃 처리
export const optimizeWebViewLogout = (logoutCallback: () => Promise<void>): Promise<void> => {
    console.log('WebView 환경에서 최적화된 로그아웃 실행');

    return new Promise((resolve, reject) => {
        try {
            // Flutter 헬퍼 함수 호출 (있다면)
            if ((window as any).flutterLogoutHelper) {
                (window as any).flutterLogoutHelper();
            }

            // WebView에서는 즉시 스토리지 클리어
            try {
                localStorage.clear();
                sessionStorage.clear();
                console.log('WebView: 모든 스토리지 정보 클리어됨');
            } catch (storageError) {
                console.warn('WebView: 스토리지 클리어 실패 (무시됨):', storageError);
            }

            // Firebase 로그아웃 실행
            logoutCallback()
                .then(() => {
                    // WebView에서는 약간의 지연 후 화면 전환
                    setTimeout(() => {
                        // 강제 리렌더링으로 화면 전환 보장
                        optimizeWebViewTransition(() => {
                            // 해시 라우팅으로 로그인 페이지 이동
                            window.location.hash = '#/login';
                            resolve();
                        });
                    }, 150);
                })
                .catch((error) => {
                    console.error('WebView: Firebase 로그아웃 실패:', error);
                    // 로그아웃이 실패해도 화면 전환은 실행
                    setTimeout(() => {
                        optimizeWebViewTransition(() => {
                            window.location.hash = '#/login';
                            resolve();
                        });
                    }, 150);
                });
        } catch (error) {
            console.error('WebView: 로그아웃 최적화 실패:', error);
            reject(error);
        }
    });
};
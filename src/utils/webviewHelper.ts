// WebView 렌더링 최적화 유틸리티
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
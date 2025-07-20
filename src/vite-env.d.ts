/// <reference types="vite/client" />

// ReactNativeWebView 타입 정의
declare global {
    interface Window {
        ReactNativeWebView?: {
            postMessage: (message: string) => void;
        };
    }
}

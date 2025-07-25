// 개발 환경 전용 디버깅 도구
import { checkUserRole, updateUserRole, createStoreOwnerAccount } from './webviewHelper';

interface DebugAuth {
    getCurrentUser: () => any;
    createStoreOwner: (email: string, password: string, name: string) => Promise<boolean>;
    changeUserRole: (uid: string, newRole: 'customer' | 'store_owner' | 'admin') => Promise<boolean>;
    changeMyRole: (newRole: 'customer' | 'store_owner' | 'admin') => Promise<boolean>;
    fixTestAccounts: () => Promise<void>;
    checkUserRole: (uid: string) => Promise<string | null>;
}

declare global {
    interface Window {
        debugAuth: DebugAuth;
    }
}

// 현재 사용자 정보 확인
const getCurrentUser = () => {
    try {
        const { useAuthStore } = require('../stores/authStore');
        const user = useAuthStore.getState().user;
        console.log('현재 사용자:', user);
        return user;
    } catch (error) {
        console.error('사용자 정보 가져오기 실패:', error);
        return null;
    }
};

// 매장관리자 계정 생성
const createStoreOwner = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
        const success = await createStoreOwnerAccount(email, password, name);
        if (success) {
            console.log('✅ 매장관리자 계정 생성 완료');
            console.log('이제 해당 계정으로 로그인해보세요:', email);
        } else {
            console.log('❌ 매장관리자 계정 생성 실패');
        }
        return success;
    } catch (error) {
        console.error('매장관리자 계정 생성 중 오류:', error);
        return false;
    }
};

// 사용자 역할 변경
const changeUserRole = async (uid: string, newRole: 'customer' | 'store_owner' | 'admin'): Promise<boolean> => {
    try {
        const success = await updateUserRole(uid, newRole);
        if (success) {
            console.log(`✅ 사용자 역할 변경 완료: ${uid} -> ${newRole}`);
            console.log('페이지를 새로고침하거나 다시 로그인해보세요');
        } else {
            console.log('❌ 사용자 역할 변경 실패');
        }
        return success;
    } catch (error) {
        console.error('사용자 역할 변경 중 오류:', error);
        return false;
    }
};

// 현재 로그인한 사용자의 역할 변경
const changeMyRole = async (newRole: 'customer' | 'store_owner' | 'admin'): Promise<boolean> => {
    try {
        const user = getCurrentUser();
        if (!user) {
            console.log('❌ 로그인된 사용자가 없습니다');
            return false;
        }

        const success = await updateUserRole(user.id, newRole);
        if (success) {
            console.log(`✅ 내 역할 변경 완료: ${user.email} -> ${newRole}`);
            console.log('🔄 페이지를 새로고침합니다...');
            setTimeout(() => window.location.reload(), 1000);
        } else {
            console.log('❌ 역할 변경 실패');
        }
        return success;
    } catch (error) {
        console.error('내 역할 변경 중 오류:', error);
        return false;
    }
};

// 테스트 계정 역할 자동 수정
const fixTestAccounts = async (): Promise<void> => {
    console.log('🔧 테스트 계정 역할 수정 중...');

    try {
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');

        const usersRef = collection(db, 'users');

        // store@example.com 계정을 매장관리자로 설정
        const storeOwnerQuery = query(usersRef, where('email', '==', 'store@example.com'));
        const storeOwnerSnapshot = await getDocs(storeOwnerQuery);

        if (!storeOwnerSnapshot.empty) {
            const userDoc = storeOwnerSnapshot.docs[0];
            const success = await updateUserRole(userDoc.id, 'store_owner');
            if (success) {
                console.log('✅ store@example.com 계정을 매장관리자로 설정했습니다');
            }
        } else {
            console.log('⚠️ store@example.com 계정을 찾을 수 없습니다');
        }

        // sso3@naver.com 계정을 고객으로 설정
        const customerQuery = query(usersRef, where('email', '==', 'sso3@naver.com'));
        const customerSnapshot = await getDocs(customerQuery);

        if (!customerSnapshot.empty) {
            const userDoc = customerSnapshot.docs[0];
            const success = await updateUserRole(userDoc.id, 'customer');
            if (success) {
                console.log('✅ sso3@naver.com 계정을 고객으로 설정했습니다');
            }
        } else {
            console.log('⚠️ sso3@naver.com 계정을 찾을 수 없습니다');
        }

        console.log('🔄 페이지를 새로고침합니다...');
        setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
        console.error('❌ 테스트 계정 수정 실패:', error);
    }
};

// 개발자 도구 초기화
const initializeDevTools = (): void => {
    if (typeof window !== 'undefined') {
        window.debugAuth = {
            getCurrentUser,
            createStoreOwner,
            changeUserRole,
            changeMyRole,
            fixTestAccounts,
            checkUserRole,
        };
    }
};

// 개발 환경에서만 실행
if (import.meta.env.DEV) {
    initializeDevTools();
}

export default initializeDevTools; 
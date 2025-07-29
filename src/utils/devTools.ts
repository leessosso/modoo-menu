// 개발 환경 전용 디버깅 도구
import { checkUserRole, updateUserRole, createStoreOwnerAccount } from './webviewHelper';

interface DebugAuth {
    getCurrentUser: () => any;
    createStoreOwner: (email: string, password: string, name: string) => Promise<boolean>;
    changeUserRole: (uid: string, newRole: 'customer' | 'store_owner' | 'admin') => Promise<boolean>;
    changeMyRole: (newRole: 'customer' | 'store_owner' | 'admin') => Promise<boolean>;
    fixTestAccounts: () => Promise<void>;
    checkUserRole: (uid: string) => Promise<string | null>;
    updateExistingStoresLocation: () => Promise<void>;
    addNearbyTestStores: () => Promise<void>;
    addRealLocationTestStores: () => Promise<void>;
    checkLocationPermissionStatus: () => Promise<void>;
    forceResetLocationPermission: () => Promise<void>;
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

// 강서구 근처에 테스트용 가까운 매장 추가
const addNearbyTestStores = async (): Promise<void> => {
    console.log('🔧 강서구 근처 테스트 매장 추가 중...');

    try {
        const { collection, addDoc } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');

        const storesRef = collection(db, 'stores');

        // 강서구 근처 매장들 (실제 좌표)
        const nearbyStores = [
            {
                name: '강서구 맛있는 치킨집',
                description: '강서구에서 가장 맛있는 치킨집입니다',
                address: '서울특별시 강서구 화곡동 123-45',
                phone: '02-1234-5678',
                businessHours: '매일 11:00-22:00',
                isOpen: true,
                ownerId: 'test_owner_1',
                latitude: 37.5510,  // 강서구 화곡동
                longitude: 126.8480,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: '강서구 커피숍',
                description: '강서구에서 분위기 좋은 커피숍',
                address: '서울특별시 강서구 마곡동 456-78',
                phone: '02-2345-6789',
                businessHours: '매일 07:00-21:00',
                isOpen: true,
                ownerId: 'test_owner_2',
                latitude: 37.5530,  // 강서구 마곡동
                longitude: 126.8500,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: '강서구 피자집',
                description: '강서구에서 맛있는 피자를 만드는 곳',
                address: '서울특별시 강서구 가양동 789-12',
                phone: '02-3456-7890',
                businessHours: '매일 12:00-23:00',
                isOpen: true,
                ownerId: 'test_owner_3',
                latitude: 37.5490,  // 강서구 가양동
                longitude: 126.8460,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        for (const store of nearbyStores) {
            await addDoc(storesRef, store);
            console.log(`✅ ${store.name} 추가 완료`);
        }

        console.log('🎉 강서구 근처 테스트 매장 추가 완료!');
        console.log('🔄 페이지를 새로고침합니다...');
        setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
        console.error('❌ 강서구 근처 테스트 매장 추가 실패:', error);
    }
};

// 실제 GPS 위치 기반으로 테스트 매장 추가
const addRealLocationTestStores = async (): Promise<void> => {
    console.log('🔧 실제 GPS 위치 기반 테스트 매장 추가 중...');

    try {
        // 먼저 현재 위치 가져오기
        const { getCurrentLocation } = await import('./locationHelper');
        const userLocation = await getCurrentLocation();

        console.log('📍 현재 GPS 위치:', userLocation);

        const { collection, addDoc } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');

        const storesRef = collection(db, 'stores');

        // 현재 위치 기준으로 가까운 매장들 생성
        const nearbyStores = [
            {
                name: '현재 위치 근처 치킨집',
                description: '현재 위치에서 가까운 치킨집입니다',
                address: `실제 GPS 근처 (${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)})`,
                phone: '02-1234-5678',
                businessHours: '매일 11:00-22:00',
                isOpen: true,
                ownerId: 'test_owner_1',
                latitude: userLocation.latitude + 0.001,  // 약 100m 거리
                longitude: userLocation.longitude + 0.001,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: '현재 위치 근처 커피숍',
                description: '현재 위치에서 가까운 커피숍입니다',
                address: `실제 GPS 근처 (${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)})`,
                phone: '02-2345-6789',
                businessHours: '매일 07:00-21:00',
                isOpen: true,
                ownerId: 'test_owner_2',
                latitude: userLocation.latitude - 0.002,  // 약 200m 거리
                longitude: userLocation.longitude - 0.002,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
            {
                name: '현재 위치 근처 피자집',
                description: '현재 위치에서 가까운 피자집입니다',
                address: `실제 GPS 근처 (${userLocation.latitude.toFixed(6)}, ${userLocation.longitude.toFixed(6)})`,
                phone: '02-3456-7890',
                businessHours: '매일 12:00-23:00',
                isOpen: true,
                ownerId: 'test_owner_3',
                latitude: userLocation.latitude + 0.003,  // 약 300m 거리
                longitude: userLocation.longitude - 0.001,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        ];

        for (const store of nearbyStores) {
            await addDoc(storesRef, store);
            console.log(`✅ ${store.name} 추가 완료`);
        }

        console.log('🎉 실제 GPS 위치 기반 테스트 매장 추가 완료!');
        console.log('🔄 페이지를 새로고침합니다...');
        setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
        console.error('❌ 실제 GPS 위치 기반 테스트 매장 추가 실패:', error);
    }
};

// 기존 매장들의 위치 정보 일괄 업데이트
const updateExistingStoresLocation = async (): Promise<void> => {
    console.log('🔧 기존 매장 위치 정보 업데이트 중...');

    try {
        const { collection, getDocs, updateDoc, doc } = await import('firebase/firestore');
        const { db } = await import('../config/firebase');
        const { geocodeAddress } = await import('./locationHelper');

        const storesRef = collection(db, 'stores');
        const storesSnapshot = await getDocs(storesRef);

        let updatedCount = 0;
        let errorCount = 0;

        for (const storeDoc of storesSnapshot.docs) {
            const storeData = storeDoc.data();

            // 이미 위치 정보가 있으면 건너뛰기
            if (storeData.latitude && storeData.longitude) {
                console.log(`⏭️ ${storeData.name}: 이미 위치 정보 있음`);
                continue;
            }

            // 주소가 없으면 건너뛰기
            if (!storeData.address) {
                console.log(`⚠️ ${storeData.name}: 주소 정보 없음`);
                continue;
            }

            try {
                // 주소를 좌표로 변환
                const location = await geocodeAddress(storeData.address);

                // 매장 정보 업데이트
                await updateDoc(doc(db, 'stores', storeDoc.id), {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    updatedAt: new Date(),
                });

                console.log(`✅ ${storeData.name}: 위치 정보 업데이트 완료 (${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)})`);
                updatedCount++;
            } catch (error) {
                console.error(`❌ ${storeData.name}: 위치 정보 업데이트 실패`, error);
                errorCount++;
            }
        }

        console.log(`🎉 위치 정보 업데이트 완료: ${updatedCount}개 성공, ${errorCount}개 실패`);

        if (updatedCount > 0) {
            console.log('🔄 페이지를 새로고침합니다...');
            setTimeout(() => window.location.reload(), 1000);
        }

    } catch (error) {
        console.error('❌ 기존 매장 위치 정보 업데이트 실패:', error);
    }
};

// 위치 권한 상태 확인
const checkLocationPermissionStatus = async (): Promise<void> => {
    console.log('🔍 위치 권한 상태 확인 중...');

    try {
        const { checkLocationPermission, getCurrentLocation } = await import('./locationHelper');

        const permissionStatus = await checkLocationPermission();
        console.log('📍 위치 권한 상태:', permissionStatus);

        if (permissionStatus === 'granted') {
            try {
                const location = await getCurrentLocation();
                console.log('✅ 위치 권한 허용됨, 현재 위치:', location);
            } catch (error) {
                console.error('❌ 위치 가져오기 실패:', error);
            }
        } else if (permissionStatus === 'denied') {
            console.warn('⚠️ 위치 권한이 거부됨');
        } else {
            console.log('⏳ 위치 권한 요청 대기 중');
        }
    } catch (error) {
        console.error('❌ 위치 권한 확인 실패:', error);
    }
};

// 위치 권한 강제 재설정
const forceResetLocationPermission = async (): Promise<void> => {
    console.log('🔧 위치 권한 강제 재설정 중...');

    try {
        const { getCurrentLocation, checkLocationPermission } = await import('./locationHelper');

        // 1. 현재 권한 상태 확인
        const currentStatus = await checkLocationPermission();
        console.log('📍 현재 권한 상태:', currentStatus);

        // 2. 위치 권한 강제 요청
        console.log('📍 위치 권한 요청 중...');
        const location = await getCurrentLocation();

        console.log('✅ 위치 권한 재설정 성공!');
        console.log('📍 현재 위치:', location);

        // 3. 페이지 새로고침으로 상태 업데이트
        console.log('🔄 페이지를 새로고침합니다...');
        setTimeout(() => window.location.reload(), 1000);

    } catch (error) {
        console.error('❌ 위치 권한 재설정 실패:', error);
        console.log('💡 브라우저 설정에서 위치 권한을 수동으로 허용해주세요.');
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
            updateExistingStoresLocation,
            addNearbyTestStores,
            addRealLocationTestStores,
            checkLocationPermissionStatus,
            forceResetLocationPermission,
        };
    }
};

// 개발 환경에서만 실행
if (import.meta.env.DEV) {
    initializeDevTools();
}

export default initializeDevTools; 
import type { Location } from '../types/store';

/**
 * 현재 위치를 가져오는 함수
 * @returns Promise<Location>
 */
export const getCurrentLocation = (): Promise<Location> => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('위치 서비스가 지원되지 않습니다.'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.warn('위치 가져오기 실패:', error);
                // 테스트용 기본 위치 (서울 중심부)
                resolve({ latitude: 37.5665, longitude: 126.9780 });
            },
            {
                timeout: 10000,
                maximumAge: 5 * 60 * 1000, // 5분
                enableHighAccuracy: true,
            }
        );
    });
};

/**
 * 두 지점 간의 거리를 계산하는 함수 (Haversine formula)
 * @param lat1 첫 번째 지점의 위도
 * @param lon1 첫 번째 지점의 경도
 * @param lat2 두 번째 지점의 위도
 * @param lon2 두 번째 지점의 경도
 * @returns 거리 (km 단위)
 */
export const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number => {
    const R = 6371; // 지구 반지름 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // 소수점 1자리까지
};

/**
 * 주소를 좌표로 변환하는 함수 (Geocoding)
 * @param address 주소
 * @returns Promise<Location>
 */
export const geocodeAddress = async (address: string): Promise<Location> => {
    try {
        // 실제 구현에서는 Google Maps Geocoding API 또는 다른 서비스 사용
        // 현재는 테스트용으로 랜덤 좌표 반환
        const baseLat = 37.5665;
        const baseLon = 126.9780;

        // 주소 해시를 기반으로 한 일관된 랜덤 좌표 생성
        const hash = address.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);

        const latOffset = (hash % 100) / 1000; // ±0.1도 범위
        const lonOffset = ((hash * 2) % 100) / 1000;

        return {
            latitude: baseLat + latOffset,
            longitude: baseLon + lonOffset,
        };
    } catch (error) {
        console.error('주소 변환 실패:', error);
        throw new Error('주소를 좌표로 변환할 수 없습니다.');
    }
};

/**
 * 거리 정보를 포맷팅하는 함수
 * @param distance 거리 (km)
 * @returns 포맷팅된 거리 문자열
 */
export const formatDistance = (distance: number): string => {
    if (distance < 1) {
        return `${Math.round(distance * 1000)}m`;
    }
    return `${distance}km`;
};

/**
 * 예상 이동 시간을 계산하는 함수
 * @param distance 거리 (km)
 * @param averageSpeed 평균 속도 (km/h, 기본값: 5km/h 도보)
 * @returns 예상 이동 시간 (분)
 */
export const calculateDuration = (distance: number, averageSpeed: number = 5): number => {
    return Math.round((distance / averageSpeed) * 60);
};

/**
 * 위치 기반 매장 정렬 함수
 * @param stores 매장 목록
 * @param userLocation 사용자 위치
 * @returns 거리순으로 정렬된 매장 목록
 */
export const sortStoresByDistance = (
    stores: Array<{ latitude?: number; longitude?: number }>,
    userLocation: Location
): Array<{ distance: number; store: any }> => {
    return stores
        .filter(store => store.latitude && store.longitude)
        .map(store => ({
            distance: calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                store.latitude!,
                store.longitude!
            ),
            store
        }))
        .sort((a, b) => a.distance - b.distance);
};

/**
 * 위치 권한을 요청하는 함수
 * @returns Promise<boolean>
 */
export const requestLocationPermission = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (!navigator.geolocation) {
            resolve(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            () => resolve(true),
            () => resolve(false),
            { timeout: 5000 }
        );
    });
}; 
import type { Location } from '../types/store';
import { googleMapsConfig } from '../config/firebase';

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
                reject(new Error('실제 위치를 가져올 수 없습니다.'));
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
 * 주소를 좌표로 변환하는 함수
 * @param address 주소
 * @returns Promise<Location>
 */
export const geocodeAddress = async (address: string): Promise<Location> => {
    try {
        // Google Maps API 키가 없으면 테스트 모드로 진행
        if (!googleMapsConfig.apiKey) {
            console.warn('Google Maps API 키가 없어 테스트 모드로 진행합니다.');
            return await geocodeAddressTest(address);
        }

        const url = `${googleMapsConfig.geocodingApiUrl}?address=${encodeURIComponent(address)}&key=${googleMapsConfig.apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.status === 'OK' && data.results.length > 0) {
            const location = data.results[0].geometry.location;
            return {
                latitude: location.lat,
                longitude: location.lng,
            };
        } else {
            throw new Error(`Geocoding 실패: ${data.status}`);
        }
    } catch (error) {
        console.error('실제 Geocoding 실패, 테스트 모드로 진행:', error);
        return await geocodeAddressTest(address);
    }
};

/**
 * 테스트용 주소 변환 함수
 * @param address 주소
 * @returns Promise<Location>
 */
const geocodeAddressTest = async (address: string): Promise<Location> => {
    try {
        const baseLat = 37.5665;
        const baseLon = 126.9780;

        // 주소 해시를 기반으로 한 일관된 랜덤 좌표 생성
        const hash = address.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);

        const latOffset = (hash % 100) / 1000;
        const lonOffset = ((hash * 2) % 100) / 1000;

        return {
            latitude: baseLat + latOffset,
            longitude: baseLon + lonOffset,
        };
    } catch (error) {
        console.error('테스트 주소 변환 실패:', error);
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
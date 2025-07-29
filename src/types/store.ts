export interface Store {
    id: string;
    name: string;
    description: string;
    logo?: string;
    address: string;
    phone: string;
    businessHours: string;
    categories: Category[];
    isOpen: boolean;
    ownerId: string; // 매장관리자 ID
    createdAt: Date;
    updatedAt: Date;
    // 위치 정보 추가
    latitude?: number;
    longitude?: number;
}

// 위치 정보 타입
export interface Location {
    latitude: number;
    longitude: number;
}

// 거리 정보가 포함된 매장 타입
export interface StoreWithDistance extends Store {
    distance?: number;
}

// 거리 계산 결과 타입
export interface DistanceResult {
    distance: number; // km 단위
    duration?: number; // 예상 이동 시간 (분)
}

export interface Category {
    id: string;
    name: string;
    icon: string;
    items: MenuItem[];
    storeId: string;
    order: number;
}

export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image?: string;
    categoryId: string;
    storeId: string;
    options: MenuOption[];
    allergens: string[];
    isPopular: boolean;
    isAvailable: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface MenuOption {
    id: string;
    name: string;
    price: number;
    isAvailable: boolean;
}

export interface CreateStoreData {
    name: string;
    description: string;
    address: string;
    phone: string;
    businessHours: string;
    latitude?: number;
    longitude?: number;
}

export interface UpdateStoreData extends Partial<CreateStoreData> {
    isOpen?: boolean;
}

// 카테고리 생성/수정 데이터
export interface CreateCategoryData {
    name: string;
    icon: string;
    storeId: string;
}

export interface UpdateCategoryData extends Partial<Omit<CreateCategoryData, 'storeId'>> {
    order?: number;
}

// 메뉴 아이템 생성/수정 데이터
export interface CreateMenuItemData {
    name: string;
    description: string;
    price: number;
    image?: string;
    categoryId: string;
    storeId: string;
    options?: MenuOption[];
    allergens?: string[];
    isPopular?: boolean;
    isAvailable?: boolean;
}

export interface UpdateMenuItemData extends Partial<Omit<CreateMenuItemData, 'categoryId' | 'storeId'>> {
    order?: number;
} 
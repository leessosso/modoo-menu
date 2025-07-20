// 매장 관련 타입
export interface Store {
    id: string;
    name: string;
    description: string;
    logo: string;
    address: string;
    phone: string;
    businessHours: string;
    categories: Category[];
    isOpen: boolean;
}

// 카테고리 타입
export interface Category {
    id: string;
    name: string;
    icon: string;
    items: MenuItem[];
}

// 메뉴 아이템 타입
export interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    options: MenuOption[];
    allergens: string[];
    isPopular: boolean;
    isAvailable: boolean;
}

// 메뉴 옵션 타입
export interface MenuOption {
    id: string;
    name: string;
    price: number;
    isRequired: boolean;
}

// 장바구니 아이템 타입
export interface CartItem {
    menuItem: MenuItem;
    quantity: number;
    selectedOptions: MenuOption[];
    totalPrice: number;
}

// 주문 타입
export interface Order {
    id: string;
    items: CartItem[];
    totalAmount: number;
    orderNumber: string;
    estimatedWaitTime: number;
    timestamp: Date;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
}

// 사용자 타입
export interface User {
    id: string;
    name: string;
    preferences: {
        language: 'ko' | 'en';
        theme: 'light' | 'dark';
    };
}

// 앱 상태 타입
export interface AppState {
    currentStore: Store | null;
    cart: CartItem[];
    user: User | null;
    isLoading: boolean;
    error: string | null;
} 
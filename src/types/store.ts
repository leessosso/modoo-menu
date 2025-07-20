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
}

export interface UpdateStoreData extends Partial<CreateStoreData> {
    isOpen?: boolean;
} 
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Store, CreateStoreData, UpdateStoreData } from '../types/store';

interface StoreState {
    stores: Store[];
    currentStore: Store | null;
    isLoading: boolean;
    error: string | null;
}

interface StoreActions {
    // 매장 목록 관리
    fetchStores: (ownerId: string) => Promise<void>;
    fetchStore: (storeId: string) => Promise<Store | null>;

    // 매장 CRUD
    createStore: (data: CreateStoreData, ownerId: string) => Promise<string>;
    updateStore: (storeId: string, data: UpdateStoreData) => Promise<void>;
    deleteStore: (storeId: string) => Promise<void>;

    // 상태 관리
    setCurrentStore: (store: Store | null) => void;
    clearError: () => void;
    setLoading: (loading: boolean) => void;
}

type StoreStore = StoreState & StoreActions;

export const useStoreStore = create<StoreStore>()(
    devtools(
        (set, get) => ({
            // 초기 상태
            stores: [],
            currentStore: null,
            isLoading: false,
            error: null,

            // 매장 목록 가져오기
            fetchStores: async (ownerId: string) => {
                set({ isLoading: true, error: null });

                try {
                    const storesQuery = query(
                        collection(db, 'stores'),
                        where('ownerId', '==', ownerId),
                        orderBy('createdAt', 'desc')
                    );

                    const querySnapshot = await getDocs(storesQuery);
                    const stores: Store[] = [];

                    querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        stores.push({
                            id: doc.id,
                            ...data,
                            createdAt: data.createdAt?.toDate() || new Date(),
                            updatedAt: data.updatedAt?.toDate() || new Date(),
                        } as Store);
                    });

                    set({ stores, isLoading: false });
                } catch (error: any) {
                    console.error('매장 목록 가져오기 실패:', error);
                    set({
                        error: '매장 목록을 가져오는데 실패했습니다.',
                        isLoading: false
                    });
                }
            },

            // 특정 매장 가져오기
            fetchStore: async (storeId: string) => {
                set({ isLoading: true, error: null });

                try {
                    const storeDoc = await getDoc(doc(db, 'stores', storeId));

                    if (storeDoc.exists()) {
                        const data = storeDoc.data();
                        const store: Store = {
                            id: storeDoc.id,
                            ...data,
                            createdAt: data.createdAt?.toDate() || new Date(),
                            updatedAt: data.updatedAt?.toDate() || new Date(),
                        } as Store;

                        set({ currentStore: store, isLoading: false });
                        return store;
                    } else {
                        set({ currentStore: null, isLoading: false });
                        return null;
                    }
                } catch (error: any) {
                    console.error('매장 정보 가져오기 실패:', error);
                    set({
                        error: '매장 정보를 가져오는데 실패했습니다.',
                        isLoading: false
                    });
                    return null;
                }
            },

            // 매장 생성
            createStore: async (data: CreateStoreData, ownerId: string) => {
                set({ isLoading: true, error: null });

                try {
                    const storeData = {
                        ...data,
                        ownerId,
                        isOpen: true,
                        categories: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    };

                    const docRef = await addDoc(collection(db, 'stores'), storeData);

                    // 생성된 매장을 목록에 추가
                    const newStore: Store = {
                        id: docRef.id,
                        ...storeData,
                    };

                    set(state => ({
                        stores: [newStore, ...state.stores],
                        isLoading: false,
                    }));

                    return docRef.id;
                } catch (error: any) {
                    console.error('매장 생성 실패:', error);
                    set({
                        error: '매장 생성에 실패했습니다.',
                        isLoading: false
                    });
                    throw error;
                }
            },

            // 매장 수정
            updateStore: async (storeId: string, data: UpdateStoreData) => {
                set({ isLoading: true, error: null });

                try {
                    const updateData = {
                        ...data,
                        updatedAt: new Date(),
                    };

                    await updateDoc(doc(db, 'stores', storeId), updateData);

                    // 목록과 현재 매장 정보 업데이트
                    set(state => ({
                        stores: state.stores.map(store =>
                            store.id === storeId
                                ? { ...store, ...updateData }
                                : store
                        ),
                        currentStore: state.currentStore?.id === storeId
                            ? { ...state.currentStore, ...updateData }
                            : state.currentStore,
                        isLoading: false,
                    }));
                } catch (error: any) {
                    console.error('매장 수정 실패:', error);
                    set({
                        error: '매장 수정에 실패했습니다.',
                        isLoading: false
                    });
                    throw error;
                }
            },

            // 매장 삭제
            deleteStore: async (storeId: string) => {
                set({ isLoading: true, error: null });

                try {
                    await deleteDoc(doc(db, 'stores', storeId));

                    // 목록에서 제거
                    set(state => ({
                        stores: state.stores.filter(store => store.id !== storeId),
                        currentStore: state.currentStore?.id === storeId ? null : state.currentStore,
                        isLoading: false,
                    }));
                } catch (error: any) {
                    console.error('매장 삭제 실패:', error);
                    set({
                        error: '매장 삭제에 실패했습니다.',
                        isLoading: false
                    });
                    throw error;
                }
            },

            // 현재 매장 설정
            setCurrentStore: (store: Store | null) => {
                set({ currentStore: store });
            },

            // 오류 초기화
            clearError: () => {
                set({ error: null });
            },

            // 로딩 상태 설정
            setLoading: (loading: boolean) => {
                set({ isLoading: loading });
            },
        }),
        {
            name: 'store-store',
        }
    )
); 
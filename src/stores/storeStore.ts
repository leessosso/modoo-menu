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
  orderBy,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type {
  Store,
  CreateStoreData,
  UpdateStoreData,
  Category,
  MenuItem,
  CreateCategoryData,
  UpdateCategoryData,
  CreateMenuItemData,
  UpdateMenuItemData
} from '../types/store';

interface StoreState {
  stores: Store[];
  currentStore: Store | null;
  categories: Category[];
  menuItems: MenuItem[];
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

  // 카테고리 관리
  fetchCategories: (storeId: string) => Promise<void>;
  createCategory: (data: CreateCategoryData) => Promise<string>;
  updateCategory: (categoryId: string, data: UpdateCategoryData) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  reorderCategories: (storeId: string, categoryIds: string[]) => Promise<void>;

  // 메뉴 아이템 관리
  fetchMenuItems: (categoryId?: string) => Promise<void>;
  createMenuItem: (data: CreateMenuItemData) => Promise<string>;
  updateMenuItem: (itemId: string, data: UpdateMenuItemData) => Promise<void>;
  deleteMenuItem: (itemId: string) => Promise<void>;
  reorderMenuItems: (categoryId: string, itemIds: string[]) => Promise<void>;

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
      categories: [],
      menuItems: [],
      isLoading: false,
      error: null,

      // 매장 목록 가져오기
      fetchStores: async (ownerId: string) => {
        set({ isLoading: true, error: null });

        try {
          const storesQuery = query(
            collection(db, 'stores'),
            where('ownerId', '==', ownerId),
            orderBy('createdAt', 'desc'),
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
            isLoading: false,
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
            isLoading: false,
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
            isLoading: false,
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
                : store,
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
            isLoading: false,
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
            isLoading: false,
          });
          throw error;
        }
      },

      // 카테고리 목록 가져오기
      fetchCategories: async (storeId: string) => {
        set({ isLoading: true, error: null });

        try {
          const categoriesQuery = query(
            collection(db, 'categories'),
            where('storeId', '==', storeId),
            orderBy('order', 'asc'),
          );

          const querySnapshot = await getDocs(categoriesQuery);
          const categories: Category[] = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            const category: Category = {
              id: doc.id,
              name: data.name,
              icon: data.icon,
              storeId: data.storeId,
              order: data.order,
              items: [], // 메뉴 아이템은 별도로 가져옴
            };
            categories.push(category);
          });

          set({ categories, isLoading: false });
        } catch (error: any) {
          console.error('카테고리 목록 가져오기 실패:', error);
          set({
            error: '카테고리 목록을 가져오는데 실패했습니다.',
            isLoading: false,
          });
        }
      },

      // 카테고리 생성
      createCategory: async (data: CreateCategoryData) => {
        set({ isLoading: true, error: null });

        try {
          const { categories } = get();
          const order = categories.length;

          const categoryData = {
            ...data,
            order,
            items: [],
          };

          const docRef = await addDoc(collection(db, 'categories'), categoryData);

          const newCategory: Category = {
            id: docRef.id,
            ...categoryData,
          };

          set(state => ({
            categories: [...state.categories, newCategory],
            isLoading: false,
          }));

          return docRef.id;
        } catch (error: any) {
          console.error('카테고리 생성 실패:', error);
          set({
            error: '카테고리 생성에 실패했습니다.',
            isLoading: false,
          });
          throw error;
        }
      },

      // 카테고리 수정
      updateCategory: async (categoryId: string, data: UpdateCategoryData) => {
        set({ isLoading: true, error: null });

        try {
          const updateData: any = { ...data };
          await updateDoc(doc(db, 'categories', categoryId), updateData);

          set(state => ({
            categories: state.categories.map(category =>
              category.id === categoryId
                ? { ...category, ...data }
                : category,
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('카테고리 수정 실패:', error);
          set({
            error: '카테고리 수정에 실패했습니다.',
            isLoading: false,
          });
          throw error;
        }
      },

      // 카테고리 삭제
      deleteCategory: async (categoryId: string) => {
        set({ isLoading: true, error: null });

        try {
          // 해당 카테고리의 메뉴 아이템들도 삭제
          const menuItemsQuery = query(
            collection(db, 'menuItems'),
            where('categoryId', '==', categoryId),
          );

          const menuItemsSnapshot = await getDocs(menuItemsQuery);
          const deletePromises = menuItemsSnapshot.docs.map(doc =>
            deleteDoc(doc.ref)
          );
          await Promise.all(deletePromises);

          // 카테고리 삭제
          await deleteDoc(doc(db, 'categories', categoryId));

          set(state => ({
            categories: state.categories.filter(category => category.id !== categoryId),
            menuItems: state.menuItems.filter(item => item.categoryId !== categoryId),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('카테고리 삭제 실패:', error);
          set({
            error: '카테고리 삭제에 실패했습니다.',
            isLoading: false,
          });
          throw error;
        }
      },

      // 카테고리 순서 변경
      reorderCategories: async (storeId: string, categoryIds: string[]) => {
        set({ isLoading: true, error: null });

        try {
          const updatePromises = categoryIds.map((id, index) =>
            updateDoc(doc(db, 'categories', id), { order: index })
          );

          await Promise.all(updatePromises);

          set(state => ({
            categories: state.categories
              .map(category => ({
                ...category,
                order: categoryIds.indexOf(category.id),
              }))
              .sort((a, b) => a.order - b.order),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('카테고리 순서 변경 실패:', error);
          set({
            error: '카테고리 순서 변경에 실패했습니다.',
            isLoading: false,
          });
          throw error;
        }
      },

      // 메뉴 아이템 목록 가져오기
      fetchMenuItems: async (categoryId?: string) => {
        set({ isLoading: true, error: null });

        try {
          let menuItemsQuery;

          if (categoryId) {
            menuItemsQuery = query(
              collection(db, 'menuItems'),
              where('categoryId', '==', categoryId),
              orderBy('order', 'asc'),
            );
          } else {
            const { currentStore } = get();
            if (!currentStore) {
              set({ isLoading: false });
              return;
            }

            menuItemsQuery = query(
              collection(db, 'menuItems'),
              where('storeId', '==', currentStore.id),
              orderBy('order', 'asc'),
            );
          }

          const querySnapshot = await getDocs(menuItemsQuery);
          const menuItems: MenuItem[] = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            menuItems.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            } as MenuItem);
          });

          set({ menuItems, isLoading: false });
        } catch (error: any) {
          console.error('메뉴 아이템 목록 가져오기 실패:', error);
          set({
            error: '메뉴 목록을 가져오는데 실패했습니다.',
            isLoading: false,
          });
        }
      },

      // 메뉴 아이템 생성
      createMenuItem: async (data: CreateMenuItemData) => {
        set({ isLoading: true, error: null });

        try {
          const { menuItems } = get();
          const categoryItems = menuItems.filter(item => item.categoryId === data.categoryId);
          const order = categoryItems.length;

          const menuItemData = {
            ...data,
            options: data.options || [],
            allergens: data.allergens || [],
            isPopular: data.isPopular || false,
            isAvailable: data.isAvailable !== false, // 기본값 true
            order,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const docRef = await addDoc(collection(db, 'menuItems'), menuItemData);

          const newMenuItem: MenuItem = {
            id: docRef.id,
            ...menuItemData,
          };

          set(state => ({
            menuItems: [...state.menuItems, newMenuItem],
            isLoading: false,
          }));

          return docRef.id;
        } catch (error: any) {
          console.error('메뉴 아이템 생성 실패:', error);
          set({
            error: '메뉴 생성에 실패했습니다.',
            isLoading: false,
          });
          throw error;
        }
      },

      // 메뉴 아이템 수정
      updateMenuItem: async (itemId: string, data: UpdateMenuItemData) => {
        set({ isLoading: true, error: null });

        try {
          const updateData: any = {
            ...data,
            updatedAt: new Date(),
          };

          await updateDoc(doc(db, 'menuItems', itemId), updateData);

          set(state => ({
            menuItems: state.menuItems.map(item =>
              item.id === itemId
                ? { ...item, ...updateData }
                : item,
            ),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('메뉴 아이템 수정 실패:', error);
          set({
            error: '메뉴 수정에 실패했습니다.',
            isLoading: false,
          });
          throw error;
        }
      },

      // 메뉴 아이템 삭제
      deleteMenuItem: async (itemId: string) => {
        set({ isLoading: true, error: null });

        try {
          await deleteDoc(doc(db, 'menuItems', itemId));

          set(state => ({
            menuItems: state.menuItems.filter(item => item.id !== itemId),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('메뉴 아이템 삭제 실패:', error);
          set({
            error: '메뉴 삭제에 실패했습니다.',
            isLoading: false,
          });
          throw error;
        }
      },

      // 메뉴 아이템 순서 변경
      reorderMenuItems: async (categoryId: string, itemIds: string[]) => {
        set({ isLoading: true, error: null });

        try {
          const updatePromises = itemIds.map((id, index) =>
            updateDoc(doc(db, 'menuItems', id), { order: index })
          );

          await Promise.all(updatePromises);

          set(state => ({
            menuItems: state.menuItems
              .map(item => ({
                ...item,
                order: item.categoryId === categoryId
                  ? itemIds.indexOf(item.id)
                  : item.order,
              }))
              .sort((a, b) => a.order - b.order),
            isLoading: false,
          }));
        } catch (error: any) {
          console.error('메뉴 순서 변경 실패:', error);
          set({
            error: '메뉴 순서 변경에 실패했습니다.',
            isLoading: false,
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
    },
  ),
); 
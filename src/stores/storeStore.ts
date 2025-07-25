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
  onSnapshot,
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
  // 실시간 동기화를 위한 구독 관리
  storesUnsubscribe: (() => void) | null;
  categoriesUnsubscribe: (() => void) | null;
  menuItemsUnsubscribe: (() => void) | null;
}

interface StoreActions {
  // 매장 목록 관리
  fetchStores: (ownerId: string) => Promise<void>;
  fetchStore: (storeId: string) => Promise<Store | null>;
  subscribeToStores: (ownerId: string) => void;
  unsubscribeFromStores: () => void;

  // 매장 CRUD
  createStore: (data: CreateStoreData, ownerId: string) => Promise<string>;
  updateStore: (storeId: string, data: UpdateStoreData) => Promise<void>;
  deleteStore: (storeId: string) => Promise<void>;

  // 카테고리 관리
  fetchCategories: (storeId: string) => Promise<void>;
  subscribeToCategories: (storeId: string) => void;
  unsubscribeFromCategories: () => void;
  createCategory: (data: CreateCategoryData) => Promise<string>;
  updateCategory: (categoryId: string, data: UpdateCategoryData) => Promise<void>;
  deleteCategory: (categoryId: string) => Promise<void>;
  reorderCategories: (storeId: string, categoryIds: string[]) => Promise<void>;

  // 메뉴 아이템 관리
  fetchMenuItems: (categoryId?: string) => Promise<void>;
  subscribeToMenuItems: (storeId: string) => void;
  unsubscribeFromMenuItems: () => void;
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
      // 실시간 동기화를 위한 구독 관리
      storesUnsubscribe: null,
      categoriesUnsubscribe: null,
      menuItemsUnsubscribe: null,

      // 매장 목록 가져오기 (일회성)
      fetchStores: async (ownerId: string) => {
        set({ isLoading: true, error: null });
        console.log('🔍 매장 목록 가져오기 시작:', { ownerId });

        try {
          const storesQuery = query(
            collection(db, 'stores'),
            where('ownerId', '==', ownerId),
            // orderBy 제거 - Firebase 인덱스 문제 해결
          );

          const querySnapshot = await getDocs(storesQuery);
          const stores: Store[] = [];

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log('📄 매장 데이터:', { id: doc.id, data });
            stores.push({
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
            } as Store);
          });

          // 클라이언트에서 정렬 (createdAt 기준 내림차순)
          stores.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

          console.log('✅ 매장 목록 가져오기 성공:', { count: stores.length, stores });
          set({ stores, isLoading: false });
        } catch (error: any) {
          console.error('❌ 매장 목록 가져오기 실패:', error);
          set({
            error: '매장 목록을 가져오는데 실패했습니다.',
            isLoading: false,
          });
        }
      },

      // 매장 목록 실시간 구독
      subscribeToStores: (ownerId: string) => {
        console.log('🔔 매장 목록 실시간 구독 시작:', { ownerId });

        // 기존 구독 해제
        const { storesUnsubscribe } = get();
        if (storesUnsubscribe) {
          storesUnsubscribe();
        }

        try {
          const storesQuery = query(
            collection(db, 'stores'),
            where('ownerId', '==', ownerId),
          );

          const unsubscribe = onSnapshot(storesQuery, (querySnapshot) => {
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

            // 클라이언트에서 정렬 (createdAt 기준 내림차순)
            stores.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

            console.log('🔄 매장 목록 실시간 업데이트:', { count: stores.length, stores });
            set({ stores, isLoading: false });
          }, (error) => {
            console.error('❌ 매장 목록 실시간 구독 실패:', error);
            set({
              error: '매장 목록 실시간 동기화에 실패했습니다.',
              isLoading: false,
            });
          });

          set({ storesUnsubscribe: unsubscribe });
        } catch (error: any) {
          console.error('❌ 매장 목록 구독 설정 실패:', error);
          set({
            error: '매장 목록 구독 설정에 실패했습니다.',
            isLoading: false,
          });
        }
      },

      // 매장 목록 구독 해제
      unsubscribeFromStores: () => {
        const { storesUnsubscribe } = get();
        if (storesUnsubscribe) {
          console.log('🔕 매장 목록 구독 해제');
          storesUnsubscribe();
          set({ storesUnsubscribe: null });
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
        console.log('🏪 매장 생성 시작:', { data, ownerId });

        try {
          const storeData = {
            ...data,
            ownerId,
            isOpen: true,
            categories: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          console.log('📝 Firestore에 저장할 데이터:', storeData);
          const docRef = await addDoc(collection(db, 'stores'), storeData);
          console.log('✅ Firestore 저장 완료:', { docId: docRef.id });

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
          console.error('❌ 매장 생성 실패:', error);
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

      // 카테고리 목록 가져오기 (일회성)
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

      // 카테고리 실시간 구독 (메뉴 아이템 개수 포함)
      subscribeToCategories: (storeId: string) => {
        console.log('🔔 카테고리 실시간 구독 시작:', { storeId });

        // 기존 구독 해제
        const { categoriesUnsubscribe } = get();
        if (categoriesUnsubscribe) {
          categoriesUnsubscribe();
        }

        try {
          // orderBy 제거하여 Firebase 인덱스 문제 해결
          const categoriesQuery = query(
            collection(db, 'categories'),
            where('storeId', '==', storeId),
          );

          const unsubscribe = onSnapshot(categoriesQuery, async (querySnapshot) => {
            const categories: Category[] = [];

            // 카테고리 데이터 처리
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              const category: Category = {
                id: doc.id,
                name: data.name,
                icon: data.icon,
                storeId: data.storeId,
                order: data.order,
                items: [], // 임시로 빈 배열 설정
              };
              categories.push(category);
            });

            // 각 카테고리별 메뉴 아이템 개수 가져오기
            const categoriesWithItems = await Promise.all(
              categories.map(async (category) => {
                try {
                  const menuItemsQuery = query(
                    collection(db, 'menuItems'),
                    where('categoryId', '==', category.id),
                  );
                  const menuItemsSnapshot = await getDocs(menuItemsQuery);

                  return {
                    ...category,
                    items: menuItemsSnapshot.docs.map(doc => ({
                      id: doc.id,
                      ...doc.data(),
                    })) as MenuItem[],
                  };
                } catch (error) {
                  console.error(`카테고리 ${category.id} 메뉴 아이템 가져오기 실패:`, error);
                  return category;
                }
              })
            );

            // 클라이언트에서 정렬 (order 기준 오름차순)
            categoriesWithItems.sort((a, b) => (a.order || 0) - (b.order || 0));

            console.log('🔄 카테고리 실시간 업데이트:', {
              count: categoriesWithItems.length,
              categories: categoriesWithItems.map(c => ({
                id: c.id,
                name: c.name,
                itemCount: c.items.length
              }))
            });
            set({ categories: categoriesWithItems, isLoading: false });
          }, (error) => {
            console.error('❌ 카테고리 실시간 구독 실패:', error);
            // 에러 발생 시 구독 해제
            const { categoriesUnsubscribe: currentUnsubscribe } = get();
            if (currentUnsubscribe) {
              currentUnsubscribe();
            }
            set({
              error: '카테고리 실시간 동기화에 실패했습니다.',
              isLoading: false,
              categoriesUnsubscribe: null,
            });
          });

          set({ categoriesUnsubscribe: unsubscribe });
        } catch (error: any) {
          console.error('❌ 카테고리 구독 설정 실패:', error);
          set({
            error: '카테고리 구독 설정에 실패했습니다.',
            isLoading: false,
          });
        }
      },

      // 카테고리 구독 해제
      unsubscribeFromCategories: () => {
        const { categoriesUnsubscribe } = get();
        if (categoriesUnsubscribe) {
          console.log('🔕 카테고리 구독 해제');
          categoriesUnsubscribe();
          set({ categoriesUnsubscribe: null });
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
      reorderCategories: async (_storeId: string, categoryIds: string[]) => {
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

      // 메뉴 아이템 목록 가져오기 (일회성)
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

      // 메뉴 아이템 실시간 구독
      subscribeToMenuItems: (storeId: string) => {
        console.log('🔔 메뉴 아이템 실시간 구독 시작:', { storeId });

        // 기존 구독 해제
        const { menuItemsUnsubscribe } = get();
        if (menuItemsUnsubscribe) {
          menuItemsUnsubscribe();
        }

        try {
          // orderBy 제거하여 Firebase 인덱스 문제 해결
          const menuItemsQuery = query(
            collection(db, 'menuItems'),
            where('storeId', '==', storeId),
          );

          const unsubscribe = onSnapshot(menuItemsQuery, (querySnapshot) => {
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

            // 클라이언트에서 정렬 (order 기준 오름차순)
            menuItems.sort((a, b) => (a.order || 0) - (b.order || 0));

            console.log('🔄 메뉴 아이템 실시간 업데이트:', { count: menuItems.length, menuItems });
            set({ menuItems, isLoading: false });
          }, (error) => {
            console.error('❌ 메뉴 아이템 실시간 구독 실패:', error);
            // 에러 발생 시 구독 해제
            const { menuItemsUnsubscribe: currentUnsubscribe } = get();
            if (currentUnsubscribe) {
              currentUnsubscribe();
            }
            set({
              error: '메뉴 아이템 실시간 동기화에 실패했습니다.',
              isLoading: false,
              menuItemsUnsubscribe: null,
            });
          });

          set({ menuItemsUnsubscribe: unsubscribe });
        } catch (error: any) {
          console.error('❌ 메뉴 아이템 구독 설정 실패:', error);
          set({
            error: '메뉴 아이템 구독 설정에 실패했습니다.',
            isLoading: false,
          });
        }
      },

      // 메뉴 아이템 구독 해제
      unsubscribeFromMenuItems: () => {
        const { menuItemsUnsubscribe } = get();
        if (menuItemsUnsubscribe) {
          console.log('🔕 메뉴 아이템 구독 해제');
          menuItemsUnsubscribe();
          set({ menuItemsUnsubscribe: null });
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
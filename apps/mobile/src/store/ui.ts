import { create } from 'zustand';

interface UIState {
  // Loading states
  isAppLoading: boolean;
  isRefreshing: boolean;
  
  // Modal states
  isCreateBridgeModalOpen: boolean;
  isImagePickerModalOpen: boolean;
  
  // Notification states
  unreadNotificationsCount: number;
  
  // Network state
  isOnline: boolean;
  
  // Theme state
  isDarkMode: boolean;
}

interface UIActions {
  // Loading actions
  setAppLoading: (loading: boolean) => void;
  setRefreshing: (refreshing: boolean) => void;
  
  // Modal actions
  openCreateBridgeModal: () => void;
  closeCreateBridgeModal: () => void;
  openImagePickerModal: () => void;
  closeImagePickerModal: () => void;
  
  // Notification actions
  setUnreadNotificationsCount: (count: number) => void;
  incrementUnreadNotifications: () => void;
  clearUnreadNotifications: () => void;
  
  // Network actions
  setOnline: (online: boolean) => void;
  
  // Theme actions
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
}

export const useUIStore = create<UIState & UIActions>((set, get) => ({
  // State
  isAppLoading: true,
  isRefreshing: false,
  isCreateBridgeModalOpen: false,
  isImagePickerModalOpen: false,
  unreadNotificationsCount: 0,
  isOnline: true,
  isDarkMode: false,

  // Actions
  setAppLoading: (loading) => set({ isAppLoading: loading }),
  
  setRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
  
  openCreateBridgeModal: () => set({ isCreateBridgeModalOpen: true }),
  
  closeCreateBridgeModal: () => set({ isCreateBridgeModalOpen: false }),
  
  openImagePickerModal: () => set({ isImagePickerModalOpen: true }),
  
  closeImagePickerModal: () => set({ isImagePickerModalOpen: false }),
  
  setUnreadNotificationsCount: (count) => set({ unreadNotificationsCount: count }),
  
  incrementUnreadNotifications: () => {
    const current = get().unreadNotificationsCount;
    set({ unreadNotificationsCount: current + 1 });
  },
  
  clearUnreadNotifications: () => set({ unreadNotificationsCount: 0 }),
  
  setOnline: (online) => set({ isOnline: online }),
  
  toggleDarkMode: () => {
    const current = get().isDarkMode;
    set({ isDarkMode: !current });
  },
  
  setDarkMode: (darkMode) => set({ isDarkMode: darkMode }),
}));



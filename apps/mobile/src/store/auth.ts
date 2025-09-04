import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthTokens } from '@/types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  get isAuthenticated(): boolean;
}

interface AuthActions {
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  login: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      tokens: null,
      isLoading: false,
      
      // Computed property
      get isAuthenticated() {
        const state = get();
        return !!(state.user && state.tokens?.accessToken);
      },

      // Actions
      setUser: (user) => set({ user }),
      
      setTokens: (tokens) => set({ tokens }),
      
      login: (user, tokens) => {
        console.log('Login action called with:', { user, tokens });
        console.log('Setting auth state...');
        set({
          user,
          tokens,
          isLoading: false,
        });
        console.log('Auth state set successfully');
      },
      
      logout: () => {
        console.log('Logout action called');
        set({
          user: null,
          tokens: null,
          isLoading: false,
        });
      },
      
      clearAuth: () => {
        console.log('Clear auth action called');
        set({
          user: null,
          tokens: null,
          isLoading: false,
        });
        // Clear AsyncStorage
        AsyncStorage.removeItem('auth-storage');
      },
      
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        // Don't persist isAuthenticated - calculate it from user and tokens
      }),
      onRehydrateStorage: () => (state) => {
        // Verify token validity when rehydrating from storage
        if (state?.tokens?.accessToken) {
          try {
            // Check if token is expired
            const tokenPayload = JSON.parse(atob(state.tokens.accessToken.split('.')[1]));
            const currentTime = Date.now() / 1000;
            
            if (tokenPayload.exp < currentTime) {
              console.log('Token expired, logging out');
              state.logout();
            }
          } catch (error) {
            console.log('Invalid token format, logging out');
            state.logout();
          }
        }
      },
    }
  )
);


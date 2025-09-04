import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      isDark: false,
      
      setMode: (mode: ThemeMode) => {
        set({ mode });
        
        // Update isDark based on mode
        if (mode === 'dark') {
          set({ isDark: true });
        } else if (mode === 'light') {
          set({ isDark: false });
        } else {
          // For system mode, we'll need to detect system preference
          // For now, default to light
          set({ isDark: false });
        }
      },
      
      toggleTheme: () => {
        const { isDark } = get();
        set({ 
          isDark: !isDark,
          mode: !isDark ? 'dark' : 'light'
        });
      },
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        mode: state.mode,
        isDark: state.isDark 
      }),
    }
  )
);

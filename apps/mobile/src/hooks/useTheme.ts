import { useThemeStore } from '@/store/theme';
import { getColors, colors as defaultColors } from '@/constants/colors';

export const useTheme = () => {
  try {
    const { mode, isDark, setMode, toggleTheme } = useThemeStore();
    const colors = getColors(isDark);

    return {
      mode,
      isDark,
      colors,
      setMode,
      toggleTheme,
    };
  } catch (error) {
    console.error('Error in useTheme hook:', error);
    // Return default theme if there's an error
    return {
      mode: 'light' as const,
      isDark: false,
      colors: defaultColors,
      setMode: () => {},
      toggleTheme: () => {},
    };
  }
};

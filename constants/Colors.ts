/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#FF7F00';
const tintColorDark = '#FF7F00';

export default {
  light: {
    text: '#333333',
    background: '#F5F5F5',
    tint: tintColorLight,
    tabIconDefault: '#666666',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF',
    background: '#1A1A1A',
    tint: tintColorDark,
    tabIconDefault: '#999999',
    tabIconSelected: tintColorDark,
  },
};

// Paleta de colores del diseño
export const Colors = {
  // Color Primario
  primary: '#FF7F00',
  
  // Colores Secundarios
  secondary: '#3498DB',
  accent: '#FFD700',
  
  // Colores Neutros
  neutral: {
    light: '#F5F5F5',
    dark: '#333333',
    gray: '#666666',
    lightGray: '#CCCCCC',
  },
  
  // Colores de Acento
  success: '#2ECC71',
  error: '#E74C3C',
  
  // Colores de fondo
  background: '#F5F5F5',
  card: '#FFFFFF',
  
  // Colores de texto
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
    white: '#FFFFFF',
  },
  
  // Colores de botones
  button: {
    primary: '#FF7F00',
    secondary: '#3498DB',
    success: '#2ECC71',
    error: '#E74C3C',
    disabled: '#CCCCCC',
  },
  
  // Colores de estado
  status: {
    online: '#2ECC71',
    offline: '#E74C3C',
    pending: '#FFD700',
  },
};

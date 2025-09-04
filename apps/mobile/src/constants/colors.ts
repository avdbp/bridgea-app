// Paleta de colores de Bridgea - basada en el diseño original
export const lightColors = {
  // Colores principales
  primary: '#007AFF', // Azul iOS
  primaryDark: '#0056CC',
  primaryLight: '#4DA6FF',
  
  // Colores secundarios
  secondary: '#34C759', // Verde iOS
  secondaryDark: '#28A745',
  secondaryLight: '#5DD679',
  
  // Colores de fondo
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  backgroundTertiary: '#FFFFFF',
  surface: '#FFFFFF',
  
  // Colores de texto
  text: '#000000',
  textSecondary: '#8E8E93',
  textTertiary: '#C7C7CC',
  
  // Colores de estado
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',
  
  // Colores de borde
  border: '#C6C6C8',
  borderLight: '#E5E5EA',
  
  // Colores de sombra
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  
  // Colores de overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  
  // Colores de navegación
  tabBarActive: '#007AFF',
  tabBarInactive: '#8E8E93',
  tabBarBackground: '#FFFFFF',
  
  // Colores de botones
  buttonPrimary: '#007AFF',
  buttonSecondary: '#F2F2F7',
  buttonDanger: '#FF3B30',
  buttonSuccess: '#34C759',
  
  // Colores de input
  inputBackground: '#F2F2F7',
  inputBorder: '#C6C6C8',
  inputFocus: '#007AFF',
  
  // Colores de notificación
  notificationBackground: '#FF3B30',
  notificationText: '#FFFFFF',
  
  // Colores adicionales
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const darkColors = {
  // Colores principales
  primary: '#0A84FF', // Azul iOS oscuro
  primaryDark: '#0056CC',
  primaryLight: '#4DA6FF',
  
  // Colores secundarios
  secondary: '#30D158', // Verde iOS oscuro
  secondaryDark: '#28A745',
  secondaryLight: '#5DD679',
  
  // Colores de fondo
  background: '#000000',
  backgroundSecondary: '#1C1C1E',
  backgroundTertiary: '#2C2C2E',
  surface: '#1C1C1E',
  
  // Colores de texto
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#48484A',
  
  // Colores de estado
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#0A84FF',
  
  // Colores de borde
  border: '#38383A',
  borderLight: '#2C2C2E',
  
  // Colores de sombra
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  
  // Colores de overlay
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayLight: 'rgba(0, 0, 0, 0.5)',
  
  // Colores de navegación
  tabBarActive: '#0A84FF',
  tabBarInactive: '#8E8E93',
  tabBarBackground: '#1C1C1E',
  
  // Colores de botones
  buttonPrimary: '#0A84FF',
  buttonSecondary: '#2C2C2E',
  buttonDanger: '#FF453A',
  buttonSuccess: '#30D158',
  
  // Colores de input
  inputBackground: '#2C2C2E',
  inputBorder: '#38383A',
  inputFocus: '#0A84FF',
  
  // Colores de notificación
  notificationBackground: '#FF453A',
  notificationText: '#FFFFFF',
  
  // Colores adicionales
  white: '#FFFFFF',
  black: '#000000',
} as const;

// Función para obtener colores basados en el tema
export const getColors = (isDark: boolean) => {
  return isDark ? darkColors : lightColors;
};

// Exportar colores por defecto (modo claro)
export const colors = lightColors;

export type ColorKey = keyof typeof colors;


import { Platform } from 'react-native';

// Familia de fuentes
export const FontFamily = {
  regular: Platform.OS === 'ios' ? 'Roboto-Regular' : 'Roboto',
  medium: Platform.OS === 'ios' ? 'Roboto-Medium' : 'Roboto-Medium',
  bold: Platform.OS === 'ios' ? 'Roboto-Bold' : 'Roboto-Bold',
  light: Platform.OS === 'ios' ? 'Roboto-Light' : 'Roboto-Light',
};

// Tamaños de fuente según el diseño
export const FontSizes = {
  // Títulos Grandes / Encabezados de Sección
  largeTitle: {
    min: 24,
    max: 32,
    default: 28,
  },
  
  // Títulos de Tarjeta / Nombres de Usuario
  cardTitle: {
    min: 18,
    max: 20,
    default: 18,
  },
  
  // Cuerpo de Texto Principal / Párrafos
  body: {
    min: 14,
    max: 16,
    default: 16,
  },
  
  // Texto Secundario / Etiquetas / Subtítulos Pequeños
  secondary: {
    min: 10,
    max: 12,
    default: 12,
  },
  
  // Botones
  button: {
    min: 14,
    max: 16,
    default: 16,
  },
};

// Estilos de texto predefinidos
export const TextStyles = {
  largeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSizes.largeTitle.default,
    color: '#333333',
  },
  
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSizes.cardTitle.default,
    color: '#333333',
  },
  
  body: {
    fontFamily: FontFamily.regular,
    fontSize: FontSizes.body.default,
    color: '#333333',
    lineHeight: 22,
  },
  
  secondary: {
    fontFamily: FontFamily.regular,
    fontSize: FontSizes.secondary.default,
    color: '#666666',
  },
  
  button: {
    fontFamily: FontFamily.medium,
    fontSize: FontSizes.button.default,
    color: '#FFFFFF',
  },
  
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: FontSizes.secondary.min,
    color: '#999999',
  },
}; 
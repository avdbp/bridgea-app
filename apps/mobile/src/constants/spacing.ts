export const spacing = {
  // Espaciado base
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  '4xl': 96,
  
  // Espaciado específico para componentes
  screenPadding: 16,
  cardPadding: 16,
  buttonPadding: 12,
  inputPadding: 12,
  
  // Espaciado para listas
  listItemSpacing: 12,
  sectionSpacing: 24,
  
  // Espaciado para navegación
  tabBarHeight: 60,
  headerHeight: 44,
  
  // Espaciado para bordes
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  // Espaciado para sombras
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowRadius: 4,
  elevation: 3,
} as const;

export type Spacing = keyof typeof spacing;
export type BorderRadius = keyof typeof spacing.borderRadius;



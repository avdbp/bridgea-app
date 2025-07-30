# Sistema de Diseño - Bridgea

## 🎨 **Paleta de Colores**

### **Color Primario**
- **Hex**: `#FF7F00` (Naranja)
- **Uso**: Botones de acción principales (CTA), encabezados importantes, elementos interactivos clave, logo

### **Colores Secundarios**
- **Azul**: `#3498DB`
  - **Uso**: Fondos de secciones, iconos informativos, enlaces, elementos de navegación secundarios
- **Amarillo**: `#FFD700`
  - **Uso**: Elementos de acento, notificaciones, iconos de estado (ej. "en línea"), pequeños detalles que quieres que destaquen

### **Colores Neutros**
- **Gris Claro**: `#F5F5F5`
  - **Uso**: Fondos de pantalla, tarjetas de contenido, separadores
- **Gris Oscuro**: `#333333`
  - **Uso**: Texto principal, iconos generales, bordes sutiles

### **Colores de Acento**
- **Verde**: `#2ECC71`
  - **Uso**: Mensajes de éxito, confirmaciones, indicadores de "conectado" o "match"
- **Rojo**: `#E74C3C`
  - **Uso**: Mensajes de error (ej. "Contraseña incorrecta", "Fallo al enviar")

## 📝 **Tipografía**

### **Familia de Fuentes**
- **Principal**: `Roboto`
- **Variantes**: Regular, Medium, Bold, Light

### **Tamaños de Fuente**

#### **Títulos Grandes / Encabezados de Sección**
- **Rango**: 24px - 32px
- **Default**: 28px
- **Uso**: Títulos principales de páginas, encabezados de secciones importantes

#### **Títulos de Tarjeta / Nombres de Usuario**
- **Rango**: 18px - 20px
- **Default**: 18px
- **Uso**: Títulos de tarjetas, nombres de usuario, encabezados secundarios

#### **Cuerpo de Texto Principal / Párrafos**
- **Rango**: 14px - 16px
- **Default**: 16px
- **Uso**: Texto principal, párrafos, descripciones

#### **Texto Secundario / Etiquetas / Subtítulos Pequeños**
- **Rango**: 10px - 12px
- **Default**: 12px
- **Uso**: Etiquetas, subtítulos pequeños, texto secundario

#### **Botones**
- **Rango**: 14px - 16px
- **Default**: 16px
- **Uso**: Texto de botones, elementos interactivos

## 🏗️ **Implementación Técnica**

### **Archivos de Constantes**

#### **`constants/Colors.ts`**
```typescript
export const Colors = {
  primary: '#FF7F00',
  secondary: '#3498DB',
  accent: '#FFD700',
  neutral: {
    light: '#F5F5F5',
    dark: '#333333',
    gray: '#666666',
    lightGray: '#CCCCCC',
  },
  success: '#2ECC71',
  error: '#E74C3C',
  // ... más colores
};
```

#### **`constants/Typography.ts`**
```typescript
export const FontFamily = {
  regular: 'Roboto-Regular',
  medium: 'Roboto-Medium',
  bold: 'Roboto-Bold',
  light: 'Roboto-Light',
};

export const TextStyles = {
  largeTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    color: '#333333',
  },
  // ... más estilos
};
```

### **Uso en Componentes**

#### **Importación**
```typescript
import { Colors } from "../constants/Colors";
import { TextStyles } from "../constants/Typography";
```

#### **Aplicación de Estilos**
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background,
  },
  title: {
    ...TextStyles.largeTitle,
  },
  button: {
    backgroundColor: Colors.primary,
  },
});
```

## 🎯 **Componentes Actualizados**

### **✅ Páginas Actualizadas**
- ✅ **Perfil de Usuario** (`app/user/[username].tsx`)
  - BottomNav agregado
  - Nueva paleta de colores aplicada
  - Tipografías actualizadas
  - Diseño de tarjetas mejorado

- ✅ **Bridges** (`app/bridges.tsx`)
  - Paleta de colores actualizada
  - Tipografías consistentes
  - Botones de eliminar con colores del sistema

- ✅ **BottomNav** (`components/BottomNav.tsx`)
  - Colores del sistema aplicados
  - Tipografías consistentes
  - Iconos y textos mejorados

### **🔄 Páginas Pendientes de Actualización**
- 🔄 **Login** (`app/(auth)/login.tsx`)
- 🔄 **Register** (`app/(auth)/register.tsx`)
- 🔄 **Home** (`app/home.tsx`)
- 🔄 **Search** (`app/search.tsx`)
- 🔄 **Profile** (`app/profile.tsx`)
- 🔄 **Create Bridge** (`app/create-bridge.tsx`)

## 📱 **Elementos de UI**

### **Botones**
- **Primario**: Fondo naranja (`#FF7F00`), texto blanco
- **Secundario**: Fondo azul (`#3498DB`), texto blanco
- **Error**: Fondo rojo (`#E74C3C`), texto blanco
- **Deshabilitado**: Fondo gris (`#CCCCCC`), texto gris

### **Tarjetas**
- **Fondo**: Blanco (`#FFFFFF`)
- **Sombra**: Sutil con opacidad 0.1
- **Bordes**: Redondeados (12px)
- **Padding**: 16px

### **Navegación**
- **Fondo**: Blanco (`#FFFFFF`)
- **Borde superior**: Gris claro (`#CCCCCC`)
- **Iconos activos**: Naranja (`#FF7F00`)
- **Iconos inactivos**: Gris (`#666666`)

## 🚀 **Próximos Pasos**

1. **Actualizar páginas restantes** con la nueva paleta
2. **Implementar modo oscuro** usando las variantes dark
3. **Crear componentes reutilizables** (Button, Card, Input)
4. **Optimizar para diferentes tamaños de pantalla**
5. **Agregar animaciones** consistentes con el diseño

## 📊 **Beneficios del Sistema**

- ✅ **Consistencia visual** en toda la aplicación
- ✅ **Mantenimiento fácil** desde archivos centralizados
- ✅ **Escalabilidad** para futuras actualizaciones
- ✅ **Accesibilidad** mejorada con contrastes apropiados
- ✅ **Experiencia de usuario** coherente 
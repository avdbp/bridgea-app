# 🔧 Configuración de Cloudinary para Eliminación de Imágenes

## 📋 Requisitos

Para habilitar la eliminación automática de imágenes en Cloudinary, necesitas configurar las credenciales de API.

## 🔑 Configuración de Credenciales

### 1. Obtener Credenciales de Cloudinary

1. Ve a tu [Dashboard de Cloudinary](https://cloudinary.com/console)
2. En la sección **Account Details**, encuentra:
   - **Cloud Name**: `dqqddecpb`
   - **API Key**: Tu clave de API
   - **API Secret**: Tu secreto de API

### 2. Configurar Variables de Entorno

Crea o modifica el archivo `.env` en la raíz del proyecto:

```env
# Cloudinary API Credentials
EXPO_PUBLIC_CLOUDINARY_API_KEY=tu_api_key_aqui
EXPO_PUBLIC_CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

### 3. Configurar Presets

Asegúrate de que tienes configurados los siguientes presets en Cloudinary:

#### 📁 Preset para Perfiles
- **Nombre**: `bridgea-profiles`
- **Carpeta**: `profile/`
- **Configuración**: Sin firmar (unsigned)

#### 🌉 Preset para Bridges
- **Nombre**: `bridgea-bridges`
- **Carpeta**: `bridges/`
- **Configuración**: Sin firmar (unsigned)

## 🗑️ Funcionalidad de Eliminación

Una vez configuradas las credenciales, las siguientes acciones eliminarán automáticamente las imágenes de Cloudinary:

### 👤 Cambio de Foto de Perfil
- Se elimina la imagen anterior cuando se sube una nueva
- **Carpeta**: `profile/`

### 🌉 Eliminación de Bridge
- Se elimina la imagen cuando se borra un bridge
- **Carpeta**: `bridges/`

## 🔒 Seguridad

- Las credenciales de API se usan solo para eliminación
- Las subidas siguen usando presets sin firmar para mayor seguridad
- Las credenciales se almacenan en variables de entorno

## 🚨 Notas Importantes

1. **No compartas** las credenciales de API
2. **No subas** el archivo `.env` a Git
3. Las credenciales son necesarias solo para eliminación
4. Las subidas funcionan sin credenciales usando presets

## 🧪 Pruebas

Para verificar que la eliminación funciona:

1. Crear un bridge con imagen
2. Eliminar el bridge
3. Verificar en los logs: `✅ Imagen eliminada exitosamente`
4. Confirmar en Cloudinary que la imagen se eliminó

## ❌ Sin Credenciales

Si no configuras las credenciales:
- Las imágenes se seguirán subiendo normalmente
- Las eliminaciones mostrarán un mensaje de advertencia
- No se eliminarán imágenes de Cloudinary (se acumularán) 
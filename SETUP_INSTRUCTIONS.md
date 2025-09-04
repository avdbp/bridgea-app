# 🚀 Instrucciones para Ejecutar Bridgea App

## ✅ Estado Actual
- ✅ **Backend**: Completamente implementado con Fastify + TypeScript + MongoDB
- ✅ **Frontend**: Completamente implementado con Expo React Native + TypeScript
- ✅ **Dependencias**: Instaladas correctamente
- ✅ **Funcionalidades**: Mensajería, seguir usuarios, búsqueda, autenticación

## 🔧 Configuración Necesaria

### 1. Archivos de Entorno (.env)

#### Backend (`apps/api/.env`):
```bash
# Database
MONGODB_URI=mongodb+srv://rocketmediaes_db_user:yRCTORefCzg8jLT6@bridgea-app.xnoftdt.mongodb.net/?retryWrites=true&w=majority&appName=bridgea-app
MONGODB_DB=bridgea

# JWT
JWT_SECRET=el_que_tu_quieras_tu_decides_cual_sera_muy_seguro_y_largo
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=dqph2qm49
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
CLOUDINARY_UPLOAD_PRESET=bridgea_users

# Server
PORT=3001
NODE_ENV=development
CLIENT_URL=http://localhost:8081
ALLOWED_ORIGINS=http://localhost:8081,http://localhost:3000,exp://192.168.1.100:8081
```

#### Frontend (`apps/mobile/.env`):
```bash
# API Configuration
API_BASE_URL=http://localhost:3001/api/v1
SOCKET_URL=http://localhost:3002

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dqph2qm49
CLOUDINARY_UPLOAD_PRESET=bridgea_users

# App Configuration
APP_NAME=Bridgea
APP_VERSION=1.0.0
```

### 2. Configurar Cloudinary
1. Ve a [Cloudinary Console](https://console.cloudinary.com/)
2. Obtén tu `API_KEY` y `API_SECRET`
3. Reemplaza `tu_api_key_aqui` y `tu_api_secret_aqui` en el archivo `.env` del backend

## 🚀 Cómo Ejecutar la App

### Opción 1: Ejecutar Todo Junto (Recomendado)
```bash
# Desde la raíz del proyecto
npm run dev
```

### Opción 2: Ejecutar por Separado

#### Backend:
```bash
cd apps/api
npm run dev
```

#### Frontend:
```bash
cd apps/mobile
npm run dev
```

## 📱 Probar la App

### 1. Backend
- **API**: http://localhost:3001
- **Documentación**: http://localhost:3001/docs
- **Socket.IO**: http://localhost:3002

### 2. Frontend
- **Expo Dev Tools**: Se abrirá automáticamente
- **QR Code**: Escanea con Expo Go en tu móvil
- **Simulador**: Presiona `i` para iOS o `a` para Android

## 🎯 Funcionalidades Disponibles

### ✅ Implementadas y Funcionando:
1. **Autenticación**
   - Registro de usuarios
   - Login/Logout
   - Recuperación de contraseña

2. **Mensajería**
   - Chat en tiempo real
   - Lista de conversaciones
   - Notificaciones de mensajes

3. **Seguir Usuarios**
   - Buscar usuarios
   - Seguir/Dejar de seguir
   - Solicitudes de seguimiento
   - Lista de seguidores/seguidos

4. **Perfil de Usuario**
   - Ver perfil
   - Editar perfil
   - Configuración

### 🔄 En Desarrollo:
- Sistema de grupos
- Notificaciones push
- Feed de puentes (posts)

## 🐛 Solución de Problemas

### Error de Conexión a MongoDB:
- Verifica que la URI de MongoDB sea correcta
- Asegúrate de que la base de datos esté accesible

### Error de Cloudinary:
- Verifica las credenciales de Cloudinary
- Asegúrate de que el upload preset exista

### Error de Expo:
- Ejecuta `npx expo install --fix`
- Limpia la caché: `npx expo start --clear`

## 📋 Próximos Pasos

1. **Configurar archivos .env** (CRÍTICO)
2. **Configurar Cloudinary** (CRÍTICO)
3. **Ejecutar la app** y probar funcionalidades
4. **Implementar sistema de grupos** (opcional)
5. **Implementar notificaciones push** (opcional)

## 🎉 ¡Listo para Probar!

Una vez configurados los archivos `.env`, la app debería funcionar completamente con:
- ✅ Autenticación
- ✅ Mensajería en tiempo real
- ✅ Sistema de seguir usuarios
- ✅ Búsqueda de usuarios
- ✅ Navegación completa

**¡La app está prácticamente lista para usar!** 🚀



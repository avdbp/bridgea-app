# Bridgea App

Una aplicación de redes sociales moderna construida con React Native y Node.js.

## 🚀 Características

- **Autenticación**: Login, registro y gestión de sesiones
- **Perfiles de Usuario**: Edición de perfil, cambio de contraseña, configuración de privacidad
- **Sistema de Seguimiento**: Seguir/Dejar de seguir usuarios, solicitudes de seguimiento
- **Puentes (Posts)**: Crear, ver, dar like y comentar publicaciones con multimedia
- **Mensajería**: Chat individual en tiempo real con Socket.IO
- **Búsqueda**: Buscar usuarios por nombre o username
- **Notificaciones**: Notificaciones push y en tiempo real
- **Tema**: Modo claro y oscuro
- **Multimedia**: Subida de imágenes y videos con compresión

## 🛠️ Tecnologías

### Frontend (Mobile)
- React Native con Expo
- Expo Router para navegación
- Zustand para gestión de estado
- React Query para manejo de datos
- Socket.IO para comunicación en tiempo real
- TypeScript

### Backend (API)
- Node.js con Fastify
- MongoDB con Mongoose
- JWT para autenticación
- Cloudinary para gestión de multimedia
- Socket.IO para WebSockets
- TypeScript

## 📱 Estructura del Proyecto

```
bridgea-app/
├── apps/
│   ├── mobile/          # Aplicación móvil (React Native)
│   └── api/             # API Backend (Node.js)
├── package.json         # Configuración del monorepo
├── vercel.json         # Configuración de Vercel
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- npm o pnpm
- Expo CLI
- MongoDB Atlas
- Cuenta de Cloudinary

### 1. Clonar el repositorio
```bash
git clone https://github.com/avdbp/bridgea-app.git
cd bridgea-app
```

### 2. Instalar dependencias
```bash
# Instalar dependencias del monorepo
npm install

# Instalar dependencias del backend
cd apps/api
npm install

# Instalar dependencias del móvil
cd ../mobile
npm install
```

### 3. Configurar variables de entorno

#### Backend (apps/api/.env)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_BRIDGES_PRESET=your-bridges-preset
CLOUDINARY_PROFILES_PRESET=your-profiles-preset
DEFAULT_AVATAR_URL=https://res.cloudinary.com/your-cloud/image/upload/v1/profile_default_avatar
PORT=3001
NODE_ENV=development
```

#### Móvil (apps/mobile/.env)
```env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_SOCKET_URL=http://localhost:3003
```

### 4. Ejecutar el proyecto

#### Backend
```bash
cd apps/api
npm run dev
```

#### Móvil
```bash
cd apps/mobile
npx expo start
```

## 🌐 Despliegue

### Backend en Vercel
El backend está configurado para desplegarse automáticamente en Vercel.

### Móvil
Para construir la aplicación móvil:
```bash
cd apps/mobile
npx expo build:android
npx expo build:ios
```

## 📝 API Endpoints

### Autenticación
- `POST /api/v1/auth/register` - Registro de usuario
- `POST /api/v1/auth/login` - Inicio de sesión
- `POST /api/v1/auth/refresh` - Renovar token
- `POST /api/v1/auth/logout` - Cerrar sesión

### Usuarios
- `GET /api/v1/users/me` - Obtener perfil actual
- `PUT /api/v1/users/me` - Actualizar perfil
- `GET /api/v1/users/search` - Buscar usuarios
- `GET /api/v1/users/:username` - Obtener perfil de usuario

### Puentes (Posts)
- `GET /api/v1/bridges` - Obtener puentes
- `POST /api/v1/bridges` - Crear puente
- `GET /api/v1/bridges/:id` - Obtener puente específico
- `POST /api/v1/bridges/:id/like` - Dar like a puente
- `DELETE /api/v1/bridges/:id/like` - Quitar like

### Seguimiento
- `POST /api/v1/follows/:userId` - Seguir usuario
- `DELETE /api/v1/follows/:userId` - Dejar de seguir
- `GET /api/v1/follows/followers/:username` - Obtener seguidores
- `GET /api/v1/follows/following/:username` - Obtener siguiendo

### Mensajes
- `GET /api/v1/messages/conversations` - Obtener conversaciones
- `GET /api/v1/messages/:userId` - Obtener mensajes con usuario
- `POST /api/v1/messages` - Enviar mensaje

### Upload
- `POST /api/v1/upload` - Subir archivos multimedia

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

**Alejandro VDB**
- GitHub: [@avdbp](https://github.com/avdbp)

## 🙏 Agradecimientos

- Expo por el framework de React Native
- Fastify por el framework de Node.js
- MongoDB por la base de datos
- Cloudinary por el servicio de multimedia
- Vercel por el hosting
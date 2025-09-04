# Bridgea Backend - Vercel Deployment

## Variables de Entorno Requeridas

Configura las siguientes variables de entorno en Vercel:

### MongoDB
- `MONGODB_URI`: URI de conexión a MongoDB Atlas
- `MONGODB_DB`: Nombre de la base de datos

### JWT
- `JWT_SECRET`: Clave secreta para firmar tokens JWT
- `JWT_EXPIRES_IN`: Tiempo de expiración del token (ej: 7d)
- `REFRESH_TOKEN_EXPIRES_IN`: Tiempo de expiración del refresh token (ej: 30d)

### Cloudinary
- `CLOUDINARY_CLOUD_NAME`: Nombre de tu cloud en Cloudinary
- `CLOUDINARY_API_KEY`: API Key de Cloudinary
- `CLOUDINARY_API_SECRET`: API Secret de Cloudinary
- `CLOUDINARY_BRIDGES_PRESET`: Preset para imágenes de puentes
- `CLOUDINARY_PROFILES_PRESET`: Preset para imágenes de perfiles
- `DEFAULT_AVATAR_URL`: URL del avatar por defecto

### Server
- `PORT`: Puerto del servidor (Vercel lo maneja automáticamente)
- `NODE_ENV`: Entorno (production)

## Instalación

1. Instala las dependencias:
```bash
npm install
```

2. Configura las variables de entorno en Vercel

3. Despliega a Vercel:
```bash
vercel --prod
```

## Estructura

- `api/index.ts`: Punto de entrada principal para Vercel
- `apps/api/src/`: Código fuente del backend
- `vercel.json`: Configuración de Vercel


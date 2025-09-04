import Constants from 'expo-constants';

export const config = {
  // API Configuration
  API_BASE_URL: Constants.expoConfig?.extra?.apiBaseUrl || 'http://192.168.5.251:3001/api/v1',
  SOCKET_URL: Constants.expoConfig?.extra?.socketUrl || 'http://192.168.5.251:3003',
  
  // Cloudinary Configuration
  CLOUDINARY_CLOUD_NAME: Constants.expoConfig?.extra?.cloudinaryCloudName || 'dqqddecpb',
  CLOUDINARY_UPLOAD_PRESET: Constants.expoConfig?.extra?.cloudinaryUploadPreset || 'bridgea-bridges',
  
  // App Configuration
  APP_NAME: Constants.expoConfig?.extra?.appName || 'Bridgea',
  APP_VERSION: Constants.expoConfig?.extra?.appVersion || '1.0.0',
  APP_LOGO_URL: Constants.expoConfig?.extra?.appLogoUrl || 'https://res.cloudinary.com/dqqddecpb/image/upload/v1757017377/bridgea/defaults/bridgea_app_logo.png',
  DEFAULT_AVATAR_URL: Constants.expoConfig?.extra?.defaultAvatarUrl || 'https://res.cloudinary.com/dqqddecpb/image/upload/v1757017376/bridgea/defaults/bridgea_default_avatar.png',
} as const;


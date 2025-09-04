import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/bridgea',
  MONGODB_DB: process.env.MONGODB_DB || 'bridgea',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'bridgea-super-secret-jwt-key-for-authentication-2024',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '15m',
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || 'dqqddecpb',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '177891273267324',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '9i0RlHazxRJr4VnKc5TdvJj_vl4',
  CLOUDINARY_BRIDGES_PRESET: process.env.CLOUDINARY_BRIDGES_PRESET || 'bridgea-bridges',
  CLOUDINARY_PROFILES_PRESET: process.env.CLOUDINARY_PROFILES_PRESET || 'bridgea-profiles',
  DEFAULT_AVATAR_URL: process.env.DEFAULT_AVATAR_URL || 'https://res.cloudinary.com/dqqddecpb/image/upload/v1757017376/bridgea/defaults/bridgea_default_avatar.png',
  
  // Server
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // CORS
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:8081',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'http://localhost:8081,exp://192.168.1.100:8081,exp://192.168.5.251:8081,exp://localhost:8081',
  
  // Email (optional)
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
} as const;


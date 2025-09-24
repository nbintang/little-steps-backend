import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  frontendUrl: process.env.FRONTEND_URL,
  backendUrl: process.env.BACKEND_URL,
}));

export const authConfig = registerAs('auth', () => ({
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtVerificationSecret: process.env.JWT_VERIFICATION_SECRET,
  jwtTemporarySecret: process.env.JWT_TEMPORARY_SECRET,
  jwtResetPasswordSecret: process.env.JWT_RESET_PASSWORD_SECRET,
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
}));

export const mailConfig = registerAs('mail', () => ({
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT ?? '587', 10),
  from: process.env.EMAIL_FROM,
  secure: Boolean(process.env.EMAIL_SECURE),
}));

export const cloudinaryConfig = registerAs('cloudinary', () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.CLOUDINARY_API_KEY,
  apiSecret: process.env.CLOUDINARY_API_SECRET,
}));

export const globalConfig = [
  appConfig,
  authConfig,
  mailConfig,
  cloudinaryConfig,
];

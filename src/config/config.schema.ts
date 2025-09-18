import * as z from 'zod';

export const appConfigSchema = z.object({
  PORT: z.string().regex(/^\d+$/).default('3000'),
  DATABASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url().optional(),
  PROD_BACKEND_URL: z.string().url().optional(),
});

export const authConfigSchema = z.object({
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_VERIFICATION_TOKEN_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REFRESH_TOKEN: z.string().min(1),
});

export const mailConfigSchema = z.object({
  EMAIL_USER: z.email(),
  EMAIL_PASS: z.string().min(1),
  EMAIL_HOST: z.string().min(1),
  EMAIL_PORT: z.string().regex(/^\d+$/),
  EMAIL_FROM: z.email(),
});

export const cloudinaryConfigSchema = z.object({
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

export const globalConfigSchema = appConfigSchema
  .and(authConfigSchema)
  .and(mailConfigSchema)
  .and(cloudinaryConfigSchema);

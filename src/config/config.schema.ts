import * as z from 'zod';

export const appConfigSchema = z.object({
  PORT: z.string().regex(/^\d+$/).default('3000'),
  DATABASE_URL: z.url(),
  FRONTEND_URL: z.url().optional(),
  BACKEND_URL: z.url().optional(),
});

export const authConfigSchema = z.object({
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_VERIFICATION_SECRET: z.string().min(1),
  JWT_TEMPORARY_SECRET: z.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REFRESH_TOKEN: z.string().min(1),
  GOOGLE_CALLBACK_URL: z.url(),
});

export const mailConfigSchema = z.object({
  EMAIL_USER: z.email().or(z.string()),
  EMAIL_PASS: z.string().min(1),
  EMAIL_HOST: z.string().min(1),
  EMAIL_PORT: z.string().regex(/^\d+$/),
  EMAIL_FROM: z.string().regex(/^.+<[^<>@]+@[^<>@]+\.[^<>@]+>$/, {
    message: 'EMAIL_FROM harus dalam format "Name <email@domain.com>"',
  }),
  EMAIL_SECURE: z.coerce.boolean(),
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

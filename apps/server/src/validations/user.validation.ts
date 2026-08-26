import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
  })
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string()
  })
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    username: z.string().min(3).optional(),
    avatar: z.string().url().optional().or(z.literal('')),
    bio: z.string().max(200).optional(),
  })
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6)
  })
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string()
  })
});

export const oauthLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string(),
    provider: z.string(),
    avatar: z.string().url().optional()
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string(),
    newPassword: z.string().min(6)
  })
});

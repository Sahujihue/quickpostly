import { z } from 'zod';

// ==============================================================================
// COMMON REUSABLE SCHEMAS
// ==============================================================================

export const idSchema = z.string().min(1, 'ID is required');

export const slugSchema = z
  .string()
  .min(2, 'Slug must be at least 2 characters')
  .max(60, 'Slug cannot exceed 60 characters')
  .regex(/^[a-z0-9-]+$/, 'Slug must only contain lowercase alphanumeric characters and hyphens');

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// ==============================================================================
// AUTHENTICATION SCHEMAS
// ==============================================================================

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  rememberMe: z.boolean().optional().default(false),
  twoFactorCode: z.string().length(6, '2FA code must be exactly 6 digits').optional(),
});

export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Please enter a valid business email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  workspaceName: z.string().min(2, 'Workspace name must be at least 2 characters').optional(),
  agreeTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the Terms and Privacy Policy to continue',
  }),
});

export const verifyTwoFactorSchema = z.object({
  tempToken: z.string().min(1, 'Verification token is required'),
  code: z.string().length(6, 'Code must be 6 digits'),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// ==============================================================================
// USER PROFILE & SETTINGS SCHEMAS
// ==============================================================================

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  phone: z.string().max(25).optional().nullable(),
  country: z.string().max(60).optional().nullable(),
  timezone: z.string().default('UTC'),
  language: z.string().default('en'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'INR']).default('USD'),
  company: z.string().max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal('')),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(8, 'Confirm password is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ['confirmPassword'],
  });

export const setupTwoFactorSchema = z.object({
  code: z.string().length(6, 'Please enter the 6-digit verification code from your authenticator app'),
  secret: z.string().min(16, 'Secret key is missing'),
});

export const disableTwoFactorSchema = z.object({
  password: z.string().min(1, 'Password is required to disable 2FA'),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to confirm account deletion'),
  confirmPhrase: z.literal('DELETE MY ACCOUNT', {
    errorMap: () => ({ message: 'Please type DELETE MY ACCOUNT exactly as shown' }),
  }),
});

// ==============================================================================
// ADMIN USER MANAGEMENT SCHEMAS
// ==============================================================================

export const adminUpdateUserSchema = z.object({
  name: z.string().min(2).max(60).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'USER']).optional(),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']).optional(),
  phone: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  timezone: z.string().optional(),
});

// ==============================================================================
// WORKSPACE SCHEMAS
// ==============================================================================

export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters').max(50),
  slug: slugSchema.optional(),
  timezone: z.string().default('UTC'),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['ADMIN', 'EDITOR', 'CLIENT', 'VIEWER']).default('EDITOR'),
});

// ==============================================================================
// CONTACT FORM SCHEMA
// ==============================================================================

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Please enter a valid business email address'),
  company: z.string().optional(),
  planInterest: z.enum(['starter', 'pro', 'agency', 'enterprise', 'custom']).default('pro'),
  message: z.string().min(10, 'Message must be at least 10 characters long').max(2000),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

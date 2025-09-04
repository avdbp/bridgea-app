import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long'),
  email: z.string().email('Invalid email address'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username too long')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  location: z.string().min(1, 'Location is required').max(100, 'Location too long'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// User schemas
export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
  location: z.string().min(1).max(100).optional(),
  isPrivate: z.boolean().optional(),
});

export const searchUsersSchema = z.object({
  q: z.string().min(1, 'Search query is required').max(100, 'Search query too long'),
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
});

// Bridge schemas
export const createBridgeSchema = z.object({
  content: z.string().min(1, 'Content is required').max(2000, 'Content too long'),
  media: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video']),
    publicId: z.string(),
    width: z.number().optional(),
    height: z.number().optional(),
    duration: z.number().optional(),
  })).optional(),
  tags: z.array(z.string().toLowerCase().trim()).optional(),
  location: z.object({
    name: z.string(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }).optional(),
  }).optional(),
  visibility: z.enum(['public', 'private', 'followers']).default('public'),
});

export const updateBridgeSchema = z.object({
  content: z.string().min(1).max(2000).optional(),
  tags: z.array(z.string().toLowerCase().trim()).optional(),
  visibility: z.enum(['public', 'private', 'followers']).optional(),
});

// Follow schemas
export const followUserSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

// Comment schemas
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(500, 'Comment too long'),
  parentCommentId: z.string().optional(),
});

// Message schemas
export const sendMessageSchema = z.object({
  recipientId: z.string().min(1, 'Recipient ID is required'),
  content: z.string().min(1, 'Message content is required').max(1000, 'Message too long'),
  media: z.object({
    url: z.string().url(),
    type: z.enum(['image', 'video', 'audio']),
    publicId: z.string(),
  }).optional(),
});

// Group schemas
export const createGroupSchema = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Group name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  isPrivate: z.boolean().default(false),
});

export const updateGroupSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  isPrivate: z.boolean().optional(),
});

// Pagination schemas
export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('20'),
});

// Media schemas
export const mediaUploadSchema = z.object({
  type: z.enum(['image', 'video']),
  folder: z.string().default('bridgea/'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
export type CreateBridgeInput = z.infer<typeof createBridgeSchema>;
export type UpdateBridgeInput = z.infer<typeof updateBridgeSchema>;
export type FollowUserInput = z.infer<typeof followUserSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type MediaUploadInput = z.infer<typeof mediaUploadSchema>;



import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  updateProfileSchema,
  searchUsersSchema,
  createBridgeSchema,
  updateBridgeSchema,
  followUserSchema,
  createCommentSchema,
  sendMessageSchema,
  createGroupSchema,
  updateGroupSchema,
  paginationSchema,
  mediaUploadSchema,
} from '../types/schemas';

describe('Types', () => {
  describe('Schema Exports', () => {
    it('should export all required schemas', () => {
      expect(registerSchema).toBeDefined();
      expect(loginSchema).toBeDefined();
      expect(changePasswordSchema).toBeDefined();
      expect(forgotPasswordSchema).toBeDefined();
      expect(updateProfileSchema).toBeDefined();
      expect(searchUsersSchema).toBeDefined();
      expect(createBridgeSchema).toBeDefined();
      expect(updateBridgeSchema).toBeDefined();
      expect(followUserSchema).toBeDefined();
      expect(createCommentSchema).toBeDefined();
      expect(sendMessageSchema).toBeDefined();
      expect(createGroupSchema).toBeDefined();
      expect(updateGroupSchema).toBeDefined();
      expect(paginationSchema).toBeDefined();
      expect(mediaUploadSchema).toBeDefined();
    });

    it('should have correct schema types', () => {
      expect(typeof registerSchema).toBe('object');
      expect(typeof loginSchema).toBe('object');
      expect(typeof changePasswordSchema).toBe('object');
      expect(typeof forgotPasswordSchema).toBe('object');
      expect(typeof updateProfileSchema).toBe('object');
      expect(typeof searchUsersSchema).toBe('object');
      expect(typeof createBridgeSchema).toBe('object');
      expect(typeof updateBridgeSchema).toBe('object');
      expect(typeof followUserSchema).toBe('object');
      expect(typeof createCommentSchema).toBe('object');
      expect(typeof sendMessageSchema).toBe('object');
      expect(typeof createGroupSchema).toBe('object');
      expect(typeof updateGroupSchema).toBe('object');
      expect(typeof paginationSchema).toBe('object');
      expect(typeof mediaUploadSchema).toBe('object');
    });
  });

  describe('Schema Structure', () => {
    it('should have correct register schema structure', () => {
      expect(registerSchema.shape.firstName).toBeDefined();
      expect(registerSchema.shape.lastName).toBeDefined();
      expect(registerSchema.shape.email).toBeDefined();
      expect(registerSchema.shape.username).toBeDefined();
      expect(registerSchema.shape.location).toBeDefined();
      expect(registerSchema.shape.password).toBeDefined();
      expect(registerSchema.shape.confirmPassword).toBeDefined();
    });

    it('should have correct login schema structure', () => {
      expect(loginSchema.shape.emailOrUsername).toBeDefined();
      expect(loginSchema.shape.password).toBeDefined();
    });

    it('should have correct change password schema structure', () => {
      expect(changePasswordSchema.shape.currentPassword).toBeDefined();
      expect(changePasswordSchema.shape.newPassword).toBeDefined();
      expect(changePasswordSchema.shape.confirmPassword).toBeDefined();
    });

    it('should have correct forgot password schema structure', () => {
      expect(forgotPasswordSchema.shape.email).toBeDefined();
    });

    it('should have correct update profile schema structure', () => {
      expect(updateProfileSchema.shape.firstName).toBeDefined();
      expect(updateProfileSchema.shape.lastName).toBeDefined();
      expect(updateProfileSchema.shape.bio).toBeDefined();
      expect(updateProfileSchema.shape.location).toBeDefined();
      expect(updateProfileSchema.shape.isPrivate).toBeDefined();
    });

    it('should have correct search users schema structure', () => {
      expect(searchUsersSchema.shape.q).toBeDefined();
      expect(searchUsersSchema.shape.page).toBeDefined();
      expect(searchUsersSchema.shape.limit).toBeDefined();
    });

    it('should have correct create bridge schema structure', () => {
      expect(createBridgeSchema.shape.content).toBeDefined();
      expect(createBridgeSchema.shape.media).toBeDefined();
      expect(createBridgeSchema.shape.tags).toBeDefined();
      expect(createBridgeSchema.shape.location).toBeDefined();
      expect(createBridgeSchema.shape.visibility).toBeDefined();
    });

    it('should have correct update bridge schema structure', () => {
      expect(updateBridgeSchema.shape.content).toBeDefined();
      expect(updateBridgeSchema.shape.tags).toBeDefined();
      expect(updateBridgeSchema.shape.visibility).toBeDefined();
    });

    it('should have correct follow user schema structure', () => {
      expect(followUserSchema.shape.username).toBeDefined();
    });

    it('should have correct create comment schema structure', () => {
      expect(createCommentSchema.shape.content).toBeDefined();
      expect(createCommentSchema.shape.parentCommentId).toBeDefined();
    });

    it('should have correct send message schema structure', () => {
      expect(sendMessageSchema.shape.recipientId).toBeDefined();
      expect(sendMessageSchema.shape.content).toBeDefined();
      expect(sendMessageSchema.shape.media).toBeDefined();
    });

    it('should have correct create group schema structure', () => {
      expect(createGroupSchema.shape.name).toBeDefined();
      expect(createGroupSchema.shape.description).toBeDefined();
      expect(createGroupSchema.shape.isPrivate).toBeDefined();
    });

    it('should have correct update group schema structure', () => {
      expect(updateGroupSchema.shape.name).toBeDefined();
      expect(updateGroupSchema.shape.description).toBeDefined();
      expect(updateGroupSchema.shape.isPrivate).toBeDefined();
    });

    it('should have correct pagination schema structure', () => {
      expect(paginationSchema.shape.page).toBeDefined();
      expect(paginationSchema.shape.limit).toBeDefined();
    });

    it('should have correct media upload schema structure', () => {
      expect(mediaUploadSchema.shape.type).toBeDefined();
      expect(mediaUploadSchema.shape.folder).toBeDefined();
    });
  });
});



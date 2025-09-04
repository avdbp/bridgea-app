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

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate correct registration data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe',
        location: 'New York',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        username: 'johndoe',
        location: 'New York',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject mismatched passwords', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe',
        location: 'New York',
        password: 'password123',
        confirmPassword: 'differentpassword',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'johndoe',
        location: 'New York',
        password: '123',
        confirmPassword: '123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid username', () => {
      const invalidData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        username: 'jo',
        location: 'New York',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('loginSchema', () => {
    it('should validate correct login data', () => {
      const validData = {
        emailOrUsername: 'john@example.com',
        password: 'password123',
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty email/username', () => {
      const invalidData = {
        emailOrUsername: '',
        password: 'password123',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty password', () => {
      const invalidData = {
        emailOrUsername: 'john@example.com',
        password: '',
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('should validate correct password change data', () => {
      const validData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123',
      };

      const result = changePasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject mismatched new passwords', () => {
      const invalidData = {
        currentPassword: 'oldpassword123',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword',
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short new password', () => {
      const invalidData = {
        currentPassword: 'oldpassword123',
        newPassword: '123',
        confirmPassword: '123',
      };

      const result = changePasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('forgotPasswordSchema', () => {
    it('should validate correct email', () => {
      const validData = {
        email: 'john@example.com',
      };

      const result = forgotPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      const result = forgotPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateProfileSchema', () => {
    it('should validate correct profile update data', () => {
      const validData = {
        firstName: 'John',
        lastName: 'Doe',
        bio: 'This is my bio',
        location: 'New York',
        isPrivate: false,
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate partial profile update data', () => {
      const validData = {
        bio: 'Updated bio',
      };

      const result = updateProfileSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject long bio', () => {
      const invalidData = {
        bio: 'a'.repeat(501), // 501 characters
      };

      const result = updateProfileSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('searchUsersSchema', () => {
    it('should validate correct search query', () => {
      const validData = {
        q: 'john',
        page: '1',
        limit: '20',
      };

      const result = searchUsersSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty search query', () => {
      const invalidData = {
        q: '',
        page: '1',
        limit: '20',
      };

      const result = searchUsersSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long search query', () => {
      const invalidData = {
        q: 'a'.repeat(101), // 101 characters
        page: '1',
        limit: '20',
      };

      const result = searchUsersSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createBridgeSchema', () => {
    it('should validate correct bridge data', () => {
      const validData = {
        content: 'This is a test bridge',
        visibility: 'public',
      };

      const result = createBridgeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate bridge with media', () => {
      const validData = {
        content: 'This is a test bridge with media',
        media: [
          {
            url: 'https://example.com/image.jpg',
            type: 'image',
            publicId: 'test/image',
            width: 800,
            height: 600,
          },
        ],
        visibility: 'public',
      };

      const result = createBridgeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const invalidData = {
        content: '',
        visibility: 'public',
      };

      const result = createBridgeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long content', () => {
      const invalidData = {
        content: 'a'.repeat(2001), // 2001 characters
        visibility: 'public',
      };

      const result = createBridgeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid visibility', () => {
      const invalidData = {
        content: 'This is a test bridge',
        visibility: 'invalid',
      };

      const result = createBridgeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateBridgeSchema', () => {
    it('should validate correct bridge update data', () => {
      const validData = {
        content: 'Updated bridge content',
        tags: ['updated', 'tags'],
        visibility: 'private',
      };

      const result = updateBridgeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate partial bridge update data', () => {
      const validData = {
        content: 'Updated content only',
      };

      const result = updateBridgeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('followUserSchema', () => {
    it('should validate correct username', () => {
      const validData = {
        username: 'johndoe',
      };

      const result = followUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty username', () => {
      const invalidData = {
        username: '',
      };

      const result = followUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createCommentSchema', () => {
    it('should validate correct comment data', () => {
      const validData = {
        content: 'This is a test comment',
      };

      const result = createCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate comment with parent', () => {
      const validData = {
        content: 'This is a reply',
        parentCommentId: 'parent-comment-id',
      };

      const result = createCommentSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const invalidData = {
        content: '',
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long content', () => {
      const invalidData = {
        content: 'a'.repeat(501), // 501 characters
      };

      const result = createCommentSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('sendMessageSchema', () => {
    it('should validate correct message data', () => {
      const validData = {
        recipientId: 'recipient-id',
        content: 'Hello, this is a test message',
      };

      const result = sendMessageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate message with media', () => {
      const validData = {
        recipientId: 'recipient-id',
        content: 'Hello, this is a test message with media',
        media: {
          url: 'https://example.com/image.jpg',
          type: 'image',
          publicId: 'test/image',
        },
      };

      const result = sendMessageSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty recipient ID', () => {
      const invalidData = {
        recipientId: '',
        content: 'Hello, this is a test message',
      };

      const result = sendMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject empty content', () => {
      const invalidData = {
        recipientId: 'recipient-id',
        content: '',
      };

      const result = sendMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long content', () => {
      const invalidData = {
        recipientId: 'recipient-id',
        content: 'a'.repeat(1001), // 1001 characters
      };

      const result = sendMessageSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('createGroupSchema', () => {
    it('should validate correct group data', () => {
      const validData = {
        name: 'Test Group',
        description: 'This is a test group',
        isPrivate: false,
      };

      const result = createGroupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate group without description', () => {
      const validData = {
        name: 'Test Group',
        isPrivate: false,
      };

      const result = createGroupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty name', () => {
      const invalidData = {
        name: '',
        description: 'This is a test group',
        isPrivate: false,
      };

      const result = createGroupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long name', () => {
      const invalidData = {
        name: 'a'.repeat(101), // 101 characters
        description: 'This is a test group',
        isPrivate: false,
      };

      const result = createGroupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject long description', () => {
      const invalidData = {
        name: 'Test Group',
        description: 'a'.repeat(501), // 501 characters
        isPrivate: false,
      };

      const result = createGroupSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateGroupSchema', () => {
    it('should validate correct group update data', () => {
      const validData = {
        name: 'Updated Group Name',
        description: 'Updated description',
        isPrivate: true,
      };

      const result = updateGroupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should validate partial group update data', () => {
      const validData = {
        name: 'Updated Group Name',
      };

      const result = updateGroupSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('paginationSchema', () => {
    it('should validate correct pagination data', () => {
      const validData = {
        page: '1',
        limit: '20',
      };

      const result = paginationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should use default values', () => {
      const validData = {};

      const result = paginationSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it('should reject invalid page', () => {
      const invalidData = {
        page: 'invalid',
        limit: '20',
      };

      const result = paginationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid limit', () => {
      const invalidData = {
        page: '1',
        limit: 'invalid',
      };

      const result = paginationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('mediaUploadSchema', () => {
    it('should validate correct media upload data', () => {
      const validData = {
        type: 'image',
        folder: 'test/',
      };

      const result = mediaUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should use default folder', () => {
      const validData = {
        type: 'image',
      };

      const result = mediaUploadSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.folder).toBe('bridgea/');
      }
    });

    it('should reject invalid type', () => {
      const invalidData = {
        type: 'invalid',
        folder: 'test/',
      };

      const result = mediaUploadSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});



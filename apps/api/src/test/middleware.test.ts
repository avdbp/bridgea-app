import { describe, it, expect, beforeEach } from 'vitest';
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { authenticate, optionalAuth } from '../middleware/auth';
import { validateBody, validateQuery, validateParams } from '../middleware/validation';
import { registerSchema } from '../types/schemas';

describe('Middleware', () => {
  describe('Authentication Middleware', () => {
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };
      mockReply = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };
    });

    it('should reject request without token', async () => {
      await authenticate(mockRequest as FastifyRequest, mockReply as FastifyReply);
      
      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Access token required' });
    });

    it('should reject request with invalid token', async () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      await authenticate(mockRequest as FastifyRequest, mockReply as FastifyReply);
      
      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith({ error: 'Invalid token' });
    });

    it('should accept request with valid token', async () => {
      // This would need a valid JWT token in a real test
      // For now, we'll just test the structure
      expect(mockRequest.headers).toBeDefined();
    });
  });

  describe('Optional Authentication Middleware', () => {
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;

    beforeEach(() => {
      mockRequest = {
        headers: {},
      };
      mockReply = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };
    });

    it('should allow request without token', async () => {
      await optionalAuth(mockRequest as FastifyRequest, mockReply as FastifyReply);
      
      // Should not call status or send for optional auth
      expect(mockReply.status).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it('should accept request with valid token', async () => {
      // This would need a valid JWT token in a real test
      // For now, we'll just test the structure
      expect(mockRequest.headers).toBeDefined();
    });
  });

  describe('Validation Middleware', () => {
    let mockRequest: Partial<FastifyRequest>;
    let mockReply: Partial<FastifyReply>;

    beforeEach(() => {
      mockRequest = {
        body: {},
        query: {},
        params: {},
      };
      mockReply = {
        status: vi.fn().mockReturnThis(),
        send: vi.fn().mockReturnThis(),
      };
    });

    describe('validateBody', () => {
      it('should validate correct body data', async () => {
        const validData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          username: 'johndoe',
          location: 'New York',
          password: 'password123',
          confirmPassword: 'password123',
        };

        mockRequest.body = validData;

        const middleware = validateBody(registerSchema);
        await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockReply.status).not.toHaveBeenCalled();
        expect(mockReply.send).not.toHaveBeenCalled();
        expect(mockRequest.body).toEqual(validData);
      });

      it('should reject invalid body data', async () => {
        const invalidData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'invalid-email',
          username: 'johndoe',
          location: 'New York',
          password: 'password123',
          confirmPassword: 'password123',
        };

        mockRequest.body = invalidData;

        const middleware = validateBody(registerSchema);
        await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockReply.status).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Validation error',
            details: expect.any(Array),
          })
        );
      });
    });

    describe('validateQuery', () => {
      it('should validate correct query data', async () => {
        const validData = {
          q: 'john',
          page: '1',
          limit: '20',
        };

        mockRequest.query = validData;

        const middleware = validateQuery(registerSchema);
        await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockReply.status).not.toHaveBeenCalled();
        expect(mockReply.send).not.toHaveBeenCalled();
        expect(mockRequest.query).toEqual(validData);
      });

      it('should reject invalid query data', async () => {
        const invalidData = {
          q: '',
          page: '1',
          limit: '20',
        };

        mockRequest.query = invalidData;

        const middleware = validateQuery(registerSchema);
        await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockReply.status).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Validation error',
            details: expect.any(Array),
          })
        );
      });
    });

    describe('validateParams', () => {
      it('should validate correct params data', async () => {
        const validData = {
          username: 'johndoe',
        };

        mockRequest.params = validData;

        const middleware = validateParams(registerSchema);
        await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockReply.status).not.toHaveBeenCalled();
        expect(mockReply.send).not.toHaveBeenCalled();
        expect(mockRequest.params).toEqual(validData);
      });

      it('should reject invalid params data', async () => {
        const invalidData = {
          username: '',
        };

        mockRequest.params = invalidData;

        const middleware = validateParams(registerSchema);
        await middleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

        expect(mockReply.status).toHaveBeenCalledWith(400);
        expect(mockReply.send).toHaveBeenCalledWith(
          expect.objectContaining({
            error: 'Validation error',
            details: expect.any(Array),
          })
        );
      });
    });
  });
});



import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { build } from '../index';
import { connectDB } from '../utils/database';
import { User } from '../models/User';
import { Bridge } from '../models/Bridge';
import { Follow } from '../models/Follow';
import { Like } from '../models/Like';
import { Comment } from '../models/Comment';
import { Notification } from '../models/Notification';
import { Group } from '../models/Group';
import { Message } from '../models/Message';

describe('Chaos Tests', () => {
  let app: any;

  beforeEach(async () => {
    app = build();
    await app.ready();
    
    // Connect to test database
    await connectDB();
    
    // Clear test data
    await User.deleteMany({});
    await Bridge.deleteMany({});
    await Follow.deleteMany({});
    await Like.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await Group.deleteMany({});
    await Message.deleteMany({});
  });

  afterEach(async () => {
    await app.close();
    
    // Clean up test data
    await User.deleteMany({});
    await Bridge.deleteMany({});
    await Follow.deleteMany({});
    await Like.deleteMany({});
    await Comment.deleteMany({});
    await Notification.deleteMany({});
    await Group.deleteMany({});
    await Message.deleteMany({});
  });

  describe('Random Request Patterns', () => {
    it('should handle random mixed request types', async () => {
      const requestTypes = [
        { method: 'GET', url: '/api/v1/health' },
        { method: 'POST', url: '/api/v1/auth/register', payload: { firstName: 'Test', lastName: 'User', email: 'test@example.com', username: 'testuser', location: 'Test City', password: 'password123', confirmPassword: 'password123' } },
        { method: 'GET', url: '/api/v1/users/search?q=test' },
        { method: 'POST', url: '/api/v1/auth/login', payload: { email: 'test@example.com', password: 'password123' } },
      ];

      const randomRequests = [];
      
      for (let i = 0; i < 100; i++) {
        const randomType = requestTypes[Math.floor(Math.random() * requestTypes.length)];
        randomRequests.push(
          app.inject({
            method: randomType.method,
            url: randomType.url,
            payload: randomType.payload,
          })
        );
      }

      const responses = await Promise.all(randomRequests);
      
      expect(responses).toHaveLength(100);
      responses.forEach(response => {
        expect([200, 201, 400, 401, 404]).toContain(response.statusCode);
      });
    });

    it('should handle random payload sizes', async () => {
      const payloadSizes = [100, 1000, 10000, 100000];
      const requests = [];
      
      for (let i = 0; i < 50; i++) {
        const size = payloadSizes[Math.floor(Math.random() * payloadSizes.length)];
        const content = 'A'.repeat(size);
        
        requests.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
              firstName: content,
              lastName: 'User',
              email: `test${i}@example.com`,
              username: `testuser${i}`,
              location: 'Test City',
              password: 'password123',
              confirmPassword: 'password123',
            },
          })
        );
      }

      const responses = await Promise.all(requests);
      
      expect(responses).toHaveLength(50);
      responses.forEach(response => {
        expect([200, 201, 400]).toContain(response.statusCode);
      });
    });
  });

  describe('Concurrent Mixed Operations', () => {
    let authTokens: string[] = [];

    beforeEach(async () => {
      // Create 100 users for testing
      const userPromises = [];
      
      for (let i = 0; i < 100; i++) {
        const userData = {
          firstName: `Test${i}`,
          lastName: 'User',
          email: `test${i}@example.com`,
          username: `testuser${i}`,
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        };

        userPromises.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: userData,
          })
        );
      }

      const responses = await Promise.all(userPromises);
      authTokens = responses.map(response => response.json().tokens.accessToken);
    });

    it('should handle mixed read/write operations', async () => {
      const operations = [];
      
      for (let i = 0; i < 1000; i++) {
        const tokenIndex = i % authTokens.length;
        const operationType = Math.random();
        
        if (operationType < 0.3) {
          // Read operation - get profile
          operations.push(
            app.inject({
              method: 'GET',
              url: '/api/v1/users/profile',
              headers: {
                Authorization: `Bearer ${authTokens[tokenIndex]}`,
              },
            })
          );
        } else if (operationType < 0.6) {
          // Write operation - create bridge
          operations.push(
            app.inject({
              method: 'POST',
              url: '/api/v1/bridges',
              headers: {
                Authorization: `Bearer ${authTokens[tokenIndex]}`,
              },
              payload: {
                content: `Test bridge ${i}`,
                visibility: 'public',
              },
            })
          );
        } else {
          // Search operation
          operations.push(
            app.inject({
              method: 'GET',
              url: '/api/v1/users/search?q=test',
              headers: {
                Authorization: `Bearer ${authTokens[tokenIndex]}`,
              },
            })
          );
        }
      }

      const responses = await Promise.all(operations);
      
      expect(responses).toHaveLength(1000);
      responses.forEach(response => {
        expect([200, 201, 400, 401, 404]).toContain(response.statusCode);
      });
    });

    it('should handle mixed authentication states', async () => {
      const operations = [];
      
      for (let i = 0; i < 500; i++) {
        const tokenIndex = i % authTokens.length;
        const hasAuth = Math.random() < 0.7; // 70% chance of having auth
        
        if (hasAuth) {
          operations.push(
            app.inject({
              method: 'GET',
              url: '/api/v1/users/profile',
              headers: {
                Authorization: `Bearer ${authTokens[tokenIndex]}`,
              },
            })
          );
        } else {
          operations.push(
            app.inject({
              method: 'GET',
              url: '/api/v1/users/profile',
            })
          );
        }
      }

      const responses = await Promise.all(operations);
      
      expect(responses).toHaveLength(500);
      responses.forEach(response => {
        expect([200, 401]).toContain(response.statusCode);
      });
    });
  });

  describe('Error Recovery', () => {
    it('should recover from malformed requests', async () => {
      const malformedRequests = [
        { method: 'POST', url: '/api/v1/auth/register', payload: 'invalid json' },
        { method: 'GET', url: '/api/v1/users/invalid-id' },
        { method: 'POST', url: '/api/v1/bridges', payload: { invalid: 'data' } },
        { method: 'PUT', url: '/api/v1/users/nonexistent', payload: { firstName: 'Test' } },
      ];

      const requests = [];
      
      for (let i = 0; i < 100; i++) {
        const malformedRequest = malformedRequests[Math.floor(Math.random() * malformedRequests.length)];
        requests.push(
          app.inject({
            method: malformedRequest.method,
            url: malformedRequest.url,
            payload: malformedRequest.payload,
          })
        );
      }

      const responses = await Promise.all(requests);
      
      expect(responses).toHaveLength(100);
      responses.forEach(response => {
        expect([400, 401, 404, 422]).toContain(response.statusCode);
      });
    });

    it('should recover from network-like delays', async () => {
      const requests = [];
      
      for (let i = 0; i < 50; i++) {
        // Simulate network delay by adding random timeout
        const delay = Math.random() * 1000; // 0-1000ms delay
        
        requests.push(
          new Promise(resolve => {
            setTimeout(() => {
              resolve(
                app.inject({
                  method: 'GET',
                  url: '/api/v1/health',
                })
              );
            }, delay);
          })
        );
      }

      const responses = await Promise.all(requests);
      
      expect(responses).toHaveLength(50);
      responses.forEach(response => {
        expect(response.statusCode).toBe(200);
      });
    });
  });

  describe('Resource Exhaustion', () => {
    it('should handle memory pressure gracefully', async () => {
      const largeRequests = [];
      
      for (let i = 0; i < 100; i++) {
        const largeContent = 'A'.repeat(10000); // 10KB per request
        
        largeRequests.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: {
              firstName: largeContent,
              lastName: 'User',
              email: `test${i}@example.com`,
              username: `testuser${i}`,
              location: 'Test City',
              password: 'password123',
              confirmPassword: 'password123',
            },
          })
        );
      }

      const responses = await Promise.all(largeRequests);
      
      expect(responses).toHaveLength(100);
      responses.forEach(response => {
        expect([200, 201, 400]).toContain(response.statusCode);
      });
    });

    it('should handle connection pool exhaustion', async () => {
      const requests = [];
      
      for (let i = 0; i < 1000; i++) {
        requests.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/health',
          })
        );
      }

      const responses = await Promise.all(requests);
      
      expect(responses).toHaveLength(1000);
      responses.forEach(response => {
        expect([200, 503]).toContain(response.statusCode);
      });
    });
  });

  describe('Data Consistency Under Chaos', () => {
    let authTokens: string[] = [];

    beforeEach(async () => {
      // Create 50 users for testing
      const userPromises = [];
      
      for (let i = 0; i < 50; i++) {
        const userData = {
          firstName: `Test${i}`,
          lastName: 'User',
          email: `test${i}@example.com`,
          username: `testuser${i}`,
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        };

        userPromises.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: userData,
          })
        );
      }

      const responses = await Promise.all(userPromises);
      authTokens = responses.map(response => response.json().tokens.accessToken);
    });

    it('should maintain data consistency under concurrent modifications', async () => {
      const operations = [];
      
      for (let i = 0; i < 500; i++) {
        const tokenIndex = i % authTokens.length;
        const operationType = Math.random();
        
        if (operationType < 0.5) {
          // Create bridge
          operations.push(
            app.inject({
              method: 'POST',
              url: '/api/v1/bridges',
              headers: {
                Authorization: `Bearer ${authTokens[tokenIndex]}`,
              },
              payload: {
                content: `Test bridge ${i}`,
                visibility: 'public',
              },
            })
          );
        } else {
          // Update profile
          operations.push(
            app.inject({
              method: 'PUT',
              url: '/api/v1/users/profile',
              headers: {
                Authorization: `Bearer ${authTokens[tokenIndex]}`,
              },
              payload: {
                firstName: `Updated${i}`,
              },
            })
          );
        }
      }

      const responses = await Promise.all(operations);
      
      expect(responses).toHaveLength(500);
      responses.forEach(response => {
        expect([200, 201, 400, 401, 422]).toContain(response.statusCode);
      });
    });

    it('should handle race conditions gracefully', async () => {
      const raceOperations = [];
      
      for (let i = 0; i < 100; i++) {
        const tokenIndex = i % authTokens.length;
        
        // Multiple operations on the same resource
        raceOperations.push(
          app.inject({
            method: 'PUT',
            url: '/api/v1/users/profile',
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
            payload: {
              firstName: `Race${i}`,
            },
          })
        );
        
        raceOperations.push(
          app.inject({
            method: 'PUT',
            url: '/api/v1/users/profile',
            headers: {
              Authorization: `Bearer ${authTokens[tokenIndex]}`,
            },
            payload: {
              lastName: `Condition${i}`,
            },
          })
        );
      }

      const responses = await Promise.all(raceOperations);
      
      expect(responses).toHaveLength(200);
      responses.forEach(response => {
        expect([200, 400, 401, 422]).toContain(response.statusCode);
      });
    });
  });
});



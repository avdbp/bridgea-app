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

describe('Endurance Tests', () => {
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

  describe('Long Running Operations', () => {
    it('should handle continuous user registration for 5 minutes', async () => {
      const startTime = Date.now();
      const endTime = startTime + (5 * 60 * 1000); // 5 minutes
      let successCount = 0;
      let errorCount = 0;

      while (Date.now() < endTime) {
        const userData = {
          firstName: `Test${Date.now()}`,
          lastName: 'User',
          email: `test${Date.now()}@example.com`,
          username: `testuser${Date.now()}`,
          location: 'Test City',
          password: 'password123',
          confirmPassword: 'password123',
        };

        try {
          const response = await app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: userData,
          });

          if (response.statusCode === 201) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      expect(successCount).toBeGreaterThan(0);
      expect(errorCount).toBeLessThan(successCount);
    }, 300000); // 5 minute timeout

    it('should handle continuous bridge creation for 10 minutes', async () => {
      // First, create a user for authentication
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        username: 'testuser',
        location: 'Test City',
        password: 'password123',
        confirmPassword: 'password123',
      };

      const registerResponse = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: userData,
      });

      const authToken = registerResponse.json().tokens.accessToken;

      const startTime = Date.now();
      const endTime = startTime + (10 * 60 * 1000); // 10 minutes
      let successCount = 0;
      let errorCount = 0;

      while (Date.now() < endTime) {
        const bridgeData = {
          content: `Test bridge ${Date.now()}`,
          visibility: 'public',
        };

        try {
          const response = await app.inject({
            method: 'POST',
            url: '/api/v1/bridges',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            payload: bridgeData,
          });

          if (response.statusCode === 201) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
        }

        // Small delay to prevent overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      expect(successCount).toBeGreaterThan(0);
      expect(errorCount).toBeLessThan(successCount);
    }, 600000); // 10 minute timeout
  });

  describe('Memory Leak Detection', () => {
    it('should not leak memory during repeated operations', async () => {
      const initialMemory = process.memoryUsage();
      const operations = [];

      // Perform 1000 operations
      for (let i = 0; i < 1000; i++) {
        operations.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/health',
          })
        );
      }

      await Promise.all(operations);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 100MB)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024);
    });

    it('should not leak memory during user operations', async () => {
      const initialMemory = process.memoryUsage();
      const operations = [];

      // Create and delete users repeatedly
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

        operations.push(
          app.inject({
            method: 'POST',
            url: '/api/v1/auth/register',
            payload: userData,
          })
        );
      }

      await Promise.all(operations);

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });

  describe('Connection Pool Management', () => {
    it('should maintain stable connections during long operations', async () => {
      const startTime = Date.now();
      const endTime = startTime + (2 * 60 * 1000); // 2 minutes
      let connectionErrors = 0;
      let totalRequests = 0;

      while (Date.now() < endTime) {
        try {
          const response = await app.inject({
            method: 'GET',
            url: '/api/v1/health',
          });

          if (response.statusCode !== 200) {
            connectionErrors++;
          }
          totalRequests++;
        } catch (error) {
          connectionErrors++;
          totalRequests++;
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const errorRate = connectionErrors / totalRequests;
      expect(errorRate).toBeLessThan(0.01); // Less than 1% error rate
    }, 120000); // 2 minute timeout

    it('should handle connection pool exhaustion gracefully', async () => {
      const requests = [];
      
      // Create many concurrent requests to exhaust connection pool
      for (let i = 0; i < 1000; i++) {
        requests.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/health',
          })
        );
      }

      const responses = await Promise.all(requests);
      
      // Most requests should succeed, some might fail due to pool exhaustion
      const successCount = responses.filter(r => r.statusCode === 200).length;
      const failureCount = responses.filter(r => r.statusCode !== 200).length;
      
      expect(successCount).toBeGreaterThan(failureCount);
      expect(successCount).toBeGreaterThan(500); // At least 50% should succeed
    });
  });

  describe('Database Performance Over Time', () => {
    it('should maintain consistent performance as data grows', async () => {
      const performanceMetrics = [];
      
      // Create users in batches and measure performance
      for (let batch = 0; batch < 10; batch++) {
        const startTime = Date.now();
        
        const userPromises = [];
        for (let i = 0; i < 100; i++) {
          const userData = {
            firstName: `Test${batch}_${i}`,
            lastName: 'User',
            email: `test${batch}_${i}@example.com`,
            username: `testuser${batch}_${i}`,
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

        await Promise.all(userPromises);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        performanceMetrics.push(duration);
      }

      // Performance should not degrade significantly
      const firstBatch = performanceMetrics[0];
      const lastBatch = performanceMetrics[performanceMetrics.length - 1];
      const performanceDegradation = (lastBatch - firstBatch) / firstBatch;
      
      expect(performanceDegradation).toBeLessThan(2); // Less than 200% degradation
    });

    it('should handle large dataset queries efficiently', async () => {
      // Create a large dataset
      const userPromises = [];
      
      for (let i = 0; i < 1000; i++) {
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

      await Promise.all(userPromises);

      // Measure search performance
      const startTime = Date.now();
      
      const searchResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/users/search?q=test',
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(searchResponse.statusCode).toBe(200);
      expect(duration).toBeLessThan(5000); // Should complete within 5 seconds
    });
  });

  describe('Error Recovery Over Time', () => {
    it('should recover from errors during long operations', async () => {
      const startTime = Date.now();
      const endTime = startTime + (3 * 60 * 1000); // 3 minutes
      let errorCount = 0;
      let recoveryCount = 0;

      while (Date.now() < endTime) {
        try {
          // Mix of valid and invalid requests
          const requestType = Math.random();
          
          if (requestType < 0.8) {
            // Valid request
            const response = await app.inject({
              method: 'GET',
              url: '/api/v1/health',
            });
            
            if (response.statusCode === 200) {
              recoveryCount++;
            }
          } else {
            // Invalid request to trigger errors
            const response = await app.inject({
              method: 'GET',
              url: '/api/v1/invalid-endpoint',
            });
            
            if (response.statusCode !== 200) {
              errorCount++;
            }
          }
        } catch (error) {
          errorCount++;
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // System should recover from errors
      expect(recoveryCount).toBeGreaterThan(errorCount);
    }, 180000); // 3 minute timeout

    it('should maintain stability after repeated failures', async () => {
      // Intentionally cause failures
      for (let i = 0; i < 100; i++) {
        try {
          await app.inject({
            method: 'GET',
            url: '/api/v1/invalid-endpoint',
          });
        } catch (error) {
          // Expected to fail
        }
      }

      // System should still work after failures
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/health',
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('Resource Cleanup', () => {
    it('should properly clean up resources after operations', async () => {
      const initialResources = {
        memory: process.memoryUsage(),
        connections: await getConnectionCount(),
      };

      // Perform operations
      const operations = [];
      for (let i = 0; i < 500; i++) {
        operations.push(
          app.inject({
            method: 'GET',
            url: '/api/v1/health',
          })
        );
      }

      await Promise.all(operations);

      // Force cleanup
      if (global.gc) {
        global.gc();
      }

      // Wait for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));

      const finalResources = {
        memory: process.memoryUsage(),
        connections: await getConnectionCount(),
      };

      // Resources should be cleaned up
      const memoryIncrease = finalResources.memory.heapUsed - initialResources.memory.heapUsed;
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024); // Less than 50MB increase
    });
  });
});

// Helper function to get connection count (mock implementation)
async function getConnectionCount(): Promise<number> {
  // This would be implemented based on your database connection monitoring
  return 0;
}



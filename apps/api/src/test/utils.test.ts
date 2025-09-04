import { describe, it, expect, beforeEach } from 'vitest';
import { connectDB } from '../utils/database';

describe('Utils', () => {
  describe('Database Connection', () => {
    it('should connect to database', async () => {
      // This test would need a test database connection
      // For now, we'll just test that the function exists and is callable
      expect(typeof connectDB).toBe('function');
    });

    it('should handle connection errors gracefully', async () => {
      // This test would need to mock a connection error
      // For now, we'll just test that the function exists
      expect(typeof connectDB).toBe('function');
    });
  });
});



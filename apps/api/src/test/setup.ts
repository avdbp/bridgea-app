import { beforeAll, afterAll } from 'vitest';
import { connectDB } from '../utils/database';

beforeAll(async () => {
  // Connect to test database
  await connectDB();
});

afterAll(async () => {
  // Clean up test database
  // Add cleanup logic here if needed
});



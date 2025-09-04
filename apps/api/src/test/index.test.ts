import { describe, it, expect, beforeEach } from 'vitest';
import { build } from '../index';

describe('Application', () => {
  let app: any;

  beforeEach(async () => {
    app = build();
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('should build the application', () => {
    expect(app).toBeDefined();
  });

  it('should have correct application structure', () => {
    expect(app.hasRoute).toBeDefined();
    expect(app.hasPlugin).toBeDefined();
    expect(app.hasDecorator).toBeDefined();
  });

  it('should have health check route', () => {
    expect(app.hasRoute({ method: 'GET', url: '/health' })).toBe(true);
  });

  it('should have auth routes', () => {
    expect(app.hasRoute({ method: 'POST', url: '/api/v1/auth/register' })).toBe(true);
    expect(app.hasRoute({ method: 'POST', url: '/api/v1/auth/login' })).toBe(true);
    expect(app.hasRoute({ method: 'POST', url: '/api/v1/auth/refresh' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/auth/me' })).toBe(true);
    expect(app.hasRoute({ method: 'PATCH', url: '/api/v1/auth/change-password' })).toBe(true);
    expect(app.hasRoute({ method: 'POST', url: '/api/v1/auth/forgot-password' })).toBe(true);
    expect(app.hasRoute({ method: 'POST', url: '/api/v1/auth/logout' })).toBe(true);
  });

  it('should have user routes', () => {
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/users/:username' })).toBe(true);
    expect(app.hasRoute({ method: 'PATCH', url: '/api/v1/users/me' })).toBe(true);
    expect(app.hasRoute({ method: 'PATCH', url: '/api/v1/users/me/avatar' })).toBe(true);
    expect(app.hasRoute({ method: 'PATCH', url: '/api/v1/users/me/banner' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/users/search' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/users/:username/followers' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/users/:username/following' })).toBe(true);
  });

  it('should have bridge routes', () => {
    expect(app.hasRoute({ method: 'POST', url: '/api/v1/bridges' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/bridges/feed' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/bridges/user/:username' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/bridges/:id' })).toBe(true);
    expect(app.hasRoute({ method: 'PATCH', url: '/api/v1/bridges/:id' })).toBe(true);
    expect(app.hasRoute({ method: 'DELETE', url: '/api/v1/bridges/:id' })).toBe(true);
    expect(app.hasRoute({ method: 'POST', url: '/api/v1/bridges/:id/like' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/bridges/:id/comments' })).toBe(true);
    expect(app.hasRoute({ method: 'POST', url: '/api/v1/bridges/:id/comments' })).toBe(true);
  });

  it('should have follow routes', () => {
    expect(app.hasRoute({ method: 'POST', url: '/api/v1/follows/:username' })).toBe(true);
    expect(app.hasRoute({ method: 'DELETE', url: '/api/v1/follows/:username' })).toBe(true);
    expect(app.hasRoute({ method: 'PATCH', url: '/api/v1/follows/:username' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/follows/me/followers' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/follows/me/following' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/follows/me/requests' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/follows/:username/status' })).toBe(true);
  });

  it('should have notification routes', () => {
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/notifications' })).toBe(true);
    expect(app.hasRoute({ method: 'PATCH', url: '/api/v1/notifications/:id/read' })).toBe(true);
    expect(app.hasRoute({ method: 'PATCH', url: '/api/v1/notifications/read-all' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/notifications/unread-count' })).toBe(true);
    expect(app.hasRoute({ method: 'DELETE', url: '/api/v1/notifications/:id' })).toBe(true);
    expect(app.hasRoute({ method: 'POST', url: '/api/v1/notifications/push/test' })).toBe(true);
  });

  it('should have media routes', () => {
    expect(app.hasRoute({ method: 'POST', url: '/api/v1/media/signature' })).toBe(true);
    expect(app.hasRoute({ method: 'DELETE', url: '/api/v1/media/:publicId' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/media/optimize/:publicId' })).toBe(true);
    expect(app.hasRoute({ method: 'GET', url: '/api/v1/media/thumbnail/:publicId' })).toBe(true);
  });

  it('should have swagger documentation', () => {
    expect(app.hasRoute({ method: 'GET', url: '/docs' })).toBe(true);
  });

  it('should have correct plugins registered', () => {
    expect(app.hasPlugin('@fastify/cors')).toBe(true);
    expect(app.hasPlugin('@fastify/helmet')).toBe(true);
    expect(app.hasPlugin('@fastify/rate-limit')).toBe(true);
    expect(app.hasPlugin('@fastify/swagger')).toBe(true);
    expect(app.hasPlugin('@fastify/swagger-ui')).toBe(true);
  });

  it('should have correct decorators', () => {
    expect(app.hasDecorator('authenticate')).toBe(true);
    expect(app.hasDecorator('optionalAuth')).toBe(true);
    expect(app.hasDecorator('validateBody')).toBe(true);
    expect(app.hasDecorator('validateQuery')).toBe(true);
    expect(app.hasDecorator('validateParams')).toBe(true);
  });
});



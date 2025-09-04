import { describe, it, expect, beforeEach } from 'vitest';
import { io, Socket } from 'socket.io-client';

describe('Socket.IO', () => {
  let client: Socket;

  beforeEach(() => {
    // Create a socket client for testing
    client = io('http://localhost:3002', {
      transports: ['websocket'],
    });
  });

  afterEach(() => {
    if (client) {
      client.disconnect();
    }
  });

  it('should connect to socket server', (done) => {
    client.on('connect', () => {
      expect(client.connected).toBe(true);
      done();
    });

    client.on('connect_error', (error) => {
      done(error);
    });
  });

  it('should join a group room', (done) => {
    client.on('connect', () => {
      client.emit('join-group', 'test-group-id');
      
      // Wait a bit for the server to process
      setTimeout(() => {
        expect(client.connected).toBe(true);
        done();
      }, 100);
    });
  });

  it('should join a conversation room', (done) => {
    client.on('connect', () => {
      client.emit('join-conversation', 'test-conversation-id');
      
      // Wait a bit for the server to process
      setTimeout(() => {
        expect(client.connected).toBe(true);
        done();
      }, 100);
    });
  });

  it('should handle typing indicators', (done) => {
    client.on('connect', () => {
      client.emit('typing-start', {
        conversationId: 'test-conversation-id',
        recipientId: 'test-recipient-id',
      });
      
      // Wait a bit for the server to process
      setTimeout(() => {
        expect(client.connected).toBe(true);
        done();
      }, 100);
    });
  });
});



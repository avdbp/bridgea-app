import { io, Socket } from 'socket.io-client';
import { config } from '@/constants/config';
import { useAuthStore } from '@/store/auth';
import { useUIStore } from '@/store/ui';
import { SocketEvents } from '@/types';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(): void {
    const { tokens, isAuthenticated } = useAuthStore.getState();
    
    if (!isAuthenticated || !tokens?.accessToken) {
      console.log('Socket: Not authenticated, skipping connection');
      return;
    }

    if (this.socket?.connected) {
      console.log('Socket: Already connected');
      return;
    }

    console.log('Socket: Connecting...');
    
    this.socket = io(config.SOCKET_URL, {
      auth: {
        token: tokens.accessToken,
      },
      transports: ['websocket'],
      timeout: 20000,
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  disconnect(): void {
    if (this.socket) {
      console.log('Socket: Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket: Connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket: Disconnected', reason);
      
      if (reason === 'io server disconnect') {
        // Server disconnected, try to reconnect
        this.handleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket: Connection error', error);
      
      // If it's an authentication error, don't try to reconnect
      if (error.message?.includes('Authentication error') || error.message?.includes('Invalid token')) {
        console.log('Socket: Authentication error, disconnecting');
        this.disconnect();
        return;
      }
      
      this.handleReconnect();
    });

    // Notification events
    this.socket.on('new-like', (data: SocketEvents['new-like']) => {
      console.log('Socket: New like received', data);
      useUIStore.getState().incrementUnreadNotifications();
    });

    this.socket.on('new-comment', (data: SocketEvents['new-comment']) => {
      console.log('Socket: New comment received', data);
      useUIStore.getState().incrementUnreadNotifications();
    });

    this.socket.on('new-follow', (data: SocketEvents['new-follow']) => {
      console.log('Socket: New follow received', data);
      useUIStore.getState().incrementUnreadNotifications();
    });

    this.socket.on('new-message', (data: SocketEvents['new-message']) => {
      console.log('Socket: New message received', data);
      useUIStore.getState().incrementUnreadNotifications();
      
      // Emit custom event for message handling
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('new-message', { detail: data }));
      }
    });

    this.socket.on('new-group-invite', (data: SocketEvents['new-group-invite']) => {
      console.log('Socket: New group invite received', data);
      useUIStore.getState().incrementUnreadNotifications();
    });

    // Typing indicators
    this.socket.on('user-typing', (data: SocketEvents['user-typing']) => {
      console.log('Socket: User typing', data);
      // Handle typing indicator in chat components
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Socket: Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`Socket: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Room management
  joinGroup(groupId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-group', groupId);
    }
  }

  leaveGroup(groupId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-group', groupId);
    }
  }

  joinConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('join-conversation', conversationId);
    }
  }

  leaveConversation(conversationId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('leave-conversation', conversationId);
    }
  }

  // Typing indicators
  startTyping(conversationId: string, recipientId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing-start', { conversationId, recipientId });
    }
  }

  stopTyping(conversationId: string, recipientId: string): void {
    if (this.socket?.connected) {
      this.socket.emit('typing-stop', { conversationId, recipientId });
    }
  }

  // Custom event listeners
  on(event: string, callback: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data?: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }

  // Connection status
  get isConnected(): boolean {
    return this.socket?.connected || false;
  }

  get socketId(): string | undefined {
    return this.socket?.id;
  }
}

export const socketService = new SocketService();


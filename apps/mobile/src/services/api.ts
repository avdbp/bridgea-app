import { config } from '@/constants/config';
import { useAuthStore } from '@/store/auth';
import { AuthResponse, ApiResponse, PaginatedResponse, User, Bridge, Comment, Follow, Notification, Group, Message } from '@/types';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = config.API_BASE_URL;
  }

  getToken(): string | null {
    const { tokens } = useAuthStore.getState();
    return tokens?.accessToken || null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const { tokens } = useAuthStore.getState();
    
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (tokens?.accessToken) {
      headers.Authorization = `Bearer ${tokens.accessToken}`;
    }

    console.log('API Service: Making request to:', url);
    console.log('API Service: Request options:', { method: options.method, headers });

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('API Service: Response status:', response.status);
    console.log('API Service: Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Service: Error response:', errorData);
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    console.log('API Service: Response data:', result);
    return result;
  }

  // Auth endpoints
  async login(credentials: { emailOrUsername: string; password: string }): Promise<AuthResponse> {
    console.log('API Service: Login called with:', credentials);
    console.log('API Service: Base URL:', this.baseURL);
    
    try {
      const result = await this.request<AuthResponse>('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      
      console.log('API Service: Login successful:', result);
      return result;
    } catch (error) {
      console.error('API Service: Login error:', error);
      throw error;
    }
  }

  async register(userData: {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    location: string;
    password: string;
    confirmPassword: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request<ApiResponse>('/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async changePassword(data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<ApiResponse> {
    return this.request<ApiResponse>('/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async refreshToken(): Promise<{ tokens: { accessToken: string; refreshToken: string } }> {
    const { tokens } = useAuthStore.getState();
    return this.request('/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: tokens?.refreshToken }),
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/v1/auth/me');
  }

  async logout(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/v1/auth/logout', {
      method: 'POST',
    });
  }

  // User endpoints
  async getUser(username: string): Promise<{ user: User }> {
    return this.request<{ user: User }>(`/v1/users/${username}`);
  }

  async searchUsers(query: string, page: number = 1, limit: number = 20): Promise<PaginatedResponse<User>> {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    return this.request<PaginatedResponse<User>>(`/v1/users/search?${params}`);
  }

  async updateProfile(data: {
    firstName: string;
    lastName: string;
    username: string;
    bio?: string;
    location?: string;
    website?: string;
    isPrivate?: boolean;
    avatar?: string;
    banner?: string;
  }): Promise<{ user: User }> {
    return this.request<{ user: User }>('/v1/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateAvatar(data: { avatar: string }): Promise<{ user: User }> {
    // Si es una URI local, comprimir y subir a Cloudinary primero
    if (data.avatar.startsWith('file://') || data.avatar.startsWith('content://')) {
      const { compressImage } = await import('./imageCompression');
      const { uploadToServer } = await import('./upload');
      
      // Comprimir imagen para perfil (más pequeña)
      const compressedUri = await compressImage(data.avatar, {
        maxWidth: 512,
        maxHeight: 512,
        quality: 0.9,
        format: 'jpeg'
      });
      
      const result = await uploadToServer(compressedUri, 'image', 'profile');
      data.avatar = result.url;
    }
    
    return this.request<{ user: User }>('/v1/users/me/avatar', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateBanner(data: { banner: string }): Promise<{ user: User }> {
    // Si es una URI local, comprimir y subir a Cloudinary primero
    if (data.banner.startsWith('file://') || data.banner.startsWith('content://')) {
      const { compressImage } = await import('./imageCompression');
      const { uploadToServer } = await import('./upload');
      
      // Comprimir banner (más ancho pero menos alto)
      const compressedUri = await compressImage(data.banner, {
        maxWidth: 1200,
        maxHeight: 400,
        quality: 0.8,
        format: 'jpeg'
      });
      
      const result = await uploadToServer(compressedUri, 'image', 'profile');
      data.banner = result.url;
    }
    
    return this.request<{ user: User }>('/v1/users/me/banner', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getFollowers(username: string, page = 1, limit = 20): Promise<{ followers: User[] }> {
    return this.request<{ followers: User[] }>(`/v1/users/${username}/followers?page=${page}&limit=${limit}`);
  }

  async getFollowing(username: string, page = 1, limit = 20): Promise<{ following: User[] }> {
    return this.request<{ following: User[] }>(`/v1/users/${username}/following?page=${page}&limit=${limit}`);
  }

  async getUserFollowers(username: string, page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    return this.request<PaginatedResponse<User>>(`/v1/users/${username}/followers?page=${page}&limit=${limit}`);
  }

  async getUserFollowing(username: string, page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    return this.request<PaginatedResponse<User>>(`/v1/users/${username}/following?page=${page}&limit=${limit}`);
  }

  // Bridge endpoints
  async createBridge(data: {
    content: string;
    media?: Array<{
      url: string;
      type: 'image' | 'video';
      publicId: string;
      width?: number;
      height?: number;
      duration?: number;
    }>;
    tags?: string[];
    location?: {
      name: string;
      coordinates?: { lat: number; lng: number };
    };
    visibility?: 'public' | 'private' | 'followers';
  }): Promise<{ bridge: Bridge }> {
    return this.request<{ bridge: Bridge }>('/v1/bridges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getFeed(page = 1, limit = 20): Promise<PaginatedResponse<Bridge>> {
    return this.request<PaginatedResponse<Bridge>>(`/v1/bridges/feed?page=${page}&limit=${limit}`);
  }

  async getUserBridges(username: string, page = 1, limit = 20): Promise<PaginatedResponse<Bridge>> {
    return this.request<PaginatedResponse<Bridge>>(`/v1/bridges/user/${username}?page=${page}&limit=${limit}`);
  }

  async getBridge(id: string): Promise<{ bridge: Bridge }> {
    return this.request<{ bridge: Bridge }>(`/v1/bridges/${id}`);
  }

  async updateBridge(id: string, data: {
    content?: string;
    tags?: string[];
    visibility?: 'public' | 'private' | 'followers';
  }): Promise<{ bridge: Bridge }> {
    return this.request<{ bridge: Bridge }>(`/v1/bridges/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteBridge(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/v1/bridges/${id}`, {
      method: 'DELETE',
    });
  }

  async likeBridge(id: string): Promise<{ liked: boolean }> {
    return this.request<{ liked: boolean }>(`/v1/bridges/${id}/like`, {
      method: 'POST',
    });
  }

  async getBridgeComments(id: string, page = 1, limit = 20): Promise<PaginatedResponse<Comment>> {
    return this.request<PaginatedResponse<Comment>>(`/bridges/${id}/comments?page=${page}&limit=${limit}`);
  }

  async addComment(id: string, data: {
    content: string;
    parentCommentId?: string;
  }): Promise<{ comment: Comment }> {
    return this.request<{ comment: Comment }>(`/bridges/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Follow endpoints
  async followUser(username: string): Promise<{ status: 'pending' | 'approved' }> {
    return this.request<{ status: 'pending' | 'approved' }>(`/follows/${username}`, {
      method: 'POST',
    });
  }

  async unfollowUser(username: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/follows/${username}`, {
      method: 'DELETE',
    });
  }

  async respondToFollowRequest(username: string, action: 'accept' | 'reject'): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/follows/${username}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });
  }

  async getMyFollowers(page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    return this.request<PaginatedResponse<User>>(`/follows/me/followers?page=${page}&limit=${limit}`);
  }

  async getMyFollowing(page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    return this.request<PaginatedResponse<User>>(`/follows/me/following?page=${page}&limit=${limit}`);
  }

  async getFollowRequests(page = 1, limit = 20): Promise<PaginatedResponse<User>> {
    return this.request<PaginatedResponse<User>>(`/follows/me/requests?page=${page}&limit=${limit}`);
  }

  async getFollowStatus(username: string): Promise<{ isFollowing: boolean; status: 'pending' | 'approved' | null }> {
    return this.request<{ isFollowing: boolean; status: 'pending' | 'approved' | null }>(`/follows/${username}/status`);
  }

  // Notification endpoints
  async getNotifications(page = 1, limit = 20): Promise<PaginatedResponse<Notification> & { unreadCount: number }> {
    return this.request<PaginatedResponse<Notification> & { unreadCount: number }>(`/notifications?page=${page}&limit=${limit}`);
  }

  async markNotificationAsRead(id: string): Promise<{ notification: Notification }> {
    return this.request<{ notification: Notification }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    return this.request<ApiResponse>('/v1/notifications/read-all', {
      method: 'PATCH',
    });
  }

  async getUnreadNotificationsCount(): Promise<{ unreadCount: number }> {
    return this.request<{ unreadCount: number }>('/v1/notifications/unread-count');
  }

  async deleteNotification(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/notifications/${id}`, {
      method: 'DELETE',
    });
  }

  // Bridge endpoints

  async unlikeBridge(id: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/bridges/${id}/unlike`, {
      method: 'DELETE',
    });
  }

  // Media endpoints
  async getUploadSignature(type: 'image' | 'video', folder = 'bridgea/'): Promise<{
    signature: string;
    timestamp: number;
    folder: string;
    resource_type: 'image' | 'video';
    upload_preset: string;
    cloud_name: string;
  }> {
    return this.request('/media/signature', {
      method: 'POST',
      body: JSON.stringify({ type, folder }),
    });
  }

  async deleteMedia(publicId: string, type: 'image' | 'video' = 'image'): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/media/${publicId}?type=${type}`, {
      method: 'DELETE',
    });
  }

  async getOptimizedImageUrl(publicId: string, options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    crop?: string;
  } = {}): Promise<{ url: string }> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return this.request<{ url: string }>(`/media/optimize/${publicId}?${params.toString()}`);
  }

  async getVideoThumbnailUrl(publicId: string, options: {
    width?: number;
    height?: number;
    time?: string;
  } = {}): Promise<{ url: string }> {
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    return this.request<{ url: string }>(`/media/thumbnail/${publicId}?${params.toString()}`);
  }

  // Message endpoints
  async sendMessage(data: {
    recipientId: string;
    content: string;
    media?: {
      url: string;
      type: 'image' | 'video' | 'audio';
      publicId: string;
    };
  }): Promise<{ message: Message }> {
    return this.request<{ message: Message }>('/v1/messages', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getConversation(userId: string, page = 1, limit = 20): Promise<PaginatedResponse<Message>> {
    return this.request<PaginatedResponse<Message>>(`/messages/conversation/${userId}?page=${page}&limit=${limit}`);
  }

  async getConversations(page = 1, limit = 20): Promise<{
    conversations: Array<{
      user: User;
      lastMessage: Message;
      unreadCount: number;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    return this.request(`/messages/conversations?page=${page}&limit=${limit}`);
  }

  async markMessageAsRead(messageId: string): Promise<{ message: Message }> {
    return this.request<{ message: Message }>(`/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  }

  async markConversationAsRead(userId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/messages/conversation/${userId}/read`, {
      method: 'PATCH',
    });
  }

  async deleteMessage(messageId: string): Promise<ApiResponse> {
    return this.request<ApiResponse>(`/messages/${messageId}`, {
      method: 'DELETE',
    });
  }

  async getUnreadMessageCount(): Promise<{ unreadCount: number }> {
    return this.request<{ unreadCount: number }>('/v1/messages/unread-count');
  }
}

export const apiService = new ApiService();

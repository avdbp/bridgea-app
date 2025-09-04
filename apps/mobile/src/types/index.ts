// User types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  location: string;
  bio?: string;
  website?: string;
  avatar?: string;
  banner?: string;
  isPrivate: boolean;
  isVerified: boolean;
  followersCount: number;
  followingCount: number;
  bridgesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  pushTokens: string[];
}

// Bridge types
export interface Media {
  url: string;
  type: 'image' | 'video';
  publicId: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface Bridge {
  _id: string;
  author: User;
  content: string;
  media: Media[];
  tags: string[];
  location?: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  visibility: 'public' | 'private' | 'followers';
  isPrivate: boolean;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBridgeInput {
  content: string;
  media?: Media[];
  tags?: string[];
  location?: {
    name: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  isPrivate?: boolean;
}

// Follow types
export interface Follow {
  _id: string;
  follower: User;
  following: User;
  status: 'pending' | 'approved';
  createdAt: string;
  updatedAt: string;
}

// Comment types
export interface Comment {
  _id: string;
  user: User;
  bridge: string;
  content: string;
  parentComment?: string;
  likesCount: number;
  repliesCount: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// Like types
export interface Like {
  _id: string;
  user: string;
  bridge: string;
  createdAt: string;
}

// Notification types
export type NotificationType = 
  | 'NEW_FOLLOW_REQUEST'
  | 'FOLLOW_APPROVED'
  | 'NEW_LIKE'
  | 'NEW_COMMENT'
  | 'NEW_BRIDGE_SHARED'
  | 'NEW_MESSAGE'
  | 'GROUP_INVITE';

export interface Notification {
  _id: string;
  recipient: string;
  sender?: User;
  type: NotificationType;
  title: string;
  body: string;
  data?: {
    bridgeId?: string;
    commentId?: string;
    followId?: string;
    groupId?: string;
    messageId?: string;
  };
  isRead: boolean;
  createdAt: string;
}

// Message types
export interface Message {
  _id: string;
  sender: User;
  recipient: User;
  content: string;
  media?: {
    url: string;
    type: 'image' | 'video' | 'audio';
    publicId: string;
  };
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

// Group types
export interface Group {
  _id: string;
  name: string;
  description: string;
  avatar?: string;
  banner?: string;
  creator: User;
  admins: User[];
  members: User[];
  isPrivate: boolean;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
}

// Auth types
export interface LoginCredentials {
  emailOrUsername: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  location: string;
  password: string;
  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  tokens: AuthTokens;
}

// API Response types
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
  details?: Array<{
    field: string;
    message: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Navigation types
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Main: undefined;
  ForgotPassword: undefined;
  Search: undefined;
  Chat: { userId: string };
  Followers: { username: string };
  Following: { username: string };
  FollowRequests: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Create: undefined;
  Messages: undefined;
  Groups: undefined;
  Profile: undefined;
};

export type HomeStackParamList = {
  Feed: undefined;
  BridgeDetail: { bridgeId: string };
  UserProfile: { username: string };
};

export type ProfileStackParamList = {
  Profile: { username?: string };
  EditProfile: undefined;
  Settings: undefined;
  Followers: { username: string };
  Following: { username: string };
};

// Form types
export interface FormField {
  value: string;
  error?: string;
  touched: boolean;
}

export interface FormState {
  [key: string]: FormField;
}

// Socket types
export interface SocketEvents {
  'new-like': { bridgeId: string; userId: string };
  'new-comment': { bridgeId: string; commentId: string; userId: string };
  'new-follow': { userId: string; followerId: string };
  'new-message': { messageId: string; senderId: string; recipientId: string };
  'new-group-invite': { groupId: string; inviterId: string };
  'user-typing': { userId: string; isTyping: boolean };
}

// Cloudinary types
export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  duration?: number;
  resource_type: 'image' | 'video';
}

export interface CloudinarySignature {
  signature: string;
  timestamp: number;
  folder: string;
  resource_type: 'image' | 'video';
  upload_preset: string;
  cloud_name: string;
}

/**
 * أنواع الـ API (Requests & Responses)
 */

import { Book, User, Category, Bookmark, Highlight, Notification, ReadingProgress, Statistics } from './models.types';

// API Response العام
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Pagination
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============ Auth ============

export interface LoginRequest {
  email: string;
  password: string;
  deviceInfo: DeviceInfo;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phoneNumber?: string;
  deviceInfo: DeviceInfo;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface DeviceInfo {
  deviceToken: string;
  deviceType: 'ios' | 'android';
  deviceModel?: string;
  osVersion?: string;
  appVersion: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// ============ Books ============

export interface BooksQuery extends PaginationParams {
  category?: string;
  search?: string;
  sort?: 'newest' | 'popular' | 'title' | 'author';
  language?: string;
}

export interface BookDetailResponse {
  book: Book & {
    chapters: Array<{
      id: string;
      title: string;
      order: number;
      sections: Array<{
        id: string;
        title: string;
        pageCount: number;
      }>;
    }>;
    readingProgress?: ReadingProgress;
    bookmarks: Bookmark[];
    highlights: Highlight[];
    downloadInfo: {
      isDownloaded: boolean;
      canDownload: boolean;
      size: number;
      formats: string[];
    };
  };
}

export interface BookContentQuery {
  chapter?: number;
  section?: number;
}

export interface BookContentResponse {
  content: {
    chapterId: string;
    sectionId: string;
    title: string;
    content: string;
    pageNumber: number;
    navigation: {
      prev?: {
        chapterId: string;
        sectionId: string;
        title: string;
      };
      next?: {
        chapterId: string;
        sectionId: string;
        title: string;
      };
    };
  };
}

// ============ Bookmarks ============

export interface CreateBookmarkRequest {
  bookId: string;
  chapterId: string;
  sectionId: string;
  pageNumber: number;
  note?: string;
}

export interface BookmarksQuery extends PaginationParams {
  bookId?: string;
}

// ============ Highlights ============

export interface CreateHighlightRequest {
  bookId: string;
  chapterId: string;
  sectionId: string;
  text: string;
  color: string;
  note?: string;
  pageNumber: number;
  position: {
    start: number;
    end: number;
  };
}

export interface HighlightsQuery extends PaginationParams {
  bookId?: string;
  color?: string;
}

// ============ Reading Progress ============

export interface UpdateReadingProgressRequest {
  currentPage: number;
  percentage: number;
  lastPosition?: {
    chapterId: string;
    sectionId: string;
    scrollPosition: number;
  };
  readingTime: number;
}

export interface ReadingStatsResponse {
  stats: Statistics;
}

// ============ Downloads ============

export interface CreateDownloadRequest {
  bookId: string;
  format: 'pdf' | 'epub';
}

export interface DownloadResponse {
  id: string;
  bookId: string;
  status: string;
  downloadUrl: string;
  fileSize: number;
  expiresAt: string;
}

// ============ Notifications ============

export interface RegisterDeviceTokenRequest {
  deviceToken: string;
  deviceType: 'ios' | 'android';
}

export interface NotificationsQuery extends PaginationParams {
  isRead?: boolean;
  type?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

// ============ Sync ============

export interface SyncRequest {
  lastSyncAt: string;
  pendingActions: Array<{
    action: 'create' | 'update' | 'delete';
    entityType: 'bookmark' | 'highlight' | 'progress';
    entityId?: string;
    data: any;
  }>;
}

export interface SyncResponse {
  processed: number;
  conflicts: any[];
  updates: {
    bookmarks: Bookmark[];
    highlights: Highlight[];
    progress: ReadingProgress[];
  };
  syncedAt: string;
}

// ============ User ============

export interface UpdateProfileRequest {
  name?: string;
  bio?: string;
  phoneNumber?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateSettingsRequest {
  theme?: 'light' | 'dark' | 'auto';
  language?: 'ar' | 'en';
  fontSize?: number;
  lineHeight?: number;
  notificationsEnabled?: boolean;
  dailyReminderTime?: {
    hour: number;
    minute: number;
  };
}

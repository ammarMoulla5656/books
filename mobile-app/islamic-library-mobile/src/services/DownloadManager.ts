/**
 * Download Manager Service
 * إدارة تحميل الكتب للقراءة بدون اتصال
 */

import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Download Status
 */
export enum DownloadStatus {
  PENDING = 'pending',
  DOWNLOADING = 'downloading',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PAUSED = 'paused',
}

/**
 * Download Item
 */
export interface DownloadItem {
  id: string;
  bookId: string;
  bookTitle: string;
  url: string;
  status: DownloadStatus;
  progress: number; // 0-100
  downloadedBytes: number;
  totalBytes: number;
  filePath?: string;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

/**
 * Download Manager Class
 */
class DownloadManagerService {
  private downloads: Map<string, DownloadItem> = new Map();
  private downloadTasks: Map<string, FileSystem.DownloadResumable> = new Map();
  private listeners: Array<(downloads: DownloadItem[]) => void> = [];

  constructor() {
    this.loadDownloads();
  }

  /**
   * Load downloads from AsyncStorage
   */
  private async loadDownloads() {
    try {
      const saved = await AsyncStorage.getItem('downloads');
      if (saved) {
        const downloads = JSON.parse(saved) as DownloadItem[];
        downloads.forEach((item) => {
          this.downloads.set(item.id, item);
        });
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load downloads:', error);
    }
  }

  /**
   * Save downloads to AsyncStorage
   */
  private async saveDownloads() {
    try {
      const downloads = Array.from(this.downloads.values());
      await AsyncStorage.setItem('downloads', JSON.stringify(downloads));
    } catch (error) {
      console.error('Failed to save downloads:', error);
    }
  }

  /**
   * Add listener for download updates
   */
  addListener(listener: (downloads: DownloadItem[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners() {
    const downloads = Array.from(this.downloads.values());
    this.listeners.forEach((listener) => listener(downloads));
  }

  /**
   * Start download
   */
  async startDownload(
    bookId: string,
    bookTitle: string,
    url: string
  ): Promise<string> {
    const id = `download_${bookId}_${Date.now()}`;
    const fileName = `${bookId}.pdf`;
    const filePath = `${FileSystem.documentDirectory}${fileName}`;

    const downloadItem: DownloadItem = {
      id,
      bookId,
      bookTitle,
      url,
      status: DownloadStatus.PENDING,
      progress: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      filePath,
      startedAt: new Date().toISOString(),
    };

    this.downloads.set(id, downloadItem);
    this.notifyListeners();
    this.saveDownloads();

    // Start actual download
    this.performDownload(id, url, filePath);

    return id;
  }

  /**
   * Perform actual download
   */
  private async performDownload(id: string, url: string, filePath: string) {
    const downloadItem = this.downloads.get(id);
    if (!downloadItem) return;

    try {
      // Update status to downloading
      downloadItem.status = DownloadStatus.DOWNLOADING;
      this.downloads.set(id, downloadItem);
      this.notifyListeners();

      // Create download resumable
      const downloadResumable = FileSystem.createDownloadResumable(
        url,
        filePath,
        {},
        (downloadProgress) => {
          const progress = Math.round(
            (downloadProgress.totalBytesWritten /
              downloadProgress.totalBytesExpectedToWrite) *
              100
          );

          downloadItem.progress = progress;
          downloadItem.downloadedBytes = downloadProgress.totalBytesWritten;
          downloadItem.totalBytes =
            downloadProgress.totalBytesExpectedToWrite;
          this.downloads.set(id, downloadItem);
          this.notifyListeners();
        }
      );

      this.downloadTasks.set(id, downloadResumable);

      // Start download
      const result = await downloadResumable.downloadAsync();

      if (result) {
        downloadItem.status = DownloadStatus.COMPLETED;
        downloadItem.progress = 100;
        downloadItem.completedAt = new Date().toISOString();
        downloadItem.filePath = result.uri;
        this.downloads.set(id, downloadItem);
        this.downloadTasks.delete(id);
        this.notifyListeners();
        this.saveDownloads();
      }
    } catch (error: any) {
      downloadItem.status = DownloadStatus.FAILED;
      downloadItem.error = error.message || 'Download failed';
      this.downloads.set(id, downloadItem);
      this.downloadTasks.delete(id);
      this.notifyListeners();
      this.saveDownloads();
    }
  }

  /**
   * Pause download
   */
  async pauseDownload(id: string): Promise<void> {
    const downloadTask = this.downloadTasks.get(id);
    const downloadItem = this.downloads.get(id);

    if (downloadTask && downloadItem) {
      try {
        await downloadTask.pauseAsync();
        downloadItem.status = DownloadStatus.PAUSED;
        this.downloads.set(id, downloadItem);
        this.notifyListeners();
        this.saveDownloads();
      } catch (error) {
        console.error('Failed to pause download:', error);
      }
    }
  }

  /**
   * Resume download
   */
  async resumeDownload(id: string): Promise<void> {
    const downloadTask = this.downloadTasks.get(id);
    const downloadItem = this.downloads.get(id);

    if (downloadTask && downloadItem) {
      try {
        await downloadTask.resumeAsync();
        downloadItem.status = DownloadStatus.DOWNLOADING;
        this.downloads.set(id, downloadItem);
        this.notifyListeners();
        this.saveDownloads();
      } catch (error) {
        console.error('Failed to resume download:', error);
      }
    }
  }

  /**
   * Cancel download
   */
  async cancelDownload(id: string): Promise<void> {
    const downloadTask = this.downloadTasks.get(id);
    const downloadItem = this.downloads.get(id);

    if (downloadTask && downloadItem) {
      try {
        await downloadTask.pauseAsync();
        this.downloadTasks.delete(id);

        // Delete file if exists
        if (downloadItem.filePath) {
          const fileInfo = await FileSystem.getInfoAsync(
            downloadItem.filePath
          );
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(downloadItem.filePath);
          }
        }

        this.downloads.delete(id);
        this.notifyListeners();
        this.saveDownloads();
      } catch (error) {
        console.error('Failed to cancel download:', error);
      }
    }
  }

  /**
   * Delete download
   */
  async deleteDownload(id: string): Promise<void> {
    const downloadItem = this.downloads.get(id);

    if (downloadItem) {
      // Cancel if downloading
      if (downloadItem.status === DownloadStatus.DOWNLOADING) {
        await this.cancelDownload(id);
        return;
      }

      // Delete file
      if (downloadItem.filePath) {
        try {
          const fileInfo = await FileSystem.getInfoAsync(
            downloadItem.filePath
          );
          if (fileInfo.exists) {
            await FileSystem.deleteAsync(downloadItem.filePath);
          }
        } catch (error) {
          console.error('Failed to delete file:', error);
        }
      }

      this.downloads.delete(id);
      this.notifyListeners();
      this.saveDownloads();
    }
  }

  /**
   * Get download by ID
   */
  getDownload(id: string): DownloadItem | undefined {
    return this.downloads.get(id);
  }

  /**
   * Get download by book ID
   */
  getDownloadByBookId(bookId: string): DownloadItem | undefined {
    return Array.from(this.downloads.values()).find(
      (item) => item.bookId === bookId
    );
  }

  /**
   * Get all downloads
   */
  getAllDownloads(): DownloadItem[] {
    return Array.from(this.downloads.values());
  }

  /**
   * Get active downloads
   */
  getActiveDownloads(): DownloadItem[] {
    return Array.from(this.downloads.values()).filter(
      (item) =>
        item.status === DownloadStatus.DOWNLOADING ||
        item.status === DownloadStatus.PENDING
    );
  }

  /**
   * Get completed downloads
   */
  getCompletedDownloads(): DownloadItem[] {
    return Array.from(this.downloads.values()).filter(
      (item) => item.status === DownloadStatus.COMPLETED
    );
  }

  /**
   * Check if book is downloaded
   */
  isBookDownloaded(bookId: string): boolean {
    const download = this.getDownloadByBookId(bookId);
    return download?.status === DownloadStatus.COMPLETED;
  }

  /**
   * Get total downloaded size
   */
  getTotalDownloadedSize(): number {
    return Array.from(this.downloads.values())
      .filter((item) => item.status === DownloadStatus.COMPLETED)
      .reduce((total, item) => total + item.totalBytes, 0);
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Clear all completed downloads
   */
  async clearCompletedDownloads(): Promise<void> {
    const completed = this.getCompletedDownloads();
    for (const item of completed) {
      await this.deleteDownload(item.id);
    }
  }
}

// Export singleton instance
export const DownloadManager = new DownloadManagerService();

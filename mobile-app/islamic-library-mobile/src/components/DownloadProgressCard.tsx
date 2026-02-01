/**
 * DownloadProgressCard
 * عرض تقدم التحميل
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import { DownloadItem, DownloadStatus, DownloadManager } from '@/services/DownloadManager';

interface DownloadProgressCardProps {
  download: DownloadItem;
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
}

export const DownloadProgressCard: React.FC<DownloadProgressCardProps> = ({
  download,
  onCancel,
  onRetry,
}) => {
  const getStatusColor = () => {
    switch (download.status) {
      case DownloadStatus.COMPLETED:
        return Colors.light.success;
      case DownloadStatus.DOWNLOADING:
        return Colors.light.primary;
      case DownloadStatus.FAILED:
        return Colors.light.error;
      case DownloadStatus.PAUSED:
        return Colors.light.warning;
      default:
        return Colors.light.textMuted;
    }
  };

  const getStatusText = () => {
    switch (download.status) {
      case DownloadStatus.COMPLETED:
        return 'مكتمل';
      case DownloadStatus.DOWNLOADING:
        return 'جاري التحميل...';
      case DownloadStatus.FAILED:
        return 'فشل التحميل';
      case DownloadStatus.PAUSED:
        return 'متوقف مؤقتاً';
      case DownloadStatus.PENDING:
        return 'في الانتظار...';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (download.status) {
      case DownloadStatus.COMPLETED:
        return 'checkmark-circle';
      case DownloadStatus.DOWNLOADING:
        return 'download';
      case DownloadStatus.FAILED:
        return 'alert-circle';
      case DownloadStatus.PAUSED:
        return 'pause-circle';
      default:
        return 'time';
    }
  };

  const handleActionPress = () => {
    if (download.status === DownloadStatus.FAILED && onRetry) {
      onRetry(download.id);
    } else if (
      download.status === DownloadStatus.DOWNLOADING ||
      download.status === DownloadStatus.PENDING
    ) {
      if (onCancel) {
        onCancel(download.id);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons
            name={getStatusIcon() as any}
            size={20}
            color={getStatusColor()}
          />
          <Text style={styles.title} numberOfLines={1}>
            {download.bookTitle}
          </Text>
        </View>

        {(download.status === DownloadStatus.DOWNLOADING ||
          download.status === DownloadStatus.PENDING ||
          download.status === DownloadStatus.FAILED) && (
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
            onPress={handleActionPress}
          >
            <Ionicons
              name={
                download.status === DownloadStatus.FAILED
                  ? 'refresh'
                  : 'close-circle'
              }
              size={20}
              color={
                download.status === DownloadStatus.FAILED
                  ? Colors.light.primary
                  : Colors.light.error
              }
            />
          </Pressable>
        )}
      </View>

      {/* Status */}
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
        {download.status === DownloadStatus.DOWNLOADING && (
          <Text style={styles.progressText}>{download.progress}%</Text>
        )}
      </View>

      {/* Progress Bar */}
      {(download.status === DownloadStatus.DOWNLOADING ||
        download.status === DownloadStatus.PAUSED) && (
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${download.progress}%`,
                backgroundColor: getStatusColor(),
              },
            ]}
          />
        </View>
      )}

      {/* Size Info */}
      {download.totalBytes > 0 && (
        <View style={styles.sizeInfo}>
          <Text style={styles.sizeText}>
            {DownloadManager.formatBytes(download.downloadedBytes)} /{' '}
            {DownloadManager.formatBytes(download.totalBytes)}
          </Text>
        </View>
      )}

      {/* Error Message */}
      {download.status === DownloadStatus.FAILED && download.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{download.error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.light.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sizeInfo: {
    alignItems: 'flex-start',
  },
  sizeText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  errorContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: Colors.light.error,
  },
});

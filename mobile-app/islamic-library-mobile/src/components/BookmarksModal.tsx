/**
 * BookmarksModal
 * مودال عرض وإدارة العلامات المرجعية
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import type { Bookmark } from '@/stores';

interface BookmarksModalProps {
  visible: boolean;
  bookmarks: Bookmark[];
  onClose: () => void;
  onBookmarkPress: (bookmark: Bookmark) => void;
  onBookmarkDelete: (bookmarkId: string) => void;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  visible,
  bookmarks,
  onClose,
  onBookmarkPress,
  onBookmarkDelete,
}) => {
  const renderBookmark = ({ item }: { item: Bookmark }) => (
    <Pressable
      style={({ pressed }) => [
        styles.bookmarkItem,
        pressed && styles.bookmarkItemPressed,
      ]}
      onPress={() => {
        onBookmarkPress(item);
        onClose();
      }}
    >
      <View style={styles.bookmarkContent}>
        <Ionicons name="bookmark" size={20} color={Colors.light.primary} />
        <View style={styles.bookmarkInfo}>
          <Text style={styles.bookmarkTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.bookmarkPage}>صفحة {item.page}</Text>
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.deleteButtonPressed,
        ]}
        onPress={() => onBookmarkDelete(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color={Colors.light.error} />
      </Pressable>
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>العلامات المرجعية</Text>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </Pressable>
          </View>

          {bookmarks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="bookmark-outline"
                size={64}
                color={Colors.light.textMuted}
              />
              <Text style={styles.emptyText}>لا توجد علامات مرجعية</Text>
              <Text style={styles.emptySubtext}>
                اضغط على أيقونة العلامة المرجعية لحفظ الصفحة الحالية
              </Text>
            </View>
          ) : (
            <FlatList
              data={bookmarks}
              renderItem={renderBookmark}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  listContainer: {
    padding: 16,
  },
  bookmarkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  bookmarkItemPressed: {
    opacity: 0.7,
  },
  bookmarkContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bookmarkInfo: {
    flex: 1,
  },
  bookmarkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  bookmarkPage: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonPressed: {
    opacity: 0.7,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

/**
 * ReviewModal
 * مودال إضافة وتحرير التقييمات
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';
import type { Review } from '@/stores';

interface ReviewModalProps {
  visible: boolean;
  bookTitle: string;
  existingReview?: Review | null;
  onClose: () => void;
  onSave: (rating: number, comment: string) => void;
  onDelete?: (reviewId: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  visible,
  bookTitle,
  existingReview,
  onClose,
  onSave,
  onDelete,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (visible) {
      setRating(existingReview?.rating || 5);
      setComment(existingReview?.comment || '');
    }
  }, [visible, existingReview]);

  const handleSave = () => {
    if (rating === 0) {
      return;
    }
    onSave(rating, comment.trim());
    setRating(5);
    setComment('');
    onClose();
  };

  const handleDelete = () => {
    if (existingReview && onDelete) {
      onDelete(existingReview.id);
      setRating(5);
      setComment('');
      onClose();
    }
  };

  const handleClose = () => {
    setRating(5);
    setComment('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.modalOverlay} onPress={handleClose}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>
                  {existingReview ? 'تعديل التقييم' : 'إضافة تقييم'}
                </Text>
                <Text style={styles.bookTitle} numberOfLines={1}>
                  {bookTitle}
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.closeButton,
                  pressed && styles.closeButtonPressed,
                ]}
                onPress={handleClose}
              >
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </Pressable>
            </View>

            {/* Rating Stars */}
            <View style={styles.ratingSection}>
              <Text style={styles.ratingLabel}>التقييم</Text>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable
                    key={star}
                    onPress={() => setRating(star)}
                    style={({ pressed }) => [
                      styles.starButton,
                      pressed && styles.starButtonPressed,
                    ]}
                  >
                    <Ionicons
                      name={star <= rating ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= rating ? '#FFA000' : Colors.light.textMuted}
                    />
                  </Pressable>
                ))}
              </View>
              <Text style={styles.ratingText}>
                {rating === 1
                  ? 'ضعيف'
                  : rating === 2
                  ? 'مقبول'
                  : rating === 3
                  ? 'جيد'
                  : rating === 4
                  ? 'جيد جداً'
                  : 'ممتاز'}
              </Text>
            </View>

            {/* Comment Input */}
            <View style={styles.commentSection}>
              <Text style={styles.commentLabel}>
                التعليق (اختياري)
              </Text>
              <TextInput
                style={styles.commentInput}
                placeholder="شارك رأيك حول هذا الكتاب..."
                placeholderTextColor={Colors.light.textMuted}
                value={comment}
                onChangeText={setComment}
                multiline
                numberOfLines={5}
                textAlign="right"
              />
              <Text style={styles.charCount}>{comment.length} حرف</Text>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              {existingReview && onDelete && (
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && styles.deleteButtonPressed,
                  ]}
                  onPress={handleDelete}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={Colors.light.background}
                  />
                  <Text style={styles.deleteButtonText}>حذف</Text>
                </Pressable>
              )}

              <View style={styles.rightActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.cancelButton,
                    pressed && styles.cancelButtonPressed,
                  ]}
                  onPress={handleClose}
                >
                  <Text style={styles.cancelButtonText}>إلغاء</Text>
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.saveButton,
                    rating === 0 && styles.saveButtonDisabled,
                    pressed && styles.saveButtonPressed,
                  ]}
                  onPress={handleSave}
                  disabled={rating === 0}
                >
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={Colors.light.background}
                  />
                  <Text style={styles.saveButtonText}>حفظ</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
    marginBottom: 4,
  },
  bookTitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
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
  ratingSection: {
    padding: 20,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  starButtonPressed: {
    opacity: 0.7,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  commentSection: {
    padding: 20,
    paddingTop: 0,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.light.text,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  charCount: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'left',
    marginTop: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 12,
  },
  rightActions: {
    flexDirection: 'row',
    gap: 12,
    flex: 1,
    justifyContent: 'flex-end',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.light.error,
  },
  deleteButtonPressed: {
    opacity: 0.8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.background,
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  cancelButtonPressed: {
    opacity: 0.7,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonPressed: {
    opacity: 0.8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.background,
  },
});

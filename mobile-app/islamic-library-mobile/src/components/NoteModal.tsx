/**
 * NoteModal
 * مودال إضافة وتحرير الملاحظات
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
import type { Note } from '@/stores';

interface NoteModalProps {
  visible: boolean;
  existingNote?: Note | null;
  currentPage: number;
  onClose: () => void;
  onSave: (content: string) => void;
  onDelete?: (noteId: string) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  visible,
  existingNote,
  currentPage,
  onClose,
  onSave,
  onDelete,
}) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    if (visible) {
      setContent(existingNote?.content || '');
    }
  }, [visible, existingNote]);

  const handleSave = () => {
    if (content.trim().length === 0) {
      return;
    }
    onSave(content.trim());
    setContent('');
    onClose();
  };

  const handleDelete = () => {
    if (existingNote && onDelete) {
      onDelete(existingNote.id);
      setContent('');
      onClose();
    }
  };

  const handleClose = () => {
    setContent('');
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
                  {existingNote ? 'تعديل الملاحظة' : 'إضافة ملاحظة'}
                </Text>
                <Text style={styles.pageInfo}>صفحة {currentPage}</Text>
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

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="اكتب ملاحظتك هنا..."
                placeholderTextColor={Colors.light.textMuted}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={8}
                textAlign="right"
                autoFocus
              />
              <Text style={styles.charCount}>{content.length} حرف</Text>
            </View>

            <View style={styles.actionsContainer}>
              {existingNote && onDelete && (
                <Pressable
                  style={({ pressed }) => [
                    styles.deleteButton,
                    pressed && styles.deleteButtonPressed,
                  ]}
                  onPress={handleDelete}
                >
                  <Ionicons name="trash-outline" size={20} color={Colors.light.background} />
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
                    content.trim().length === 0 && styles.saveButtonDisabled,
                    pressed && styles.saveButtonPressed,
                  ]}
                  onPress={handleSave}
                  disabled={content.trim().length === 0}
                >
                  <Ionicons name="checkmark" size={20} color={Colors.light.background} />
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
  pageInfo: {
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
  inputContainer: {
    padding: 20,
  },
  input: {
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.light.text,
    minHeight: 160,
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

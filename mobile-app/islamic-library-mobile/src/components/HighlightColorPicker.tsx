/**
 * HighlightColorPicker
 * مكون اختيار لون التظليل
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants';

interface HighlightColorPickerProps {
  visible: boolean;
  selectedText: string;
  onClose: () => void;
  onColorSelect: (color: string) => void;
}

const HIGHLIGHT_COLORS = [
  { color: '#FFEB3B', name: 'أصفر' },
  { color: '#4CAF50', name: 'أخضر' },
  { color: '#2196F3', name: 'أزرق' },
  { color: '#FF9800', name: 'برتقالي' },
  { color: '#E91E63', name: 'وردي' },
  { color: '#9C27B0', name: 'بنفسجي' },
];

export const HighlightColorPicker: React.FC<HighlightColorPickerProps> = ({
  visible,
  selectedText,
  onClose,
  onColorSelect,
}) => {
  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
          <View style={styles.header}>
            <Text style={styles.title}>اختر لون التظليل</Text>
            <Pressable
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}
              onPress={onClose}
            >
              <Ionicons name="close" size={20} color={Colors.light.text} />
            </Pressable>
          </View>

          {selectedText.length > 0 && (
            <View style={styles.textPreview}>
              <Text style={styles.textPreviewLabel}>النص المحدد:</Text>
              <Text style={styles.textPreviewContent} numberOfLines={3}>
                {selectedText}
              </Text>
            </View>
          )}

          <View style={styles.colorsContainer}>
            {HIGHLIGHT_COLORS.map((item) => (
              <Pressable
                key={item.color}
                style={({ pressed }) => [
                  styles.colorButton,
                  { backgroundColor: item.color },
                  pressed && styles.colorButtonPressed,
                ]}
                onPress={() => handleColorSelect(item.color)}
              >
                <Text style={styles.colorName}>{item.name}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonPressed: {
    opacity: 0.7,
  },
  textPreview: {
    padding: 16,
    backgroundColor: Colors.light.backgroundSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  textPreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  textPreviewContent: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 22,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  colorButton: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  colorButtonPressed: {
    opacity: 0.8,
  },
  colorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
});

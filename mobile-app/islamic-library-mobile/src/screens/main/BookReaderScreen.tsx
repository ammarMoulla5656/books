/**
 * BookReaderScreen
 * شاشة قراءة الكتاب مع Bookmarks/Highlights/Notes
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import type { MainStackScreenProps } from '@/navigation';
import { Colors } from '@/constants';
import { useBookStore } from '@/stores';
import {
  BookmarksModal,
  HighlightColorPicker,
  NoteModal,
} from '@/components';

type RouteProp = MainStackScreenProps<'BookReader'>['route'];

// Mock book content
const MOCK_CONTENT = `بسم الله الرحمن الرحيم

الحمد لله رب العالمين، والصلاة والسلام على أشرف الأنبياء والمرسلين، نبينا محمد وعلى آله وصحبه أجمعين.

أما بعد:

فإن العلم الشرعي هو أساس كل خير، وهو النور الذي يضيء للمسلم طريقه في هذه الحياة، وهو الميزان الذي يزن به الأمور، ويفرق به بين الحق والباطل.

ولقد حث الإسلام على طلب العلم، وبين فضله وأهميته في آيات كثيرة من القرآن الكريم، وأحاديث متعددة من السنة النبوية المطهرة.

قال الله تعالى: {يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ} [المجادلة: 11]

وقال تعالى: {قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ} [الزمر: 9]

وقال النبي صلى الله عليه وسلم: "من سلك طريقاً يلتمس فيه علماً سهل الله له به طريقاً إلى الجنة" [رواه مسلم]

وقال صلى الله عليه وسلم: "طلب العلم فريضة على كل مسلم" [رواه ابن ماجه]

فالعلم الشرعي هو أشرف العلوم وأنفعها، لأنه يتعلق بمعرفة الله تعالى ومعرفة دينه، وهو السبيل إلى معرفة ما يحبه الله ويرضاه، وما يكرهه ويأباه.

والله الموفق والهادي إلى سواء السبيل.`;

export const BookReaderScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp>();
  const { bookId, bookTitle } = route.params;

  // Book Store
  const {
    addBookmark,
    removeBookmark,
    getBookBookmarks,
    addHighlight,
    getBookHighlights,
    addNote,
    updateNote,
    removeNote,
    getBookNotes,
    updateProgress,
    addReadingHistory,
  } = useBookStore();

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const [fontSize, setFontSize] = useState(18);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Bookmarks State
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [bookmarks, setBookmarks] = useState(getBookBookmarks(bookId));

  // Highlights State
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  // Notes State
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState<any>(null);
  const [pageNotes, setPageNotes] = useState<any[]>([]);

  // Reading Timer
  const [readingStartTime, setReadingStartTime] = useState(Date.now());

  const totalPages = 2345; // Mock
  const progress = Math.round((currentPage / totalPages) * 100);

  // Update bookmarks when modal opens
  useEffect(() => {
    if (showBookmarks) {
      setBookmarks(getBookBookmarks(bookId));
    }
  }, [showBookmarks, bookId]);

  // Update page notes when page changes
  useEffect(() => {
    const notes = getBookNotes(bookId).filter(
      (note) => note.page === currentPage
    );
    setPageNotes(notes);
  }, [currentPage, bookId]);

  // Track reading time on unmount
  useEffect(() => {
    return () => {
      const duration = Math.floor((Date.now() - readingStartTime) / 1000);
      addReadingHistory({
        bookId,
        page: currentPage,
        duration,
      });
    };
  }, []);

  // Update progress when page changes
  useEffect(() => {
    updateProgress(bookId, progress);
  }, [progress, bookId]);

  const handleBackPress = () => {
    // Save reading time before leaving
    const duration = Math.floor((Date.now() - readingStartTime) / 1000);
    addReadingHistory({
      bookId,
      page: currentPage,
      duration,
    });
    navigation.goBack();
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleIncreaseFontSize = () => {
    if (fontSize < 28) {
      setFontSize(fontSize + 2);
    }
  };

  const handleDecreaseFontSize = () => {
    if (fontSize > 14) {
      setFontSize(fontSize - 2);
    }
  };

  // Bookmark Handlers
  const handleAddBookmark = () => {
    addBookmark({
      bookId,
      page: currentPage,
      title: `صفحة ${currentPage}`,
    });
    Alert.alert('تم الحفظ', 'تمت إضافة العلامة المرجعية بنجاح');
  };

  const handleBookmarkPress = (bookmark: any) => {
    setCurrentPage(bookmark.page);
  };

  const handleBookmarkDelete = (bookmarkId: string) => {
    removeBookmark(bookmarkId);
    setBookmarks(getBookBookmarks(bookId));
  };

  // Highlight Handlers
  const handleTextSelect = () => {
    // Simulate text selection - in real app, this would use actual text selection API
    const mockSelectedText = 'فإن العلم الشرعي هو أساس كل خير';
    setSelectedText(mockSelectedText);
    setShowHighlightPicker(true);
  };

  const handleHighlightColorSelect = (color: string) => {
    if (selectedText) {
      addHighlight({
        bookId,
        page: currentPage,
        text: selectedText,
        color,
      });
      setSelectedText('');
      Alert.alert('تم التظليل', 'تم تظليل النص بنجاح');
    }
  };

  // Note Handlers
  const handleAddNote = () => {
    setCurrentNote(null);
    setShowNoteModal(true);
  };

  const handleEditNote = (note: any) => {
    setCurrentNote(note);
    setShowNoteModal(true);
  };

  const handleSaveNote = (content: string) => {
    if (currentNote) {
      // Update existing note
      updateNote(currentNote.id, content);
    } else {
      // Add new note
      addNote({
        bookId,
        page: currentPage,
        content,
      });
    }
    // Refresh page notes
    const notes = getBookNotes(bookId).filter(
      (note) => note.page === currentPage
    );
    setPageNotes(notes);
  };

  const handleDeleteNote = (noteId: string) => {
    removeNote(noteId);
    // Refresh page notes
    const notes = getBookNotes(bookId).filter(
      (note) => note.page === currentPage
    );
    setPageNotes(notes);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
          onPress={handleBackPress}
        >
          <Ionicons name="close" size={24} color={Colors.light.text} />
        </Pressable>

        <View style={styles.titleContainer}>
          <Text style={styles.bookTitle} numberOfLines={1}>
            {bookTitle}
          </Text>
          <Text style={styles.pageInfo}>
            صفحة {currentPage} من {totalPages}
          </Text>
        </View>

        <View style={styles.topActions}>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            onPress={() => setShowBookmarks(true)}
          >
            <Ionicons name="bookmarks" size={22} color={Colors.light.text} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              pressed && styles.iconButtonPressed,
            ]}
            onPress={() => setShowSettings(true)}
          >
            <Ionicons name="settings-outline" size={22} color={Colors.light.text} />
          </Pressable>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        onPress={() => setShowMenu(!showMenu)}
      >
        <Pressable onPress={() => setShowMenu(!showMenu)}>
          <Text style={[styles.text, { fontSize }]}>{MOCK_CONTENT}</Text>
        </Pressable>

        {/* Page Notes Display */}
        {pageNotes.length > 0 && (
          <View style={styles.notesSection}>
            <Text style={styles.notesSectionTitle}>
              📝 ملاحظات هذه الصفحة ({pageNotes.length})
            </Text>
            {pageNotes.map((note) => (
              <Pressable
                key={note.id}
                style={({ pressed }) => [
                  styles.noteCard,
                  pressed && styles.noteCardPressed,
                ]}
                onPress={() => handleEditNote(note)}
              >
                <Text style={styles.noteContent} numberOfLines={3}>
                  {note.content}
                </Text>
                <Text style={styles.noteDate}>
                  {new Date(note.updatedAt).toLocaleDateString('ar-DZ')}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: Colors.light.success },
            pressed && styles.fabPressed,
          ]}
          onPress={handleAddNote}
        >
          <Ionicons name="create-outline" size={24} color={Colors.light.background} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: '#FFEB3B' },
            pressed && styles.fabPressed,
          ]}
          onPress={handleTextSelect}
        >
          <Ionicons name="color-fill" size={24} color="#000" />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.fab,
            { backgroundColor: Colors.light.primary },
            pressed && styles.fabPressed,
          ]}
          onPress={handleAddBookmark}
        >
          <Ionicons name="bookmark" size={24} color={Colors.light.background} />
        </Pressable>
      </View>

      {/* Bottom Navigation */}
      {showMenu && (
        <View style={styles.bottomBar}>
          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              currentPage === 1 && styles.navButtonDisabled,
              pressed && styles.navButtonPressed,
            ]}
            onPress={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={
                currentPage === 1
                  ? Colors.light.textMuted
                  : Colors.light.primary
              }
            />
            <Text
              style={[
                styles.navButtonText,
                currentPage === 1 && styles.navButtonTextDisabled,
              ]}
            >
              السابق
            </Text>
          </Pressable>

          <View style={styles.pageSlider}>
            <Text style={styles.pageSliderText}>{currentPage}</Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.navButton,
              currentPage === totalPages && styles.navButtonDisabled,
              pressed && styles.navButtonPressed,
            ]}
            onPress={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <Text
              style={[
                styles.navButtonText,
                currentPage === totalPages && styles.navButtonTextDisabled,
              ]}
            >
              التالي
            </Text>
            <Ionicons
              name="chevron-back"
              size={24}
              color={
                currentPage === totalPages
                  ? Colors.light.textMuted
                  : Colors.light.primary
              }
            />
          </Pressable>
        </View>
      )}

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSettings(false)}
        >
          <View style={styles.settingsPanel}>
            <Text style={styles.settingsTitle}>إعدادات القراءة</Text>

            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>حجم الخط</Text>
              <View style={styles.fontSizeControls}>
                <Pressable
                  style={({ pressed }) => [
                    styles.fontSizeButton,
                    pressed && styles.fontSizeButtonPressed,
                  ]}
                  onPress={handleDecreaseFontSize}
                >
                  <Ionicons name="remove" size={20} color={Colors.light.text} />
                </Pressable>
                <Text style={styles.fontSizeValue}>{fontSize}</Text>
                <Pressable
                  style={({ pressed }) => [
                    styles.fontSizeButton,
                    pressed && styles.fontSizeButtonPressed,
                  ]}
                  onPress={handleIncreaseFontSize}
                >
                  <Ionicons name="add" size={20} color={Colors.light.text} />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                styles.closeSettingsButton,
                pressed && styles.closeSettingsButtonPressed,
              ]}
              onPress={() => setShowSettings(false)}
            >
              <Text style={styles.closeSettingsButtonText}>إغلاق</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Bookmarks Modal */}
      <BookmarksModal
        visible={showBookmarks}
        bookmarks={bookmarks}
        onClose={() => setShowBookmarks(false)}
        onBookmarkPress={handleBookmarkPress}
        onBookmarkDelete={handleBookmarkDelete}
      />

      {/* Highlight Color Picker */}
      <HighlightColorPicker
        visible={showHighlightPicker}
        selectedText={selectedText}
        onClose={() => setShowHighlightPicker(false)}
        onColorSelect={handleHighlightColorSelect}
      />

      {/* Note Modal */}
      <NoteModal
        visible={showNoteModal}
        existingNote={currentNote}
        currentPage={currentPage}
        onClose={() => setShowNoteModal(false)}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFEF7', // Warm reading background
  },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonPressed: {
    opacity: 0.7,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 2,
  },
  pageInfo: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },

  // Progress Bar
  progressBar: {
    height: 3,
    backgroundColor: Colors.light.border,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.primary,
  },

  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
  },
  text: {
    lineHeight: 32,
    color: Colors.light.text,
    textAlign: 'right',
    fontFamily: 'System',
  },

  // Notes Section
  notesSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 2,
    borderTopColor: Colors.light.border,
  },
  notesSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  noteCard: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#FFF9C4',
    borderLeftWidth: 4,
    borderLeftColor: '#FBC02D',
  },
  noteCardPressed: {
    opacity: 0.7,
  },
  noteContent: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 22,
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },

  // Floating Action Buttons
  fabContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    gap: 12,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  fabPressed: {
    opacity: 0.8,
  },

  // Bottom Bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    backgroundColor: Colors.light.background,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.backgroundSecondary,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonPressed: {
    opacity: 0.7,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  navButtonTextDisabled: {
    color: Colors.light.textMuted,
  },
  pageSlider: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
  },
  pageSliderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.background,
  },

  // Settings Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  settingsPanel: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  settingsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  fontSizeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.light.backgroundSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeButtonPressed: {
    opacity: 0.7,
  },
  fontSizeValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    minWidth: 40,
    textAlign: 'center',
  },
  closeSettingsButton: {
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.light.primary,
  },
  closeSettingsButtonPressed: {
    opacity: 0.8,
  },
  closeSettingsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.background,
    textAlign: 'center',
  },
});

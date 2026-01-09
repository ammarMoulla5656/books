import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ReadingSettings, Bookmark } from './types';

interface AppState {
  readingSettings: ReadingSettings;
  bookmarks: Bookmark[];
  setFontSize: (size: number) => void;
  setLineSpacing: (spacing: number) => void;
  toggleDarkMode: () => void;
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  setBookmarks: (bookmarks: Bookmark[]) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      readingSettings: {
        fontSize: 18,
        lineSpacing: 1.8,
        darkMode: false,
      },
      bookmarks: [],
      setFontSize: (size) =>
        set((state) => ({
          readingSettings: { ...state.readingSettings, fontSize: size },
        })),
      setLineSpacing: (spacing) =>
        set((state) => ({
          readingSettings: { ...state.readingSettings, lineSpacing: spacing },
        })),
      toggleDarkMode: () =>
        set((state) => ({
          readingSettings: {
            ...state.readingSettings,
            darkMode: !state.readingSettings.darkMode,
          },
        })),
      addBookmark: (bookmark) =>
        set((state) => ({
          bookmarks: [...state.bookmarks, bookmark],
        })),
      removeBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        })),
      setBookmarks: (bookmarks) => set({ bookmarks }),
    }),
    {
      name: 'library-storage',
    }
  )
);

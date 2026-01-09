import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Book, Bookmark } from './types';

// Books Collection
const booksCollection = collection(db, 'books');
const bookmarksCollection = collection(db, 'bookmarks');

// Get all books
export async function getAllBooks(): Promise<Book[]> {
  const q = query(booksCollection, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Book[];
}

// Get a single book by ID
export async function getBookById(id: string): Promise<Book | null> {
  const docRef = doc(db, 'books', id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Book;
  }
  return null;
}

// Add a new book
export async function addBook(book: Omit<Book, 'id'>): Promise<string> {
  const docRef = await addDoc(booksCollection, {
    ...book,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return docRef.id;
}

// Update a book
export async function updateBook(id: string, book: Partial<Book>): Promise<void> {
  const docRef = doc(db, 'books', id);
  await updateDoc(docRef, {
    ...book,
    updatedAt: Timestamp.now(),
  });
}

// Delete a book
export async function deleteBook(id: string): Promise<void> {
  const docRef = doc(db, 'books', id);
  await deleteDoc(docRef);
}

// Upload image to Firebase Storage or convert to base64
export async function uploadImage(file: File, path: string): Promise<string> {
  try {
    // Check if Firebase Storage is configured
    if (!storage || !process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET) {
      // Fallback to base64 encoding for local development
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    // Fallback to base64 encoding
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Bookmarks
export async function getBookmarks(): Promise<Bookmark[]> {
  const snapshot = await getDocs(bookmarksCollection);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Bookmark[];
}

export async function addBookmark(bookmark: Omit<Bookmark, 'id'>): Promise<string> {
  const docRef = await addDoc(bookmarksCollection, {
    ...bookmark,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

export async function deleteBookmark(id: string): Promise<void> {
  const docRef = doc(db, 'bookmarks', id);
  await deleteDoc(docRef);
}

// Search books
export async function searchBooks(searchTerm: string): Promise<Book[]> {
  const books = await getAllBooks();
  const lowercaseSearch = searchTerm.toLowerCase();

  return books.filter(book => {
    // Search in title
    if (book.title.toLowerCase().includes(lowercaseSearch)) return true;

    // Search in category
    if (book.category.toLowerCase().includes(lowercaseSearch)) return true;

    // Search in chapters
    for (const chapter of book.chapters) {
      if (chapter.title.toLowerCase().includes(lowercaseSearch)) return true;

      // Search in sections
      for (const section of chapter.sections) {
        if (section.title.toLowerCase().includes(lowercaseSearch)) return true;
        if (section.content.toLowerCase().includes(lowercaseSearch)) return true;
      }
    }

    return false;
  });
}

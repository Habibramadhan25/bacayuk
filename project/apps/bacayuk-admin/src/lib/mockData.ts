export interface Book {
  id: string;
  title: string;
  author: string;
  category: string;
  year: number;
  publisher: string;
  isbn: string;
  status: 'Published' | 'Draft' | string;
  rating: number;
  readers: number;
  dateAdded: string;
  coverUrl: string;
  description: string;
}

export interface User {
  id: string;
  name: string;
  email: string | null;
  username: string;
  joinDate: string;
  booksRead: number;
  booksCompleted: number;
  status: 'Active' | 'Inactive' | string;
  avatar?: string;
  avatarUrl?: string | null;
  school?: string;
}

export interface Category {
  id: string;
  name: string;
  bookCount: number;
}

export interface HistoryItem {
  id: string;
  studentId?: string | null;
  bookId: string;
  bookTitle: string;
  author: string;
  coverUrl: string;
  progress: number;
  currentPage: number;
  totalPages: number;
  lastRead: string;
  status: 'Sedang Dibaca' | 'Selesai' | 'Belum Selesai' | string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  status: 'Success' | 'Warning' | 'Error' | string;
}

export interface Review {
  id: string;
  bookId: string;
  studentId?: string | null;
  name: string;
  rating: number;
  text: string;
  date?: string;
  createdAt?: string;
}

// Data aplikasi kini diambil dari backend/MySQL (tanpa seed localStorage).
export const initLocalStorage = () => {};

export type SessionUser = {
  id: string;
  username?: string;
  name?: string;
  email?: string | null;
  role?: string;
  school?: string;
  avatarUrl?: string | null;
  avatar?: string | null;
  timezone?: string;
  booksRead?: number;
  booksCompleted?: number;
  status?: string;
  type: 'admin' | 'student';
};

const ADMIN_KEY = 'bacayuk_session_admin';
const STUDENT_KEY = 'bacayuk_session_student';

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: any) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function remove(key: string) {
  try {
    sessionStorage.removeItem(key);
  } catch {}
}

export function getAdminSession(): SessionUser | null {
  return read<SessionUser>(ADMIN_KEY);
}

export function setAdminSession(user: SessionUser) {
  write(ADMIN_KEY, { ...user, type: 'admin' });
  window.dispatchEvent(new Event('auth_changed'));
}

export function clearAdminSession() {
  remove(ADMIN_KEY);
  window.dispatchEvent(new Event('auth_changed'));
}

export function getStudentSession(): SessionUser | null {
  return read<SessionUser>(STUDENT_KEY);
}

export function setStudentSession(user: SessionUser) {
  write(STUDENT_KEY, { ...user, type: 'student' });
  window.dispatchEvent(new Event('auth_changed'));
}

export function clearStudentSession() {
  remove(STUDENT_KEY);
  window.dispatchEvent(new Event('auth_changed'));
}

export function isAdminAuthed() {
  return !!getAdminSession();
}

export function isStudentAuthed() {
  return !!getStudentSession();
}

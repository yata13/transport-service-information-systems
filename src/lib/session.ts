import { SessionUser } from '../types';

const KEY = 'gondar-erp-session';
const MAX_AGE_MS = 12 * 60 * 60 * 1000; // one working shift

export function loadSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionUser & { at: number };
    if (!parsed.name || !parsed.token || Date.now() - parsed.at > MAX_AGE_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return { name: parsed.name, badge: parsed.badge, role: parsed.role, token: parsed.token };
  } catch {
    return null;
  }
}

export function saveSession(user: SessionUser): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...user, at: Date.now() }));
  } catch {
    // Storage unavailable (private mode) – session lasts until reload.
  }
}

export function clearSession(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

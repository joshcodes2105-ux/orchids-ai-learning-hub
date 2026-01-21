import { UserSession, SearchSession, LearningResource } from './types';

const STORAGE_KEY = 'learnai_session';

export function getStoredSession(): UserSession {
  if (typeof window === 'undefined') {
    return { sessions: [], bookmarks: [] };
  }
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to parse stored session', e);
  }
  
  return { sessions: [], bookmarks: [] };
}

export function saveSession(session: UserSession): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch (e) {
    console.error('Failed to save session', e);
  }
}

export function addSearchSession(topic: string, resources: LearningResource[]): SearchSession {
  const session = getStoredSession();
  const newSearch: SearchSession = {
    id: crypto.randomUUID(),
    topic,
    timestamp: Date.now(),
    resources,
  };
  
  session.sessions = [newSearch, ...session.sessions].slice(0, 20);
  session.currentTopic = topic;
  saveSession(session);
  
  return newSearch;
}

export function toggleBookmark(resource: LearningResource): boolean {
  const session = getStoredSession();
  const existingIndex = session.bookmarks.findIndex(b => b.id === resource.id);
  
  if (existingIndex > -1) {
    session.bookmarks.splice(existingIndex, 1);
    saveSession(session);
    return false;
  } else {
    session.bookmarks.push({ ...resource, bookmarked: true });
    saveSession(session);
    return true;
  }
}

export function isBookmarked(resourceId: string): boolean {
  const session = getStoredSession();
  return session.bookmarks.some(b => b.id === resourceId);
}

export function clearHistory(): void {
  const session = getStoredSession();
  session.sessions = [];
  saveSession(session);
}

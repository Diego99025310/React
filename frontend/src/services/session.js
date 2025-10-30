import { localStorageSafe, sessionStorageSafe } from './storage.js';

const KEYS = {
  token: 'token',
  role: 'role',
  userId: 'userId',
  userEmail: 'userEmail'
};

const AUTH_STORAGE_KEY = 'hidrapink:auth:v1';

const readPersistedAuth = () => {
  try {
    const raw = localStorageSafe.getItem(AUTH_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
    return {};
  } catch (error) {
    return {};
  }
};

const writePersistedAuth = (data) => {
  try {
    localStorageSafe.setItem(AUTH_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // ignore persistence failure
  }
};

const clearPersistedAuth = () => {
  try {
    localStorageSafe.removeItem(AUTH_STORAGE_KEY);
  } catch (error) {
    // ignore
  }
};

export const readSession = () => {
  const base = Object.fromEntries(
    Object.entries(KEYS).map(([key, value]) => [key, sessionStorageSafe.getItem(value) || ''])
  );
  const persisted = readPersistedAuth();
  return { ...persisted, ...base };
};

export const writeSession = ({ token, role, userId, userEmail }) => {
  if (token) {
    sessionStorageSafe.setItem(KEYS.token, token);
  }
  if (role) {
    sessionStorageSafe.setItem(KEYS.role, role);
  }
  if (userId) {
    sessionStorageSafe.setItem(KEYS.userId, userId);
  }
  if (userEmail) {
    sessionStorageSafe.setItem(KEYS.userEmail, userEmail);
  }
  writePersistedAuth({ token, role, userId, userEmail });
};

export const clearSession = () => {
  Object.values(KEYS).forEach((storageKey) => {
    sessionStorageSafe.removeItem(storageKey);
  });
  clearPersistedAuth();
};

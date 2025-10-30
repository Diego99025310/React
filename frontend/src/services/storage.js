const safeAccess = (storageProvider) => {
  if (!storageProvider) return null;
  try {
    const key = '__hidrapink_test__';
    storageProvider.setItem(key, '1');
    storageProvider.removeItem(key);
    return storageProvider;
  } catch (error) {
    return null;
  }
};

const createMemoryStorage = () => {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => {
      store.delete(key);
    }
  };
};

export const sessionStorageSafe = safeAccess(typeof window !== 'undefined' ? window.sessionStorage : null) ||
  createMemoryStorage();

export const localStorageSafe = safeAccess(typeof window !== 'undefined' ? window.localStorage : null) ||
  createMemoryStorage();

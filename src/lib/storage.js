export function storageGet(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  } catch {
    return fallback;
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`NeatClock: could not save ${key}`, error);
    return false;
  }
}

export function storageRemove(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/** Persist a value; invoke onFailure when localStorage rejects the write (quota, private mode). */
export function persistState(key, value, onFailure) {
  const ok = storageSet(key, value);
  if (!ok && typeof onFailure === 'function') {
    onFailure();
  }
  return ok;
}

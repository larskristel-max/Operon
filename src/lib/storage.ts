function asNonEmptyString(value: string | null): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function getSessionString(key: string): string | null {
  return asNonEmptyString(sessionStorage.getItem(key));
}

export function setSessionString(key: string, value: string): void {
  sessionStorage.setItem(key, value);
}

export function removeSessionKey(key: string): void {
  sessionStorage.removeItem(key);
}

export function getLocalString(key: string): string | null {
  return asNonEmptyString(localStorage.getItem(key));
}

export function setLocalString(key: string, value: string): void {
  localStorage.setItem(key, value);
}

export function removeLocalKey(key: string): void {
  localStorage.removeItem(key);
}

export function getSessionJson<T>(key: string): T | null {
  const raw = sessionStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setSessionJson<T>(key: string, value: T): void {
  sessionStorage.setItem(key, JSON.stringify(value));
}

export function getLocalJson<T>(key: string): T | null {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setLocalJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

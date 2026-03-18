export const SESSION_TOKEN_KEY = 'checklist.token';

export function getToken() {
  if (typeof window === 'undefined') {
    return '';
  }

  return window.localStorage.getItem(SESSION_TOKEN_KEY) ?? '';
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(SESSION_TOKEN_KEY);
  }
}

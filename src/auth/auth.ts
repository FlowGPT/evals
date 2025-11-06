const AUTH_TOKEN_KEY = 'auth_token'

export function setToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function clearToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function isAuthed(): boolean {
  return !!getToken()
}

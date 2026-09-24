// API base, token storage and authenticated fetch.

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? ''
const TOKEN_KEY = 'ck_token'

export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken(): void {
    localStorage.removeItem(TOKEN_KEY)
}

export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
    const isForm = options.body instanceof FormData
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (!isForm) headers['Content-Type'] = 'application/json'
    const token = getToken()
    if (token) headers.Authorization = 'Bearer ' + token
    return fetch(BASE + path, { ...options, headers })
}
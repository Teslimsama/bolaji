// API base, token storage and authenticated fetch.
// Injected at build time from the non-VITE variable CRESTKEEPER_API_URL,
// so it never leaves Vercel as a browser-exposed VITE_ value.

declare const __CRESTKEEPER_API_URL__: string | undefined

const BASE = (__CRESTKEEPER_API_URL__ ?? '').replace(/\/$/, '')
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
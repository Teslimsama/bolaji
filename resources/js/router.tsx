// Tiny client router: route lookup, navigation and Head/Link helpers.

import { useEffect, useState, type AnchorHTMLAttributes, type ComponentType, type ReactNode } from 'react'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Tree from './pages/Tree'
import Find from './pages/Find'
import AdminQueue from './pages/AdminQueue'
import Login from './pages/Auth/Login'
import RequestAccess from './pages/Auth/RequestAccess'
import VerifyStatus from './pages/Auth/VerifyStatus'
import Profile from './pages/Auth/Profile'

const routes: [string, ComponentType][] = [
    ['/', Home],
    ['/dashboard', Dashboard],
    ['/tree', Tree],
    ['/find', Find],
    ['/admin/queue', AdminQueue],
    ['/login', Login],
    ['/request-access', RequestAccess],
    ['/me/verify', VerifyStatus],
    ['/me', Profile],
]

function norm(p: string): string {
    if (p.length > 1 && p.endsWith('/')) return p.replace(/\/+$/, '')
    return p
}

export function route(path: string): ComponentType | null {
    const hit = routes.find(([p]) => norm(p) === norm(path))
    return hit ? hit[1] : null
}

let patched = false

function patchHistory(): void {
    if (patched) return
    patched = true
    const wrap = (name: 'pushState' | 'replaceState') => {
        const orig = window.history[name]
        const fn = function (this: History, ...args: Parameters<typeof orig>) {
            orig.apply(this, args)
            window.dispatchEvent(new PopStateEvent('popstate'))
        }
        ;(window.history as any)[name] = fn
    }
    wrap('pushState')
    wrap('replaceState')
}

export function navigate(path: string): void {
    window.history.pushState(null, '', path)
}

export function usePath(): string {
    const [path, setPath] = useState(() => window.location.pathname)
    useEffect(() => {
        patchHistory()
        const onChange = () => setPath(window.location.pathname)
        window.addEventListener('popstate', onChange)
        return () => window.removeEventListener('popstate', onChange)
    }, [])
    return path
}

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string; children?: ReactNode }

export function Link({ href, children, target, style, ...rest }: LinkProps) {
    return (
        <a
            href={href}
            style={style}
            target={target}
            rel={target === '_blank' ? 'noopener noreferrer' : undefined}
            onClick={(e) => {
                if (target) return
                if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                    e.preventDefault()
                    navigate(href)
                }
            }}
            {...rest}
        >
            {children}
        </a>
    )
}

export function Head({ title }: { title?: string }) {
    useEffect(() => {
        document.title = title ? title + ' - Crestkeeper' : 'Crestkeeper'
    }, [title])
    return null
}
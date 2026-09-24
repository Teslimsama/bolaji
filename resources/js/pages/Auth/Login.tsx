import { Head, Link, navigate } from '../../router'
import { useState } from 'react'
import { authFetch, setToken } from '../../api'
import theme from '../../theme'

const { palette, fonts, type: t, spacing } = theme
const ink = palette.ink
const px = palette.parchment
const br = palette.brass
const ad = palette.adire
const ko = palette.kola

function FInput({ value, onChange, type, placeholder }: { value: string; onChange: (e: any) => void; type?: string; placeholder?: string }) {
    const [focus, setFocus] = useState(false)
    return (
        <input
            type={type || 'text'}
            value={value}
            onChange={onChange}
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
            placeholder={placeholder}
            style={{ width: '100%', boxSizing: 'border-box', background: 'transparent', border: '1px solid ' + (focus ? br.bright : ad.indigo), outline: 'none', color: ink.ink, fontFamily: fonts.body, fontSize: '0.9rem', padding: '9px 11px', marginBottom: 14 }}
        />
    )
}

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [msg, setMsg] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    async function submit(e: { preventDefault: () => void }) {
        e.preventDefault()
        setBusy(true)
        setMsg(null)
        try {
            const r = await authFetch('/api/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            })
            if (!r.ok) {
                const d: { message?: string; errors?: Record<string, string[]> } = await r.json().catch(() => ({}))
                const first = d.errors ? Object.values(d.errors).flat()[0] : null
                setMsg(first || d.message || 'Sign in failed. Check your details and try again.')
                return
            }
            const d: { token?: string } = await r.json()
            if (d.token) setToken(d.token)
            navigate('/dashboard')
        } catch {
            setMsg('Could not reach the sign in service.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: px.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
            <Head title="Sign in" />
            <form onSubmit={submit} style={{ width: '100%', maxWidth: 420, background: px.base, color: ink.ink, border: '1px solid ' + br.brass, padding: spacing.xl }}>
                <h1 style={{ ...t.subhead, margin: '0 0 6px' }}>Sign in to your lineage</h1>
                <p style={{ ...t.body, color: ink.warm, margin: '0 0 18px' }}>Use the email your access request was filed under.</p>
                <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 5 }}>Email</label>
                <FInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@family.example" />
                <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 5 }}>Password</label>
                <FInput value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Your password" />
                {msg && <p style={{ ...t.body, color: ko.kola, fontSize: '0.8rem', margin: '-8px 0 12px' }}>{msg}</p>}
                <button type="submit" disabled={busy} style={{ background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.85rem', letterSpacing: '0.05em', padding: '9px 18px', cursor: 'pointer' }}>
                    {busy ? 'Signing in...' : 'Sign in'}
                </button>
                <p style={{ ...t.body, fontSize: '0.82rem', color: ink.warm, margin: '16px 0 0' }}>
                    No account yet?{' '}
                    <Link href="/request-access" style={{ color: br.brass, textDecoration: 'underline' }}>Request access</Link> from a family elder.
                </p>
            </form>
        </div>
    )
}
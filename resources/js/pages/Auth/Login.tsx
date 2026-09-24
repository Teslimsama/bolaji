import { Head, Link, router, usePage } from '@inertiajs/react'
import { useState } from 'react'
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
    const errors = (usePage().props.errors as Record<string, string>) || {}

    function submit(e: { preventDefault: () => void }) {
        e.preventDefault()
        router.post('/login', { email, password })
    }

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: px.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
            <Head title="Sign in" />
            <form onSubmit={submit} style={{ width: '100%', maxWidth: 420, background: px.base, color: ink.ink, border: '1px solid ' + br.brass, padding: spacing.xl }}>
                <h1 style={{ ...t.subhead, margin: '0 0 6px' }}>Sign in to your lineage</h1>
                <p style={{ ...t.body, color: ink.warm, margin: '0 0 18px' }}>Use the email your access request was filed under.</p>
                <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 5 }}>Email</label>
                <FInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@family.example" />
                {errors.email && <p style={{ ...t.body, color: ko.kola, fontSize: '0.8rem', margin: '-8px 0 12px' }}>{errors.email}</p>}
                <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 5 }}>Password</label>
                <FInput value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Your password" />
                {errors.password && <p style={{ ...t.body, color: ko.kola, fontSize: '0.8rem', margin: '-8px 0 12px' }}>{errors.password}</p>}
                <button type="submit" style={{ background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.85rem', letterSpacing: '0.05em', padding: '9px 18px', cursor: 'pointer' }}>
                    Sign in
                </button>
                <p style={{ ...t.body, fontSize: '0.82rem', color: ink.warm, margin: '16px 0 0' }}>
                    No account yet?{' '}
                    <Link href="/request-access" style={{ color: br.brass, textDecoration: 'underline' }}>Request access</Link> from a family elder.
                </p>
            </form>
        </div>
    )
}
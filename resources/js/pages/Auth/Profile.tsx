import { Head, Link, navigate } from '../../router'
import { useEffect, useState } from 'react'
import { authFetch, clearToken } from '../../api'
import theme from '../../theme'

const { palette, fonts, type: t, spacing } = theme
const ink = palette.ink
const px = palette.parchment
const br = palette.brass
const ad = palette.adire
const mo = palette.moss

const input: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    background: 'transparent',
    border: '1px solid ' + ad.indigo,
    outline: 'none',
    color: ink.ink,
    fontFamily: fonts.body,
    fontSize: '0.88rem',
    padding: '9px 11px',
    marginBottom: 12,
}

export default function Profile() {
    const [member, setMember] = useState<Record<string, any> | null>(null)
    const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', email: '' })
    const [msg, setMsg] = useState<string | null>(null)

    useEffect(() => {
        authFetch('/api/me')
            .then((r) => {
                if (r.status === 401) {
                    setMsg('Sign in with a verified member to view your profile.')
                    return null
                }
                return r.ok ? r.json() : null
            })
            .then((d: { user?: { member?: Record<string, any> | null } } | null) => {
                if (!d) return
                const m = d.user?.member ?? null
                setMember(m)
                if (m) setForm({ first_name: m.first_name || '', last_name: m.last_name || '', phone: m.phone || '', email: m.email || '' })
            })
            .catch(() => {})
    }, [])

    function set(k: string, v: string) {
        setForm((p) => ({ ...p, [k]: v }))
    }

    async function submit(e: { preventDefault: () => void }) {
        e.preventDefault()
        if (!member?.id) {
            setMsg('Sign in with a verified member to save your details.')
            return
        }
        try {
            const r = await authFetch('/api/members/' + member.id, {
                method: 'PUT',
                body: JSON.stringify(form),
            })
            const d: { message?: string; errors?: Record<string, string[]> } = await r.json().catch(() => ({}))
            if (!r.ok) {
                const first = d.errors ? Object.values(d.errors).flat()[0] : null
                setMsg(first || d.message || 'Could not save your details.')
                return
            }
            setMsg('Details saved.')
        } catch {
            setMsg('Could not reach the lineage service.')
        }
    }

    async function signOut() {
        try {
            await authFetch('/api/logout', { method: 'POST' })
        } catch {
            // noop
        }
        clearToken()
        navigate('/')
    }

    const verified = Boolean(member?.is_verified)
    const name = member?.full_name || 'Not on the registry yet'
    const branch = member?.branch ? String(member.branch) : 'Unassigned branch'

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: px.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
            <Head title="Your profile" />
            <div style={{ width: '100%', maxWidth: 480, background: px.base, color: ink.ink, border: '1px solid ' + br.brass, padding: spacing.xl }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h1 style={{ ...t.subhead, margin: 0 }}>Your profile</h1>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <div style={{ width: 40, height: 40, border: '1px solid ' + br.brass, display: 'grid', placeItems: 'center' }}>
                            <span style={{ fontFamily: fonts.display, fontSize: 18, color: br.brass }}>B</span>
                        </div>
                    </Link>
                </div>
                <div style={{ fontFamily: fonts.display, fontSize: 24, color: br.brass }}>{name}</div>
                <div style={{ ...t.label, color: ad.pale, marginTop: 4, marginBottom: 14 }}>Branch: {branch}</div>
                {verified ? (
                    <span style={{ display: 'inline-block', background: mo.moss, color: px.paper, fontFamily: fonts.body, fontSize: '0.7rem', letterSpacing: '0.06em', padding: '4px 10px' }}>verified</span>
                ) : (
                    <p style={{ ...t.body, fontSize: '0.82rem', color: ink.warm, margin: '0 0 14px' }}>Verification is the elder's pen - your badge appears once it is confirmed.</p>
                )}
                <div style={{ marginTop: 18 }}>
                    <div style={{ ...t.label, color: ad.pale, marginBottom: 10 }}>Edit details</div>
                    <form onSubmit={submit}>
                        <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 4 }}>First name</label>
                        <input style={input} value={form.first_name} onChange={(e) => set('first_name', e.target.value)} placeholder="First name" />
                        <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 4 }}>Last name</label>
                        <input style={input} value={form.last_name} onChange={(e) => set('last_name', e.target.value)} placeholder="Last name" />
                        <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 4 }}>Phone</label>
                        <input style={input} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Phone" />
                        <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 4 }}>Email</label>
                        <input style={input} value={form.email} onChange={(e) => set('email', e.target.value)} type="email" placeholder="you@family.example" />
                        <button type="submit" style={{ background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.85rem', letterSpacing: '0.05em', padding: '9px 18px', cursor: 'pointer' }}>
                            Save details
                        </button>
                        {msg && <p style={{ ...t.body, fontSize: '0.8rem', color: palette.kola.kola, margin: '10px 0 0' }}>{msg}</p>}
                    </form>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 20 }}>
                    <Link href="/me/verify" style={{ display: 'inline-block', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.82rem', letterSpacing: '0.05em', padding: '9px 16px', textDecoration: 'none' }}>
                        Check verification status
                    </Link>
                    <button onClick={signOut} style={{ background: 'transparent', border: '1px solid ' + px.paper, color: ink.ink, fontFamily: fonts.body, fontSize: '0.82rem', letterSpacing: '0.05em', padding: '9px 16px', cursor: 'pointer' }}>
                        Sign out
                    </button>
                </div>
            </div>
        </div>
    )
}
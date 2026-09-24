import { Head, Link } from '../../router'
import { useEffect, useState } from 'react'
import { authFetch } from '../../api'
import theme from '../../theme'

const { palette, fonts, type: t, spacing } = theme
const ink = palette.ink
const px = palette.parchment
const br = palette.brass
const ad = palette.adire

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

function Label({ children }: { children: string }) {
    return (
        <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 4 }}>{children}</label>
    )
}

export default function RequestAccess() {
    const [branches, setBranches] = useState<{ id: number; name: string }[]>([])
    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', gender: 'other',
        family_branch_id: '', claimed_relationship_type: '',
        password: '', password_confirmation: '', notes: '',
    })
    const [msg, setMsg] = useState<string | null>(null)
    const [done, setDone] = useState(false)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        authFetch('/api/branches')
            .then((r) => (r.ok ? r.json() : null))
            .then((d: { branches?: { id: number; name: string }[] } | null) => setBranches(d?.branches ?? []))
            .catch(() => {})
    }, [])

    function set(k: string, v: string) {
        setForm((p) => ({ ...p, [k]: v }))
    }

    async function submit(e: { preventDefault: () => void }) {
        e.preventDefault()
        setBusy(true)
        setMsg(null)
        try {
            const r = await authFetch('/api/request-access', {
                method: 'POST',
                body: JSON.stringify({
                    ...form,
                    family_branch_id: form.family_branch_id ? Number(form.family_branch_id) : null,
                }),
            })
            const d: { message?: string; errors?: Record<string, string[]> } = await r.json().catch(() => ({}))
            if (!r.ok) {
                const first = d.errors ? Object.values(d.errors).flat()[0] : null
                setMsg(first || d.message || 'Could not submit your request. Please try again.')
                return
            }
            setMsg(d.message || 'Your request has been submitted. A family elder will review it.')
            setDone(true)
        } catch {
            setMsg('Could not reach the lineage service.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: px.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
            <Head title="Request access" />
            <form onSubmit={submit} style={{ width: '100%', maxWidth: 520, background: px.base, color: ink.ink, border: '1px solid ' + br.brass, padding: spacing.xl }}>
                <h1 style={{ ...t.subhead, margin: '0 0 6px' }}>Request access</h1>
                <p style={{ ...t.body, color: ink.warm, margin: '0 0 18px' }}>
                    Tell us how you connect to the Bolaji lineage. A family elder reviews every request before the registry opens.
                </p>
                {done && msg && (
                    <p style={{ ...t.body, color: palette.moss.moss, margin: '0 0 12px', border: '1px solid ' + palette.moss.moss, padding: 10 }}>{msg}</p>
                )}
                <Label>First name</Label>
                <input style={input} value={form.first_name} onChange={(e) => set('first_name', e.target.value)} placeholder="First name" />
                <Label>Last name</Label>
                <input style={input} value={form.last_name} onChange={(e) => set('last_name', e.target.value)} placeholder="Last name" />
                <Label>Email</Label>
                <input style={input} value={form.email} onChange={(e) => set('email', e.target.value)} type="email" placeholder="you@family.example" />
                <Label>Gender</Label>
                <select style={input} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                </select>
                <Label>Branch</Label>
                <select style={input} value={form.family_branch_id} onChange={(e) => set('family_branch_id', e.target.value)}>
                    <option value="">Choose a branch</option>
                    {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                </select>
                <Label>How you connect</Label>
                <select style={input} value={form.claimed_relationship_type} onChange={(e) => set('claimed_relationship_type', e.target.value)}>
                    <option value="">Choose a relationship</option>
                    <option value="sibling">Sibling</option>
                    <option value="child">Child</option>
                    <option value="grandchild">Grandchild</option>
                    <option value="cousin">Cousin</option>
                    <option value="in_law">In-law</option>
                </select>
                <Label>Password</Label>
                <input style={input} value={form.password} onChange={(e) => set('password', e.target.value)} type="password" placeholder="At least 8 characters" />
                <Label>Confirm password</Label>
                <input style={input} value={form.password_confirmation} onChange={(e) => set('password_confirmation', e.target.value)} type="password" placeholder="Repeat your password" />
                <Label>Notes</Label>
                <textarea style={{ ...input, minHeight: 60 }} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Anything that helps the elder confirm your connection" />
                {!done && msg && (
                    <div style={{ border: '1px solid ' + palette.kola.kola, color: palette.kola.light, padding: 10, fontFamily: fonts.body, fontSize: '0.82rem', marginBottom: 12 }}>
                        {msg}
                    </div>
                )}
                <button type="submit" disabled={busy || done} style={{ background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.85rem', letterSpacing: '0.05em', padding: '9px 18px', cursor: 'pointer' }}>
                    {busy ? 'Submitting...' : 'Request access'}
                </button>
                <p style={{ ...t.body, fontSize: '0.82rem', color: ink.warm, margin: '16px 0 0' }}>
                    Already enrolled?{' '}
                    <Link href="/login" style={{ color: br.brass, textDecoration: 'underline' }}>Sign in</Link>.
                </p>
            </form>
        </div>
    )
}
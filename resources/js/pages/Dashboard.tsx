import { Head, Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import theme from '../theme'

const { palette, fonts, type: t, spacing, viewWidth } = theme
const ink = palette.ink
const px = palette.parchment
const br = palette.brass
const ad = palette.adire
const ko = palette.kola

type Rel = {
    subject?: { full_name?: string; branch?: string | null }
    label: string
    kin_type: string
    degrees?: { m: number; n: number }
    common_ancestor?: { full_name: string } | null
    close_family_warning?: boolean
    close_family_reason?: string | null
    details?: string
}

function Nav({ active }: { active: string }) {
    const items: [string, string][] = [
        ['', 'home'],
        ['dashboard', 'dashboard'],
        ['tree', 'tree'],
        ['find', 'find'],
        ['admin/queue', 'admin'],
    ]
    return (
        <nav style={{ background: ink.warm, borderBottom: '1px solid ' + br.brass, padding: '14px 28px', display: 'flex', alignItems: 'center', gap: 22 }}>
            {items.map(([h, l]) => (
                <Link key={l} href={'/' + h} style={{ fontFamily: fonts.body, fontSize: '0.78rem', letterSpacing: '0.05em', textDecoration: 'none', color: active === l ? br.brass : px.paper, opacity: active === l ? 1 : 0.65 }}>
                    {l}
                </Link>
            ))}
            <span style={{ marginLeft: 'auto' }} className="adire-dot" />
        </nav>
    )
}

export default function Dashboard() {
    const [counts, setCounts] = useState({ verified: 0, pending: 0, reviews: 0, reviewed: 0 })
    const [loaded, setLoaded] = useState(false)
    const [id, setId] = useState('')
    const [rel, setRel] = useState<Rel | null>(null)
    const [msg, setMsg] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/admin/dashboard')
            .then((r) => (r.ok ? r.json() : null))
            .then((d: { members_verified?: number; members_pending?: number; verifications_pending?: number; verifications_reviewed?: number } | null) => {
                if (!d) return
                setCounts({
                    verified: d.members_verified ?? 0,
                    pending: d.members_pending ?? 0,
                    reviews: d.verifications_pending ?? 0,
                    reviewed: d.verifications_reviewed ?? 0,
                })
                setLoaded(true)
            })
            .catch(() => {})
    }, [])

    const cards = [
        { label: 'members verified', value: counts.verified },
        { label: 'members pending', value: counts.pending },
        { label: 'reviews pending', value: counts.reviews },
        { label: 'reviews completed', value: counts.reviewed },
    ]

    async function ask(e: { preventDefault: () => void }) {
        e.preventDefault()
        setRel(null)
        setMsg(null)
        const mid = Number(id.trim())
        if (!mid) {
            setMsg('Enter a member id to trace a connection.')
            return
        }
        try {
            const r = await fetch('/api/me/relationship/' + mid)
            if (r.status === 401 || r.status === 403 || r.status === 404) {
                setMsg('Sign in with a verified profile to ask a relative.')
                return
            }
            if (!r.ok) {
                const d: { message?: string } = await r.json().catch(() => ({}))
                setMsg(d.message || 'No connection found for this member yet.')
                return
            }
            const d: { result: Rel } = await r.json()
            setRel(d.result)
        } catch {
            setMsg('Could not reach the lineage service.')
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: px.paper }}>
            <Head title="Dashboard" />
            <Nav active="dashboard" />
            <main style={{ maxWidth: viewWidth.wide, margin: '0 auto', padding: '56px 48px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
                    <span className="adire-dot" />
                    <span className="adire-line" style={{ width: 1, height: 26, margin: 0 }} />
                    <span className="adire-dot" />
                    <h1 style={{ ...t.subhead, margin: 0, color: px.paper }}>Your dashboard</h1>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: spacing.md }}>
                    {cards.map((c) => (
                        <div key={c.label} style={{ position: 'relative', background: px.base, color: ink.ink, border: '1px solid ' + br.brass, padding: spacing.lg }}>
                            <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span className="adire-dot" />
                                <span className="adire-line" style={{ height: 10, width: 2, margin: 0 }} />
                            </div>
                            <div style={{ ...t.label, color: ink.warm, marginBottom: spacing.xs }}>{c.label}</div>
                            <div style={{ fontFamily: fonts.display, fontSize: 40, lineHeight: 1, color: br.brass }}>{c.value}</div>
                        </div>
                    ))}
                </div>
                <form onSubmit={ask} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginTop: spacing.xl }}>
                    <input
                        value={id}
                        onChange={(e) => setId(e.target.value)}
                        placeholder="Member id"
                        style={{ background: 'transparent', border: '1px solid ' + br.brass, color: px.paper, fontFamily: fonts.body, fontSize: '0.9rem', padding: '9px 12px', maxWidth: 220 }}
                    />
                    <button type="submit" style={{ background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.85rem', letterSpacing: '0.05em', padding: '9px 18px', cursor: 'pointer' }}>
                        ask a relative
                    </button>
                </form>
                {msg && <p style={{ ...t.body, color: px.paper, opacity: 0.85, marginTop: spacing.sm }}>{msg}</p>}
                {rel && (
                    <div style={{ background: px.base, color: ink.ink, border: '1px solid ' + ad.indigo, padding: spacing.lg, marginTop: spacing.md }}>
                        <div style={{ fontFamily: fonts.display, fontSize: 24, color: br.brass }}>{rel.label}</div>
                        {rel.details && <p style={{ ...t.body, color: ink.warm, margin: '6px 0 0' }}>{rel.details}</p>}
                        {rel.close_family_warning && (
                            <div style={{ marginTop: spacing.sm, border: '1px solid ' + ko.kola, color: ko.light, padding: 10, fontFamily: fonts.body, fontSize: '0.85rem' }}>
                                Close family note: {rel.close_family_reason || 'you share a recent ancestor'}
                            </div>
                        )}
                    </div>
                )}
                {!loaded && (
                    <div style={{ marginTop: spacing.xl, border: '1px dashed ' + br.brass, padding: spacing.lg, maxWidth: 560 }}>
                        <p style={{ ...t.body, margin: 0, color: px.paper, opacity: 0.85 }}>No verified data yet - your lineage numbers appear once a verified profile signs in.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
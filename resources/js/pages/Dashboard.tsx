import { Head, Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import theme from '../theme'

const { palette, fonts, type: t, viewWidth } = theme
const ink = palette.ink
const pc = palette.parchment
const br = palette.brass
const ad = palette.adire

function Rail({ active }: { active: string }) {
    const items: [string, string][] = [
        ['home', 'Home'],
        ['dashboard', 'Dashboard'],
        ['tree', 'Tree'],
        ['find', 'Find'],
        ['admin', 'Admin'],
    ]
    return (
        <div style={{ position: 'fixed', top: 0, bottom: 0, left: 0, width: 92, background: ink.warm, borderRight: '1px solid ' + br.brass, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 24, zIndex: 40 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
                <div style={{ width: 44, height: 44, border: '1px solid ' + br.brass, display: 'grid', placeItems: 'center' }}>
                    <div style={{ width: 34, height: 34, border: '1px solid ' + br.bright, display: 'grid', placeItems: 'center' }}>
                        <span style={{ fontFamily: fonts.display, fontSize: 20, lineHeight: 1, color: br.brass }}>B</span>
                    </div>
                </div>
            </Link>
            <div className="adire-line" style={{ height: 24, margin: '18px auto 6px' }} />
            <div className="adire-dot" style={{ margin: '0 auto 6px' }} />
            {items.map(([path, label]) => (
                <Link key={path} href={'/' + path} style={{ textDecoration: 'none', margin: '7px 0', fontFamily: fonts.body, fontSize: '0.66rem', letterSpacing: '0.07em', color: path === active ? br.brass : pc.paper, opacity: path === active ? 1 : 0.6 }}>
                    {label}
                </Link>
            ))}
            <div className="adire-line" style={{ height: 16, margin: '8px auto' }} />
            <Link href="/login" style={{ textDecoration: 'none', fontFamily: fonts.body, fontSize: '0.66rem', letterSpacing: '0.07em', color: pc.paper, opacity: 0.75 }}>
                Sign in
            </Link>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: 18 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid ' + br.brass, display: 'grid', placeItems: 'center' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: ad.indigo }} />
                </div>
                <div style={{ fontFamily: fonts.body, fontSize: '0.6rem', letterSpacing: '0.06em', color: pc.paper, opacity: 0.5, marginTop: 6 }}>demo</div>
            </div>
        </div>
    )
}

export default function Dashboard() {
    const [counts, setCounts] = useState<{ verified: number; pending: number; reviews: number; reviewed: number } | null>(null)
    const [online, setOnline] = useState(false)

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
                setOnline(true)
            })
            .catch(() => {})
    }, [])

    const cards: { label: string; value: number | undefined }[] = [
        { label: 'verified generations', value: counts?.verified },
        { label: 'pending generations', value: counts?.pending },
        { label: 'reviews pending', value: counts?.reviews },
        { label: 'reviews completed', value: counts?.reviewed },
    ]

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: pc.paper }}>
            <Head title="Dashboard" />
            <Rail active="dashboard" />
            <main style={{ paddingLeft: 92 }}>
                <div style={{ maxWidth: viewWidth.wide, margin: '0 auto', padding: '56px 48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 34 }}>
                        <span className="adire-dot" />
                        <span className="adire-line" style={{ width: 1, height: 26, margin: 0 }} />
                        <span className="adire-dot" />
                        <h1 style={{ ...t.subhead, margin: 0, color: pc.paper }}>Your dashboard</h1>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                        {cards.map((card) => (
                            <div key={card.label} style={{ background: pc.base, color: ink.ink, border: '1px solid ' + br.brass, padding: 18 }}>
                                <div style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: '0.72rem', letterSpacing: '0.06em', color: ink.warm, marginBottom: 10 }}>{card.label}</div>
                                <div style={{ fontFamily: fonts.display, fontSize: 38, color: br.brass, lineHeight: 1 }}>{card.value ?? '-'}</div>
                            </div>
                        ))}
                    </div>
                    {!online && (
                        <div style={{ marginTop: 34, background: pc.base, color: ink.ink, border: '1px solid ' + ad.indigo, padding: 28 }}>
                            <p style={{ ...t.subhead, margin: '0 0 8px' }}>Sign in to view your lineages</p>
                            <p style={{ ...t.body, color: ink.warm, margin: 0 }}>
                                This dashboard is read-only in the demo. Live counts and your personal lineage appear once a verified profile signs in.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
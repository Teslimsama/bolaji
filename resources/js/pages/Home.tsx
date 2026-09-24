import { Head, Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import theme from '../theme'

const { palette, fonts, type: t, spacing, viewWidth } = theme
const ink = palette.ink
const px = palette.parchment
const br = palette.brass
const ad = palette.adire
const mo = palette.moss

export default function Home() {
    const [reg, setReg] = useState({ branches: 0, kin: 0 })

    useEffect(() => {
        fetch('/api/branches')
            .then((r) => (r.ok ? r.json() : null))
            .then((d: { branches?: { member_count?: number }[] } | null) => {
                const list = d?.branches ?? []
                setReg({ branches: list.length, kin: list.reduce((s, b) => s + (Number(b.member_count) || 0), 0) })
            })
            .catch(() => {})
    }, [])

    const strip = [
        { label: 'branches drawn', value: String(reg.branches), dot: false },
        { label: 'kin on the registry', value: String(reg.kin), dot: false },
        { label: 'founding root', value: 'one', dot: false },
        { label: 'verified line', value: 'one', dot: true },
    ]

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: px.paper }}>
            <Head title="Home" />
            <main style={{ display: 'flex', minHeight: '100vh', flexWrap: 'wrap' }}>
                <aside style={{ width: 200, borderRight: '1px solid ' + br.brass, padding: spacing.xl, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ width: 84, height: 84, border: '1px solid ' + br.brass, display: 'grid', placeItems: 'center' }}>
                        <div style={{ width: 66, height: 66, border: '1px solid ' + br.bright, display: 'grid', placeItems: 'center' }}>
                            <span style={{ fontFamily: fonts.display, fontSize: 34, lineHeight: 1, color: br.brass }}>B</span>
                        </div>
                    </div>
                    <div style={{ marginTop: spacing.lg }} className="adire-dot" />
                    <div style={{ height: 90 }} className="adire-line" />
                    <div className="adire-dot" />
                    <div style={{ height: 90 }} className="adire-line" />
                    <div className="adire-dot" />
                    <p style={{ ...t.label, color: ad.pale, marginTop: spacing.lg, textAlign: 'center' }}>one name, many roots</p>
                </aside>
                <section style={{ flex: 1, minWidth: 320, padding: spacing.huge, margin: '0 auto', maxWidth: viewWidth.wide }}>
                    <p style={{ ...t.label, color: ad.pale, margin: 0 }}>private lineage registry</p>
                    <h1 style={{ ...t.headline, color: px.paper, margin: spacing.md + 'px 0' }}>The Bolaji lines, drawn together</h1>
                    <p style={{ ...t.body, color: px.paper, opacity: 0.85, maxWidth: 560, margin: '0 0 26px' }}>
                        One family, many branches, one heritage. Each line is kept private and confirmed by the elders before it is drawn.
                    </p>
                    <Link href="/tree" style={{ display: 'inline-block', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.9rem', letterSpacing: '0.05em', padding: spacing.sm + 'px ' + spacing.lg + 'px', textDecoration: 'none', background: 'transparent' }}>
                        trace a branch
                    </Link>
                    <div style={{ borderTop: '2px solid ' + br.brass, borderBottom: '2px solid ' + br.brass, padding: spacing.lg, marginTop: spacing.xxl, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: spacing.md }}>
                        {strip.map((s) => (
                            <div key={s.label} style={{ background: px.base, color: ink.ink, border: '1px solid ' + br.brass, padding: spacing.md }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: spacing.xs }}>
                                    {s.dot && <span className="adire-dot" style={{ background: mo.moss }} />}
                                    <span style={{ ...t.label, color: ink.warm }}>{s.label}</span>
                                </div>
                                <div style={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 1.1, color: br.brass }}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    )
}
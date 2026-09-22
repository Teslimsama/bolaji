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

export default function Home() {
    const [stats, setStats] = useState<{ branches: number; kin: number } | null>(null)

    useEffect(() => {
        fetch('/api/branches')
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => {
                const list: { member_count?: string | number }[] = data?.branches ?? []
                const kin = list.reduce((sum, b) => sum + (Number(b.member_count) || 0), 0)
                setStats({ branches: list.length, kin })
            })
            .catch(() => setStats({ branches: 0, kin: 0 }))
    }, [])

    const statLine = stats ? `${stats.branches} branches - ${stats.kin} members on the registry` : 'Reading the registry -'

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: pc.paper }}>
            <Head title="Home" />
            <Rail active="home" />
            <main style={{ paddingLeft: 92 }}>
                <div style={{ maxWidth: viewWidth.wide, margin: '0 auto', padding: '64px 48px' }}>
                    <div style={{ display: 'flex', gap: 64, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <section style={{ flex: '0 1 300px' }}>
                            <div style={{ width: 72, height: 72, border: '1px solid ' + br.brass, display: 'grid', placeItems: 'center' }}>
                                <div style={{ width: 56, height: 56, border: '1px solid ' + br.bright, display: 'grid', placeItems: 'center' }}>
                                    <span style={{ fontFamily: fonts.display, fontSize: 30, lineHeight: 1, color: br.brass }}>B</span>
                                </div>
                            </div>
                            <div style={{ marginTop: 32, border: '1px solid ' + ad.pale, padding: 18, maxWidth: 300 }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <span className="adire-dot" />
                                    <span className="adire-line" style={{ width: 'auto', height: 1, flex: 1, margin: 0 }} />
                                    <span className="adire-dot" />
                                </div>
                                <p style={{ ...t.label, color: ad.indigo, margin: '14px 0 6px' }}>One name, many roots</p>
                                <p style={{ ...t.body, color: ink.warm, margin: 0, fontSize: '0.85rem', lineHeight: 1.5 }}>
                                    What began with our founding elders has grown into many branches, each carrying the name forward through faith, community and kinship.
                                </p>
                            </div>
                        </section>
                        <section style={{ flex: '1 1 420px' }}>
                            <p style={{ ...t.label, color: ad.pale, margin: '0 0 14px' }}>Private lineage registry</p>
                            <h1 style={{ ...t.headline, margin: '0 0 18px', color: pc.paper }}>The Bolaji lines, drawn together</h1>
                            <p style={{ ...t.body, color: pc.paper, opacity: 0.8, maxWidth: 560, margin: '0 0 10px' }}>
                                One family, many branches, one heritage. Trace where each line begins and where it leads, kept close for kin.
                            </p>
                            <p style={{ ...t.body, color: pc.paper, opacity: 0.8, maxWidth: 560, margin: 0 }}>
                                Sign in to see your own place in the tree and how you are connected to every other member.
                            </p>
                            <div style={{ borderTop: '1px solid ' + br.brass, borderBottom: '1px solid ' + br.brass, padding: '18px 0', marginTop: 34, display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Link href="/tree" style={{ border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.9rem', letterSpacing: '0.05em', padding: '10px 18px', textDecoration: 'none', background: 'transparent' }}>
                                    Trace a branch
                                </Link>
                                <Link href="/find" style={{ color: pc.paper, opacity: 0.75, fontFamily: fonts.body, fontSize: '0.85rem', textDecoration: 'none', borderBottom: '1px solid ' + pc.paper }}>
                                    Find a relative instead
                                </Link>
                            </div>
                            <p style={{ fontFamily: fonts.body, fontSize: '0.8rem', letterSpacing: '0.04em', color: ad.pale, marginTop: 20 }}>{statLine}</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    )
}
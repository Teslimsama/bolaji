import { Head, Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import theme from '../theme'

const { palette, fonts, type: t, motif, viewWidth } = theme
const ink = palette.ink
const pc = palette.parchment
const br = palette.brass
const ad = palette.adire

type Person = { id: number; name: string; role: string }
type Gen = { label: string; people: Person[] }
type Rel = { label: string; kin_type: string; details: string; degrees: { m: number; n: number }; common_ancestor: { full_name: string } | null; close_family_warning: boolean; path: { name: string; role: string }[] }

const DEMO_GENS: Gen[] = [
    { label: 'First generation - the root', people: [{ id: 101, name: 'Alhaji Mudasiru Bolaji', role: 'Founding elder' }] },
    { label: 'Second generation', people: [{ id: 102, name: 'Olufunke Bolaji', role: 'Line keeper' }, { id: 103, name: 'Adebayo Bolaji', role: 'Guardian' }] },
    { label: 'Third generation', people: [{ id: 104, name: 'Tunde Bolaji', role: 'Member' }, { id: 105, name: 'Folake Bolaji', role: 'Member' }, { id: 106, name: 'Seyi Bolaji', role: 'Member' }] },
]

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

export default function Tree() {
    const [live, setLive] = useState<Gen[] | null>(null)
    const [q, setQ] = useState('')
    const [busy, setBusy] = useState(false)
    const [message, setMessage] = useState<string | null>(null)
    const [result, setResult] = useState<Rel | null>(null)

    useEffect(() => {
        fetch('/api/tree')
            .then((r) => (r.ok ? r.json() : null))
            .then((d: { generations?: Gen[] } | null) => {
                if (d && Array.isArray(d.generations) && d.generations.length) setLive(d.generations)
            })
            .catch(() => {})
    }, [])

    const gens = live && live.length ? live : DEMO_GENS
    const isPreview = !live || !live.length

    async function ask(e: { preventDefault: () => void }) {
        e.preventDefault()
        const id = Number(q.trim())
        if (!id) {
            setMessage('Type a member id to trace a branch.')
            setResult(null)
            return
        }
        setBusy(true)
        setMessage(null)
        setResult(null)
        try {
            const r = await fetch('/api/me/relationship/' + id)
            if (r.status === 401 || r.status === 403 || r.status === 404) {
                setMessage('Sign in to trace a branch - the registry is private.')
            } else if (!r.ok) {
                const d: { message?: string } = await r.json().catch(() => ({}))
                setMessage(d.message || 'Could not resolve this branch yet.')
            } else {
                const d: { result: Rel } = await r.json()
                setResult(d.result)
                setMessage('Branch resolved.')
            }
        } catch {
            setMessage('Could not reach the lineage service. Please try again.')
        } finally {
            setBusy(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: pc.paper }}>
            <Head title="Tree" />
            <Rail active="tree" />
            <main style={{ paddingLeft: 92 }}>
                <div style={{ maxWidth: 900, margin: '0 auto', padding: '56px 48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
                        <span className="adire-dot" />
                        <span className="adire-line" style={{ width: 1, height: 26, margin: 0 }} />
                        <span className="adire-dot" />
                        <h1 style={{ ...t.subhead, margin: 0, color: pc.paper }}>The family tree</h1>
                    </div>

                    <section style={{ marginBottom: 44 }}>
                        <p style={{ ...t.body, color: pc.paper, margin: '0 0 12px' }}>Ask about a branch</p>
                        <form onSubmit={ask} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                                value={q}
                                onChange={(e: { target: { value: string } }) => setQ(e.target.value)}
                                placeholder="Member id"
                                style={{ background: 'transparent', border: '1px solid ' + br.brass, color: pc.paper, fontFamily: fonts.body, fontSize: '0.9rem', padding: '9px 12px', maxWidth: 220 }}
                            />
                            <button
                                type="submit"
                                disabled={busy}
                                style={{ background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.85rem', letterSpacing: '0.05em', padding: '9px 18px', cursor: busy ? 'default' : 'pointer' }}
                            >
                                {busy ? 'Tracing...' : 'Trace'}
                            </button>
                        </form>
                        {message && <p style={{ ...t.body, color: pc.paper, opacity: 0.85, margin: '12px 0 0' }}>{message}</p>}
                        {result && (
                            <div style={{ background: pc.base, color: ink.ink, border: '1px solid ' + ad.indigo, padding: 22, marginTop: 16 }}>
                                <div style={{ fontFamily: fonts.display, fontSize: 26, color: br.brass }}>{result.label}</div>
                                <p style={{ ...t.body, color: ink.warm, margin: '8px 0 0' }}>{result.details}</p>
                                <p style={{ fontFamily: fonts.body, fontSize: '0.8rem', color: ink.warm, margin: '8px 0 0' }}>
                                    Kin type {result.kin_type} - degrees {result.degrees.m} up / {result.degrees.n} down
                                    {result.common_ancestor ? ' - common ancestor ' + result.common_ancestor.full_name : ''}
                                </p>
                            </div>
                        )}
                    </section>

                    {isPreview && (
                        <p style={{ fontFamily: fonts.body, fontSize: '0.8rem', color: ad.pale, margin: '0 0 20px' }}>
                            Preview generations shown. Sign in to load the live tree.
                        </p>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {gens.map((gen, gi) => (
                            <div key={gi} style={{ width: '100%', textAlign: 'center' }}>
                                {gi > 0 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span className="adire-line" style={{ height: 34, width: motif.connecting, margin: '0 auto' }} />
                                        <span className="adire-dot" style={{ margin: '6px auto' }} />
                                    </div>
                                )}
                                <div style={{ fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.08em', color: ad.pale, marginBottom: 14 }}>{gen.label}</div>
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}>
                                    {gen.people.map((p) => (
                                        <div key={p.id} className="adire-node" style={{ minWidth: 150, padding: '14px 18px', textAlign: 'center', borderWidth: motif.lineStrip }}>
                                            <div style={{ fontFamily: fonts.display, fontSize: 16, marginBottom: 6 }}>{p.name}</div>
                                            <div style={{ fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', opacity: 0.7 }}>{p.role}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    )
}
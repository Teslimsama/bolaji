import { Head, Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import theme from '../theme'

const { palette, fonts, type: t, viewWidth } = theme
const ink = palette.ink
const pc = palette.parchment
const br = palette.brass
const ad = palette.adire

type Row = { id: number; applicant: string; member: string; type: string; status: string; days: number; related_to: string; notes: string; demo?: boolean }

const DEMO_ROWS: Row[] = [
    { id: 201, applicant: 'Folake Bolaji', member: 'Folake Bolaji', type: 'sibling', status: 'pending', days: 4, related_to: 'Alhaji Mudasiru Bolaji', notes: 'Submitted a photo with the founding couple.', demo: true },
    { id: 202, applicant: 'Tunde Bolaji', member: 'Tunde Bolaji', type: 'grandchild', status: 'pending', days: 9, related_to: 'Adebayo Bolaji', notes: 'Chose grandchild of the declared member.', demo: true },
    { id: 203, applicant: 'Seyi Bolaji', member: 'Seyi Bolaji', type: 'niece_nephew', status: 'more_info', days: 14, related_to: 'Olufunke Bolaji', notes: 'Review asked for a second witness on file.', demo: true },
    { id: 204, applicant: 'Iyanu Bolaji', member: 'Iyanu Bolaji', type: 'cousin', status: 'pending', days: 2, related_to: 'Oluwaseun Bolaji', notes: 'Linked to the Oshodi branch.', demo: true },
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

export default function AdminQueue() {
    const [rows, setRows] = useState<Row[] | null>(null)
    const [preview, setPreview] = useState(false)
    const [sel, setSel] = useState<Row | null>(null)
    const [over, setOver] = useState<number | null>(null)
    const [actionMsg, setActionMsg] = useState<string | null>(null)
    const [acting, setActing] = useState(false)

    useEffect(() => {
        fetch('/api/verifications')
            .then((r) => (r.ok ? r.json() : null))
            .then((d: { requests?: Row[] } | null) => {
                if (d && Array.isArray(d.requests)) {
                    setRows(d.requests.map((x) => ({ ...x, days: daysBetween(x.days), notes: '', related_to: '' })))
                    return
                }
                setRows(DEMO_ROWS)
                setPreview(true)
            })
            .catch(() => {
                setRows(DEMO_ROWS)
                setPreview(true)
            })
    }, [])

    function daysBetween(days: number): number {
        return typeof days === 'number' ? days : 0
    }

    const visible = rows ?? []

    async function decide(status: string) {
        if (!sel) return
        setActing(true)
        setActionMsg(null)
        try {
            const r = await fetch('/api/verifications/' + sel.id + '/review', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            })
            if (r.ok) {
                setRows((prev) => (prev ?? []).map((x) => (x.id === sel.id ? { ...x, status } : x)))
                setActionMsg('Request updated.')
            } else {
                setActionMsg(status === 'approved' ? 'Sign in as an elder to approve a request.' : 'Sign in as an elder to request more info.')
            }
        } catch {
            setActionMsg('Could not reach the review service.')
        } finally {
            setActing(false)
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: pc.paper }}>
            <Head title="Admin" />
            <Rail active="admin" />
            <main style={{ paddingLeft: 92 }}>
                <div style={{ maxWidth: viewWidth.wide, margin: '0 auto', padding: '56px 48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
                        <span className="adire-dot" />
                        <span className="adire-line" style={{ width: 1, height: 26, margin: 0 }} />
                        <span className="adire-dot" />
                        <h1 style={{ ...t.subhead, margin: 0, color: pc.paper }}>Verification queue</h1>
                    </div>

                    {preview && (
                        <p style={{ fontFamily: fonts.body, fontSize: '0.82rem', color: ad.pale, margin: '0 0 22px' }}>
                            Preview queue shown - sign in as an elder to review live requests.
                        </p>
                    )}

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: fonts.body, fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left' }}>
                                    {['request id', 'applicant', 'member', 'type', 'status', 'days pending'].map((h) => (
                                        <th key={h} style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: '0.7rem', letterSpacing: '0.06em', color: ad.pale, padding: '10px 14px', borderBottom: '1px solid ' + br.brass }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {visible.map((r) => (
                                    <tr
                                        key={r.id}
                                        onClick={() => {
                                            setSel(r)
                                            setActionMsg(null)
                                        }}
                                        onMouseEnter={() => setOver(r.id)}
                                        onMouseLeave={() => setOver(null)}
                                        style={{
                                            cursor: 'pointer',
                                            background: over === r.id ? pc.paper : 'transparent',
                                            color: over === r.id ? ink.ink : pc.paper,
                                            borderBottom: '1px solid ' + ad.indigo,
                                        }}
                                    >
                                        <td style={{ padding: '12px 14px' }}>{r.id}</td>
                                        <td style={{ padding: '12px 14px' }}>{r.applicant}</td>
                                        <td style={{ padding: '12px 14px' }}>{r.member}</td>
                                        <td style={{ padding: '12px 14px' }}>{r.type}</td>
                                        <td style={{ padding: '12px 14px', color: r.status === 'more_info' ? br.brass : r.status === 'pending' ? ad.pale : pc.paper, opacity: 0.9 }}>{r.status}</td>
                                        <td style={{ padding: '12px 14px' }}>{r.days}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {sel && (
                <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, background: ink.warm, borderLeft: '1px solid ' + br.brass, padding: 30, overflowY: 'auto', color: pc.paper, zIndex: 50 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                        <span className="adire-dot" />
                        <span className="adire-line" style={{ width: 1, height: 18, margin: 0 }} />
                        <span className="adire-dot" />
                        <span style={{ fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.06em', color: ad.pale }}>Request {sel.id}</span>
                    </div>
                    <h2 style={{ ...t.subhead, margin: '0 0 20px', color: pc.paper }}>{sel.applicant}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: fonts.body, fontSize: '0.88rem' }}>
                        <div><div style={{ ...t.label, color: ad.pale, marginBottom: 3 }}>Member</div>{sel.member}</div>
                        <div><div style={{ ...t.label, color: ad.pale, marginBottom: 3 }}>Claimed type</div>{sel.type}</div>
                        <div><div style={{ ...t.label, color: ad.pale, marginBottom: 3 }}>Related to</div>{sel.related_to}</div>
                        <div><div style={{ ...t.label, color: ad.pale, marginBottom: 3 }}>Status</div>{sel.status}</div>
                        <div><div style={{ ...t.label, color: ad.pale, marginBottom: 3 }}>Days pending</div>{sel.days}</div>
                        <div><div style={{ ...t.label, color: ad.pale, marginBottom: 3 }}>Notes</div>{sel.notes || 'None provided.'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
                        <button
                            onClick={() => decide('approved')}
                            disabled={acting}
                            style={{ background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.82rem', letterSpacing: '0.05em', padding: '9px 16px', cursor: acting ? 'default' : 'pointer' }}
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => decide('more_info')}
                            disabled={acting}
                            style={{ background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.82rem', letterSpacing: '0.05em', padding: '9px 16px', cursor: acting ? 'default' : 'pointer' }}
                        >
                            Request more info
                        </button>
                        <button
                            onClick={() => setSel(null)}
                            style={{ background: 'transparent', border: '1px solid ' + pc.paper, color: pc.paper, fontFamily: fonts.body, fontSize: '0.82rem', padding: '9px 16px', cursor: 'pointer' }}
                        >
                            Close
                        </button>
                    </div>
                    {actionMsg && <p style={{ ...t.body, color: pc.paper, opacity: 0.85, marginTop: 18 }}>{actionMsg}</p>}
                </div>
            )}
        </div>
    )
}
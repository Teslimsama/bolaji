import { Head } from '../router'
import { useEffect, useState } from 'react'
import { authFetch } from '../api'
import theme from '../theme'

const { palette, fonts, type: t, spacing, viewWidth } = theme
const ink = palette.ink
const px = palette.parchment
const br = palette.brass
const ad = palette.adire
const mo = palette.moss
const ko = palette.kola

type Row = {
    id: number
    name: string
    claim: string
    submitted: string
    status: string
    related_to: string | null
    notes: string | null
}

function toRows(list: unknown[]): Row[] {
    return (list ?? []).map((r: any) => ({
        id: Number(r.id),
        name: r.family_member ? [(r.family_member.first_name || ''), (r.family_member.last_name || '')].join(' ').trim() : (r.name || 'Unnamed request'),
        claim: r.claimed_relationship_type || 'lineage claim',
        submitted: r.created_at ? String(r.created_at).slice(0, 10) : '-',
        status: r.status || 'pending',
        related_to: r.claimed_related_to ? [(r.claimed_related_to.first_name || ''), (r.claimed_related_to.last_name || '')].join(' ').trim() : null,
        notes: r.notes || null,
    }))
}

function statusMeta(s: string): { label: string; color: string } {
    if (s === 'approved') return { label: 'verified', color: mo.moss }
    if (s === 'more_info') return { label: 'needs info', color: ko.kola }
    if (s === 'rejected') return { label: 'not approved', color: ko.kola }
    return { label: 'in review', color: br.brass }
}

async function fetchQueue(): Promise<Row[]> {
    const r = await authFetch('/api/verifications')
    if (!r.ok) return []
    const d: { requests?: unknown[] } = await r.json()
    return toRows(d.requests ?? [])
}

export default function AdminQueue() {
    const [rows, setRows] = useState<Row[]>([])
    const [sel, setSel] = useState<Row | null>(null)
    const [note, setNote] = useState<string | null>(null)
    const [busy, setBusy] = useState(false)

    useEffect(() => {
        fetchQueue().then((live) => {
            if (live.length) setRows(live)
        })
    }, [])

    async function decide(status: string) {
        if (!sel) return
        setBusy(true)
        try {
            const r = await authFetch('/api/verifications/' + sel.id + '/review', {
                method: 'POST',
                body: JSON.stringify({ status }),
            })
            if (r.ok) {
                setRows((prev) => prev.map((x) => (x.id === sel.id ? { ...x, status } : x)))
                setSel((cur) => (cur ? { ...cur, status } : cur))
                setNote('Request updated - the member record will reflect the new status.')
            } else {
                setNote('Sign in as an elder or admin to review this request.')
            }
        } catch {
            setNote('Could not reach the review service.')
        } finally {
            setBusy(false)
        }
    }

    const columns = ['request id', 'name', 'requested lineage claim', 'submitted', 'status']

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: px.paper }}>
            <Head title="Admin" />
            <main style={{ maxWidth: viewWidth.wide, margin: '0 auto', padding: spacing.xxl + 'px ' + spacing.xl + 'px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
                    <span className="adire-dot" />
                    <span className="adire-line" style={{ width: 1, height: 26, margin: 0 }} />
                    <span className="adire-dot" />
                    <h1 style={{ ...t.subhead, margin: 0, color: px.paper }}>Verification queue</h1>
                </div>
                {note && <p style={{ ...t.body, color: ad.pale, margin: '0 0 18px' }}>{note}</p>}
                {rows.length === 0 ? (
                    <div style={{ border: '1px dashed ' + br.brass, padding: spacing.xl, maxWidth: 560 }}>
                        <p style={{ ...t.body, margin: 0, color: px.paper, opacity: 0.85 }}>
                            No verification requests yet - the queue fills when family members request access. Sign in as an elder to load the live queue.
                        </p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: fonts.body, fontSize: '0.85rem' }}>
                            <thead>
                                <tr>
                                    {columns.map((h) => (
                                        <th key={h} style={{ ...t.label, fontSize: '0.68rem', color: ad.pale, padding: '10px 14px', borderBottom: '1px solid ' + br.brass, textAlign: 'left' }}>{h}</th>
                                    ))}
                                    <th style={{ ...t.label, fontSize: '0.68rem', color: ad.pale, padding: '10px 14px', borderBottom: '1px solid ' + br.brass }} />
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((r) => {
                                    const meta = statusMeta(r.status)
                                    return (
                                        <tr key={r.id} style={{ borderBottom: '1px solid ' + ad.indigo }}>
                                            <td style={{ padding: '12px 14px' }}>{r.id}</td>
                                            <td style={{ padding: '12px 14px' }}>{r.name}</td>
                                            <td style={{ padding: '12px 14px' }}>{r.claim}</td>
                                            <td style={{ padding: '12px 14px' }}>{r.submitted}</td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, display: 'inline-block', marginRight: 8 }} />
                                                {meta.label}
                                            </td>
                                            <td style={{ padding: '12px 14px' }}>
                                                <button
                                                    onClick={() => setSel(r)}
                                                    style={{ background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.75rem', padding: '6px 12px', cursor: 'pointer' }}
                                                >
                                                    open verification
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {sel && (
                <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 380, maxWidth: '90vw', background: ad.indigo, color: px.paper, borderLeft: '1px solid ' + br.brass, padding: spacing.xl, overflowY: 'auto', zIndex: 50 }}>
                    <div style={{ ...t.label, color: px.paper, opacity: 0.7, marginBottom: 6 }}>Request {sel.id}</div>
                    <h2 style={{ ...t.subhead, margin: '0 0 18px', color: px.paper }}>{sel.name}</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: fonts.body, fontSize: '0.88rem' }}>
                        <div><div style={{ ...t.label, color: ad.pale, marginBottom: 3 }}>Requested lineage claim</div>{sel.claim}</div>
                        <div><div style={{ ...t.label, color: ad.pale, marginBottom: 3 }}>Submitted</div>{sel.submitted}</div>
                        <div><div style={{ ...t.label, color: ad.pale, marginBottom: 3 }}>Related to</div>{sel.related_to || 'None stated'}</div>
                        <div><div style={{ ...t.label, color: ad.pale, marginBottom: 3 }}>Status</div>{statusMeta(sel.status).label}</div>
                        <div><div style={{ ...t.label, color: ad.pale, marginBottom: 3 }}>Notes</div>{sel.notes || 'None provided.'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
                        <button
                            onClick={() => decide('approved')}
                            disabled={busy || sel.status === 'approved'}
                            style={{ background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.8rem', letterSpacing: '0.04em', padding: '9px 16px', cursor: busy ? 'default' : 'pointer' }}
                        >
                            approve membership
                        </button>
                        <button
                            onClick={() => decide('more_info')}
                            disabled={busy}
                            style={{ background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.8rem', letterSpacing: '0.04em', padding: '9px 16px', cursor: busy ? 'default' : 'pointer' }}
                        >
                            request more information
                        </button>
                        <button
                            onClick={() => setSel(null)}
                            style={{ background: 'transparent', border: '1px solid ' + px.paper, color: px.paper, fontFamily: fonts.body, fontSize: '0.8rem', padding: '9px 16px', cursor: 'pointer' }}
                        >
                            close
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
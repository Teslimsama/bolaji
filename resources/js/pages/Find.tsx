import { Head } from '@inertiajs/react'
import { useState } from 'react'
import theme from '../theme'

const { palette, fonts, type: t, spacing, viewWidth } = theme
const ink = palette.ink
const px = palette.parchment
const br = palette.brass
const ad = palette.adire
const ko = palette.kola

type Member = { id: number; full_name: string; status?: string; is_verified?: boolean; branch_id?: number | null }
type Rel = {
    subject?: { full_name?: string; branch?: string | null }
    label: string
    kin_type: string
    degrees?: { m: number; n: number }
    common_ancestor?: { full_name: string } | null
    close_family_warning?: boolean
    close_family_reason?: string | null
    details?: string
    path?: { name: string; role: string }[]
}

export default function Find() {
    const [search, setSearch] = useState('')
    const [members, setMembers] = useState<Member[]>([])
    const [done, setDone] = useState(false)
    const [busy, setBusy] = useState(false)
    const [note, setNote] = useState<string | null>(null)
    const [rel, setRel] = useState<Rel | null>(null)
    const [relNote, setRelNote] = useState<string | null>(null)

    async function submit(e: { preventDefault: () => void }) {
        e.preventDefault()
        setBusy(true)
        setDone(false)
        setRel(null)
        setRelNote(null)
        setNote(null)
        try {
            const r = await fetch('/api/members?search=' + encodeURIComponent(search.trim()))
            if (r.status === 401 || r.status === 403) {
                setMembers([])
                setNote('Sign in to search the registry - it is kept private.')
                return
            }
            if (!r.ok) {
                setMembers([])
                setNote('Could not load the directory right now.')
                return
            }
            const d: { members: Member[] } = await r.json()
            setMembers(d.members ?? [])
            setDone(true)
        } catch {
            setMembers([])
            setNote('Could not reach the lineage service.')
        } finally {
            setBusy(false)
        }
    }

    async function connected(m: Member) {
        setRel(null)
        setRelNote(null)
        try {
            const r = await fetch('/api/me/relationship/' + m.id)
            if (r.status === 401 || r.status === 403) {
                setRelNote('Sign in with a verified profile to see how you are connected.')
                return
            }
            if (!r.ok) {
                const d: { message?: string } = await r.json().catch(() => ({}))
                setRelNote(d.message || 'No connection could be established for this member yet.')
                return
            }
            const d: { result: Rel } = await r.json()
            setRel(d.result)
        } catch {
            setRelNote('Could not reach the lineage service.')
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: px.paper }}>
            <Head title="Find" />
            <main style={{ maxWidth: viewWidth.wide, margin: '0 auto', padding: spacing.xxl + 'px ' + spacing.xl + 'px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
                    <span className="adire-dot" />
                    <span className="adire-line" style={{ width: 1, height: 26, margin: 0 }} />
                    <span className="adire-dot" />
                    <h1 style={{ ...t.subhead, margin: 0, color: px.paper }}>Find a relative</h1>
                </div>
                <form onSubmit={submit} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 30 }}>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name"
                        style={{ background: 'transparent', border: '1px solid ' + br.brass, color: px.paper, fontFamily: fonts.body, fontSize: '0.9rem', padding: '9px 12px', maxWidth: 260 }}
                    />
                    <button type="submit" style={{ background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.85rem', letterSpacing: '0.05em', padding: '9px 18px', cursor: 'pointer' }}>
                        {busy ? 'searching...' : 'search'}
                    </button>
                </form>
                {note && <p style={{ ...t.body, color: ad.pale, margin: '0 0 18px' }}>{note}</p>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
                    {members.map((m) => (
                        <div key={m.id} className="adire-node" style={{ padding: '16px 18px' }}>
                            <div style={{ fontFamily: fonts.display, fontSize: 16, marginBottom: 6 }}>{m.full_name}</div>
                            <div style={{ ...t.label, color: ad.indigo, fontSize: '0.68rem', marginBottom: 4 }}>{m.is_verified ? 'verified member' : 'member'}</div>
                            <button
                                onClick={() => connected(m)}
                                style={{ marginTop: 8, background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.78rem', padding: '7px 12px', cursor: 'pointer' }}
                            >
                                how are we connected?
                            </button>
                        </div>
                    ))}
                </div>
                {done && members.length === 0 && <p style={{ ...t.body, color: px.paper, opacity: 0.8 }}>No members match this search.</p>}
                {relNote && <p style={{ ...t.body, color: px.paper, opacity: 0.85, marginTop: 18 }}>{relNote}</p>}
                {rel && (
                    <div style={{ background: px.base, color: ink.ink, border: '1px solid ' + ad.indigo, padding: spacing.lg, marginTop: 20 }}>
                        <div style={{ ...t.label, color: ad.pale, marginBottom: 4 }}>
                            {rel.subject?.full_name ? 'You, ' + rel.subject.full_name + ', and them' : 'How you are connected'}
                        </div>
                        <div style={{ fontFamily: fonts.display, fontSize: 26, color: br.brass }}>{rel.label}</div>
                        {rel.details && <p style={{ ...t.body, color: ink.warm, margin: '6px 0 0' }}>{rel.details}</p>}
                        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', ...t.body, fontSize: '0.8rem', marginTop: 8 }}>
                            <span>Kin type: {rel.kin_type}</span>
                            {rel.degrees && <span>Degrees: {rel.degrees.m} up, {rel.degrees.n} down</span>}
                            {rel.common_ancestor && <span>Common ancestor: {rel.common_ancestor.full_name}</span>}
                        </div>
                        {rel.close_family_warning && (
                            <div style={{ marginTop: 12, border: '1px solid ' + ko.kola, color: ko.light, padding: 12, fontFamily: fonts.body, fontSize: '0.85rem' }}>
                                Close family note: {rel.close_family_reason || 'you share a recent ancestor'}
                            </div>
                        )}
                        {rel.path && rel.path.length > 0 && (
                            <div style={{ marginTop: 14 }}>
                                <div style={{ ...t.label, color: ad.indigo, marginBottom: 6 }}>The chain</div>
                                {rel.path.map((step, i) => (
                                    <div key={i} style={{ ...t.body, fontSize: '0.8rem', marginTop: 4, color: ink.warm }}>
                                        <span style={{ color: step.role === 'common_ancestor' ? ad.indigo : ink.warm }}>{step.name}</span>
                                        <span style={{ opacity: 0.6 }}> - {step.role}</span>
                                        {i < rel.path.length - 1 && <span style={{ margin: '0 6px', color: ad.pale }}>lines</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}
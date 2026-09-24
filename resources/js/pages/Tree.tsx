import { Head } from '../router'
import { useEffect, useState } from 'react'
import { authFetch } from '../api'
import theme from '../theme'

const { palette, fonts, type: t, spacing } = theme
const ink = palette.ink
const px = palette.parchment
const br = palette.brass
const ad = palette.adire

type Person = { id: number | string; name: string; role: string }
type Gen = { label: string; people: Person[] }

type TvMember = { id: number; full_name: string; is_verified?: boolean }
type TvLink = { id: number; parent_id: number; child_id: number }
type TvSpouse = { id: number; person_one_id: number; person_two_id: number }

function toGens(d: { members?: TvMember[]; parent_links?: TvLink[]; spouse_links?: TvSpouse[] } | null): Gen[] {
    if (!d) return []
    const members = d.members ?? []
    if (!members.length) return []
    const parents: Record<number, number[]> = {}
    const children: Record<number, number[]> = {}
    const spouses: Record<number, number[]> = {}
    for (const l of d.parent_links ?? []) {
        const p = Number(l.parent_id)
        const c = Number(l.child_id)
        ;(parents[c] ??= []).push(p)
        ;(children[p] ??= []).push(c)
    }
    for (const s of d.spouse_links ?? []) {
        const a = Number(s.person_one_id)
        const b = Number(s.person_two_id)
        ;(spouses[a] ??= []).push(b)
        ;(spouses[b] ??= []).push(a)
    }
    const memberMap: Record<number, TvMember> = {}
    for (const m of members) memberMap[Number(m.id)] = m
    const depth: Record<number, number> = {}
    const queue: number[] = []
    for (const m of members) {
        const id = Number(m.id)
        if ((parents[id] ?? []).length) continue
        const hasInLaw = (spouses[id] ?? []).some((mate) => (parents[mate] ?? []).length)
        if (hasInLaw) continue
        depth[id] = 0
        queue.push(id)
    }
    for (let i = 0; i < queue.length; i++) {
        for (const child of children[queue[i]] ?? []) {
            if (depth[child] === undefined) {
                depth[child] = depth[queue[i]] + 1
                queue.push(child)
            }
        }
    }
    for (const key of Object.keys(spouses)) {
        const id = Number(key)
        if (depth[id] !== undefined) continue
        for (const mate of spouses[id] ?? []) {
            if (depth[mate] !== undefined) {
                depth[id] = depth[mate]
                break
            }
        }
        if (depth[id] === undefined) depth[id] = 0
    }
    const byGen: Record<number, number[]> = {}
    for (const key of Object.keys(depth)) {
        const id = Number(key)
        ;(byGen[depth[id]] ??= []).push(id)
    }
    const gens: Gen[] = []
    for (const gen of Object.keys(byGen).map(Number).sort((a, b) => a - b)) {
        const people: Person[] = []
        for (const id of byGen[gen].sort((a, b) => a - b)) {
            const m = memberMap[id]
            if (!m) continue
            people.push({ id: m.id, name: m.full_name || 'Unnamed member', role: m.is_verified ? 'verified' : 'pending' })
        }
        if (people.length) gens.push({ label: 'Generation ' + (gens.length + 1), people })
    }
    return gens
}

export default function Tree() {
    const [sel, setSel] = useState<{ gen: string; person: Person } | null>(null)
    const [gens, setGens] = useState<Gen[]>([])

    useEffect(() => {
        authFetch('/api/tree')
            .then((r) => (r.status === 401 ? null : r.ok ? r.json() : null))
            .then((d) => setGens(toGens(d)))
            .catch(() => setGens([]))
    }, [])

    if (!gens.length) {
        return (
            <div style={{ minHeight: '100vh', background: ink.ink, color: px.paper }}>
                <Head title="Tree" />
                <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
                    <div style={{ maxWidth: 480, textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <span className="adire-dot" />
                            <span className="adire-line" style={{ height: 40 }} />
                            <span className="adire-dot" />
                        </div>
                        <h1 style={{ ...t.subhead, color: px.paper, margin: '18px 0 8px' }}>The family tree</h1>
                        <p style={{ ...t.body, color: px.paper, opacity: 0.85, margin: 0, lineHeight: 1.6 }}>
                            The tree is not drawn yet. Verified members appear here, generation by generation, once the elders confirm them. Sign in to view the tree.
                        </p>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: px.paper }}>
            <Head title="Tree" />
            <main style={{ maxWidth: 980, margin: '0 auto', padding: spacing.xxl + 'px ' + spacing.xl + 'px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
                    <span className="adire-dot" />
                    <span className="adire-line" style={{ width: 1, height: 26, margin: 0 }} />
                    <span className="adire-dot" />
                    <h1 style={{ ...t.subhead, margin: 0, color: px.paper }}>The family tree</h1>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {gens.map((gen, gi) => (
                        <div key={gi} style={{ width: '100%', textAlign: 'center' }}>
                            {gi > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <span className="adire-line" style={{ height: 34 }} />
                                    <span className="adire-dot" style={{ margin: '4px auto' }} />
                                </div>
                            )}
                            <div style={{ ...t.label, color: ad.pale, marginBottom: 14 }}>{gen.label}</div>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}>
                                {gen.people.map((p) => (
                                    <div
                                        key={p.id}
                                        className="adire-node"
                                        onClick={() => setSel({ gen: gen.label, person: p })}
                                        style={{ minWidth: 150, padding: '14px 18px', textAlign: 'center', cursor: 'pointer', border: '1px solid ' + (sel?.person.id === p.id ? br.brass : ad.indigo) }}
                                    >
                                        <div style={{ fontFamily: fonts.display, fontSize: 16, marginBottom: 6 }}>{p.name}</div>
                                        <div style={{ ...t.label, color: ad.indigo, fontSize: '0.7rem' }}>{p.role}</div>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', margin: spacing.sm + 'px 0' }}>
                                <span className="adire-dot" />
                                <span className="adire-line" style={{ width: '100%', height: 1.5, margin: 0 }} />
                                <span className="adire-dot" />
                            </div>
                        </div>
                    ))}
                </div>
                {sel && (
                    <div style={{ background: px.base, color: ink.ink, border: '1px solid ' + br.brass, padding: spacing.lg, marginTop: spacing.xl }}>
                        <div style={{ ...t.label, color: ad.pale, marginBottom: 4 }}>{sel.gen}</div>
                        <div style={{ fontFamily: fonts.display, fontSize: 22, color: br.brass }}>{sel.person.name}</div>
                        <p style={{ ...t.body, color: ink.warm, margin: '6px 0 0' }}>Role: {sel.person.role}</p>
                    </div>
                )}
            </main>
        </div>
    )
}
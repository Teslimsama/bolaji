import { Head, Link } from '@inertiajs/react'
import { useEffect, useState } from 'react'
import theme from '../theme'

const { palette, fonts, type: t, viewWidth } = theme
const ink = palette.ink
const pc = palette.parchment
const br = palette.brass
const ad = palette.adire
const kola = palette.kola

type Member = { id: number; full_name: string; gender: string; status: string; branch: string | null; demo?: boolean }
type BranchOpt = { id: number; name: string }
type PathStep = { name: string; role: string }
type Rel = { label: string; kin_type: string; details: string; degrees: { m: number; n: number }; common_ancestor: { full_name: string } | null; close_family_warning: boolean; close_family_reason: string | null; path: PathStep[] }

const DEMO_MEMBERS: Member[] = [
    { id: 1, full_name: 'Oluwaseun Bolaji', gender: 'male', status: 'verified', branch: 'Oshodi branch', demo: true },
    { id: 2, full_name: 'Folake Bolaji', gender: 'female', status: 'verified', branch: 'Oshodi branch', demo: true },
    { id: 3, full_name: 'Tunde Bolaji', gender: 'male', status: 'verified', branch: 'Ilesha branch', demo: true },
    { id: 4, full_name: 'Seyi Bolaji', gender: 'other', status: 'verified', branch: 'Adegbite branch', demo: true },
    { id: 5, full_name: 'Iyanu Bolaji', gender: 'female', status: 'pending', branch: 'Adegbite branch', demo: true },
]

function previewChain(m: Member): Rel {
    const close = m.status === 'verified' && m.id !== 5
    return {
        label: 'Sister',
        kin_type: 'sibling',
        details: 'You are the Sister of ' + m.full_name + '.',
        degrees: { m: 1, n: 1 },
        common_ancestor: { full_name: 'Alhaji Mudasiru Bolaji' },
        close_family_warning: close,
        close_family_reason: close ? 'Shares an ancestor within 4 generations.' : null,
        path: [
            { name: 'You', role: 'subject' },
            { name: 'Alhaji Mudasiru Bolaji', role: 'common_ancestor' },
            { name: m.full_name, role: 'target' },
        ],
    }
}

function Chain({ rel }: { rel: Rel }) {
    return (
        <div style={{ background: pc.base, color: ink.ink, border: '1px solid ' + ad.indigo, padding: 22, marginTop: 20 }}>
            <div style={{ fontFamily: fonts.display, fontSize: 26, color: br.brass }}>{rel.label}</div>
            <p style={{ ...t.body, color: ink.warm, margin: '8px 0' }}>{rel.details}</p>
            <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', fontFamily: fonts.body, fontSize: '0.8rem', marginTop: 8 }}>
                <span><b>Kin type</b> {rel.kin_type}</span>
                <span><b>Degrees</b> {rel.degrees.m} up / {rel.degrees.n} down</span>
                {rel.common_ancestor && <span><b>Common ancestor</b> {rel.common_ancestor.full_name}</span>}
            </div>
            {rel.close_family_warning && (
                <div style={{ marginTop: 14, border: '1px solid ' + kola.kola, color: kola.light, padding: 12, fontFamily: fonts.body, fontSize: '0.85rem' }}>
                    Close family note: {rel.close_family_reason || 'You share a recent ancestor.'}
                </div>
            )}
            <div style={{ marginTop: 14 }}>
                <div style={{ ...t.label, color: ad.indigo, marginBottom: 6 }}>The chain</div>
                {rel.path.map((step, i) => (
                    <div key={i} style={{ fontFamily: fonts.body, fontSize: '0.8rem', marginTop: 5, color: ink.warm }}>
                        <span style={{ color: step.role === 'common_ancestor' ? ad.indigo : ink.warm }}>{step.name}</span>
                        <span style={{ color: ink.warm, opacity: 0.6 }}> - {step.role}</span>
                        {i < rel.path.length - 1 && <span style={{ margin: '0 6px', color: ad.pale }}>lines</span>}
                    </div>
                ))}
            </div>
        </div>
    )
}

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

export default function Find() {
    const [search, setSearch] = useState('')
    const [branchId, setBranchId] = useState('')
    const [branches, setBranches] = useState<BranchOpt[]>([])
    const [members, setMembers] = useState<Member[] | null>(null)
    const [signedOut, setSignedOut] = useState(false)
    const [busy, setBusy] = useState(false)
    const [rel, setRel] = useState<Rel | null>(null)
    const [relMsg, setRelMsg] = useState<string | null>(null)

    useEffect(() => {
        fetch('/api/branches')
            .then((r) => (r.ok ? r.json() : null))
            .then((d: { branches?: { id: number; name: string }[] } | null) => setBranches(d?.branches ?? []))
            .catch(() => {})
        loadMembers('', '')
    }, [])

    async function loadMembers(s: string, b: string) {
        setBusy(true)
        setRel(null)
        setRelMsg(null)
        try {
            const params = new URLSearchParams()
            if (s) params.set('search', s)
            if (b) params.set('branch_id', b)
            const r = await fetch('/api/members?' + params.toString())
            if (r.status === 401 || r.status === 403) {
                setMembers(demoFilter(s, b))
                setSignedOut(true)
                return
            }
            if (!r.ok) {
                setMembers(demoFilter(s, b))
                setSignedOut(true)
                return
            }
            const d: { members: Member[] } = await r.json()
            setMembers(d.members)
            setSignedOut(false)
        } catch {
            setMembers(demoFilter(s, b))
            setSignedOut(true)
        } finally {
            setBusy(false)
        }
    }

    function demoFilter(s: string, b: string): Member[] {
        return DEMO_MEMBERS.filter((m) => {
            const nameOk = !s || m.full_name.toLowerCase().includes(s.toLowerCase())
            const branchOk = !b || m.branch === branches.find((x) => String(x.id) === b)?.name
            return nameOk && branchOk
        })
    }

    function submit(e: { preventDefault: () => void }) {
        e.preventDefault()
        loadMembers(search, branchId)
    }

    async function connected(m: Member) {
        setRel(null)
        setRelMsg(null)
        if (m.demo) {
            setRel(previewChain(m))
            setRelMsg('Preview chain shown - sign in to resolve the live connection.')
            return
        }
        try {
            const r = await fetch('/api/me/relationship/' + m.id)
            if (!r.ok) {
                setRelMsg('Sign in to see how you are connected.')
                return
            }
            const d: { result: Rel } = await r.json()
            setRel(d.result)
        } catch {
            setRelMsg('Could not reach the lineage service.')
        }
    }

    const visible = members ?? []

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: pc.paper }}>
            <Head title="Find" />
            <Rail active="find" />
            <main style={{ paddingLeft: 92 }}>
                <div style={{ maxWidth: viewWidth.wide, margin: '0 auto', padding: '56px 48px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 26 }}>
                        <span className="adire-dot" />
                        <span className="adire-line" style={{ width: 1, height: 26, margin: 0 }} />
                        <span className="adire-dot" />
                        <h1 style={{ ...t.subhead, margin: 0, color: pc.paper }}>Find a relative</h1>
                    </div>

                    <form onSubmit={submit} style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 30 }}>
                        <input
                            value={search}
                            onChange={(e: { target: { value: string } }) => setSearch(e.target.value)}
                            placeholder="Search by name"
                            style={{ background: 'transparent', border: '1px solid ' + br.brass, color: pc.paper, fontFamily: fonts.body, fontSize: '0.9rem', padding: '9px 12px', maxWidth: 240 }}
                        />
                        <select
                            value={branchId}
                            onChange={(e: { target: { value: string } }) => setBranchId(e.target.value)}
                            style={{ background: ink.warm, border: '1px solid ' + br.brass, color: pc.paper, fontFamily: fonts.body, fontSize: '0.9rem', padding: '9px 12px' }}
                        >
                            <option value="">All branches</option>
                            {branches.map((b) => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                            ))}
                        </select>
                        <button
                            type="submit"
                            style={{ background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.85rem', letterSpacing: '0.05em', padding: '9px 18px', cursor: 'pointer' }}
                        >
                            {busy ? 'Searching...' : 'Search'}
                        </button>
                    </form>

                    {signedOut && (
                        <p style={{ fontFamily: fonts.body, fontSize: '0.82rem', color: ad.pale, margin: '0 0 18px' }}>
                            Preview members shown - this registry is private. Sign in to search the live directory.
                        </p>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
                        {visible.map((m) => (
                            <div key={m.id} className="adire-node" style={{ padding: '16px 18px' }}>
                                <div style={{ fontFamily: fonts.display, fontSize: 16, marginBottom: 6 }}>{m.full_name}</div>
                                <div style={{ fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', opacity: 0.7, marginBottom: 4 }}>
                                    {m.branch || 'unaffiliated'} - {m.status}
                                </div>
                                <button
                                    onClick={() => connected(m)}
                                    style={{ marginTop: 10, background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.78rem', padding: '7px 12px', cursor: 'pointer' }}
                                >
                                    How are we connected?
                                </button>
                            </div>
                        ))}
                        {!visible.length && (
                            <p style={{ ...t.body, color: pc.paper, opacity: 0.8 }}>No members match this search.</p>
                        )}
                    </div>

                    {relMsg && <p style={{ ...t.body, color: pc.paper, opacity: 0.85, marginTop: 18 }}>{relMsg}</p>}
                    {rel && <Chain rel={rel} />}
                </div>
            </main>
        </div>
    )
}
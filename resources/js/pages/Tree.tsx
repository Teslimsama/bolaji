import { Head } from '@inertiajs/react'
import { useState } from 'react'
import theme from '../theme'

const { palette, fonts, type: t, spacing } = theme
const ink = palette.ink
const px = palette.parchment
const br = palette.brass
const ad = palette.adire

type Person = { id: number | string; name: string; role: string }
type Gen = { label: string; people: Person[] }

export default function Tree({ tree = [] }: { tree?: Gen[] }) {
    const [sel, setSel] = useState<{ gen: string; person: Person } | null>(null)
    const gens = tree ?? []

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
                            The tree is not drawn yet. Verified members appear here, generation by generation, once the elders confirm them.
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
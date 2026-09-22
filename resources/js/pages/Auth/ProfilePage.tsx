import { Head, Link } from '@inertiajs/react'
import theme from '../../theme'

const { palette, fonts, type: t } = theme
const ink = palette.ink
const pc = palette.parchment
const br = palette.brass
const ad = palette.adire

export default function ProfilePage() {
    const rows: [string, string][] = [
        ['Name', 'Folake Bolaji'],
        ['Email', 'folake@family.example'],
        ['Branch', 'Oshodi branch'],
        ['Status', 'pending verification'],
    ]
    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: pc.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Head title="Your profile" />
            <div style={{ width: '100%', maxWidth: 480, background: pc.base, color: ink.ink, border: '1px solid ' + br.brass, padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h1 style={{ ...t.subhead, margin: 0 }}>Your profile</h1>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <div style={{ width: 40, height: 40, border: '1px solid ' + br.brass, display: 'grid', placeItems: 'center' }}>
                            <span style={{ fontFamily: fonts.display, fontSize: 18, color: br.brass }}>B</span>
                        </div>
                    </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontFamily: fonts.body, fontSize: '0.88rem' }}>
                    {rows.map(([k, v]) => (
                        <div key={k} style={{ borderBottom: '1px solid ' + ad.pale, paddingBottom: 10 }}>
                            <div style={{ fontFamily: fonts.body, fontSize: '0.7rem', letterSpacing: '0.06em', color: ad.pale, marginBottom: 3 }}>{k}</div>
                            <div style={{ color: ink.ink }}>{v}</div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 22, border: '1px solid ' + ad.indigo, padding: 14 }}>
                    <p style={{ ...t.body, color: ink.warm, margin: 0 }}>
                        This is a demo profile. Once a verified profile signs in, your own records, lineage and connection stats appear here.
                    </p>
                </div>
                <Link href="/me/verify" style={{ display: 'inline-block', marginTop: 20, border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.82rem', letterSpacing: '0.05em', padding: '9px 16px', textDecoration: 'none' }}>
                    Check verification status
                </Link>
            </div>
        </div>
    )
}
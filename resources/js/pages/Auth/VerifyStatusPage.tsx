import { Head, Link } from '@inertiajs/react'
import theme from '../../theme'

const { palette, fonts, type: t } = theme
const ink = palette.ink
const pc = palette.parchment
const br = palette.brass
const ad = palette.adire

export default function VerifyStatusPage() {
    const steps: [string, string, boolean][] = [
        ['Request submitted', 'Your details reached the lineage office.', true],
        ['Elder review', 'A family elder is confirming your connection.', true],
        ['Registry access', 'The registry opens once you are verified.', false],
    ]
    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: pc.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Head title="Verification status" />
            <div style={{ width: '100%', maxWidth: 480, background: pc.base, color: ink.ink, border: '1px solid ' + br.brass, padding: 32 }}>
                <h1 style={{ ...t.subhead, margin: '0 0 8px' }}>Verification status</h1>
                <p style={{ ...t.body, color: ink.warm, margin: '0 0 24px' }}>Your request is sitting with the elders. Here is where it stands.</p>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {steps.map(([title, body, done], i) => (
                        <div key={title}>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <div style={{ width: 12, height: 12, borderRadius: '50%', border: '1px solid ' + br.brass, background: done ? br.brass : 'transparent' }} />
                                    {i < steps.length - 1 && <span className="adire-line" style={{ height: 26, width: '2px', margin: '2px auto' }} />}
                                </div>
                                <div style={{ marginBottom: 20 }}>
                                    <div style={{ fontFamily: fonts.body, fontSize: '0.9rem', fontWeight: 500, color: ink.ink, marginBottom: 3 }}>{title}</div>
                                    <div style={{ fontFamily: fonts.body, fontSize: '0.8rem', color: ink.warm }}>{body}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div style={{ marginTop: 10, border: '1px solid ' + ad.indigo, padding: 14 }}>
                    <p style={{ ...t.body, color: ink.warm, margin: 0 }}>
                        Demo screen - this page shows the review flow. Live status updates from the elders appear once authentication is wired.
                    </p>
                </div>
                <Link href="/me" style={{ display: 'inline-block', marginTop: 20, border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.82rem', letterSpacing: '0.05em', padding: '9px 16px', textDecoration: 'none' }}>
                    Back to your profile
                </Link>
            </div>
        </div>
    )
}
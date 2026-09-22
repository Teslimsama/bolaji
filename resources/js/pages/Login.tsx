import { Head, Link } from '@inertiajs/react'
import theme from '../theme'

const { palette, fonts, type: t } = theme
const ink = palette.ink
const pc = palette.parchment
const br = palette.brass
const ad = palette.adire

function field(label: string): React.CSSProperties {
    return {
        display: 'block',
        fontFamily: fonts.body,
        fontSize: '0.72rem',
        letterSpacing: '0.05em',
        color: ink.warm,
        marginBottom: 5,
    }
}

const input = {
    width: '100%',
    boxSizing: 'border-box' as const,
    background: 'transparent',
    border: '1px solid ' + ad.indigo,
    color: ink.ink,
    fontFamily: fonts.body,
    fontSize: '0.9rem',
    padding: '9px 11px',
    marginBottom: 16,
}

const button = {
    background: 'transparent',
    border: '1px solid ' + br.brass,
    color: br.brass,
    fontFamily: fonts.body,
    fontSize: '0.85rem',
    letterSpacing: '0.05em',
    padding: '9px 18px',
    cursor: 'pointer' as const,
}

export default function LoginPage() {
    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: pc.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Head title="Sign in" />
            <div style={{ width: '100%', maxWidth: 440, background: pc.base, color: ink.ink, border: '1px solid ' + br.brass, padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <h1 style={{ ...t.subhead, margin: 0 }}>Return to your lineage</h1>
                    <Link href="/" style={{ textDecoration: 'none' }}>
                        <div style={{ width: 40, height: 40, border: '1px solid ' + br.brass, display: 'grid', placeItems: 'center' }}>
                            <span style={{ fontFamily: fonts.display, fontSize: 18, color: br.brass }}>B</span>
                        </div>
                    </Link>
                </div>
                <p style={{ ...t.body, color: ink.warm, margin: '0 0 20px' }}>Sign in with the email your request was filed under.</p>
                <label style={field('Email')}>Email</label>
                <input style={input} type="email" placeholder="you@family.example" />
                <label style={field('Password')}>Password</label>
                <input style={input} type="password" placeholder="Your password" />
                <button style={button}>Sign in</button>
                <p style={{ ...t.label, color: ad.pale, marginTop: 18, letterSpacing: '0.06em' }}>Demo screen - authentication is not wired.</p>
                <p style={{ ...t.body, fontSize: '0.82rem', color: ink.warm, margin: '6px 0 0' }}>
                    No account yet?{' '}
                    <Link href="/request-access" style={{ color: br.brass, textDecoration: 'underline' }}>Request access</Link>
                    {' '}from a family elder.
                </p>
            </div>
        </div>
    )
}
import { Head, Link } from '@inertiajs/react'
import theme from '../../theme'

const { palette, fonts, type: t } = theme
const ink = palette.ink
const pc = palette.parchment
const br = palette.brass
const ad = palette.adire

const input = {
    width: '100%',
    boxSizing: 'border-box' as const,
    background: 'transparent',
    border: '1px solid ' + ad.indigo,
    color: ink.ink,
    fontFamily: fonts.body,
    fontSize: '0.88rem',
    padding: '9px 11px',
    marginBottom: 14,
}

export default function RequestAccessPage() {
    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: pc.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <Head title="Request access" />
            <div style={{ width: '100%', maxWidth: 520, background: pc.base, color: ink.ink, border: '1px solid ' + br.brass, padding: 32 }}>
                <h1 style={{ ...t.subhead, margin: '0 0 8px' }}>Request access</h1>
                <p style={{ ...t.body, color: ink.warm, margin: '0 0 22px' }}>
                    Tell us how you connect to the Bolaji lineage. A family elder reviews every request before the registry opens.
                </p>
                <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 5 }}>First name</label>
                <input style={input} placeholder="First name" />
                <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 5 }}>Last name</label>
                <input style={input} placeholder="Last name" />
                <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 5 }}>Email</label>
                <input style={input} type="email" placeholder="you@family.example" />
                <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 5 }}>Branch</label>
                <select style={input} defaultValue="">
                    <option value="">Choose a branch</option>
                    <option value="oshodi">Oshodi branch</option>
                    <option value="ilesha">Ilesha branch</option>
                    <option value="adegbite">Adegbite branch</option>
                </select>
                <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 5 }}>How you connect</label>
                <select style={input} defaultValue="">
                    <option value="">Choose a relationship</option>
                    <option value="sibling">Sibling</option>
                    <option value="child">Child</option>
                    <option value="grandchild">Grandchild</option>
                    <option value="cousin">Cousin</option>
                    <option value="in_law">In-law</option>
                </select>
                <label style={{ display: 'block', fontFamily: fonts.body, fontSize: '0.72rem', letterSpacing: '0.05em', color: ink.warm, marginBottom: 5 }}>Notes</label>
                <textarea style={{ ...input, minHeight: 70 }} placeholder="Anything that helps the elder confirm your connection" />
                <button style={{ background: 'transparent', border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.85rem', letterSpacing: '0.05em', padding: '9px 18px', cursor: 'pointer' }}>Submit request</button>
                <p style={{ ...t.label, color: ad.pale, marginTop: 18, letterSpacing: '0.06em' }}>Demo screen - submissions are not wired.</p>
                <p style={{ ...t.body, fontSize: '0.82rem', color: ink.warm, margin: '6px 0 0' }}>
                    Already enrolled?{' '}
                    <Link href="/login" style={{ color: br.brass, textDecoration: 'underline' }}>Sign in</Link>.
                </p>
            </div>
        </div>
    )
}
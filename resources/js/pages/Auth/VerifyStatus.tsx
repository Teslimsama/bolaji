import { Head, Link } from '@inertiajs/react'
import theme from '../../theme'

const { palette, fonts, type: t, spacing } = theme
const ink = palette.ink
const px = palette.parchment
const br = palette.brass
const ad = palette.adire
const mo = palette.moss

export default function VerifyStatus({ status = null }: { status?: string | null }) {
    const st = status || 'pending'
    const verified = st === 'verified'
    const seal = verified ? mo.moss : ad.indigo
    const sentence = verified
        ? 'Your line is verified and your name is on the registry.'
        : st === 'rejected'
            ? 'Your request was not approved. Contact an elder to reapply.'
            : st === 'more_info'
                ? 'The lineage office needs more information before they can verify you.'
                : 'Your request is with the lineage office and under review by an elder.'

    return (
        <div style={{ minHeight: '100vh', background: ink.ink, color: px.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
            <Head title="Verification status" />
            <div style={{ width: '100%', maxWidth: 460, background: px.base, color: ink.ink, border: '1px solid ' + br.brass, padding: spacing.xl, textAlign: 'center' }}>
                <h1 style={{ ...t.subhead, margin: '0 0 22px' }}>Verification status</h1>
                <div style={{ width: 96, height: 96, borderRadius: '50%', border: '2px solid ' + seal, display: 'grid', placeItems: 'center', margin: '0 auto' }}>
                    <span className="adire-dot" style={{ width: 14, height: 14, background: seal }} />
                </div>
                <div style={{ ...t.label, color: ad.pale, marginTop: spacing.md }}>status: {st}</div>
                <p style={{ ...t.body, color: ink.warm, margin: '10px 0 0', maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>{sentence}</p>
                <Link href="/me" style={{ display: 'inline-block', marginTop: 22, border: '1px solid ' + br.brass, color: br.brass, fontFamily: fonts.body, fontSize: '0.82rem', letterSpacing: '0.05em', padding: '9px 16px', textDecoration: 'none' }}>
                    Back to your profile
                </Link>
            </div>
        </div>
    )
}
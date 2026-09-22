/**
 * Crestkeeper design tokens. Palette, fonts, type, spacing, motion, motif, viewWidth.
 * Reference: platform design brief. ASCII only.
 */

export const palette = {
    ink: { ink: '#15120D', warm: '#241F18' },
    parchment: { base: '#EDE3D0', paper: '#F6EFE1' },
    brass: { brass: '#A9812F', bright: '#C69A3E' },
    adire: { indigo: '#263A5C', pale: '#55709C' },
    kola: { kola: '#8A3B2B', light: '#B24E35' },
    moss: { moss: '#4C6B4F', light: '#6B8A6E' },
}

export const fonts = {
    display: "'Fraunces', Georgia, serif",
    body: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
}

const fraunces = "'Fraunces', Georgia, serif"
const plex = "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif"

export const type = {
    display: {
        family: fraunces, weight: 350, size: 'clamp(2.4rem, 7.5vw, 5.1rem)',
        lineHeight: 1.05, letterSpacing: '-0.015em',
    },
    headline: {
        family: fraunces, weight: 380, size: 'clamp(1.7rem, 4.2vw, 2.7rem)',
        lineHeight: 1.12,
    },
    subhead: {
        family: fraunces, weight: 390, size: 'clamp(1.2rem, 2.6vw, 1.6rem)',
        lineHeight: 1.25,
    },
    body: { family: plex, weight: 400, size: '0.965rem', lineHeight: 1.6 },
    label: {
        family: plex, weight: 500, size: '0.78rem',
        lineHeight: 1.3, letterSpacing: '0.05em',
    },
}

export const spacing = { nano: 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, xxl: 48, huge: 64 }

export const motion = { fast: 140, base: 240, slow: 520, ease: 'cubic-bezier(0.22, 1, 0.36, 1)' }

export const motif = { lineStrip: '1px', connecting: '2px', dot: '3px' }

export const viewWidth = { narrow: 640, wide: 1240 }

export default { palette, fonts, type, spacing, motion, motif, viewWidth }
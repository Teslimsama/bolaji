import { createInertiaApp } from '@inertiajs/react'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'

import '../css/app.css'
import './theme'
import './adire-line.css'

createInertiaApp({
    title: (title) => (title ? title + ' - Crestkeeper' : 'Crestkeeper'),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        createRoot(el).render(createElement(App, props))
    },
    progress: {
        delay: 0,
        color: '#A9812F',
        includeCSS: true,
    },
})
// Client entry: mounts the SPA and renders the page for the current path.

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../css/app.css'
import './theme'
import './adire-line.css'
import { route, usePath } from './router'

function App() {
    const path = usePath()
    const Page = route(path)
    if (!Page) return null
    return <Page />
}

createRoot(document.getElementById('app')!).render(
    <StrictMode>
        <App />
    </StrictMode>
)
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    root: '.',
    publicDir: false,
    define: {
        __CRESTKEEPER_API_URL__: JSON.stringify(process.env.CRESTKEEPER_API_URL ?? ''),
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: 'index.html',
        },
    },
});
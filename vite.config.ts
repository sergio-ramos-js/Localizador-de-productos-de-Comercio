import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import inertia from '@inertiajs/vite';
import tailwindcss from '@tailwindcss/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import { bunny } from 'laravel-vite-plugin/fonts';

export default defineConfig({
    server: {
        host: true, // ← Cambia a true (mejor que 0.0.0.0 en algunos casos)
        port: 5371,
        strictPort: true,
        cors: true,
        hmr: {
            host: '192.168.1.111', // ← Tu IP actual
            port: 5371,
            protocol: 'http',
        },
    },

    plugins: [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        inertia(),
        react({
            babel: {
                plugins: ['babel-plugin-react-compiler'],
            },
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
    ],
});

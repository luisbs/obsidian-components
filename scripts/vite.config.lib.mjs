import { resolve } from 'path'
import { defineConfig } from 'vite'
import { packageBanner, rollupOptions } from './vite.share.mjs'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [packageBanner()],
    resolve: { alias: { '@': resolve(import.meta.dirname, '../src') } },
    build: {
        outDir: 'lib',
        target: 'es2022',
        sourcemap: true,
        rollupOptions: rollupOptions(),
        lib: {
            formats: ['es'],
            fileName: () => 'obsidian-components.esm.js',
            entry: resolve(import.meta.dirname, '../src/index.ts'),
        },
    },
})

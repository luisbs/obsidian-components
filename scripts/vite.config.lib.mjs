import { resolve } from 'path'
import { defineConfig } from 'vite'
import { packageBanner, rollupOptions } from './vite.share.mjs'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [packageBanner()],
    resolve: { alias: { '@': resolve(__dirname, '../src') } },
    build: {
        outDir: 'lib',
        target: 'es2022',
        sourcemap: true,
        rollupOptions: rollupOptions(),
        lib: {
            formats: ['es'],
            fileName: () => 'obsidian-components.esm.js',
            entry: resolve(__dirname, '../src/index.ts'),
        },
    },
})

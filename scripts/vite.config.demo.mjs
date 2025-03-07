import { resolve } from 'path'
import { defineConfig } from 'vite'
import { packageBanner, packageStatic, rollupOptions } from './vite.share.mjs'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [packageBanner(), packageStatic(['manifest.json', 'styles.css'])],
    resolve: { alias: { '@': resolve(import.meta.dirname, '../src') } },
    build: {
        emptyOutDir: false,
        outDir: 'demo/.obsidian/plugins/components',
        target: 'es2022',
        sourcemap: 'inline',
        rollupOptions: rollupOptions(),
        lib: {
            formats: ['cjs'],
            fileName: () => 'main.js',
            entry: resolve(import.meta.dirname, '../src/main.ts'),
        },
    },
})

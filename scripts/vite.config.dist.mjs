import { resolve } from 'path'
import { defineConfig } from 'vite'
import { packageBanner, packageStatic, rollupOptions } from './vite.share.mjs'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [packageBanner(), packageStatic(['manifest.json', 'styles.css'])],
    resolve: { alias: { '@': resolve(__dirname, '../src') } },
    esbuild: { drop: ['debugger'] },
    build: {
        outDir: 'dist',
        target: 'es2022',
        sourcemap: false,
        rollupOptions: rollupOptions(),
        lib: {
            formats: ['cjs'],
            fileName: () => 'main.js',
            entry: resolve(__dirname, '../src/main.ts'),
        },
    },
})

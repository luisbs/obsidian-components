import banner from 'vite-plugin-banner'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import pkg from '../package.json'

export function packageBanner() {
    return banner(
        [
            '/*!',
            ` * @copyright Copyright (c) 2022-present ${pkg.author.name}`,
            ` * @license ${pkg.name}@${pkg.version} is released under the ${pkg.license} license`,
            ` * @source ${pkg.repository.url}`,
            ' */',
        ].join('\n'),
    )
}

/** @param {string[]} files */
export function packageStatic(files) {
    return viteStaticCopy({
        targets: files.map((src) => ({ src, dest: './' })),
    })
}

export function rollupOptions() {
    return {
        logLevel: 'info',
        treeshake: true,
        external: [
            'obsidian',
            'electron',
            '@codemirror/autocomplete',
            '@codemirror/closebrackets',
            '@codemirror/collab',
            '@codemirror/commands',
            '@codemirror/comment',
            '@codemirror/fold',
            '@codemirror/gutter',
            '@codemirror/highlight',
            '@codemirror/history',
            '@codemirror/language',
            '@codemirror/lint',
            '@codemirror/matchbrackets',
            '@codemirror/panel',
            '@codemirror/rangeset',
            '@codemirror/rectangular-selection',
            '@codemirror/search',
            '@codemirror/state',
            '@codemirror/stream-parser',
            '@codemirror/text',
            '@codemirror/tooltip',
            '@codemirror/view',
        ],
    }
}

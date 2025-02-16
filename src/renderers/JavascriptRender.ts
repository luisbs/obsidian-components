import type { CodeblockContext } from '@/types'
import type { Logger } from '@luis.bs/obsidian-fnc'
import type { TFile } from 'obsidian'
import { isRecord } from '@/utility'
import BaseRenderer, { ComponentRendererError } from './BaseRenderer'

type TemplateRenderer = (
    data: unknown,
    context: CodeblockContext,
) => Promise<string>
type CodeRenderer = (
    root: HTMLElement,
    data: unknown,
    context: CodeblockContext,
) => Promise<void>

export default class JavascriptRenderer extends BaseRenderer {
    public test(component: TFile): boolean {
        return /\.[cm]js$/.test(component.name)
    }

    public async render(
        component: TFile,
        context: CodeblockContext,
        element: HTMLElement,
        data: unknown,
        log: Logger,
    ): Promise<void> {
        log.debug('Rendering from Javascript')
        // TODO: implement caching

        const renderer = await this.#getRenderer(component, log)
        if (/\.md\.[cm]js$/i.test(component.name)) {
            const template = await (renderer as TemplateRenderer)(data, context)
            this.renderMarkdown(element, template, context.notepath, log)
        } //
        else if (/\.html\.[cm]js$/i.test(component.name)) {
            const template = await (renderer as TemplateRenderer)(data, context)
            this.renderHTML(element, template, log)
        } //
        else await (renderer as CodeRenderer)(element, data, context)
    }

    /** @throws {ComponentRendererError} */
    async #getRenderer<T extends TemplateRenderer | CodeRenderer>(
        component: TFile,
        log: Logger,
    ): Promise<T> {
        log.debug('Retrieving Javascript Renderer')
        const module = await this.#source(component, log)

        // default export on cjs
        if (typeof module === 'function') return module as T
        if (!isRecord(module)) {
            throw new ComponentRendererError(
                `component ${component.name} should export a function or a 'render' method`,
                { code: 'missing-component-renderer' },
            )
        }

        // default export on esm
        if (typeof module.default === 'function') return module.default as T
        // named export on cjs & esm
        if (typeof module.render === 'function') return module.render as T

        throw new ComponentRendererError(
            `component ${component.name} should export a function or a 'render' method`,
            { code: 'missing-component-renderer' },
        )
    }

    /** @throws {ComponentRendererError} */
    async #source(file: TFile, log: Logger): Promise<unknown> {
        log.debug('Sourcing Renderer')

        try {
            // ESModules
            if (file.name.endsWith('mjs')) {
                const resolved = this.plugin.app.vault.getResourcePath(file)
                log.debug(`import('${resolved}')`)
                return await import(resolved)
            }

            // CommonJS
            const resolved = this.plugin.fs.getRealPath(file.path)
            log.debug(`require('${resolved}')`)
            // eslint-disable-next-line @typescript-eslint/no-require-imports
            return require(resolved)
        } catch (cause) {
            throw new ComponentRendererError(
                `component '${file.name}' could not be imported/required`,
                { cause, code: 'invalid-component-syntax' },
            )
        }
    }
}

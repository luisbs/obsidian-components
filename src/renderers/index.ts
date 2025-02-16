import type { CodeblockContext, ComponentsPlugin } from '@/types'
import type { Logger } from '@luis.bs/obsidian-fnc'
import type { TFile } from 'obsidian'
import BaseRenderer, { ComponentRendererError } from './BaseRenderer'
import TemplateRenderer from './TemplateRenderer'
import JavascriptRenderer from './JavascriptRender'

export default class RenderManager {
    #renderers: BaseRenderer[]

    constructor(plugin: ComponentsPlugin) {
        // TODO: add support for renderers without virtual DOM
        // ? - [Vapor](https://github.com/vuejs/core/tree/vapor)
        // ? - [Solid](https://github.com/solidjs/solid)
        // ? - [Svelte](https://github.com/sveltejs/svelte)
        this.#renderers = [
            new TemplateRenderer(plugin),
            new JavascriptRenderer(plugin),
        ]
    }

    /** @throws {ComponentRendererError} */
    public async render(
        component: TFile,
        context: CodeblockContext,
        element: HTMLElement,
        data: unknown,
        log: Logger,
    ): Promise<void> {
        for (const renderer of this.#renderers) {
            if (renderer.test(component)) {
                // clear the element
                element.empty()
                return renderer.render(component, context, element, data, log)
            }
        }

        throw new ComponentRendererError(
            `component ${component.name} is not supported`,
            { code: 'unsupported-component' },
        )
    }
}

import type { ComponentsPlugin } from '@/types'
import type { Logger } from '@luis.bs/obsidian-fnc'
import { MarkdownRenderer, TFile } from 'obsidian'

export interface CodeblockContext {
    /** Vault-path of the note containing the **Codeblock**. */
    notepath: string
    /** Component name used on the **Codeblock**. */
    usedname: string
    /** Syntax of the **Codeblock**. */
    syntax: string
    /** Hash result of the **Codeblock** content. */
    hash: string
}

export default abstract class BaseRenderer {
    constructor(protected plugin: ComponentsPlugin) {}

    /** Test if the **Renderer** supports the **Component**. */
    public abstract test(component: TFile): boolean

    /** Renders the _data_ into the _element_ using the **Component**. */
    public abstract render(
        component: TFile,
        context: CodeblockContext,
        element: HTMLElement,
        data: unknown,
        log: Logger,
    ): Promise<void>

    /** Render the **HTML _content_** inside the _element_. */
    protected renderHTML(
        element: HTMLElement,
        content: string,
        log: Logger,
    ): void {
        log.debug('Rendering as HTML')
        element.innerHTML = content
    }

    /**
     * Render the **Markdown _content_** inside the _element_.
     *
     * Any link present will be resolved from the _notepath_.
     */
    protected renderMarkdown(
        element: HTMLElement,
        content: string,
        notepath: string,
        log: Logger,
    ): void {
        log.debug('Rendering as Markdown')
        void MarkdownRenderer.render(
            this.plugin.app,
            content,
            element,
            notepath,
            this.plugin,
        )
    }
}

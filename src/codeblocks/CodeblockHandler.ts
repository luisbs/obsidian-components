import type { MarkdownPostProcessorContext } from 'obsidian'
import type { Logger } from '@luis.bs/obsidian-fnc'
import type { ComponentMatcher, ComponentsPlugin } from '@/types'
import { MapStore, getHash } from '@/utility'
import { ComponentError, DisabledComponentError } from './ComponentError'
import ParserManager from './parsers'
import RenderManager, { CodeblockContext } from './renderers'

interface RenderParams {
    /** **Codeblock Context** shared to the **Component**. */
    context: CodeblockContext
    /** **ParentElement** to render the **Component** in. */
    element: HTMLElement
    /** **Codeblock** content parsed. */
    data: unknown
}

export class CodeblockHandler {
    #log: Logger
    #plugin: ComponentsPlugin
    #parser: ParserManager
    #renderer: RenderManager

    #rendered = new MapStore<RenderParams>()
    #registered: string[] = []

    constructor(plugin: ComponentsPlugin) {
        this.#log = plugin.log.make(CodeblockHandler.name)
        this.#plugin = plugin
        this.#parser = new ParserManager(plugin)
        this.#renderer = new RenderManager(plugin)
    }

    public clear(): void {
        this.#rendered.clear()
        // todo check a way to un-register the processors
    }

    /** Force all instances of all components to re-render. */
    public refreshAll(): void {
        const group = this.#log.group()
        for (const componentPath of this.#rendered.keys()) {
            group.debug(`Refreshing Components「${componentPath}」`)
            for (const params of this.#rendered.get(componentPath)) {
                group.trace('Refreshing Codeblock', params)
                this.#render(componentPath, params, group)
            }
        }
        group.flush('Refreshed Components')
    }

    #render(
        componentPath: string,
        { context, element, data }: RenderParams,
        log: Logger,
    ): void {
        const component = this.#plugin.api.latest(componentPath)
        void this.#renderer.render(component, context, element, data, log)
    }

    /** Register the handler for codeblocks. */
    public registerCodeblocks(): void {
        // default codeblocks
        this.#plugin.registerMarkdownCodeBlockProcessor(
            'use',
            this.#handler.bind(this),
            -100,
        )

        // user-defined codeblocks
        for (const [
            id,
            names,
        ] of this.#plugin.state.components_enabled.entries()) {
            for (const name of names) {
                // avoid re-registering a processor
                if (this.#registered.includes(name)) continue

                this.#registered.push(name)
                this.#plugin.registerMarkdownCodeBlockProcessor(
                    name,
                    (source, element, context) => {
                        void this.#handler(source, element, context, id, name)
                    },
                    -100,
                )
            }
        }
    }

    async #handler(
        source: string,
        element: HTMLElement,
        elContext: MarkdownPostProcessorContext,
        componentId?: string,
        name?: string,
    ): Promise<void> {
        const group = this.#log.group()

        try {
            group.debug(`Parsing Codeblock Name ${name ?? 'use'}`)
            const notepath = elContext.sourcePath
            const used_name = name ?? this.#getComponentName(elContext, element)

            group.debug(`Parsing Codeblock Content ${used_name}`)
            const { syntax, data } = this.#parser.parse(source, notepath, group)
            const matcher = this.#getComponentMatcher(componentId, used_name)
            const hash = await getHash(source)

            group.debug(`Serializing Codeblock ${used_name}`)
            const context = { notepath, used_name, syntax, hash }
            const params = { context, element, data }
            group.trace('Serialized Codeblock', params)

            group.debug(`Rendering Codeblock ${used_name}`)
            element.classList.add('component', `${used_name}-component`)
            this.#rendered.push(matcher.path, params)
            this.#render(matcher.path, params, group)

            group.flush(`Rendered Component ${used_name}`)
        } catch (err) {
            group.error(err)
            group.flush(`Failed Rendering Component on ${elContext.sourcePath}`)

            const pre = element.createEl('pre')
            pre.classList.add('component-error')

            if (err instanceof DisabledComponentError) err.cause = source
            if (err instanceof Error) pre.append(err.stack ?? err.message)
            else pre.append(JSON.stringify(err))
        }
    }

    /** @throws {ComponentError} when componentName is not found */
    #getComponentName(
        context: MarkdownPostProcessorContext,
        element: HTMLElement,
    ): string {
        // try to identify the name from codeblock header
        const info = context.getSectionInfo(element)
        if (info) {
            const header = info.text.split('\n').at(info.lineStart) ?? ''
            const used_name = header.replace('```use', '').trim()
            if (used_name) return used_name
        }

        throw new ComponentError(
            `component name could not be found on ${context.sourcePath}`,
            { cause: info, code: 'missing-component-name' },
        )
    }

    /** @throws {ComponentError} when component is not found or is not active. */
    #getComponentMatcher(
        componentId?: string,
        used_name?: string,
    ): ComponentMatcher {
        if (componentId) {
            for (const matcher of this.#plugin.state.components_matchers) {
                if (matcher.id === componentId) return matcher
            }
        }

        if (used_name) {
            for (const matcher of this.#plugin.state.components_matchers) {
                if (matcher.test(used_name)) return matcher
            }
        }

        throw new DisabledComponentError(
            `component '${used_name}' was disabled recently`,
        )
    }
}

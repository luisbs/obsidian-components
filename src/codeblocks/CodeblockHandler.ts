import type { MarkdownPostProcessorContext } from 'obsidian'
import type { Logger } from '@luis.bs/obsidian-fnc'
import type { ComponentMatcher, ComponentsPlugin } from '@/types'
import { MapStore, getHash } from '@/utility'
import { ComponentError, DisabledComponentError } from './ComponentError'
import ParserManager from './parsers'
import RenderManager, { CodeblockContext } from './renderers'
import VersionsManager from './VersionsManager'

interface RenderParams {
    /** **Codeblock Context** shared to the **Component**. */
    context: CodeblockContext
    /** **ParentElement** to render the **Component** in. */
    element: HTMLElement
    /** **Codeblock** content parsed. */
    data: unknown
}

export default class CodeblockHandler {
    #log: Logger
    #plugin: ComponentsPlugin

    #parser: ParserManager
    #renderer: RenderManager
    #versions: VersionsManager

    #rendered = new MapStore<RenderParams>()
    #registered: string[] = []

    constructor(plugin: ComponentsPlugin) {
        this.#log = plugin.log.make(CodeblockHandler.name)
        this.#plugin = plugin
        this.#parser = new ParserManager(plugin)
        this.#renderer = new RenderManager(plugin)
        this.#versions = new VersionsManager(plugin, this.refresh.bind(this))
    }

    public async clear(log: Logger): Promise<void> {
        log.info('Clearing in-memory cache')
        this.#rendered.clear()
        this.#versions.clear()

        // remove all temporal files
        await this.#versions.resetCache(log)
        // todo check a way to un-register the processors
    }

    public async prepareDesignMode(): Promise<void> {
        const group = this.#log.group('Preparing DesignMode')

        try {
            // clear so when components are re-render they start tracking
            // and the HotComponentReload works correctly
            group.info('Clearing cache')
            await this.#versions.resetCache(group)
            await this.#versions.indexAllComponents(group)

            group.info('Refreshing All Components')
            await this.refresh(Array.from(this.#rendered.keys()), group)
        } catch (err) {
            group.warn(err)
        }
        group.flush('DesignMode Enabled')
    }

    /**
     * Force all instances of the listed components to re-render.
     * @note if no components is provided, all components are refreshed.
     */
    public async refresh(paths: string[], log: Logger): Promise<void> {
        const componentsPaths = paths.length ? paths : this.#rendered.keys()

        log.debug('Refreshing Components', paths)
        for (const componentPath of componentsPaths) {
            log.debug(`Refreshing Components(${componentPath})`)
            try {
                for (const params of this.#rendered.get(componentPath)) {
                    log.trace('Refreshing Codeblock', params)
                    await this.#renderComponent(componentPath, params, log)
                }
            } catch (err) {
                log.warn(err)
            }
        }
        log.debug('Refreshed Components')
    }

    /**
     * Register the handler for `use` codeblocks.
     */
    public registerBaseCodeblock(): void {
        // default codeblocks
        this.#plugin.registerMarkdownCodeBlockProcessor(
            'use',
            this.#handler.bind(this),
            -100,
        )
    }

    /**
     * Register the handler for custom codeblocks.
     */
    public registerCustomCodeblocks(): void {
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
            group.debug(`Parsing Codeblock Name '${name ?? 'use'}'`)
            const notepath = elContext.sourcePath
            const used_name = name ?? this.#getComponentName(elContext, element)

            group.debug(`Parsing Codeblock Content '${used_name}'`)
            const parsed = await this.#parser.parse(source, notepath, group)
            const matcher = this.#getComponentMatcher(componentId, used_name)
            const hash = getHash(source)

            group.debug(`Serializing Codeblock '${used_name}'`)
            const context = { notepath, used_name, hash, syntax: parsed.syntax }
            const params = { context, element, data: parsed.data }
            group.trace('Serialized Codeblock', params)

            group.debug(`Rendering Codeblock '${used_name}'`)
            element.classList.add('component', `${used_name}-component`)
            this.#rendered.push(matcher.path, params)
            await this.#renderComponent(matcher.path, params, group)

            const file = this.#plugin.app.vault.getFileByPath(matcher.path)
            if (file) {
                group.debug(`Indexing Component '${matcher.path}'`)
                await this.#versions.indexComponent(file, group)
            }

            group.flush(`Rendered Component '${used_name}'`)
        } catch (err) {
            group.error(err)
            group.flush(`Failed Component on '${elContext.sourcePath}'`)

            const pre = element.createEl('pre')
            pre.classList.add('component-error')

            if (err instanceof DisabledComponentError) err.cause = source
            if (err instanceof Error) pre.append(err.stack ?? err.message)
            else pre.append(JSON.stringify(err))
        }
    }

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
            `component name could not be found on '${context.sourcePath}'`,
            { cause: info, code: 'missing-component-name' },
        )
    }

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
            `component(${used_name}) was disabled recently`,
        )
    }

    async #renderComponent(
        componentPath: string,
        { context, element: el, data }: RenderParams,
        log: Logger,
    ): Promise<void> {
        const latestPath = this.#versions.resolveLatest(componentPath)
        log.debug(`Rendering with LatestPath '${latestPath}'`)

        const file = this.#plugin.app.vault.getFileByPath(latestPath)
        if (file) return this.#renderer.render(file, context, el, data, log)

        throw new ComponentError(
            `component(${latestPath}) could not be located, try reloading Obsidian`,
            { code: 'missing-component-file' },
        )
    }
}

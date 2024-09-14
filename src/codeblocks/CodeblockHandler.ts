import type { MarkdownPostProcessorContext } from 'obsidian'
import type {
  CodeblockContext,
  ComponentMatcher,
  ComponentsPlugin,
  RendererParams,
} from '@/types'
import { parseYaml } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import { MapStore, getHash, isRecord, isString } from '@/utility'
import { ComponentError } from './ComponentError'
import RenderManager from './RenderManager'

interface CodeblockContent {
  /** Syntax of the **Codeblock**. */
  syntax: CodeblockContext['syntax']
  /** Hash result of the **Codeblock** content. */
  hash: string
  /** **Codeblock** content parsed. */
  data: unknown
}

export class CodeblockHandler {
  #plugin: ComponentsPlugin
  #relay: RenderManager

  #log = new Logger('CodeblockHandler')
  #rendered = new MapStore<RendererParams>()
  #registered: string[] = []

  constructor(plugin: ComponentsPlugin) {
    this.#plugin = plugin
    this.#relay = new RenderManager(plugin)
  }

  public clear(): void {
    this.#rendered.clear()
    // todo check a way to un-register the processors
  }

  /**
   * Force all instances of all components to re-render.
   */
  public refreshAll(): void {
    for (const key of this.#rendered.keys()) {
      this.refresh(key)
    }
  }

  /**
   * Force all the instances of a component to re-render.
   */
  public refresh(filePath: string): void {
    const logger = this.#log.group(`Refreshing Components「${filePath}」`)
    for (const params of this.#rendered.get(filePath) || []) {
      logger.debug('Refreshing Context', params.context)
      this.#relay.render(params, logger)
      logger.info(`Refreshed Component with Hash「${params.context.hash}」`)
    }
    logger.flush('Refreshed Components')
  }

  /**
   * Register the handler for default codeblocks.
   */
  public registerBaseCodeblock(): void {
    this.#plugin.registerMarkdownCodeBlockProcessor('use', (source, el, ctx) =>
      this.#handleExecution(ctx, el, source),
    )
  }

  /**
   * Register the handler for user-defined codeblocks.
   */
  public registerCustomCodeblocks(): void {
    for (const [id, names] of this.#plugin.state.components_enabled.entries()) {
      for (const name of names) {
        // avoid re-registering a processor
        if (this.#registered.includes(name)) continue
        this.#registered.push(name)
        this.#plugin.registerMarkdownCodeBlockProcessor(
          name,
          (source, el, ctx) => this.#handleExecution(ctx, el, source, id, name),
        )
      }
    }
  }

  async #handleExecution(
    elContext: MarkdownPostProcessorContext,
    element: HTMLElement,
    source: string,
    componentId?: string,
    name?: string,
  ): Promise<void> {
    const id = String(Math.floor(Math.random() * 1e6)).padStart(6, '-')
    const logger = this.#log.group(`Codeblock Execution ${id}`)

    try {
      const { hash, syntax, data } = await this.#parseCodeblock(source)
      const used_name = name || this.#getComponentName(elContext, element, data)
      const matcher = this.#getComponentMatcher(componentId, used_name)
      element.classList.add('component', `${used_name}-component`)

      // prepare parames
      const notepath = elContext.sourcePath
      const context: CodeblockContext = { notepath, used_name, syntax, hash }
      const params: RendererParams = { matcher, context, element, data }
      logger.debug('Codeblock Context', context)

      // run renderer
      this.#rendered.push(matcher.path, params)
      this.#relay.render(params, logger)
      logger.flush(`[${id}] Rendered Component ${matcher.id}`)
      //
    } catch (error) {
      logger.error(error)
      logger.flush(`[${id}] Failed rendering Component ${componentId}`)

      const pre = element.createEl('pre')
      if (error instanceof ComponentError) pre.classList.add(error.code)
      if (error instanceof Error) pre.append(error.stack || error.message)
      else pre.append(String(error))
    }
  }

  async #parseCodeblock(source: string): Promise<CodeblockContent> {
    source = source.trim()
    const hash = await getHash(source, this.#log)
    const isJson = source.startsWith('{')
    const separator = new RegExp(this.#plugin.settings.usage_separator, 'ig')

    try {
      let data = null
      if (!this.#plugin.settings.enable_separators || !separator.test(source)) {
        data = isJson ? JSON.parse(source) : parseYaml(source)
      } else {
        data = isJson
          ? source.split(separator).map((fragment) => JSON.parse(fragment))
          : source.split(separator).map((fragment) => parseYaml(fragment))
      }

      return { hash, data, syntax: isJson ? 'json' : 'yaml' }
    } catch (ignored) {
      return { hash, data: source, syntax: 'unknown' }
    }
  }

  /** @throws {ComponentError} when componentName is not found */
  #getComponentName(
    ctx: MarkdownPostProcessorContext,
    el: HTMLElement,
    data: unknown,
    prefix = '```use',
  ): string {
    // try to identify the name from codeblock header
    if (this.#plugin.settings.usage_method !== 'PARAM') {
      const info = ctx.getSectionInfo(el)
      if (info) {
        const header = info.text.split('\n').at(info.lineStart) ?? ''
        return header.replace(prefix, '').trim()
      }
    }

    // try to identify the name from the data
    if (this.#plugin.settings.usage_method !== 'INLINE' && isRecord(data)) {
      for (const paramName of this.#plugin.state.name_params) {
        if (isString(data[paramName])) return data[paramName] as string
      }
    }

    throw new ComponentError('missing-component-name')
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

    throw new ComponentError('unknown-component')
  }
}

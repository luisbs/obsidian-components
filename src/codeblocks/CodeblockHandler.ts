import type { MarkdownPostProcessorContext } from 'obsidian'
import type {
  CodeblockContext,
  ComponentMatcher,
  ComponentsPlugin,
  RendererParams,
} from '@/types'
import { Logger } from 'obsidian-fnc'
import { MapStore, getHash, isRecord, isString } from '@/utility'
import { ComponentError, DisabledComponentError } from './ComponentError'
import { ParserManager } from './parsers'
import RenderManager from './renderers/RenderManager'

export class CodeblockHandler {
  #plugin: ComponentsPlugin
  #parser: ParserManager
  #relay: RenderManager

  #log = Logger.consoleLogger(CodeblockHandler.name)
  #rendered = new MapStore<RendererParams>()
  #registered: string[] = []

  constructor(plugin: ComponentsPlugin) {
    this.#plugin = plugin
    this.#parser = new ParserManager(plugin)
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
    this.#log.debug(`Refreshing Components「${filePath}」`)
    for (const params of this.#rendered.get(filePath) || []) {
      this.#log.trace('Refreshing Context', params.context)
      this.#relay.render(params)
      this.#log.debug(`Refreshed Component with Hash「${params.context.hash}」`)
    }
    this.#log.info('Refreshed Components')
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
    this.#log.debug(`Codeblock Execution ${id}`)

    try {
      const notepath = elContext.sourcePath
      const hash = await getHash(source)
      const { data, syntax } = await this.#parser.parse(source, notepath)

      const used_name = name || this.#getComponentName(elContext, element, data)
      const matcher = this.#getComponentMatcher(componentId, used_name)
      element.classList.add('component', `${used_name}-component`)

      // prepare parames
      const context: CodeblockContext = { notepath, used_name, syntax, hash }
      const params: RendererParams = { matcher, context, element, data }
      this.#log.debug('Codeblock Context', context)

      // run renderer
      this.#rendered.push(matcher.path, params)
      this.#relay.render(params)
      this.#log.info(`[${id}] Rendered Component ${matcher.id}`)
      //
    } catch (error) {
      this.#log.warn(`[${id}] Failed rendering Component ${componentId}`)
      this.#log.warn(error)

      const pre = element.createEl('pre')
      if (error instanceof DisabledComponentError) {
        pre.classList.add('unknown-component')
        pre.append(String(error))
        pre.createEl('br')
        pre.createEl('br')
        pre.append(source)
        return
      }

      if (error instanceof ComponentError) pre.classList.add(error.code)
      if (error instanceof Error) pre.append(error.stack || error.message)
      else pre.append(String(error))
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

  /** @throws {DisabledComponentError} when component is not found or is not active. */
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

    throw new DisabledComponentError(used_name)
  }
}

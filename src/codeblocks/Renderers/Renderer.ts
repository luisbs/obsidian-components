import type {
  CodeblockContext,
  ComponentMatcher,
  ComponentsPlugin,
  RendererParams,
} from '@/types'
import { MarkdownRenderer, TFile, Vault } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import { ComponentError } from '../ComponentError'

export abstract class Renderer {
  #log = new Logger('Renderer')
  protected logger = this.#log.group()
  protected id = String(Math.floor(Math.random() * 1e6)).padStart(6, '-')

  protected vault: Vault
  protected matcher: ComponentMatcher
  protected context: CodeblockContext
  protected element: HTMLElement
  protected data: unknown

  constructor(protected plugin: ComponentsPlugin, params: RendererParams) {
    this.vault = plugin.app.vault
    this.matcher = params.matcher
    this.context = params.context
    this.element = params.element
    this.data = params.data
  }

  /** Each renderer should define the sequence. */
  protected abstract renderingSequence(componentFile: TFile): Promise<void>

  /** Execute the renderer with the passed params during construction. */
  public async render(): Promise<void> {
    // clear the element
    this.element.empty()
    this.logger = this.#log.group('renderSequence')

    try {
      // prettier-ignore
      const componentFile = this.plugin.api.latest(this.matcher.path, this.logger)
      await this.renderingSequence(componentFile)
      this.logger.flush(`[${this.id}] Rendered <${this.matcher.path}>`)

      //
    } catch (error) {
      this.logger.error(error)
      this.logger.flush(`[${this.id}] Failed <${this.matcher.path}>`)

      const pre = this.element.createEl('pre')
      if (error instanceof ComponentError) pre.classList.add(error.code)
      if (error instanceof Error) pre.append(error.stack || error.message)
      else pre.append(String(error))
    }
  }

  protected renderHTML(content: string): void {
    this.logger.debug('renderHTMLContent')
    this.element.innerHTML = content
  }

  protected renderMarkdown(content: string): void {
    this.logger.debug('renderMarkdownContent')
    // NOTE: relative links is resolve from `this.context.notepath`
    MarkdownRenderer.render(
      this.plugin.app,
      content,
      this.element,
      this.context.notepath,
      this.plugin,
    )
  }
}

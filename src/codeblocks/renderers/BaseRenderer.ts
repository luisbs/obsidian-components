import type { CodeblockContext, ComponentsPlugin } from '@/types'
import { MarkdownRenderer, TFile } from 'obsidian'
import { Logger } from 'obsidian-fnc'

export abstract class BaseRenderer {
  #log = new Logger('BaseRenderer')

  constructor(protected plugin: ComponentsPlugin) {}

  /** @throws {ComponentError} */
  abstract render(
    logger: Logger,
    component: TFile,
    element: HTMLElement,
    context: CodeblockContext,
    data: unknown,
  ): Promise<void>

  protected renderHTML(
    logger: Logger,
    element: HTMLElement,
    content: string,
  ): void {
    this.#log.on(logger).debug('renderHTMLContent')
    element.innerHTML = content
  }

  protected renderMarkdown(
    logger: Logger,
    element: HTMLElement,
    content: string,
    notepath: string,
  ): void {
    this.#log.on(logger).debug('renderMarkdownContent')
    // NOTE: relative links are resolve from `this.context.notepath`
    MarkdownRenderer.render(
      this.plugin.app,
      content,
      element,
      notepath,
      this.plugin,
    )
  }
}

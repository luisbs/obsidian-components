import type { CodeblockContext, ComponentsPlugin } from '@/types'
import { MarkdownRenderer, TFile } from 'obsidian'
import { Logger } from 'obsidian-fnc'

export abstract class BaseRenderer {
  #log = Logger.consoleLogger(BaseRenderer.name)

  constructor(protected plugin: ComponentsPlugin) {}

  /** @throws {ComponentError} */
  abstract render(
    component: TFile,
    element: HTMLElement,
    context: CodeblockContext,
    data: unknown,
  ): Promise<void>

  protected renderHTML(element: HTMLElement, content: string): void {
    this.#log.debug('renderHTMLContent')
    element.innerHTML = content
  }

  protected renderMarkdown(
    element: HTMLElement,
    content: string,
    notepath: string,
  ): void {
    this.#log.debug('renderMarkdownContent')
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

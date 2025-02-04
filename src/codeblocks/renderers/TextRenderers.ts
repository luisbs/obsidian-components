import type { CodeblockContext } from '@/types'
import type { TFile } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import { isRecord } from '@/utility'
import { BaseRenderer } from './BaseRenderer'

export abstract class TextRenderer extends BaseRenderer {
  #log = Logger.consoleLogger(TextRenderer.name)

  protected async getComponentContent(component: TFile): Promise<string> {
    this.#log.debug('getComponentContent')
    return this.plugin.app.vault.read(component)
  }

  protected replaceData(
    source: string,
    data: unknown,
    fallback = '[missing]',
  ): string {
    this.#log.debug('replaceData')

    if (!isRecord(data) && !Array.isArray(data)) {
      const value = data ? String(data) : fallback
      return source.replace(/\{\{ *(\w+) *\}\}/gi, value)
    }

    // replace only truethy values
    return source.replace(/\{\{ *(\w+) *\}\}/gi, (_, key) => {
      //@ts-expect-error runtime dynamic replacement
      return data[key] ? String(data[key]) : fallback
    })
  }
}

export class HTMLRenderer extends TextRenderer {
  #log = Logger.consoleLogger(HTMLRenderer.name)

  async render(
    component: TFile,
    element: HTMLElement,
    context: CodeblockContext,
    data: unknown,
  ): Promise<void> {
    this.#log.debug('render')

    const content = await this.getComponentContent(component)
    const html = this.replaceData(content, data)
    this.renderHTML(element, html)
  }
}

export class MarkdownRenderer extends TextRenderer {
  #log = Logger.consoleLogger(MarkdownRenderer.name)

  async render(
    component: TFile,
    element: HTMLElement,
    context: CodeblockContext,
    data: unknown,
  ): Promise<void> {
    this.#log.debug('render')

    const content = await this.getComponentContent(component)
    const markdown = this.replaceData(content, data)
    this.renderMarkdown(element, markdown, context.notepath)
  }
}

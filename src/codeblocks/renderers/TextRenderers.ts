import type { CodeblockContext } from '@/types'
import type { TFile } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import { isRecord } from '@/utility'
import { BaseRenderer } from './BaseRenderer'

export abstract class TextRenderer extends BaseRenderer {
  #log = new Logger('TextRenderer')

  protected async getComponentContent(
    logger: Logger,
    component: TFile,
  ): Promise<string> {
    this.#log.on(logger).debug('getComponentContent')
    return this.plugin.app.vault.read(component)
  }

  protected replaceData(
    logger: Logger,
    source: string,
    data: unknown,
    fallback = '[missing]',
  ): string {
    this.#log.on(logger).debug('replaceData')

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
  #log = new Logger('HTMLRenderer')

  async render(
    logger: Logger,
    component: TFile,
    element: HTMLElement,
    context: CodeblockContext,
    data: unknown,
  ): Promise<void> {
    this.#log.on(logger).debug('render')

    const content = await this.getComponentContent(logger, component)
    const html = this.replaceData(logger, content, data)
    this.renderHTML(logger, element, html)
  }
}

export class MarkdownRenderer extends TextRenderer {
  #log = new Logger('MarkdownRenderer')

  async render(
    logger: Logger,
    component: TFile,
    element: HTMLElement,
    context: CodeblockContext,
    data: unknown,
  ): Promise<void> {
    this.#log.on(logger).debug('render')

    const content = await this.getComponentContent(logger, component)
    const markdown = this.replaceData(logger, content, data)
    this.renderMarkdown(logger, element, markdown, context.notepath)
  }
}

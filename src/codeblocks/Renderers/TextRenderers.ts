import { TFile } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import { isRecord } from '@/utility'
import { Renderer } from './Renderer'

export abstract class TextRenderer extends Renderer {
  #log = new Logger('TextRenderer')

  protected async getFileContent(componentFile: TFile): Promise<string> {
    this.#log.on(this.logger).debug('getFileContent')
    return this.vault.read(componentFile)
  }

  protected replaceData(
    source: string,
    data: unknown,
    fallback = '[missing]',
  ): string {
    this.#log.on(this.logger).debug('replaceData')

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
  async renderingSequence(componentFile: TFile): Promise<void> {
    const content = await this.getFileContent(componentFile)
    const html = this.replaceData(content, this.data)
    this.renderHTML(html)
  }
}

export class MarkdownRenderer extends TextRenderer {
  async renderingSequence(componentFile: TFile): Promise<void> {
    const content = await this.getFileContent(componentFile)
    const markdown = this.replaceData(content, this.data)
    this.renderMarkdown(markdown)
  }
}

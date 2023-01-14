import { isRecord } from '@/utility'
import { MarkdownRenderer, TFile } from 'obsidian'
import { CodeblockError } from '../CodeblockError'
import { Render } from './Render'

export class MarkdownRender extends Render {
  async render(element: HTMLElement, data: unknown): Promise<void> {
    const content = await this.#getFileContent()

    // TODO: support other cases
    if (!isRecord(data)) return

    const markdown = content.replace(/\{\{ *(\w+) *\}\}/gi, (value) => {
      const key = value.replace(/\W+/gi, '')
      return key in data ? String(data[key]) : '<missing>'
    })

    // @ts-expect-error unknown parameter
    MarkdownRenderer.renderMarkdown(markdown, element, this.fragment.path, null)
  }

  async #getFileContent(): Promise<string> {
    const file = this.vault.getAbstractFileByPath(this.fragment.path)
    if (file instanceof TFile) return await this.vault.read(file)
    throw new CodeblockError('missing-fragment-file')
  }
}

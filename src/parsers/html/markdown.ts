import { MarkdownRenderer, TFile } from 'obsidian'
import { CodeblockError } from '../CodeblockError'
import { Render } from './Render'

function isRecord(obj: unknown): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null
}

export class MarkdownRender extends Render {
  async render(element: HTMLElement, data: unknown): Promise<void> {
    const content = await this.#getFileContent()

    // TODO: support other cases
    if (!isRecord(data)) return

    const markdown = content.replace(/{{\ *(\w+)\ *}}/gi, (value) => {
      const key = value.replace(/\W+/gi, '')
      return key in data ? String(data[key]) : '<missing>'
    })

    MarkdownRenderer.renderMarkdown(markdown, element, this.fragment.path, null)
  }

  async #getFileContent(): Promise<string> {
    const file = this.vault.getAbstractFileByPath(this.fragment.path)
    if (file instanceof TFile) return await this.vault.read(file)
    throw new CodeblockError('fragment-file-missing')
  }
}

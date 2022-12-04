import type { Codeblock } from '@/types'
import { MarkdownRenderer, TFile } from 'obsidian'
import { Render } from './Render'

export class MarkdownRender extends Render {
  async render(
    element: HTMLElement,
    codeblock: Codeblock,
    file: TFile,
  ): Promise<void> {
    const content = await this.vault.read(file)
    const params = codeblock.parseContent()

    // TODO: support other cases
    if (typeof params !== 'object' || !params) return

    const markdown = content.replace(/{{\ *(\w+)\ *}}/gi, (value) => {
      const key = value.replace(/\W+/gi, '')
      return params[key] ?? '<missing>'
    })

    MarkdownRenderer.renderMarkdown(markdown, element, file.path, null)
  }
}

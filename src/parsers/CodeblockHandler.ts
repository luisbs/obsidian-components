import type { Codeblock, FragmentsPlugin } from '@/types'
import type { MarkdownPostProcessorContext } from 'obsidian'
import { getFormat, getFragmentByName, isFragmentEnabled } from '@/utility'
import { createHmac } from 'crypto'
import { parseYaml } from 'obsidian'
import { CodeblockError } from './CodeblockError'
import { Render } from './html/Render'
import { MarkdownRender } from './html/markdown'

export class CodeblockHandler {
  #plugin: FragmentsPlugin

  constructor(plugin: FragmentsPlugin) {
    this.#plugin = plugin
    plugin.registerMarkdownCodeBlockProcessor('use', this.handle.bind(this), -1)
  }

  async handle(
    source: string,
    element: HTMLElement,
    context: MarkdownPostProcessorContext,
  ): Promise<void> {
    const codeblock = this.#parseCodeblock(source, element, context)
    if (!codeblock) {
      element.createEl('pre').append('Error on fragment execution')
      // element.createEl('pre').append(source)
      return
    }

    try {
      console.log(codeblock)

      const renderer = this.#getCodeblockRenderer(codeblock, this.#plugin)
      const data = this.#getCodeblockData(codeblock)
      return renderer.render(element, data)

      //
    } catch (error) {
      const pre = element.createEl('pre')
      pre.append(codeblock.content)

      pre.classList.add(`language-${codeblock.syntax}`)
      if (error instanceof CodeblockError) {
        pre.classList.add(error.code)
      }
    }
  }

  #parseCodeblock(
    source: string,
    element: HTMLElement,
    context: MarkdownPostProcessorContext,
    codeblockPrefix = '```use',
  ): Codeblock | null {
    const info = context.getSectionInfo(element)
    if (!info) return null

    const header = info.text.split('\n').at(info.lineStart) ?? ''
    const isJson = source.trimStart().startsWith('{')

    return {
      name: header.replace(codeblockPrefix, '').trim(),
      hash: createHmac('sha256', '').update(source).digest('base64'),
      content: source,
      syntax: isJson ? 'json' : 'yaml',
    }
  }

  #getCodeblockRenderer(codeblock: Codeblock, plugin: FragmentsPlugin): Render {
    const fragment = getFragmentByName(codeblock.name, plugin.settings)
    if (!fragment) throw new CodeblockError('fragment-missing')

    if (!isFragmentEnabled(fragment, plugin.settings)) {
      throw new CodeblockError('fragment-disabled')
    }

    const format = getFormat(fragment.format, plugin.settings)
    if (!format) throw new CodeblockError('fragment-format-unknown')

    switch (format.id) {
      case 'html':
      case 'markdown':
        return new MarkdownRender(plugin.app.vault, codeblock, fragment)
      // case 'javascript_html':
      // case 'javascript_markdown':
      // case 'javascript_code':
    }

    throw new CodeblockError('fragment-render-missing')
  }

  #getCodeblockData(codeblock: Codeblock): unknown {
    try {
      if (codeblock.syntax === 'yaml') return parseYaml(codeblock.content)
      return JSON.parse(codeblock.content)
    } catch (error) {
      throw new CodeblockError('codeblock-parse-error', error)
    }
  }
}

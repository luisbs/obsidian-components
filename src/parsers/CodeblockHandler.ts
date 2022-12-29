import type { Codeblock, FragmentsPlugin } from '@/types'
import type { MarkdownPostProcessorContext } from 'obsidian'
import {
  getFormat,
  getFragmentByName,
  isFragmentEnabled,
  isRecord,
} from '@/utility'
import { createHmac } from 'crypto'
import { parseYaml } from 'obsidian'
import { CodeblockError } from './CodeblockError'
import {
  JavascriptCodeRender,
  JavascriptMdRender,
  MarkdownRender,
  Render,
} from './renders'

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
    try {
      const codeblock = this.#parseCodeblock(source, element, context)
      const renderer = this.#getCodeblockRenderer(codeblock)
      return renderer.render(element, codeblock.data)
      //
    } catch (error) {
      const isError = error instanceof CodeblockError
      if (isError && error.source) {
        return element.createEl('pre').append(String(error.source))
      }

      const pre = element.createEl('pre')
      pre.append(source)
      if (isError) {
        pre.classList.add(error.code)
      }
    }
  }

  #parseCodeblock(
    source: string,
    element: HTMLElement,
    context: MarkdownPostProcessorContext,
    codeblockPrefix = '```use',
  ): Codeblock {
    const isJson = source.trimStart().startsWith('{')
    let data = {}

    // parse the data
    try {
      data = !isJson ? parseYaml(source) : JSON.parse(source)
    } catch (error) {
      throw new CodeblockError('codeblock-invalid-data', error)
    }

    // define name
    let name = ''

    // first search for the name on the data
    if (this.#plugin.settings.naming_method !== 'INLINE' && isRecord(data)) {
      name = typeof data['__name'] === 'string' ? data['__name'] : ''
    }

    // if the name is missing try to get it from inline
    if (!name && this.#plugin.settings.naming_method !== 'PARAM') {
      const info = context.getSectionInfo(element)
      if (!info) throw new CodeblockError('codeblock-missing-name')

      const header = info.text.split('\n').at(info.lineStart) ?? ''
      name = header.replace(codeblockPrefix, '').trim()
    }

    if (!name) throw new CodeblockError('codeblock-missing-name')

    return {
      name,
      hash: createHmac('sha256', '').update(source).digest('base64'),
      syntax: isJson ? 'json' : 'yaml',
      source,
      data,
    }
  }

  #getCodeblockRenderer(codeblock: Codeblock): Render {
    const fragment = getFragmentByName(codeblock.name, this.#plugin.settings)
    if (!fragment) throw new CodeblockError('fragment-missing')

    if (!isFragmentEnabled(fragment, this.#plugin.settings)) {
      throw new CodeblockError('fragment-disabled')
    }

    const format = getFormat(fragment.format, this.#plugin.settings)
    if (!format) throw new CodeblockError('fragment-format-unknown')

    switch (format.id) {
      case 'html':
      case 'markdown':
        return new MarkdownRender(this.#plugin, fragment)

      case 'javascript_html':
      case 'javascript_markdown':
        return new JavascriptMdRender(this.#plugin, fragment)
      case 'javascript_code':
        return new JavascriptCodeRender(this.#plugin, fragment)
    }

    throw new CodeblockError('fragment-render-missing')
  }
}

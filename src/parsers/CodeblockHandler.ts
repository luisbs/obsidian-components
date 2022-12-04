import type {
  Codeblock,
  FragmentFormat,
  FragmentsPlugin,
  PluginSettings,
} from '@/types'
import { getFormat, getFragmentByName, isFragmentEnabled } from '@/utility'
import { createHmac } from 'crypto'
import { MarkdownPostProcessorContext, parseYaml, TFile } from 'obsidian'
import { MarkdownRender } from './html/markdown'
import { Render } from './html/Render'

export class CodeblockHandler {
  #plugin: FragmentsPlugin
  #settings: PluginSettings

  constructor(plugin: FragmentsPlugin) {
    this.#plugin = plugin
    this.#settings = plugin.settings

    plugin.registerMarkdownCodeBlockProcessor('use', this.handle.bind(this), -1)
  }

  async handle(
    source: string,
    element: HTMLElement,
    context: MarkdownPostProcessorContext,
  ) {
    const codeblock = this.#parseCodeblock(source, element, context)
    if (!codeblock) {
      return element.createEl('pre').append(source)
    }

    // check if the fragment exists
    const fragment = getFragmentByName(codeblock.name, this.#settings)
    if (!fragment) {
      return this.#dispatchError(element, codeblock, 'fragment-unknown')
    }

    // check if the fragment is enabled
    if (!isFragmentEnabled(fragment, this.#settings)) {
      return this.#dispatchError(element, codeblock, 'fragment-disabled')
    }

    // get the format from the fragment
    const format = getFormat(fragment.format, this.#settings)
    if (!format) {
      return this.#dispatchError(element, codeblock, 'fragment-format-unknown')
    }

    // get the renderer based on the format
    const renderer = this.#getRender(format)
    if (!renderer) {
      return this.#dispatchError(element, codeblock, 'fragment-render-missing')
    }

    // get the abstract file for the fragment
    const file = this.#plugin.app.vault.getAbstractFileByPath(fragment.path)
    if (!(file instanceof TFile)) {
      return this.#dispatchError(element, codeblock, 'fragment-file-missing')
    }

    return renderer.render(element, codeblock, file)
  }

  #getRender(format: FragmentFormat): Render | null {
    switch (format.id) {
      // case 'html':
      case 'markdown':
        return new MarkdownRender(this.#plugin.app.vault)
      // case 'javascript_html':
      // case 'javascript_markdown':
      // case 'javascript_code':
    }

    return null
  }

  #dispatchError(
    element: HTMLElement,
    codeblock: Codeblock,
    className: string,
  ): void {
    const pre = element.createEl('pre')
    pre.append(codeblock.content)
    pre.classList.add(`language-${codeblock.syntax}`)
    pre.classList.add(className)
  }

  #parseCodeblock(
    source: string,
    element: HTMLElement,
    context: MarkdownPostProcessorContext,
  ): Codeblock | null {
    const info = context.getSectionInfo(element)
    if (!info) return null

    const header = info.text.split('\n').at(info.lineStart) ?? ''
    const name = header.replace('```use', '').trim()

    const isJson = source.trimStart().startsWith('{')

    return {
      name,
      hash: createHmac('sha256', '').update(source).digest('base64'),
      content: source,
      syntax: isJson ? 'json' : 'yaml',
      parseContent: isJson //
        ? () => JSON.parse(source)
        : () => parseYaml(source),
    }
  }
}

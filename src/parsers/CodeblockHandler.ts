import type {
  CodeblockContent,
  FragmentFound,
  FragmentsPlugin,
  PluginSettings,
} from '@/types'
import type { MarkdownPostProcessorContext } from 'obsidian'
import {
  getFormat,
  getFragmentById,
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
  #settings: PluginSettings

  constructor(plugin: FragmentsPlugin) {
    this.#plugin = plugin
    this.#settings = plugin.settings
    this.registerProcessors()
  }

  registerProcessors(): void {
    // register base codeblock processor
    this.#plugin.registerMarkdownCodeBlockProcessor(
      'use',
      (source, el, ctx) => {
        this.#printErrors(source, el, () => {
          const content = this.#parseCodeblock(source)
          const fragment = this.#getFragment(content, el, ctx)
          const renderer = this.#getFragmentRenderer(fragment)
          renderer.render(el, content.data)
        })
      },
      -1,
    )

    // register custom codeblock processors
    for (const [fragmentId, names] of Object.entries(
      this.#settings.current_codeblocks,
    )) {
      for (const name of names) {
        this.#plugin.registerMarkdownCodeBlockProcessor(
          name,
          (source, el, ctx) => {
            return this.#printErrors(source, el, () => {
              const content = this.#parseCodeblock(source)
              const fragment = getFragmentById(fragmentId, this.#settings)
              const renderer = this.#getFragmentRenderer(fragment)
              renderer.render(el, content.data)
            })
          },
          -2,
        )
      }
    }
  }

  #printErrors(
    source: string,
    element: HTMLElement,
    callback: () => void,
  ): void {
    try {
      callback()
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

  #parseCodeblock(source: string): CodeblockContent {
    source = source.trim()

    const isJson = source.startsWith('{')
    let data = {}

    try {
      data = isJson ? JSON.parse(source) : parseYaml(source)
    } catch (error) {
      throw new CodeblockError('invalid-codeblock-syntax', error)
    }

    return {
      hash: createHmac('sha256', '').update(source).digest('base64'),
      syntax: isJson ? 'json' : 'yaml',
      source,
      data,
    }
  }

  #getFragment(
    content: CodeblockContent,
    element: HTMLElement,
    context: MarkdownPostProcessorContext,
    codeblockPrefix = '```use',
  ): FragmentFound | null {
    const { data } = content
    let name = ''

    // first search for the name on the data
    if (this.#settings.naming_method !== 'INLINE' && isRecord(data)) {
      name = typeof data['__name'] === 'string' ? data['__name'] : ''
    }

    // if the name is missing try to get it from inline
    if (!name && this.#settings.naming_method !== 'PARAM') {
      const info = context.getSectionInfo(element)
      if (!info) throw new CodeblockError('missing-fragment-name')

      const header = info.text.split('\n').at(info.lineStart) ?? ''
      name = header.replace(codeblockPrefix, '').trim()
    }

    if (!name) throw new CodeblockError('missing-fragment-name')

    return getFragmentByName(name, this.#settings)
  }

  #getFragmentRenderer(fragment: FragmentFound | null): Render {
    if (!fragment) {
      throw new CodeblockError('unknown-fragment')
    }

    if (!isFragmentEnabled(fragment, this.#settings)) {
      throw new CodeblockError('disabled-fragment')
    }

    const format = getFormat(fragment.format, this.#settings)
    if (!format) throw new CodeblockError('missing-fragment-renderer')

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

    throw new CodeblockError('missing-fragment-renderer')
  }
}

import type { MarkdownPostProcessorContext } from 'obsidian'
import type {
  CodeblockContent,
  ComponentFound,
  ComponentsPlugin,
  PluginSettings,
} from '@/types'
import { createHmac } from 'crypto'
import { parseYaml } from 'obsidian'
import { getComponentById, getComponentByName, isRecord } from '@/utility'
import { CodeblockError } from './CodeblockError'
import { getRenderer } from './renders'

export class CodeblockHandler {
  #plugin: ComponentsPlugin
  #settings: PluginSettings

  constructor(plugin: ComponentsPlugin) {
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
          const component = this.#getComponent(content, el, ctx)
          const renderer = getRenderer(this.#plugin, component)
          renderer.render(el, content.data)
        })
      },
      -1,
    )

    // register custom codeblock processors
    for (const [componentId, names] of Object.entries(
      this.#settings.current_codeblocks,
    )) {
      for (const name of names) {
        this.#plugin.registerMarkdownCodeBlockProcessor(
          name,
          (source, el, ctx) => {
            return this.#printErrors(source, el, () => {
              const content = this.#parseCodeblock(source)
              const component = getComponentById(componentId, this.#settings)
              const renderer = getRenderer(this.#plugin, component)
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

  #getComponent(
    content: CodeblockContent,
    element: HTMLElement,
    context: MarkdownPostProcessorContext,
    codeblockPrefix = '```use',
  ): ComponentFound | null {
    const { data } = content
    let name = ''

    // first search for the name on the data
    if (this.#settings.naming_method !== 'INLINE' && isRecord(data)) {
      name = typeof data['__name'] === 'string' ? data['__name'] : ''
    }

    // if the name is missing try to get it from inline
    if (!name && this.#settings.naming_method !== 'PARAM') {
      const info = context.getSectionInfo(element)
      if (!info) throw new CodeblockError('missing-component-name')

      const header = info.text.split('\n').at(info.lineStart) ?? ''
      name = header.replace(codeblockPrefix, '').trim()
    }

    if (!name) throw new CodeblockError('missing-component-name')

    return getComponentByName(name, this.#settings)
  }
}

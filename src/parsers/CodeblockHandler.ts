import type { MarkdownPostProcessorContext } from 'obsidian'
import type {
  CodeblockContent,
  ComponentFound,
  ComponentsPlugin,
} from '@/types'
import { createHmac } from 'crypto'
import { parseYaml } from 'obsidian'
import { getComponentById, isRecord } from '@/utility'
import { CodeblockError } from './CodeblockError'
import { getRenderer } from './renders'

export class CodeblockHandler {
  #plugin: ComponentsPlugin

  constructor(plugin: ComponentsPlugin) {
    this.#plugin = plugin
    this.registerBaseCodeblock()
    this.registerCustomCodeblocks()
  }

  registerBaseCodeblock(): void {
    this.#plugin.registerMarkdownCodeBlockProcessor(
      'use',
      (source, el, ctx) => {
        console.log('obsidian-components: procesing base codeblock')

        this.#catchErrors(source, el, async () => {
          const content = this.#parseCodeblock(source)
          const { name, component } = this.#getComponent(content, el, ctx)
          const renderer = getRenderer(this.#plugin, component)

          el.classList.add('component', `${name}-component`)

          console.log('obsidian-components: rendering base codeblock')
          await renderer.render(el, content.data)
        })
      },
      -1,
    )
  }

  registerCustomCodeblocks(): void {
    const { settings, state } = this.#plugin

    for (const [componentId, names] of Object.entries(state.codeblocks)) {
      for (const name of names) {
        this.#plugin.registerMarkdownCodeBlockProcessor(
          name,
          (source, el, ctx) => {
            console.log(`obsidian-components: procesing '${name}' codeblock`)

            return this.#catchErrors(source, el, async () => {
              const content = this.#parseCodeblock(source)
              const component = getComponentById(componentId, settings)
              const renderer = getRenderer(this.#plugin, component)

              el.classList.add('component', `${name}-component`)

              console.log(`obsidian-components: rendering '${name}' codeblock`)
              await renderer.render(el, content.data)
            })
          },
          -1,
        )
      }
    }
  }

  async #catchErrors(
    source: string,
    element: HTMLElement,
    callback: () => Promise<void>,
  ): Promise<void> {
    try {
      await callback()
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
  ): { name: string; component: ComponentFound | null } {
    const { settings, state } = this.#plugin

    const { data } = content
    let name = ''

    // first search for the name on the data
    if (settings.naming_method !== 'INLINE' && isRecord(data)) {
      for (const paramName of state.params) {
        if (typeof data[paramName] === 'string') {
          name = data[paramName] as string
          break
        }
      }
    }

    // if the name is missing try to get it from inline
    if (!name && settings.naming_method !== 'PARAM') {
      const info = context.getSectionInfo(element)
      if (!info) throw new CodeblockError('missing-component-name')

      const header = info.text.split('\n').at(info.lineStart) ?? ''
      name = header.replace(codeblockPrefix, '').trim()
    }

    if (!name) throw new CodeblockError('missing-component-name')

    // search the component
    for (const componentId in state.components) {
      if (state.components[componentId].contains(name)) {
        return {
          name,
          component: settings.components_found[componentId] || null,
        }
      }
    }

    return { name, component: null }
  }
}

import type { MarkdownPostProcessorContext } from 'obsidian'
import type {
  CodeblockContent,
  ComponentFound,
  ComponentsPlugin,
} from '@/types'
import { createHmac } from 'crypto'
import { parseYaml } from 'obsidian'
import { getComponentById, isRecord, MapStore } from '@/utility'
import { ComponentError } from './ComponentError'
import { Renderer, getRenderer } from './Renderers'

export class CodeblockHandler {
  #plugin: ComponentsPlugin

  #registered: string[] = []
  #rendered: MapStore<Renderer> = new MapStore()

  constructor(plugin: ComponentsPlugin) {
    this.#plugin = plugin
  }

  public registerCodeblocks() {
    this.registerBaseCodeblock()
    this.registerCustomCodeblocks()
  }

  public clear(): void {
    this.#rendered.clear()
    // todo check a way to un-register the processors
  }

  /**
   * Force all instances of all components to re-render.
   */
  public refreshAll(): void {
    for (const key of this.#rendered.keys()) {
      this.refresh(key)
    }
  }

  /**
   * Force all the instances of a component to re-render.
   */
  public refresh(filePath: string): void {
    for (const renderer of this.#rendered.get(filePath) || []) {
      renderer.render()
    }
  }

  /**
   * Register the handler for default codeblocks.
   */
  public registerBaseCodeblock(): void {
    this.#plugin.registerMarkdownCodeBlockProcessor(
      'use',
      (source, el, ctx) => {
        console.log('Procesing base codeblock')

        this.#catchErrors(el, () => {
          const content = this.#parseCodeblock(source)
          const { name, component } = this.#getComponent(content, el, ctx)
          if (!component) throw new ComponentError('unknown-component')
          el.classList.add('component', `${name}-component`)

          // prettier-ignore
          const renderer = getRenderer(el, this.#plugin, component, ctx.sourcePath, content.data)
          this.#rendered.push(component.path, renderer)
          renderer.render()
        })
      },
    )
  }

  /**
   * Register the handler for user-defined codeblocks.
   */
  public registerCustomCodeblocks(): void {
    const { settings, state } = this.#plugin

    for (const [componentId, names] of state.codeblocks.entries()) {
      for (const name of names) {
        // avoid re-registering a processor
        if (this.#registered.includes(name)) continue
        this.#registered.push(name)

        this.#plugin.registerMarkdownCodeBlockProcessor(
          name,
          (source, el, ctx) => {
            console.log(`Procesing '${name}' codeblock`)

            return this.#catchErrors(el, () => {
              const content = this.#parseCodeblock(source)
              const component = getComponentById(componentId, settings)
              if (!component) throw new ComponentError('unknown-component')
              el.classList.add('component', `${name}-component`)

              // prettier-ignore
              const renderer = getRenderer(el, this.#plugin, component, ctx.sourcePath, content.data)
              this.#rendered.push(component.path, renderer)
              renderer.render()
            })
          },
        )
      }
    }
  }

  async #catchErrors(
    element: HTMLElement,
    callback: () => void,
  ): Promise<void> {
    try {
      callback()
    } catch (error) {
      const pre = element.createEl('pre')
      if (error instanceof ComponentError) pre.classList.add(error.code)
      pre.append(String(error))
    }
  }

  #parseCodeblock(source: string): CodeblockContent {
    source = source.trim()
    const isJson = source.startsWith('{')
    const separator = new RegExp(this.#plugin.settings.usage_separator, 'ig')

    let data = null
    try {
      if (!this.#plugin.settings.enable_separators || !separator.test(source)) {
        data = isJson ? JSON.parse(source) : parseYaml(source)
      } else {
        data = source
          .split(separator)
          .map((source) => (isJson ? JSON.parse(source) : parseYaml(source)))
      }

      return {
        hash: createHmac('sha256', '').update(source).digest('base64'),
        syntax: isJson ? 'json' : 'yaml',
        source,
        data: data || '',
      }
    } catch (ignored) {
      return {
        hash: createHmac('sha256', '').update(source).digest('base64'),
        syntax: 'none',
        source,
        data: source,
      }
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
    if (settings.usage_method !== 'INLINE' && isRecord(data)) {
      for (const paramName of state.params) {
        if (typeof data[paramName] === 'string') {
          name = data[paramName] as string
          break
        }
      }
    }

    // if the name is missing try to get it from inline
    if (!name && settings.usage_method !== 'PARAM') {
      const info = context.getSectionInfo(element)
      if (!info) throw new ComponentError('missing-component-name')

      const header = info.text.split('\n').at(info.lineStart) ?? ''
      name = header.replace(codeblockPrefix, '').trim()
    }

    if (!name) throw new ComponentError('missing-component-name')

    // search the component
    for (const componentId in state.components) {
      if (state.components.hasKeyValue(componentId, name)) {
        return {
          name,
          component: settings.components_found[componentId] || null,
        }
      }
    }

    return { name, component: null }
  }
}

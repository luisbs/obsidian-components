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
import { Renderer, getRenderer } from './renders'

export class CodeblockHandler {
  #plugin: ComponentsPlugin

  #registered: string[] = []
  #rendered: Map<string, Renderer[]> = new Map()

  constructor(plugin: ComponentsPlugin) {
    this.#plugin = plugin
  }

  public registerCodeblocks() {
    this.registerBaseCodeblock()
    this.registerCustomCodeblocks()
  }

  public clear(): void {
    this.#rendered = new Map()
    // todo check a way to un-register the processors
  }

  protected storeRenderer(filePath: string, renderer: Renderer): void {
    const rendered = this.#rendered.get(filePath) || []
    rendered.push(renderer)
    this.#rendered.set(filePath, rendered.unique())
  }

  public refresh(filePath: string): void {
    console.log(`Refreshing '${filePath}' components`)
    for (const renderer of this.#rendered.get(filePath) || []) {
      renderer.render()
    }
  }

  public registerBaseCodeblock(): void {
    this.#plugin.registerMarkdownCodeBlockProcessor(
      'use',
      (source, el, ctx) => {
        console.log('Procesing base codeblock')

        this.#catchErrors(source, el, () => {
          const content = this.#parseCodeblock(source)
          const { name, component } = this.#getComponent(content, el, ctx)
          if (!component) throw new CodeblockError('unknown-component')
          el.classList.add('component', `${name}-component`)

          // prettier-ignore
          const renderer = getRenderer(el, this.#plugin, component, content.data)
          this.storeRenderer(component.path, renderer)
          renderer.render()
        })
      },
      -1,
    )
  }

  public registerCustomCodeblocks(): void {
    const { settings, state } = this.#plugin

    for (const [componentId, names] of Object.entries(state.codeblocks)) {
      for (const name of names) {
        // avoid re-registering a processor
        if (this.#registered.includes(name)) continue
        this.#registered.push(name)

        this.#plugin.registerMarkdownCodeBlockProcessor(
          name,
          (source, el, ctx) => {
            console.log(`Procesing '${name}' codeblock`)

            return this.#catchErrors(source, el, () => {
              const content = this.#parseCodeblock(source)
              const component = getComponentById(componentId, settings)
              if (!component) throw new CodeblockError('unknown-component')
              el.classList.add('component', `${name}-component`)

              // prettier-ignore
              const renderer = getRenderer(el, this.#plugin, component, content.data)
              this.storeRenderer(component.path, renderer)
              renderer.render()
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
    callback: () => void,
  ): Promise<void> {
    try {
      callback()
    } catch (error) {
      const pre = element.createEl('pre')

      const isError = error instanceof CodeblockError
      if (isError) pre.classList.add(error.code)
      if (isError && error.source) {
        pre.append(String(error.source))
      } else {
        pre.append(source)
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

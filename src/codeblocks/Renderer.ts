import type {
  ComponentFormat,
  ComponentFound,
  ComponentsPlugin,
  PluginSettings,
} from '@/types'
import { MarkdownRenderer, TFile, Vault } from 'obsidian'
import { LoggingGroup, isRecord } from '@/utility'
import { ComponentError } from './ComponentError'

export abstract class Renderer {
  protected settings: PluginSettings
  protected vault: Vault

  #id = Math.floor(Math.random() * 1e6)
  #log = LoggingGroup.make()
  static trackedByRenderer: string[] = []

  constructor(
    protected element: HTMLElement,
    protected plugin: ComponentsPlugin,
    protected format: ComponentFormat,
    protected component: ComponentFound,
    protected data: unknown,
  ) {
    this.vault = plugin.app.vault
    this.settings = plugin.settings
  }

  protected abstract runRenderer(): Promise<void>

  /**
   * Execute the renderer with the passed params during construction.
   */
  public async render(): Promise<void> {
    // clear the element
    this.element.replaceChildren()

    // catch problems during execution
    this.#log = LoggingGroup.make(`Rendering ${this.component.path}`)
    try {
      await this.runRenderer()
    } catch (error) {
      const pre = this.element.createEl('pre')
      if (error instanceof ComponentError) pre.classList.add(error.code)
      if (error instanceof Error) pre.append(error.stack || error.message)
      else pre.append(String(error))
      this.#log.error(error)
    }
    this.#log.flush(`[${this.#id}] Rendered '${this.component.path}'`)
  }

  protected replaceData(
    source: string,
    data: unknown,
    fallback = '[missing]',
  ): string {
    this.#log.debug('replaceData')

    try {
      if (isRecord(data) || Array.isArray(data)) {
        return source.replace(/\{\{ *(\w+) *\}\}/gi, (_, key) => {
          //@ts-expect-error runtime dynamic replacement
          return data[key] ? String(data[key]) : fallback
        })
      }

      return source.replace(
        /\{\{ *(\w+) *\}\}/gi,
        data ? String(data) : fallback,
      )
    } catch (error) {
      throw new ComponentError('invalid-component-params', error)
    }
  }

  protected renderHTMLContent(element: HTMLElement, content: string): void {
    this.#log.debug('renderHTMLContent')
    element.innerHTML = content
  }

  protected renderMarkdownContent(element: HTMLElement, content: string): void {
    this.#log.debug('renderMarkdownContent')
    // TODO: change the path, to avoid bad link generation of relative links
    MarkdownRenderer.render(
      this.plugin.app,
      content,
      element,
      this.component.path,
      this.plugin,
    )
  }

  protected async getFileContent(): Promise<string> {
    this.#log.debug('getFileContent')
    const file = this.vault.getAbstractFileByPath(this.component.path)
    if (file instanceof TFile) return await this.vault.read(file)
    throw new ComponentError('missing-component-file')
  }

  protected async requireRenderFn(): Promise<unknown> {
    this.#log.debug('requireRenderFn')
    const module = await this.requireFileModule()
    if (typeof module === 'function') return module
    if (!isRecord(module) || typeof module.render !== 'function') {
      throw new ComponentError('missing-component-render-function')
    }
    return module.render
  }

  protected async requireFileModule(): Promise<unknown> {
    this.#log.debug('requireFileModule')
    try {
      const baseFile = this.vault.getAbstractFileByPath(this.component.path)
      if (!(baseFile instanceof TFile)) {
        throw new ComponentError('missing-component-file')
      }

      if (!Renderer.trackedByRenderer.includes(baseFile.path)) {
        // opening a note with multiple references to a single component
        // will execute this method each time, soooo...
        // it should be tracked only once, at the end of trackFile
        // a refresh is executed on the renderer of all instances
        Renderer.trackedByRenderer.push(baseFile.path)
        await this.plugin.versions.trackFile(baseFile)
      }

      const versionName = this.plugin.versions.resolveFile(baseFile)
      const modulePath = versionName
        ? this.plugin.fs.getCachePath(versionName)
        : this.component.path

      if (this.format.tags.contains('commonjs')) {
        return await this.requireModule(modulePath)
      } else if (this.format.tags.contains('esmodules')) {
        return await this.importModule(modulePath)
      }

      throw new Error('unsupported javascript module format')
    } catch (error) {
      this.#log.error(error)
      throw new ComponentError('invalid-component-syntax', error)
    }
  }

  protected async requireModule(modulePath: string): Promise<unknown> {
    const resolved = this.plugin.fs.getRealPath(modulePath)
    this.#log.info(`require('${resolved}')`)
    return await require(resolved)
  }

  protected async importModule(modulePath: string): Promise<unknown> {
    const file = this.vault.getFileByPath(modulePath)
    if (!file) throw new ComponentError('missing-component-file', modulePath)

    const resolved = this.vault.getResourcePath(file)
    this.#log.info(`import('${resolved}')`)
    return await import(resolved)
  }
}

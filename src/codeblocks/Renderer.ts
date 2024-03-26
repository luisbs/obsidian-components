import type { ComponentFound, ComponentsPlugin, PluginSettings } from '@/types'
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

      const isError = error instanceof ComponentError
      if (isError) pre.classList.add(error.code)
      pre.append(String(error))
    }
    this.#log.flush(`[${this.#id}] Rendered '${this.component.path}'`)
  }

  protected replaceData(
    source: string,
    data: unknown,
    fallback = '[missing]',
  ): string {
    this.#log.debug('replaceData')
    if (!isRecord(data)) throw new ComponentError('invalid-component-params')
    return source.replace(/\{\{ *(\w+) *\}\}/gi, (match, key) => {
      return key in data ? String(data[key]) : fallback
    })
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
      const versionPath = versionName
        ? this.plugin.fs.getCachePath(versionName)
        : undefined
      const modulePath = this.getModulePath(versionPath)

      this.#log.info(`Executing <${versionName || this.component.path}>`)
      return require(modulePath)
    } catch (error) {
      this.#log.error(error)
      throw new ComponentError('invalid-component-syntax', error)
    }
  }

  /**
   * @returns the real path of the file on the os.
   */
  protected getModulePath(filePath?: string | null): string {
    this.#log.debug('getModulePath')
    filePath = filePath || this.component.path
    return this.plugin.fs.getRealPath(filePath)
  }
}

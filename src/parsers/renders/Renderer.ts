import type { ComponentFound, ComponentsPlugin, PluginSettings } from '@/types'
import { isRecord } from '@/utility'
import { MarkdownRenderer, TFile, Vault } from 'obsidian'
import { ComponentError } from '../ComponentError'

export abstract class Renderer {
  protected settings: PluginSettings
  protected vault: Vault

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
    try {
      await this.runRenderer()
      console.debug(`Rendered '${this.component.path}'`)
    } catch (error) {
      const pre = this.element.createEl('pre')

      const isError = error instanceof ComponentError
      if (isError) pre.classList.add(error.code)
      pre.append(String(error))
    }
  }

  protected replaceData(
    source: string,
    data: unknown,
    fallback = '[missing]',
  ): string {
    if (!isRecord(data)) throw new ComponentError('invalid-component-params')
    return source.replace(/\{\{ *(\w+) *\}\}/gi, (match, key) => {
      return key in data ? String(data[key]) : fallback
    })
  }

  protected renderHTMLContent(element: HTMLElement, content: string): void {
    element.innerHTML = content
  }

  protected renderMarkdownContent(element: HTMLElement, content: string): void {
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
    const file = this.vault.getAbstractFileByPath(this.component.path)
    if (file instanceof TFile) return await this.vault.read(file)
    throw new ComponentError('missing-component-file')
  }

  protected async requireRenderFn(): Promise<unknown> {
    const module = await this.requireFileModule()
    if (typeof module === 'function') return module
    if (!isRecord(module) || typeof module.render !== 'function') {
      throw new ComponentError('missing-component-render-function')
    }
    return module.render
  }

  protected async requireFileModule(): Promise<unknown> {
    try {
      const baseFile = this.vault.getAbstractFileByPath(this.component.path)
      // prettier-ignore
      const versionPath = await this.plugin.versions.getLastCachedVersion(baseFile as TFile)
      const modulePath = this.getModulePath(versionPath)

      console.log(`Executing 'require("${modulePath}")'`)
      return require(modulePath)
    } catch (error) {
      console.error(error)
      throw new ComponentError('invalid-component-syntax', error)
    }
  }

  /**
   * @returns the real path of the file on the os.
   */
  protected getModulePath(filePath?: string | null): string {
    filePath = filePath ?? this.component.path
    return this.plugin.fs.getRealPath(filePath)
  }
}

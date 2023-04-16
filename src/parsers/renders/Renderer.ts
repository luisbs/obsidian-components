import type { ComponentFound, ComponentsPlugin, PluginSettings } from '@/types'
import { isRecord } from '@/utility'
import { MarkdownRenderer, TFile, Vault } from 'obsidian'
import { CodeblockError } from '../CodeblockError'

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

      const isError = error instanceof CodeblockError
      if (isError) pre.classList.add(error.code)

      if (isError && error.source) {
        pre.append(String(error.source))
      } else {
        pre.append(String(error))
      }
    }
  }

  protected replaceData(
    source: string,
    data: unknown,
    fallback = '[missing]',
  ): string {
    if (!isRecord(data)) throw new CodeblockError('invalid-component-params')
    return source.replace(/\{\{ *(\w+) *\}\}/gi, (match, key) => {
      return key in data ? String(data[key]) : fallback
    })
  }

  protected renderHTMLContent(element: HTMLElement, content: string): void {
    element.innerHTML = content
  }

  protected renderMarkdownContent(element: HTMLElement, content: string): void {
    // @ts-expect-error unknown parameter
    // TODO change the the path, to avoid bad link generation of relative links
    MarkdownRenderer.renderMarkdown(content, element, this.component.path, null)
  }

  protected async getFileContent(): Promise<string> {
    const file = this.vault.getAbstractFileByPath(this.component.path)
    if (file instanceof TFile) return await this.vault.read(file)
    throw new CodeblockError('missing-component-file')
  }

  protected async requireRenderFn(): Promise<unknown> {
    const module = await this.requireFileModule()
    if (typeof module === 'function') return module
    if (!isRecord(module) || typeof module.render !== 'function') {
      throw new CodeblockError('missing-component-render-function')
    }
    return module.render
  }

  protected async requireFileModule(): Promise<unknown> {
    try {
      const baseFile = this.vault.getAbstractFileByPath(this.component.path)
      // prettier-ignore
      const versionFile = await this.plugin.versions?.getLastCachedVersion(baseFile as TFile)
      const modulePath = this.getModulePath(versionFile || baseFile)

      console.log(`Executing 'require("${modulePath}")'`)
      return require(modulePath)
    } catch (error) {
      console.error(error)
      throw new CodeblockError('invalid-component-syntax', error)
    }
  }

  /**
   * @returns the real path of the file on the os.
   */
  protected getModulePath(filePath?: string | null): string {
    filePath = filePath ?? this.component.path

    //? simplier implementation
    //? not used cause `basePath` is not public/documentated
    //? so it may change as an internal implementation
    // return path.resolve(this.vault.adapter.basePath, filePath)

    //? `getResourcePath` adds a prefix and a postfix to identify file version
    //? it needs to be removed to be recognized as a real route
    return this.vault.adapter
      .getResourcePath(filePath)
      .replace('app://local', '')
      .replace(/\?\d+$/i, '')
  }
}

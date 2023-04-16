import type { ComponentFound, ComponentsPlugin, PluginSettings } from '@/types'
import { isRecord } from '@/utility'
import { MarkdownRenderer, TAbstractFile, TFile, Vault } from 'obsidian'
import { CodeblockError } from '../CodeblockError'

export abstract class Renderer {
  protected settings: PluginSettings
  protected vault: Vault

  constructor(
    protected plugin: ComponentsPlugin,
    protected component: ComponentFound,
  ) {
    this.vault = plugin.app.vault
    this.settings = plugin.settings
  }

  abstract render(element: HTMLElement, data: unknown): Promise<void>

  protected replaceData(
    source: string,
    data: unknown,
    fallback = '[missing]',
  ): string {
    if (!isRecord(data)) throw new CodeblockError('invalid-codeblock-syntax')
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
      throw new CodeblockError('invalid-component-syntax')
    }
    return module.render
  }

  protected async requireFileModule(): Promise<unknown> {
    try {
      const baseFile = this.vault.getAbstractFileByPath(this.component.path)
      // prettier-ignore
      const versionFile = await this.plugin.versions?.getLastCachedVersion(baseFile as TFile)
      const modulePath = this.getModulePath(versionFile || baseFile)

      console.log(`obsidian-components: executing 'require("${modulePath}")'`)
      return require(modulePath)
    } catch (error) {
      throw new CodeblockError('invalid-component-syntax', error)
    }
  }

  protected getModulePath(file: TAbstractFile | null): string {
    const filePath = file?.path ?? this.component.path

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

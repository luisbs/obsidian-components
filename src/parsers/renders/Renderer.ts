import type { ComponentFound, ComponentsPlugin, PluginSettings } from '@/types'
import { isRecord } from '@/utility'
import { MarkdownRenderer, TFile, Vault } from 'obsidian'
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
    fallback = '<missing>',
  ): string {
    if (!isRecord(data)) throw new CodeblockError('invalid-codeblock-syntax')
    return source.replace(/{{ *(\w+) *}}/gi, (name) => {
      return name in data ? String(data[name]) : fallback
    })
  }

  protected renderHTMLContent(element: HTMLElement, content: string): void {
    element.innerHTML = content
  }

  protected renderMDContent(element: HTMLElement, content: string): void {
    // @ts-expect-error unknown parameter
    // TODO change the the path, to avoid bad link generation of relative links
    MarkdownRenderer.renderMarkdown(content, element, this.component.path, null)
  }

  protected async getFileContent(): Promise<string> {
    const file = this.vault.getAbstractFileByPath(this.component.path)
    if (file instanceof TFile) return await this.vault.read(file)
    throw new CodeblockError('missing-component-file')
  }

  protected requireRenderFn(): unknown {
    const module = this.requireFileModule()
    if (typeof module === 'function') return module
    if (!isRecord(module) || typeof module.render !== 'function') {
      throw new CodeblockError('invalid-component-syntax')
    }
    return module.render
  }

  // TODO test in windows system
  protected requireFileModule(): unknown {
    try {
      // construct the real filepath on the user system
      const modulePath = this.vault.adapter
        .getResourcePath(this.component.path)
        .replace('app://local', '')
        .replace(/\?\d+$/i, '')

      // console.log({ modulePath, module: require(modulePath), basePath: this.vault.adapter.basePath })
      return require(modulePath)
    } catch (error) {
      throw new CodeblockError('invalid-component-syntax', error)
    }
  }
}

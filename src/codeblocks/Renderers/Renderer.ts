import type { ComponentFormat, ComponentFound, ComponentsPlugin } from '@/types'
import { MarkdownRenderer, TFile, Vault } from 'obsidian'
import { LoggingGroup } from '@/utility'
import { ComponentError } from '../ComponentError'

export abstract class Renderer {
  protected vault: Vault

  constructor(
    protected element: HTMLElement,
    protected plugin: ComponentsPlugin,
    protected format: ComponentFormat,
    protected component: ComponentFound,
    protected data: unknown,
  ) {
    this.vault = plugin.app.vault
  }

  protected id = Math.floor(Math.random() * 1e6)
  protected log = LoggingGroup.make()

  static #tracked: string[] = []
  public static clearTracked(): void {
    this.#tracked = []
  }

  /** Middlewares file tracking. */
  async #getComponentFile(): Promise<TFile> {
    this.log.debug('getComponentFile')

    const baseFile = this.vault.getFileByPath(this.component.path)
    if (!baseFile) throw new ComponentError('missing-component-file')

    if (!Renderer.#tracked.includes(this.component.path)) {
      // opening a note with multiple references to a single component
      // will execute this tracking each time, soooo...
      // it should be tracked only once, at the end of `trackFile()`
      // a refresh is executed on the renderer of all instances
      Renderer.#tracked.push(this.component.path)
      await this.plugin.versions.trackFile(baseFile)
    }

    // versioning-hotload
    const versionPath = this.plugin.versions.resolveFile(baseFile)
    const modulePath = versionPath
      ? this.plugin.fs.getCachePath(versionPath)
      : this.component.path

    const versionFile = this.vault.getFileByPath(modulePath)
    if (!versionFile) throw new ComponentError('missing-component-file')

    return versionFile
  }

  /** Each renderer should define the sequence. */
  protected abstract renderingSequence(componentFile: TFile): Promise<void>

  /** Execute the renderer with the passed params during construction. */
  public async render(): Promise<void> {
    // clear the element
    this.element.empty()

    // catch problems during execution
    this.log = LoggingGroup.make(`Rendering ${this.component.path}`)

    try {
      const componentFile = await this.#getComponentFile()
      await this.renderingSequence(componentFile)
      //
    } catch (error) {
      this.log.error(error)

      const pre = this.element.createEl('pre')
      if (error instanceof ComponentError) pre.classList.add(error.code)
      if (error instanceof Error) pre.append(error.stack || error.message)
      else pre.append(String(error))
    }

    this.log.flush(`[${this.id}] Rendered '${this.component.path}'`)
  }

  protected renderHTML(content: string): void {
    this.log.debug('renderHTMLContent')
    this.element.innerHTML = content
  }

  protected renderMarkdown(content: string): void {
    this.log.debug('renderMarkdownContent')
    // TODO: change the path, to avoid bad link generation of relative links
    MarkdownRenderer.render(
      this.plugin.app,
      content,
      this.element,
      this.component.path,
      this.plugin,
    )
  }
}

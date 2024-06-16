import type { ComponentFormat, ComponentFound, ComponentsPlugin } from '@/types'
import { MarkdownRenderer, TFile, Vault } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import { ComponentError } from '../ComponentError'

export abstract class Renderer {
  #log = new Logger('Renderer')
  protected logger = this.#log.group()
  protected id = String(Math.floor(Math.random() * 1e6)).padStart(6, '-')

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

  static #tracked: string[] = []
  public static clearTracked(): void {
    this.#tracked = []
  }

  /** Each renderer should define the sequence. */
  protected abstract renderingSequence(componentFile: TFile): Promise<void>

  /** Execute the renderer with the passed params during construction. */
  public async render(): Promise<void> {
    // clear the element
    this.element.empty()

    // catch problems during execution
    this.logger = this.#log.group('renderSequence')

    try {
      const componentFile = await this.#getComponentFile()
      this.logger.debug(`componentFile <${componentFile.path}>`)

      await this.renderingSequence(componentFile)
      //
    } catch (error) {
      this.logger.error(error)

      const pre = this.element.createEl('pre')
      if (error instanceof ComponentError) pre.classList.add(error.code)
      if (error instanceof Error) pre.append(error.stack || error.message)
      else pre.append(String(error))
    }

    this.logger.flush(`[${this.id}] Rendered '${this.component.path}'`)
  }

  protected renderHTML(content: string): void {
    this.logger.debug('renderHTMLContent')
    this.element.innerHTML = content
  }

  protected renderMarkdown(content: string): void {
    this.logger.debug('renderMarkdownContent')
    // TODO: change the path, to avoid bad link generation of relative links
    MarkdownRenderer.render(
      this.plugin.app,
      content,
      this.element,
      this.component.path,
      this.plugin,
    )
  }

  /** Middlewares file tracking. */
  async #getComponentFile(): Promise<TFile> {
    this.logger.debug('getComponentFile')

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
}

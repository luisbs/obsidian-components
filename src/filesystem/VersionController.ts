import type { ComponentsPlugin } from '@/types'
import { TAbstractFile, TFile } from 'obsidian'
import { Logger } from '@/utility/logging'
import MapStore from './MapStore'
import FilesystemAdapter from './FilesystemAdapter'

export class VersionController {
  protected plugin: ComponentsPlugin

  protected log = new Logger()
  // like { 'music.html.cjs': ['music.html-23f29a.cjs'] }
  protected versions = new MapStore<string>()
  // like { 'HtmlRenderer.cjs': ['music.html.cjs', 'content.html.cjs'] }
  protected dependencies = new MapStore<string>()

  constructor(plugin: ComponentsPlugin) {
    this.plugin = plugin
    this.clearCache()

    this.plugin.app.vault.on('modify', this.handleFileModification.bind(this))
  }

  public clear(): void {
    this.plugin.app.vault.off('modify', this.handleFileModification.bind(this))

    this.dependencies.clear()
    this.versions.clear()
    this.clearCache()
  }

  public async clearCache(): Promise<void> {
    await this.plugin.fs.renewFolder(this.plugin.fs.getCachePath())
    this.log.info('Cleared cache')
  }

  /**
   * Update cache registry when a file is modified.
   */
  protected handleFileModification(file: TAbstractFile): void {
    if (!this.plugin.settings.enable_versioning) return

    // listen only the files on the components folder
    if (
      file instanceof TFile &&
      file.path.startsWith(this.plugin.settings.components_folder)
    ) {
      this.log.debug(`Listening changes on "${file.path}"`)
      this.trackFile(file)
    }
  }

  /**
   * Resolves a filepath into its latest cached version.
   */
  public resolveFile(fileOrPath: null | string | TFile): string | undefined {
    if (!this.plugin.settings.enable_versioning) return
    if (!fileOrPath) return

    const filepath = FilesystemAdapter.resolvePath(fileOrPath)
    return this.versions.getFirst(filepath)
  }

  /**
   * Tracks the modifications on a file.
   */
  public async trackFile(fileOrPath: null | string | TFile): Promise<boolean> {
    if (!this.plugin.settings.enable_versioning) return false
    if (!fileOrPath) return false

    const file = this.plugin.fs.resolveFile(fileOrPath)
    if (!file) return false

    const log = this.log.group(`Tracking changes on <${file.path}>`)
    const hash = await this.plugin.fs.getFileHash(fileOrPath)
    const versionName = await this.cacheFile(file, hash, log)
    if (!versionName) return false

    this.versions.prepend(file.path, versionName)
    log.flush(`Stored version "${versionName}"`)

    // force the refresh of the components
    this.refreshRender(file.path)
    return true
  }

  /**
   * Creates a temporal copy of the file on the cache folder.
   * If the file already exists nothing is made.
   * @returns the file name on the cache folder.
   */
  protected async cacheFile(
    file: TFile,
    hash: string,
    log: Logger,
  ): Promise<string> {
    const cachedFileName = `${file.basename}.${hash}.${file.extension}`
    const cachedFilePath = this.plugin.fs.getCachePath(cachedFileName)

    if (await this.plugin.fs.exists(cachedFilePath)) {
      log.debug(`File already cached <${cachedFileName}>`)
      return cachedFileName
    }

    log.debug(`Caching file <${file.name}> to <${cachedFileName}>`)
    const parentPath = file.parent?.path || ''
    await this.plugin.fs.copy(file, cachedFilePath, (content) => {
      return content.replaceAll(/require *\( *['"](.+)['"] *\)/g, (_, $1) => {
        const path = FilesystemAdapter.join(parentPath, $1)
        log.debug(`Injecting resolver for <${path}>`)

        // store which files this file imports
        this.dependencies.push(path, file.path)
        return `app.plugins.plugins['obsidian-components'].resolve("${path}")`
      })
    })

    log.debug(`Cached file <${cachedFileName}>`)
    return cachedFileName

    // try {
    // } catch (ignored) {
    // multiples calls at start can generate errors on copy
    // log.debug(`Failed caching file "${cachedFilePath}"`)
    // return null
    // }
  }

  /**
   * Forces a refresh on the rendered components
   * @param called stores the already called refreshs
   */
  protected async refreshRender(
    filepath: string,
    called: string[] = [],
  ): Promise<void> {
    // use `called` to avoid calling a refresh twice

    // first refresh direct components of the file
    if (!called.includes(filepath)) {
      this.plugin.parser.refresh(filepath)
      called.push(filepath)
    }

    // then update components that depend on the file
    // the recursivity allows to refresh all the chain of files
    for (const dependentPath of this.dependencies.get(filepath)) {
      this.refreshRender(dependentPath, called)
    }
  }
}

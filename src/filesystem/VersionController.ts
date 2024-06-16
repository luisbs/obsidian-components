import type { ComponentsPlugin } from '@/types'
import { TAbstractFile, TFile } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import { MapStore } from '@/utility'
import { FilesystemAdapter } from './FilesystemAdapter'

export class VersionController {
  #plugin: ComponentsPlugin

  #log = new Logger('VersionController')
  // like { 'music.html.cjs': ['music.html-23f29a.cjs'] }
  #versions = new MapStore<string>()
  // like { 'HtmlRenderer.cjs': ['music.html.cjs', 'content.html.cjs'] }
  #dependencies = new MapStore<string>()

  constructor(plugin: ComponentsPlugin) {
    this.#plugin = plugin
    this.#plugin.app.vault.on('modify', this.handleFileModification.bind(this))
  }

  public clear(): void {
    this.#plugin.app.vault.off('modify', this.handleFileModification.bind(this))

    this.#dependencies.clear()
    this.#versions.clear()
    this.clearCache()
  }

  public async clearCache(): Promise<void> {
    await this.#plugin.fs.renewFolder(this.#plugin.fs.getCachePath())
    this.#log.info('Cleared cache')
  }

  /**
   * Update cache registry when a file is modified.
   */
  protected handleFileModification(file: TAbstractFile): void {
    if (!this.#plugin.isDesignModeEnabled) return

    // listen only the files on the components folder
    if (
      file instanceof TFile &&
      file.path.startsWith(this.#plugin.settings.components_folder)
    ) {
      this.#log.debug(`Listening changes on "${file.path}"`)
      this.trackFile(file)
    }
  }

  /**
   * Resolves a filepath into its latest cached version.
   */
  public resolveFile(fileOrPath: null | string | TFile): string | undefined {
    if (!this.#plugin.isDesignModeEnabled) return
    if (!fileOrPath) return

    const filepath = FilesystemAdapter.resolvePath(fileOrPath)
    return this.#versions.getFirst(filepath)
  }

  /**
   * Tracks the modifications on a file.
   */
  public async trackFile(fileOrPath: null | string | TFile): Promise<boolean> {
    if (!this.#plugin.isDesignModeEnabled) return false
    if (!fileOrPath) return false

    const file = this.#plugin.fs.resolveFile(fileOrPath)
    if (!file) return false

    const log = this.#log.group(`Tracking changes on <${file.path}>`)
    const hash = await this.#plugin.fs.getFileHash(fileOrPath)
    const versionName = await this.cacheFile(file, hash, log)
    if (!versionName) return false

    this.#versions.prepend(file.path, versionName)

    // force the components to refresh
    this.refreshRender(file.path, log)
    log.flush(`Stored version <${versionName}> and refreshed components`)

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
    const cachedFilePath = this.#plugin.fs.getCachePath(cachedFileName)

    if (await this.#plugin.fs.exists(cachedFilePath)) {
      const timestamp = Date.now().toString()
      const cloneFileName = `${file.basename}.${hash}-${timestamp}.${file.extension}`
      const cloneFilePath = this.#plugin.fs.getCachePath(cloneFileName)

      await this.#plugin.fs.copy(cachedFilePath, cloneFilePath)
      log.debug(`Cloned <${cachedFileName}> to <${cloneFileName}>`)

      return cloneFileName
    }

    log.debug(`Caching file <${file.name}> to <${cachedFileName}>`)
    const parentPath = file.parent?.path || ''
    await this.#plugin.fs.copy(file, cachedFilePath, (content) => {
      return this.replaceImports(file, log, parentPath, content)
    })

    log.debug(`Cached file <${cachedFileName}>`)
    return cachedFileName
  }

  protected replaceImports(
    file: TFile,
    log: Logger,
    parentPath: string,
    content: string,
  ): string {
    // import Obj from './esm/index.js';
    // const Obj = Components.latest('components/esm/index.js');
    return content
      .replaceAll(/^ *import */gi, 'const ')
      .replaceAll(
        / *from *['"](.+)['"]|= *require *\( *['"](.+)['"] *\)/gi,
        (_, $1) => {
          const path = FilesystemAdapter.join(parentPath, $1)
          log.debug(`Injecting resolver for <${path}>`)

          // store which files this file imports
          this.#dependencies.push(path, file.path)
          return ` = await Components.latest('${path}')`
        },
      )
  }

  /**
   * Forces a refresh on the rendered components
   * @param called stores the already called refreshs
   */
  protected async refreshRender(
    filepath: string,
    log: Logger,
    called: string[] = [],
  ): Promise<void> {
    // use `called` to avoid calling a refresh twice

    // first refresh direct components of the file
    if (!called.includes(filepath)) {
      log.debug(`Refreshing <${filepath}> components`)
      this.#plugin.parser.refresh(filepath)
      called.push(filepath)
    }

    // then refresh components that depend on the file
    // the recursivity allows to refresh all the chain of files
    for (const dependentPath of this.#dependencies.get(filepath)) {
      if (called.includes(dependentPath)) continue

      // clone the file, so when executed re-instances imports like:
      // `const { a, b } = require('./file')`
      this.trackFile(dependentPath)
      called.push(dependentPath)

      this.refreshRender(dependentPath, log, called)
    }
  }
}

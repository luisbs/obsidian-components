import type { ComponentsPlugin } from '@/types'
import { TAbstractFile, TFile, TFolder } from 'obsidian'
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

  public dump(): void {
    this.#log.debug({
      versions: this.#versions,
      dependencies: this.#dependencies,
    })
  }

  constructor(plugin: ComponentsPlugin) {
    this.#plugin = plugin
    this.#plugin.app.vault.on('modify', this.#handleFileModification.bind(this))
  }

  public clear(): void {
    // prettier-ignore
    this.#plugin.app.vault.off('modify', this.#handleFileModification.bind(this))

    this.#dependencies.clear()
    this.#versions.clear()
    this.clearCache()
  }

  public async clearCache(): Promise<void> {
    // prevent cleaning on non designMode state
    if (!this.#plugin.isDesignModeEnabled) return
    await this.#plugin.fs.renewFolder(this.#plugin.fs.getCachePath())
    this.#log.info('Cleared cache')
  }

  /**
   * Resolves a filepath into its latest cached version.
   */
  public resolveLatest(filepath: string): string {
    if (!this.#plugin.isDesignModeEnabled) return filepath

    const versionName = this.#versions.getFirst(filepath)
    return versionName ? this.#plugin.fs.getCachePath(versionName) : filepath
  }

  public async exploreComponentsFolder(): Promise<void> {
    const componentsPath = this.#plugin.settings.components_folder
    const componentsFolder =
      this.#plugin.app.vault.getFolderByPath(componentsPath)
    if (!componentsFolder) {
      throw new Error(
        `Folder <${componentsFolder}> not found or is not a folder`,
      )
    }

    const logger = this.#log.group('Exploring dependencies')

    // recursive tree exploring
    const explore = async (folder: TFolder) => {
      for (const child of folder.children) {
        if (child instanceof TFolder) await explore(child)
        await this.#exploreImports(child.path, logger)
      }
    }

    await explore(componentsFolder)
    logger.flush('Explored dependencies')
  }

  /**
   * Update cache registry when a file is modified.
   */
  async #handleFileModification(file: TAbstractFile): Promise<void> {
    if (!(file instanceof TFile)) return
    if (!this.#plugin.isDesignModeEnabled) return

    // listen components-files and dependencies-files
    if (
      file.path.startsWith(this.#plugin.settings.components_folder) ||
      this.#dependencies.has(file.path)
    ) {
      const logger = this.#log.group(`Listening changes on <${file.path}>`)
      await this.#trackFile(file, logger)
      logger.flush(`Listened changes on <${file.path}>`)
    }
  }

  /**
   * Tracks the modifications on a file.
   * `refresh()` should be called after `trackFile()`.
   */
  async #trackFile(
    fileOrPath: string | TFile,
    logger: Logger,
  ): Promise<boolean> {
    if (!this.#plugin.isDesignModeEnabled) {
      this.#log.on(logger).info(`DesignMode is disabled <${fileOrPath}>`)
      return false
    }

    const changedFile = this.#plugin.fs.resolveFile(fileOrPath)
    if (!changedFile) {
      this.#log.on(logger).warn(`File not found <${fileOrPath}>`)
      return false
    }

    const dependents = this.#calculateDependents(changedFile.path)
    this.#log.on(logger).info('Dependents: ', dependents)

    // cache new versions
    this.#log.on(logger).debug('Caching files')
    for (const dependent of dependents) {
      const file = this.#plugin.fs.resolveFile(dependent)
      if (!file) {
        this.#log.on(logger).error(`Not Found <${dependent}>`)
        continue
      }
      const hash = await this.#plugin.fs.getFileHash(dependent)
      const cacheName = await this.#cacheFile(file, hash, logger)
      this.#versions.prepend(dependent, cacheName)
    }
    this.#log.on(logger).info('Cached files')

    // refresh dependents
    this.#log.on(logger).debug('Refreshing components')
    for (const dependent of dependents) this.#plugin.parser.refresh(dependent)
    this.#log.on(logger).info('Refreshed components')

    return true
  }

  /**
   * Calculate all the files affected when a file changed,
   * and its correct order.
   */
  #calculateDependents(filepath: string): string[] {
    const directDependents = this.#dependencies.get(filepath)
    const dependents: string[] = [filepath, ...directDependents]

    for (const dependent of directDependents) {
      dependents.push(...this.#calculateDependents(dependent))
    }

    return dependents.reverse().unique().reverse()
  }

  /**
   * Creates a temporal copy of the file on the cache folder.
   * If the file already a clone is created.
   *
   * @returns the file name on the cache folder.
   */
  async #cacheFile(file: TFile, hash: string, logger: Logger): Promise<string> {
    const cacheName = `${file.basename}.${hash}.${file.extension}`
    const cachePath = this.#plugin.fs.getCachePath(cacheName)

    if (await this.#plugin.fs.exists(cachePath)) {
      const timestamp = Date.now().toString()
      const cloneName = `${file.basename}.${hash}-${timestamp}.${file.extension}`
      const clonePath = this.#plugin.fs.getCachePath(cloneName)

      await this.#plugin.fs.copy(cachePath, clonePath)
      this.#log.on(logger).debug(`Cloned <${cacheName}> to <${cloneName}>`)

      return cloneName
    }

    await this.#plugin.fs.copy(file, cachePath, (content) => {
      return this.#replaceImports(file, content, logger)
    })
    this.#log.on(logger).debug(`Cached <${file.name}> to <${cacheName}>`)

    return cacheName
  }

  /**
   * Replace the imports/require statements to allow dynamic resolution.
   */
  #replaceImports(file: TFile, content: string, logger: Logger): string {
    const parentPath = file.parent?.path || ''
    return content.replaceAll(this.#importRegex(), ($0) => {
      const source = FilesystemAdapter.join(parentPath, $0)
      const latest = this.resolveLatest(source)

      this.#log.on(logger).trace(`Replacing import path <${latest}>`)
      return this.#plugin.fs.getRealPath(latest)
    })
  }

  /**
   * Explore the tree of file dependencies.
   */
  async #exploreImports(filepath: string, logger: Logger): Promise<void> {
    if (!this.#plugin.isDesignModeEnabled) return
    if (this.#dependencies.hasValue(filepath)) return

    const parentPath = filepath.replace(/[\\\/][^\\\/]*$/gi, '')
    const content = await this.#plugin.fs.read(filepath)
    const queue: string[] = []

    this.#log.on(logger).debug(`Explore imports on <${filepath}>`)
    for (const match of content.matchAll(this.#importRegex())) {
      const path = FilesystemAdapter.join(parentPath, match[0] || '')
      this.#log.on(logger).trace(`Found import for <${path}>`)
      this.#dependencies.push(path, filepath)

      queue.push(path)
    }

    // explore inner dependencies
    for (const item of queue) await this.#exploreImports(item, logger)
  }

  #importRegex() {
    return /(?<=from *['"`]|require *\( *['"`])(.+)(?=['"`])/gi
  }
}

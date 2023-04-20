import type { ComponentsPlugin, PluginSettings } from '@/types'
import { TAbstractFile, TFile } from 'obsidian'
import FilesystemAdapter from './FilesystemAdapter'
import MapStore from './MapStore'

export class VersionController {
  protected plugin: ComponentsPlugin
  protected settings: PluginSettings
  protected fs: FilesystemAdapter

  protected versions = new MapStore<string>()
  protected dependencies = new MapStore<string>()

  constructor(plugin: ComponentsPlugin) {
    this.plugin = plugin
    this.settings = plugin.settings

    this.fs = plugin.fs
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
    await this.fs.renewFolder(this.fs.getCachePath())
    console.log('Cleared cache')
  }

  protected handleFileModification(file: TAbstractFile): void {
    // listen only the files on the blocks folder
    if (
      file instanceof TFile &&
      file.path.contains(this.settings.components_folder)
    ) {
      // prettier-ignore
      console.debug(`Listening changes on "${file.path}"`)
      this.update(file)
    }
  }

  /**
   * Resolves a file into its more revent cached version.
   */
  public resolveLastCachedVersion(filePath: string): string {
    if (!this.settings.enable_versioning) return filePath

    const versionName = this.versions.getFirst(filePath)
    return !versionName ? filePath : this.fs.getCachePath(versionName)
  }

  /**
   * Gets the full-path of the more recent file version.
   */
  public async getLastCachedVersion(file: TFile): Promise<string | null> {
    if (!this.settings.enable_versioning) return null

    let versionName = this.versions.getFirst(file.path)
    if (!versionName) {
      await this.update(file)
      versionName = this.versions.getFirst(file.path)
    }

    if (!versionName) return null
    return this.fs.getCachePath(versionName)
  }

  /**
   * Forces a refresh on the rendered components
   * @param {string[]} called stores the already called refreshs
   */
  protected async refreshRender(
    filePath: string,
    called: string[] = [],
  ): Promise<void> {
    // use `called` to avoid calling a refresh twice

    // first refresh direct components of the file
    if (!called.includes(filePath)) {
      this.plugin.parser.refresh(filePath)
      called.push(filePath)
    }

    // then update components that depende on the file
    for (const dependentPath of this.dependencies.get(filePath)) {
      // the recursivity allows to refresh all the chain of files
      if (!called.includes(dependentPath)) {
        await this.clone(dependentPath)
        this.refreshRender(dependentPath, called)
        called.push(dependentPath)
      }
    }
  }

  /**
   * Tracks the modifications on a file.
   */
  protected async update(file: TFile): Promise<void>
  protected async update(filePath: string): Promise<void>
  protected async update(source: TFile | string): Promise<void> {
    if (!this.settings.enable_versioning) return
    const file = this.fs.resolveFile(source)
    if (!file) return

    const hash = await this.fs.getFileHash(file)
    const versionName = await this.cacheFile(file, hash)
    if (!versionName) return console.debug(`Not cached "${file.path}"`)
    console.debug(`Cached "${versionName}"`)

    await this.injectResolver(versionName, file.parent.path)
    this.versions.prepend(file.path, versionName)
    console.log(`Stored version "${versionName}"`)

    // force the refresh of the components
    this.refreshRender(file.path)
  }

  /**
   * Creates a clone of file last version.
   */
  protected async clone(filePath: string): Promise<void> {
    if (!this.settings.enable_versioning) return

    // if the file is not been tracked, init the tracking
    const versionName = this.versions.getFirst(filePath)
    if (!versionName) return this.update(filePath)

    const hash = Date.now().toString()
    const versionPath = this.fs.getCachePath(versionName)

    // is expected that it already has been injected the resolver
    const cloneName = await this.cacheFile(versionPath, hash)
    if (!cloneName) return console.debug(`Not cloned "${filePath}"`)
    console.debug(`Cloned "${cloneName}"`)

    this.versions.prepend(filePath, cloneName)
    console.log(`Cloned version "${cloneName}"`)
  }

  /**
   * Creates a temporal copy of the file on the cache folder.
   * If the file already exists nothing is made.
   * @returns the file name on the cache folder.
   */
  // prettier-ignore
  protected async cacheFile(file: TFile, hash: string): Promise<string | null>
  // prettier-ignore
  protected async cacheFile(filePath: string, hash: string): Promise<string | null>
  protected async cacheFile(
    source: TFile | string,
    hash: string,
  ): Promise<string | null> {
    const file = this.fs.resolveFile(source)
    if (!file) return null

    const cachedFileName = `${file.basename}-${hash}.${file.extension}`
    const cachedFilePath = this.fs.getCachePath(cachedFileName)

    if (await this.fs.missing(cachedFilePath)) {
      await this.fs.copy(file, cachedFilePath)
    }

    return cachedFileName
  }

  /**
   * Inject a custom dependency resolver to help with versioning.
   */
  public async injectResolver(
    filePath: string,
    parentPath: string,
  ): Promise<void> {
    await this.fs.edit(filePath, (component) =>
      component.replaceAll(/require *\( *['"`](.+)['"`] *\)/g, (_, $1) => {
        const path = this.fs.join(parentPath, $1)
        this.dependencies.push(filePath, path)
        return `app.plugins.plugins['obsidian-components'].resolve("${path}")`
      }),
    )

    console.debug(`Injected resolver on "${filePath}"`)
  }
}

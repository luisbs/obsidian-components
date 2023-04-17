import Path from 'path'
import { createHash } from 'crypto'
import { TAbstractFile, TFile, Vault, normalizePath } from 'obsidian'
import { ComponentsPlugin, PluginSettings } from '@/types'
import { CacheController } from './CacheController'

export class VersionController {
  protected vault: Vault
  protected plugin: ComponentsPlugin
  protected settings: PluginSettings

  protected cache: CacheController

  /**
   * Relates a filePath with it stored versions
   */
  protected versions: Map<string, string[]> = new Map()

  /**
   * Relates a filePath with it dependencies
   * stored as <dependency, dependents>
   */
  protected dependencies: Map<string, string[]> = new Map()

  constructor(plugin: ComponentsPlugin) {
    this.plugin = plugin
    this.vault = plugin.app.vault
    this.settings = plugin.settings

    this.cache = new CacheController(plugin)

    this.vault.on('modify', this.handleFileModification.bind(this))
  }

  public clear(): void {
    this.versions = new Map()
    this.dependencies = new Map()
    this.clear()
    this.vault.off('modify', this.handleFileModification.bind(this))
  }

  protected handleFileModification(file: TAbstractFile): void {
    // listen only the files on the blocks folder
    if (
      file instanceof TFile &&
      file.path.contains(this.settings.components_folder)
    ) {
      // prettier-ignore
      console.debug(`Listening changes on "${file.path}"`)
      this.updateFileVersion(file)
    }
  }

  public resolveLastCachedVersion(baseFilePath: string): string {
    const version = this.getLastFileVersion(baseFilePath)
    if (!version) return baseFilePath

    // if a version is found
    // return the path to that fileVersion
    const baseFile = this.vault.getAbstractFileByPath(baseFilePath)
    if (!(baseFile instanceof TFile)) return baseFilePath
    return this.prepareVersionPath(baseFile, version, true)
  }

  /**
   * @returns the full-path of the more recent file version.
   */
  public async getLastCachedVersion(baseFile: TFile): Promise<string | null> {
    if (!this.settings.enable_versioning) return null
    if (!(baseFile instanceof TFile)) return null

    let version = this.getLastFileVersion(baseFile.path)
    if (!version) {
      await this.updateFileVersion(baseFile)
      version = this.getLastFileVersion(baseFile.path)
    }

    if (!version) return null
    return this.prepareVersionPath(baseFile, version, true)
  }

  /**
   * Tracks the modifications on a file.
   */
  protected async updateFileVersion(baseFile: TFile): Promise<void> {
    if (!this.settings.enable_versioning) return

    const version = await this.getFileVersion(baseFile)

    // ensure the file is stored
    if (!this.isFileVersionStored(baseFile.path, version)) {
      let versionPath = this.prepareVersionPath(baseFile, version)
      versionPath = await this.cache.cacheFile(baseFile, versionPath)
      console.debug(`Cached "${versionPath}"`)
      await this.updateReferences(baseFile, versionPath)
    }

    this.storeVersion(baseFile.path, version)
    console.debug(`Stored version '${version}' of "${baseFile.path}"`)

    // force the refresh of the components
    this.refreshRender(baseFile.path)
  }

  /**
   * Forces a refresh on the rendered components
   * @param {string[]} called stores the already called refreshs
   */
  protected async refreshRender(
    baseFilePath: string,
    called: string[] = [],
  ): Promise<void> {
    // use `called` to avoid calling a refresh twice

    // first refresh direct components of the file
    if (!called.includes(baseFilePath)) {
      this.plugin.parser?.refresh(baseFilePath)
      called.push(baseFilePath)
    }

    // then update components that depende on the file
    for (const filePath of this.getFileDependents(baseFilePath)) {
      // the recursivity allows to refresh all the chain of files
      if (!called.includes(filePath)) {
        await this.cloneVersion(filePath)
        this.refreshRender(filePath, called)
        called.push(filePath)
      }
    }
  }

  /**
   * Creates a clone of a file with a name based on date and not on content.
   * This behavior is to ensure it is placed on top of the versions list
   */
  protected async cloneVersion(baseFilePath: string): Promise<void> {
    const baseFile = this.vault.getAbstractFileByPath(baseFilePath)

    const sourceVersion = this.getLastFileVersion(baseFilePath)
    if (!sourceVersion) {
      // if the file is not been tracked already, fires it
      return this.updateFileVersion(baseFile as TFile)
    }
    const version = Date.now().toString()
    const versionPath = this.prepareVersionPath(baseFile as TFile, version)

    const sourcePath = this.prepareVersionPath(baseFile as TFile, sourceVersion)
    const sourceFile = this.vault.getAbstractFileByPath(sourcePath)
    await this.cache.cacheFile(sourceFile as TFile, versionPath)

    this.storeVersion(baseFilePath, version)
    console.debug(`Cloned version '${version}' from "${baseFilePath}"`)
  }

  /**
   * Updates the references to other files.
   */
  protected async updateReferences(
    baseFile: TFile,
    newFilePath: string,
  ): Promise<void> {
    const parentPath = baseFile.parent?.path || ''

    // load the original content
    let content = await this.vault.adapter.read(newFilePath)

    // replace references to real routes
    content = content.replaceAll(
      /require *\( *['"`](.+)['"`] *\)/g,
      // use a method to dynamically resolve the dependencies
      (_, $1) => {
        const path = normalizePath(Path.join(parentPath, $1))
        this.storeDependency(baseFile.path, path)
        return `app.plugins.plugins['obsidian-components'].require("${path}")`
      },
    )

    // update the content
    await this.vault.adapter.write(newFilePath, content)
    console.debug(`Adpated '${newFilePath}'`)
  }

  /**
   * Store dependecy relations.
   */
  protected storeDependency(
    dependentPath: string,
    dependencyPath: string,
  ): void {
    const dependents = this.getFileDependents(dependencyPath)
    if (dependents.includes(dependentPath)) return
    dependents.push(dependentPath)
    this.dependencies.set(dependencyPath, dependents)
  }

  /**
   * @returns the array of stored versions of a file.
   */
  protected getFileDependents(filePath: string): string[] {
    return this.dependencies.get(filePath) || []
  }

  /**
   * Adds an entry in the version control relating to the baseFile.
   */
  protected storeVersion(filePath: string, version: string): void {
    const versions = this.getFileVersions(filePath)
    // store the versions on a DESC way for easy access to the more recent
    versions.unshift(version)
    // ensure that each version only appears ones (the more recent one)
    this.versions.set(filePath, versions.unique())
  }

  /**
   * Checks if the version has been stored already.
   */
  protected isFileVersionStored(filePath: string, version: string): boolean {
    return this.getFileVersions(filePath).some((stored) => stored === version)
  }

  /**
   * @return the most recent version of a file.
   */
  protected getLastFileVersion(filePath: string): string | undefined {
    return this.getFileVersions(filePath).first()
  }

  /**
   * @returns the array of stored versions of a file.
   */
  protected getFileVersions(filePath: string): string[] {
    return this.versions.get(filePath) || []
  }

  /**
   * @returns an identifier of the file state.
   */
  public async getFileVersion(file: TFile): Promise<string> {
    const content = await this.vault.read(file)
    const hash = createHash('sha256').update(content).digest('hex')
    // use the first 10 characters only
    return hash.substring(0, 10)
  }

  /**
   * @param {boolean} full make the result a full path.
   * @returns the path of a version file on the cache folder.
   */
  protected prepareVersionPath(
    baseFile: TFile,
    version: string,
    full = false,
  ): string {
    if (!full) {
      return `${baseFile.basename}-${version}.${baseFile.extension}`
    }

    return this.cache.getCachePath(
      `${baseFile.basename}-${version}.${baseFile.extension}`,
    )
  }
}

import { TAbstractFile, TFile, Vault } from 'obsidian'
import { ComponentsPlugin, PluginSettings } from '@/types'
import { createHash } from 'crypto'

export class VersionController {
  protected vault: Vault
  protected plugin: ComponentsPlugin
  protected settings: PluginSettings

  /**
   * Relates a user filePath with it stored versions
   */
  protected versions: Map<string, string[]> = new Map()

  constructor(plugin: ComponentsPlugin) {
    this.plugin = plugin
    this.vault = plugin.app.vault
    this.settings = plugin.settings

    this.vault.on('modify', this.handleFileModification.bind(this))
  }

  public clear(): void {
    this.versions = new Map()
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
    return this.getVersionPath(baseFile, version, true)
  }

  /**
   * Tracks the modifications on a file.
   */
  protected async updateFileVersion(baseFile: TFile): Promise<void> {
    if (!this.settings.enable_versioning) return

    const version = await this.getFileVersion(baseFile)
    if (this.isFileVersionStored(baseFile.path, version)) return

    const versionPath = this.getVersionPath(baseFile, version)
    await this.plugin.cache?.cacheFile(baseFile, versionPath)
    this.storeVersion(baseFile.path, version)
    console.debug(`Stored version '${version}' of "${baseFile.path}"`)

    // force the refresh of the components
    this.plugin.parser?.refresh(baseFile.path)
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
  protected isFileVersionStored(fileName: string, version: string): boolean {
    return this.getFileVersions(fileName).some((stored) => stored === version)
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
  protected getFileVersions(fileName: string): string[] {
    return this.versions.get(fileName) || []
  }

  /**
   * @param {boolean} full make the result a full path.
   * @returns the path of a version file on the cache folder.
   */
  protected getVersionPath(
    baseFile: TFile,
    version: string,
    full = false,
  ): string {
    if (!full) {
      return `${baseFile.basename}-${version}.${baseFile.extension}`
    }

    return (
      this.plugin.cache?.getCachePath(
        `${baseFile.basename}-${version}.${baseFile.extension}`,
      ) || `${baseFile.basename}-${version}.${baseFile.extension}`
    )
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
}

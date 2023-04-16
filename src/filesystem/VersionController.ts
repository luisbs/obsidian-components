import { TAbstractFile, TFile, Vault } from 'obsidian'
import { ComponentsPlugin } from '@/types'

export class VersionController {
  protected vault: Vault
  protected plugin: ComponentsPlugin

  /**
   * This variable tracks when ot enable the versioning,
   * since it can generate a lot of memory usage
   * and consumes more storage space, is recomended to keep it disabled
   */
  protected enabled: boolean

  /**
   * Relates a user filePath with it stored versions
   */
  protected versions: Map<string, string[]> = new Map()

  constructor(plugin: ComponentsPlugin) {
    this.plugin = plugin
    this.vault = plugin.app.vault
    this.enabled = plugin.settings.versioning_enabled

    const listener = (file: TAbstractFile): void => {
      // listen only the files on the blocks folder
      if (
        file instanceof TFile &&
        file.path.contains(plugin.settings.components_folder)
      ) {
        console.debug(`components: storing new version of "${file.path}"`)
        this.updateFileVersion(file)
      }
    }

    this.vault.on('modify', listener)
    // this.vault.off('modify', listener)
  }

  public setEnabled(value: boolean): void {
    this.enabled = value
  }

  public async getLastCachedVersion(baseFile: TFile): Promise<TFile | null> {
    if (!this.enabled) return baseFile
    if (!(baseFile instanceof TFile)) return baseFile

    let version = this.getLastFileVersion(baseFile.path)
    if (!version) {
      await this.updateFileVersion(baseFile)
      version = this.getLastFileVersion(baseFile.path)
    }

    if (!version) return baseFile
    const versionPath = this.getVersionPath(baseFile, version)
    return this.vault.getAbstractFileByPath(versionPath) as TFile | null
  }

  protected async updateFileVersion(baseFile: TFile): Promise<void> {
    const version = (await this.plugin.cache?.getFileHash(baseFile)) || ''

    if (this.isFileVersionStored(baseFile.path, version)) return

    const versionPath = this.getVersionPath(baseFile, version)
    this.plugin.cache?.cacheFile(baseFile, versionPath)
    this.storeVersion(baseFile.path, version)

    // prettier-ignore
    console.debug(`components: stored version '${version}' of "${baseFile.path}"`)
  }

  protected isFileVersionStored(fileName: string, hash: string): boolean {
    return this.getFileVersions(fileName).some((version) => version === hash)
  }

  protected getLastFileVersion(fileName: string): string | undefined {
    return this.getFileVersions(fileName).last()
  }

  protected getFileVersions(fileName: string): string[] {
    return this.versions.get(fileName) || []
  }

  protected storeVersion(fileName: string, hash: string): void {
    const versions = this.getFileVersions(fileName)
    versions.push(hash)
    this.versions.set(fileName, versions)
  }

  protected getVersionPath(baseFile: TFile, version: string): string {
    return `${baseFile.basename}-${version}.${baseFile.extension}`
  }
}

import { TAbstractFile, TFile, Vault } from 'obsidian'
import { ComponentsPlugin, PluginSettings } from '@/types'

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

    const listener = (file: TAbstractFile): void => {
      // listen only the files on the blocks folder
      if (
        file instanceof TFile &&
        file.path.contains(plugin.settings.components_folder)
      ) {
        console.debug(`components: listening changes on "${file.path}"`)
        this.updateFileVersion(file)
      }
    }

    this.vault.on('modify', listener)
    // this.vault.off('modify', listener)
  }

  public async getLastCachedVersion(baseFile: TFile): Promise<TFile | null> {
    if (!this.settings.versioning_enabled) return baseFile
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
    if (!this.settings.versioning_enabled) return

    const version = (await this.plugin.cache?.getFileHash(baseFile)) || ''

    if (this.isFileVersionStored(baseFile.path, version)) return

    console.debug(
      `components: storing version '${version}' of "${baseFile.path}"`,
    )

    const versionPath = this.getVersionPath(baseFile, version)
    this.storeVersion(baseFile.path, version)
    await this.plugin.cache?.cacheFile(baseFile, versionPath)

    console.debug(
      `components: stored version '${version}' of "${baseFile.path}"`,
    )
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

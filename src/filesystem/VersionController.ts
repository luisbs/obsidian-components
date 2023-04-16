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
      console.debug(`obsidian-components: listening changes on "${file.path}"`)
      this.updateFileVersion(file)
    }
  }

  public async getLastCachedVersion(baseFile: TFile): Promise<TFile | null> {
    if (!this.settings.enable_versioning) return baseFile
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
    if (!this.settings.enable_versioning) return

    const version = (await this.plugin.cache?.getFileHash(baseFile)) || ''

    if (this.isFileVersionStored(baseFile.path, version)) return

    // prettier-ignore
    console.debug(`obsidian-components: storing version '${version}' of "${baseFile.path}"`)

    const versionPath = this.getVersionPath(baseFile, version)
    this.storeVersion(baseFile.path, version)
    await this.plugin.cache?.cacheFile(baseFile, versionPath)

    // prettier-ignore
    console.debug(`obsidian-components: stored version '${version}' of "${baseFile.path}"`)
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

import { ComponentsPlugin } from '@/types'
import { createHash } from 'crypto'
import { TFile, TFolder, Vault } from 'obsidian'
import Path from 'path'

export class CacheController {
  protected vault: Vault

  constructor(plugin: ComponentsPlugin) {
    this.vault = plugin.app.vault
  }

  /**
   * Generates a real filePath inside the vault,
   * if no params are passed the route of the
   * cache folder is generated.
   */
  getCachePath(...paths: string[]): string {
    return Path.resolve(
      this.vault.configDir,
      'plugins/components/.temp',
      ...paths,
    )
  }

  /**
   * Destroys the folder cache and generates a new one
   * ready to be used.
   */
  async clearCache(vault: Vault): Promise<void> {
    const path = this.getCachePath()
    const folder = this.vault.getAbstractFileByPath(path)

    if (!folder) return

    await this.vault.delete(folder, true)
    await this.vault.createFolder(path)
  }

  /**
   * Returns the instance of the cache folder.
   */
  async getCacheFolder(): Promise<TFolder> {
    const path = this.getCachePath()
    const folder = this.vault.getAbstractFileByPath(path)

    if (!folder) {
      await this.vault.createFolder(path)
      return this.vault.getAbstractFileByPath(path) as TFolder
    }

    if (!(folder instanceof TFolder)) {
      await this.vault.delete(folder, true)
      await this.vault.createFolder(path)
      return this.vault.getAbstractFileByPath(path) as TFolder
    }

    return folder as TFolder
  }

  /**
   * Creates a copy of a file, and
   * returns its file name inside the cache folder.
   */
  async cacheFile(
    baseFile: TFile,
    newFilePath?: string,
  ): Promise<string | null> {
    const tempPath =
      newFilePath ||
      baseFile.basename + '-' + baseFile.stat.mtime + '.' + baseFile.extension

    const tempFile = await this.vault.copy(baseFile, tempPath)
    return tempFile.name
  }

  /**
   * Removes a file from the cache folder.
   */
  async removeFile(filePath: string): Promise<void> {
    const file = this.vault.getAbstractFileByPath(this.getCachePath(filePath))
    if (file) await this.vault.delete(file, true)
  }

  public async getFileHash(file: TFile): Promise<string> {
    const content = await this.vault.read(file)
    const hash = createHash('sha256').update(content).digest('hex')
    // use the first 10 characters only
    return hash.substring(0, 10)
  }
}

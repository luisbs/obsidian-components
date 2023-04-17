import { ComponentsPlugin } from '@/types'
import { TFile, TFolder, Vault, normalizePath } from 'obsidian'
import Path from 'path'

export class CacheController {
  protected vault: Vault

  constructor(plugin: ComponentsPlugin) {
    this.vault = plugin.app.vault
    this.clear()
  }

  /**
   * Generates a real filePath inside the vault,
   * if no params are passed the route of the
   * cache folder is generated.
   */
  public getCachePath(...paths: string[]): string {
    return normalizePath(
      Path.join(
        this.vault.configDir,
        'plugins/obsidian-components/.temp',
        ...paths,
      ),
    )
  }

  /**
   * Destroys the folder cache and generates a new one
   * ready to be used.
   */
  async clear(): Promise<void> {
    const path = this.getCachePath()
    console.debug(`Clearing cache on '${path}'`)

    try {
      // remove existing cache folder
      if (await this.vault.adapter.exists(path)) {
        await this.vault.adapter.rmdir(path, true)
      }

      // create an empty cache folder
      await this.vault.createFolder(path)

      console.log('Cleared cache')
    } catch (error) {
      console.debug(error)
    }
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
  public async cacheFile(
    baseFile: TFile,
    newFilePath?: string,
  ): Promise<string | null> {
    const tempPath = this.getCachePath(
      newFilePath ||
        `${baseFile.basename}-${baseFile.stat.mtime}.${baseFile.extension}`,
    )

    await this.vault.adapter.copy(baseFile.path, tempPath)
    return tempPath
  }

  /**
   * Removes a file from the cache folder.
   */
  public async removeFile(filePath: string): Promise<void> {
    const file = this.vault.getAbstractFileByPath(this.getCachePath(filePath))
    if (file) await this.vault.delete(file, true)
  }
}

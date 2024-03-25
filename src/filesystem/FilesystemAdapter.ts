import type { ComponentsPlugin } from '@/types'
import Path from 'path'
import { createHash } from 'crypto'
import { TAbstractFile, TFile, TFolder, Vault, normalizePath } from 'obsidian'

type ContentEditor = (content: string) => string

export default class FilesystemAdapter {
  protected vault: Vault

  constructor(plugin: ComponentsPlugin) {
    this.vault = plugin.app.vault
  }

  public resolveFile(source: TAbstractFile | string): TFile | null {
    if (typeof source === 'string') {
      const file = this.vault.getAbstractFileByPath(source)
      return file instanceof TFile ? file : null
    }
    return source instanceof TFile ? source : null
  }

  public static resolvePath(source: TAbstractFile | string): string {
    return typeof source === 'string' ? source : source.path
  }

  public static join(...paths: string[]): string {
    return normalizePath(Path.join(...paths))
  }

  /**
   * Generates a vault-path to the file,
   * if no params are passed the route of the
   * cache folder is returned.
   */
  public getCachePath(...paths: string[]): string {
    return FilesystemAdapter.join(
      this.vault.configDir,
      'plugins/obsidian-components/.temp',
      ...paths,
    )
  }

  /**
   * A real path of the file on the user system.
   */
  public getRealPath(...paths: string[]): string {
    //? simplier implementation
    //? not used cause `basePath` is not public/documentated
    //? so it may change as an internal implementation
    // @ts-expect-error not-public-api-usage
    return Path.resolve(this.vault.adapter.basePath, ...paths)

    //! replaced by above, cause it make changes as URL
    //! like replaces ' ' (space) to '%20'
    //? `getResourcePath` adds a prefix and a postfix to identify file version
    //? it needs to be removed to be recognized as a real route
    return this.vault.adapter
      .getResourcePath(Path.join(...paths))
      .replace(/app:\/\/local/i, '') // removes the prefix
      .replace(/^\/(?=[\w]+:)/i, '') // fix route for windows systems
      .replace(/\?\d+$/i, '') // removes the postfix
  }

  /**
   * Checks if a file exists.
   */
  public async missing(fileOrPath: TFile | string): Promise<boolean> {
    return !this.exists(fileOrPath as string)
  }

  /**
   * Checks if a file exists.
   */
  public async exists(fileOrPath: TFile | string): Promise<boolean> {
    const filepath = FilesystemAdapter.resolvePath(fileOrPath)
    return this.vault.adapter.exists(filepath)
  }

  /**
   * Copies the content of a file into another.
   * @param editor callback used to perform an edition before saving
   */
  public async copy(
    fileOrPath: TFile | string,
    newFilePath: string,
    editor?: ContentEditor,
  ): Promise<void> {
    const filepath = FilesystemAdapter.resolvePath(fileOrPath)

    // copy with edit
    if (typeof editor === 'function') {
      const content = await this.vault.adapter.read(filepath)
      await this.vault.adapter.write(newFilePath, editor(content))
    }
    // simplier copy
    else {
      await this.vault.adapter.copy(filepath, newFilePath)
    }
  }

  /**
   * Edits a file content using a callback.
   * @param editor callback used to perform the edition
   */
  public async edit(
    fileOrPath: TFile | string,
    editor: ContentEditor,
  ): Promise<void> {
    const filepath = FilesystemAdapter.resolvePath(fileOrPath)
    const content = await this.vault.adapter.read(filepath)
    await this.vault.adapter.write(filepath, editor(content))
  }

  /**
   * Removes a file from the filesystem.
   */
  public async remove(fileOrPath: TFile | string): Promise<void> {
    const filepath = FilesystemAdapter.resolvePath(fileOrPath)
    await this.vault.adapter.remove(filepath)
  }

  /**
   * Removes everything from a folder
   * and creates a new empty folder with the same name.
   */
  public async renewFolder(folderOrPath: TFolder | string): Promise<void> {
    const folderpath = FilesystemAdapter.resolvePath(folderOrPath)
    if (await this.vault.adapter.exists(folderpath)) {
      await this.vault.adapter.rmdir(folderpath, true)
    }
    if (!(await this.vault.adapter.exists(folderpath))) {
      await this.vault.adapter.mkdir(folderpath)
    }
  }

  /**
   * Generates a hash of certain length based on the content of a file.
   * @param length preferred of the hash, if is passed a number lower to `1` the complete hash is returned
   */
  public async getFileHash(
    fileOrPath: TFile | string,
    length = 6,
  ): Promise<string> {
    const filepath = FilesystemAdapter.resolvePath(fileOrPath)
    const content = await this.vault.adapter.read(filepath)
    const hash = createHash('sha256').update(content).digest('hex')
    return length < 1 ? hash : hash.substring(0, length)
  }
}

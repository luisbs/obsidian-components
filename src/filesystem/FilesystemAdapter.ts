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

  /**
   * Generates a vault-path to the file,
   * if no params are passed the route of the
   * cache folder is returned.
   */
  public getCachePath(...paths: string[]): string {
    return this.join(
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
    return this.join(this.vault.adapter.basePath, ...paths)

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

  public join(...paths: string[]): string {
    return normalizePath(Path.join(...paths))
  }

  /**
   * Checks if a file exists.
   */
  public async missing(file: TFile): Promise<boolean>
  public async missing(filePath: string): Promise<boolean>
  public async missing(source: TFile | string): Promise<boolean> {
    return !this.exists(source as string)
  }

  /**
   * Checks if a file exists.
   */
  public async exists(file: TFile): Promise<boolean>
  public async exists(filePath: string): Promise<boolean>
  public async exists(source: TFile | string): Promise<boolean> {
    const filePath = this.resolveFilePath(source)
    return this.vault.adapter.exists(filePath)
  }

  /**
   * Copies the content of a file into another.
   */
  public async copy(file: TFile, newFilePath: string): Promise<void>
  public async copy(filePath: string, newFilePath: string): Promise<void>
  public async copy(
    source: TFile | string,
    newFilePath: string,
  ): Promise<void> {
    const filePath = this.resolveFilePath(source)
    await this.vault.adapter.copy(filePath, newFilePath)
  }

  /**
   * Edits a file content using a callback.
   * @param {ContentEditor} editor callback used to perform the edition
   */
  public async edit(file: TFile, editor: ContentEditor): Promise<void>
  public async edit(filePath: string, editor: ContentEditor): Promise<void>
  public async edit(
    source: TFile | string,
    editor: ContentEditor,
  ): Promise<void> {
    const filePath = this.resolveFilePath(source)
    const content = await this.vault.adapter.read(filePath)
    await this.vault.adapter.write(filePath, editor(content))
  }

  /**
   * Removes a file from the filesystem.
   */
  public async remove(file: TFile): Promise<void>
  public async remove(filePath: string): Promise<void>
  public async remove(source: TFile | string): Promise<void> {
    const filePath = this.resolveFilePath(source)
    await this.vault.adapter.remove(filePath)
  }

  /**
   * Removes everything from a folder
   * and creates a new empty folder.
   */
  public async renewFolder(file: TFolder): Promise<void>
  public async renewFolder(filePath: string): Promise<void>
  public async renewFolder(source: TFolder | string): Promise<void> {
    const folderPath = this.resolveFilePath(source)
    if (await this.vault.adapter.exists(folderPath)) {
      await this.vault.adapter.rmdir(folderPath, true)
    }
    if (!(await this.vault.adapter.exists(folderPath))) {
      await this.vault.adapter.mkdir(folderPath)
    }
  }

  /**
   * Generates a hash of certain length based on the content of a file.
   * @param {number} length extension of the hash, if is passed a number lower to `1` the complete hash is returned
   */
  public async getFileHash(file: TFile, length?: number): Promise<string>
  public async getFileHash(filePath: string, length?: number): Promise<string>
  public async getFileHash(
    source: TFile | string,
    length = 10,
  ): Promise<string> {
    const filePath = this.resolveFilePath(source)
    const content = await this.vault.adapter.read(filePath)
    const hash = createHash('sha256').update(content).digest('hex')
    return length < 1 ? hash : hash.substring(0, 10)
  }

  public resolveFilePath(source: TAbstractFile | string): string {
    return typeof source === 'string' ? source : source.path
  }

  public resolveFile(source: TAbstractFile | string): TFile | null {
    if (typeof source === 'string') {
      const file = this.vault.getAbstractFileByPath(source)
      return file instanceof TFile ? file : null
    }
    return source instanceof TFile ? source : null
  }
}

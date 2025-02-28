import type { ComponentsPlugin } from '@/types'
import Path from 'path'
import { createHash } from 'crypto'
import { TAbstractFile, TFile, TFolder, Vault, normalizePath } from 'obsidian'

type ContentEditor = (content: string) => string

export class FilesystemAdapter {
    #plugin: ComponentsPlugin
    #vault: Vault

    constructor(plugin: ComponentsPlugin) {
        this.#vault = plugin.app.vault
        this.#plugin = plugin
    }

    /**
     * Returns an URI for the browser engine to use, for example to embed an image.
     */
    public getResourcePath(file: TFile): string {
        return this.#plugin.app.vault.getResourcePath(file)
    }

    /**
     * An absolute path of the file on the user system.
     */
    public getAbsolutePath(path: string): string {
        //? may change internally since `basePath` is not public/documentated
        // @ts-expect-error not-public-api-usage
        return Path.resolve(this.#vault.adapter.basePath as string, path)
    }

    /**
     * Generates a vault-path to the file,
     * @note if no params are passed the route of the cache folder is returned.
     */
    public getCachePath(...paths: string[]): string {
        return this.join(
            this.#plugin.settings.cache_folder,
            '__components__',
            ...paths,
        )
    }

    /**
     * Normalize after joining the path.
     */
    public join(...paths: string[]): string {
        return normalizePath(Path.join(...paths))
    }

    /**
     * Resolve an **fileOrPath** to a **string**.
     */
    public resolvePath(fileOrPath: TAbstractFile | string): string {
        return String.isString(fileOrPath) ? fileOrPath : fileOrPath.path
    }

    /**
     * Resolve an **fileOrPath** to a **TFile** only if possible.
     * @note this method can not be used with files inside hidden folders like `.obsidian`
     */
    public resolveFile(fileOrPath: TFile | string): TFile | null {
        if (fileOrPath instanceof TFile) return fileOrPath
        return this.#vault.getFileByPath(fileOrPath)
    }

    /**
     * Internal utility method.
     */
    async #exists(filepath: string): Promise<boolean> {
        return await this.#vault.adapter.exists(filepath)
    }

    /**
     * Internal utility method.
     */
    async #missing(filepath: string): Promise<boolean> {
        return !(await this.#vault.adapter.exists(filepath))
    }

    /**
     * Checks if a file exists.
     */
    public async exists(filepath: string): Promise<boolean> {
        return this.#exists(filepath)
    }

    /**
     * Checks if a file exists.
     */
    public async missing(filepath: string): Promise<boolean> {
        return this.#missing(filepath)
    }

    /**
     * Removes a file from the filesystem.
     */
    public async remove(filepath: string): Promise<void> {
        await this.#vault.adapter.remove(filepath)
    }

    /**
     * Retrieves the content of a file.
     */
    public async read(filepath: string): Promise<string> {
        return await this.#vault.adapter.read(filepath)
    }

    /**
     * Edits a file content using a callback.
     * @param editor callback used to perform the edition
     */
    public async edit(
        fileOrPath: TFile | string,
        editor: ContentEditor,
    ): Promise<void> {
        const filepath = this.resolvePath(fileOrPath)
        const content = await this.#vault.adapter.read(filepath)
        await this.#vault.adapter.write(filepath, editor(content))
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
        const filepath = this.resolvePath(fileOrPath)

        // simplier copy
        if (!editor) return this.#vault.adapter.copy(filepath, newFilePath)

        // copy with edit
        const content = await this.#vault.adapter.read(filepath)
        await this.#vault.adapter.write(newFilePath, editor(content))
    }

    /**
     * Removes everything from a folder
     * and creates a new empty folder with the same name.
     */
    public async renewFolder(folderOrPath: TFolder | string): Promise<void> {
        const folderpath = this.resolvePath(folderOrPath)
        if (await this.#exists(folderpath)) {
            await this.#vault.adapter.rmdir(folderpath, true)
        }
        if (await this.#missing(folderpath)) {
            await this.#vault.adapter.mkdir(folderpath)
        }
    }

    /**
     * Generates a hash of certain length based on the content of a file.
     * @param length preferred of the hash, if is passed a number lower to `1` the complete hash is returned
     * @note by default only the first 6 characters are returned
     */
    public async getFileHash(
        fileOrPath: TFile | string,
        length = 6,
    ): Promise<string> {
        const filepath = this.resolvePath(fileOrPath)
        const content = await this.#vault.adapter.read(filepath)
        const hash = createHash('sha256').update(content).digest('hex')
        return length < 1 ? hash : hash.substring(0, length)
    }
}

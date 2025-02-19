import type { ComponentsPlugin } from '@/types'
import Path from 'path'
import { createHash } from 'crypto'
import { TAbstractFile, TFile, TFolder, Vault, normalizePath } from 'obsidian'

type ContentEditor = (content: string) => string

export default class FilesystemAdapter {
    #plugin: ComponentsPlugin
    #vault: Vault

    constructor(plugin: ComponentsPlugin) {
        this.#vault = plugin.app.vault
        this.#plugin = plugin
    }

    /**
     * A real path of the file on the user system.
     */
    public getRealPath(path: string | TFile): string {
        return FilesystemAdapter.getRealPath(this.#plugin, path)
    }

    /**
     * A real path of the file on the user system.
     */
    public static getRealPath(
        plugin: ComponentsPlugin,
        path: string | TFile,
    ): string {
        //? simplier implementation
        //? not used cause `basePath` is not public/documentated
        //? so it may change as an internal implementation
        // @ts-expect-error not-public-api-usage
        return Path.resolve(String(plugin.app.vault.adapter.basePath), path)

        //! replaced by above, cause it make changes as URL
        //! like replaces ' ' (space) to '%20'
        //? `getResourcePath` adds a prefix and a postfix to identify file version
        //? it needs to be removed to be recognized as a real route
        // return plugin.app.vault.adapter
        //     .getResourcePath(Path.join(path))
        //     .replace(/app:\/\/local/i, '') // removes the prefix
        //     .replace(/^\/(?=[\w]+:)/i, '') // fix route for windows systems
        //     .replace(/\?\d+$/i, '') // removes the postfix
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
        if (!String.isString(fileOrPath)) return null
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
    public async exists(fileOrPath: TFile | string): Promise<boolean> {
        return this.#exists(this.resolvePath(fileOrPath))
    }

    /**
     * Checks if a file exists.
     */
    public async missing(fileOrPath: TFile | string): Promise<boolean> {
        return this.#missing(this.resolvePath(fileOrPath))
    }

    /**
     * Removes a file from the filesystem.
     */
    public async remove(fileOrPath: TFile | string): Promise<void> {
        const filepath = this.resolvePath(fileOrPath)
        await this.#vault.adapter.remove(filepath)
    }

    /**
     * Retrieves the content of a file.
     */
    public async read(fileOrPath: TFile | string): Promise<string> {
        const filepath = this.resolvePath(fileOrPath)
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

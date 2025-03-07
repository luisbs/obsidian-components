import type { ComponentsPlugin } from '@/types'
import pathe from 'pathe'
import { TAbstractFile, TFile, Vault, normalizePath } from 'obsidian'
import { getHash } from './common'

export class FilesystemAdapter {
    #plugin: ComponentsPlugin
    #vault: Vault

    constructor(plugin: ComponentsPlugin) {
        this.#vault = plugin.app.vault
        this.#plugin = plugin
    }

    /**
     * Removes everything from a folder
     * and creates a new empty folder with the same name.
     */
    public async renewCache(): Promise<void> {
        const path = this.getCachePath()
        const folder = this.#vault.getFolderByPath(path)
        if (folder) await this.#vault.delete(folder, false)
        await this.#vault.createFolder(path)
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
     * An absolute path of the file on the user system.
     */
    public getAbsolutePath(path: string): string {
        //? is not public/documentated, may change internally
        // @ts-expect-error not-public-api-usage
        // eslint-disable-next-line
        return this.#vault.adapter.getFullPath(path)
    }

    /**
     * Returns an URI for the browser engine to use, for example to embed an image.
     */
    public getResourcePath(file: TFile): string {
        return this.#plugin.app.vault.getResourcePath(file)
    }

    /**
     * Normalize after joining the path.
     */
    public join(...paths: string[]): string {
        return normalizePath(pathe.join(...paths))
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
     * Checks if a file exists.
     */
    public exists(filepath: string): boolean {
        return !!this.#vault.getAbstractFileByPath(filepath)
    }

    /**
     * Checks if a file exists.
     */
    public missing(filepath: string): boolean {
        return !this.#vault.getAbstractFileByPath(filepath)
    }

    /**
     * Retrieves the content of a file.
     */
    public async read(file: TFile): Promise<string> {
        return await this.#vault.cachedRead(file)
    }

    /**
     * Copies the content of a file into another.
     * @param editor callback used to perform an edition before saving
     */
    public async copy(
        file: TFile,
        newPath: string,
        editor: (content: string) => string,
    ): Promise<TFile> {
        const newFile = await this.#vault.copy(file, newPath)
        await this.#vault.process(newFile, editor)
        return newFile
    }

    /**
     * Generates a hash of certain length based on the content of a file.
     * @param length preferred of the hash, if is passed a number lower to `1` the complete hash is returned
     * @note by default only the first 6 characters are returned
     */
    public async getFileHash(file: TFile, length = 6): Promise<string> {
        const content = await this.#vault.cachedRead(file)
        const hash = await getHash(content)
        return length < 1 ? hash : hash.substring(0, length)
    }
}

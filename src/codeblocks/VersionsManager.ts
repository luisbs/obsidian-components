import type { ComponentsPlugin } from '@/types'
import type { Logger } from '@luis.bs/obsidian-fnc'
import { EventRef, TAbstractFile, TFile, TFolder } from 'obsidian'
import { MapStore } from '@/utility'
import FilesystemAdapter from './FilesystemAdapter'

type Refresher = (componentPath: string[], log: Logger) => Promise<void>

/** Regex used to match imported-files Path */
const importsRegex = () => /(?<=from *['"`]|require *\( *['"`])(.+)(?=['"`])/gi

export default class VersionsManager {
    #log: Logger
    #fs: FilesystemAdapter
    #plugin: ComponentsPlugin
    #refresher: Refresher
    #handler: EventRef

    /**
     * Stores a map in the form `[source-file, [files-were-is-imported]]`
     * @example { 'HtmlRenderer.cjs': ['music.html.cjs', 'content.html.cjs'] }
     */
    #tracked = new MapStore<string>()
    /**
     * Stores a map in the form `[source-file, [cached-versions]]`
     * @example { 'music.html.cjs': ['music.html.23f29a.cjs'] }
     */
    #versions = new MapStore<string>()

    // public dump(): void {
    //     this.#log.debug({ tracked: this.#tracked, versions: this.#versions })
    // }

    constructor(plugin: ComponentsPlugin, refresher: Refresher) {
        this.#log = plugin.log.make(VersionsManager.name)
        this.#fs = new FilesystemAdapter(plugin)
        this.#plugin = plugin
        this.#refresher = refresher
        this.#handler = this.#plugin.app.vault.on(
            'modify',
            this.#handleFileModification.bind(this),
        )
    }

    /**
     * @note Run only when plugin is unloaded
     */
    public clear(): void {
        this.#plugin.app.vault.offref(this.#handler)
        this.#tracked.clear()
        this.#versions.clear()
    }

    /**
     * Reset versions cache.
     */
    public async resetCache(log: Logger): Promise<void> {
        // prevent cleaning on non designMode state
        if (!this.#plugin.isDesignModeEnabled) return
        await this.#fs.renewFolder(this.#fs.getCachePath())
        log.info('Cleared Versions Cache')
    }

    /**
     * Resolves a filepath into its latest cached version.
     */
    public resolveLatest(filepath: string): string {
        if (!this.#plugin.isDesignModeEnabled) return filepath
        return this.#versions.getFirst(filepath) ?? filepath
    }

    /**
     * Update cache registry when a file is modified.
     */
    async #handleFileModification(file: TAbstractFile): Promise<void> {
        if (!this.#plugin.isDesignModeEnabled) return
        if (!(file instanceof TFile)) return
        // ignore files outside of the `components_folder`
        // that are not been tracked
        if (
            !file.path.startsWith(this.#plugin.settings.components_folder) &&
            !this.#tracked.has(file.path)
        ) {
            return
        }

        //
        const group = this.#log.group()
        group.debug(`Listening changes on <${file.path}>`)

        group.debug('Listing affected files')
        const affected = this.#affectedFiles(file.path)
        group.trace('Listed affected files', affected)

        // cache new versions
        group.debug('Caching affected files')
        for (const item of affected) {
            const file = this.#fs.resolveFile(item)
            if (!file) {
                group.error(`Not Found <${item}>`)
                continue
            }
            const cachePath = await this.#cacheFile(file, group)
            this.#versions.prepend(item, cachePath)
        }
        group.debug('Cached affected files')

        await this.#refresher(affected, group)
        group.flush(`Listened changes on <${file.path}>`)
    }

    /**
     * Calculate all the files affected when a file changed,
     * and its correct order.
     */
    #affectedFiles(filepath: string): string[] {
        const directDependents = this.#tracked.get(filepath)
        const dependents = [filepath, ...directDependents]

        for (const dependent of directDependents) {
            dependents.push(...this.#affectedFiles(dependent))
        }

        // keep order of apperience
        return dependents.reverse().unique().reverse()
    }

    /**
     * Creates a temporal copy of the file on the cache folder.
     * If the file already exists a clone is created.
     *
     * @returns the cached filepath.
     */
    async #cacheFile(file: TFile, log: Logger): Promise<string> {
        const cacheHash = await this.#fs.getFileHash(file)
        const cacheName = `${file.basename}.${cacheHash}.${file.extension}`
        const cachePath = this.#fs.getCachePath(cacheName)

        // first time cached, should replace imports
        if (await this.#fs.missing(cachePath)) {
            log.debug(`Caching <${file.name}>`)
            await this.#fs.copy(file, cachePath, (content) => {
                return this.#replaceImports(file, content, log)
            })
            return cachePath
        }

        // n+1 time cached, imports are already replaced
        const timestamp = Date.now().toString()
        const cloneName = `${file.basename}.${cacheHash}-${timestamp}.${file.extension}`
        const clonePath = this.#fs.getCachePath(cloneName)

        log.debug(`Cloning <${cacheName}>`)
        await this.#fs.copy(cachePath, clonePath)
        return clonePath
    }

    /**
     * Replace the imports/require statements to allow dynamic resolution.
     */
    #replaceImports(file: TFile, content: string, log: Logger): string {
        const parentPath = file.parent?.path ?? ''
        return content.replaceAll(importsRegex(), ($0) => {
            const source = this.#fs.join(parentPath, $0)
            const latest = this.resolveLatest(source)
            log.trace(`Replacing import path <${latest}>`)
            return this.#fs.getRealPath(latest)
        })
    }

    /**
     * Index the content of the user **ComponentsFolder**
     * and all the imported/requested files.
     * @throws {Error}
     */
    public async indexComponents(log: Logger): Promise<void> {
        if (!this.#plugin.isDesignModeEnabled) return

        const componentsPath = this.#plugin.settings.components_folder
        const componentsFolder =
            this.#plugin.app.vault.getFolderByPath(componentsPath)
        if (!componentsFolder) {
            throw new Error(`path <${componentsPath}> is not a folder`)
        }

        log.info('Indexing Components')
        await this.#indexFolder(componentsFolder, log)
        log.debug('Indexed Components')
    }

    /**
     * Index all the files and subfiles in a folder.
     */
    async #indexFolder(folder: TFolder, log: Logger): Promise<void> {
        log.debug(`Indexing folder <${folder.path}>`)
        for (const child of folder.children) {
            if (child instanceof TFolder) await this.#indexFolder(child, log)
            else await this.#indexFile(child.path, log)
        }
        log.debug(`Indexed folder <${folder.path}>`)
    }

    /**
     * Index all the imported/requested files in a file.
     */
    async #indexFile(filepath: string, log: Logger): Promise<void> {
        // only index file, if it has not been indexed
        if (this.#tracked.hasValue(filepath)) return

        log.debug(`Indexing imports on <${filepath}>`)
        const parentPath = filepath.replace(/[\\/][^\\/]*$/gi, '')
        const content = await this.#fs.read(filepath)
        const imports: string[] = []

        for (const match of content.matchAll(importsRegex())) {
            const importedPath = this.#fs.join(parentPath, match[0] || '')
            log.trace(`file <${filepath}> imports <${importedPath}>`)
            this.#tracked.push(importedPath, filepath)
            imports.push(importedPath)
        }
        log.debug(`Indexed imports on <${filepath}>`)

        // index imports on imported files
        for (const importedPath of imports) {
            await this.#indexFile(importedPath, log)
        }
    }
}

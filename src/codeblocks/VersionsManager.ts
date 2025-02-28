import type { ComponentsPlugin } from '@/types'
import type { Logger } from '@luis.bs/obsidian-fnc'
import { EventRef, TAbstractFile, TFile, TFolder } from 'obsidian'
import { FilesystemAdapter, MapStore } from '@/utility'

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
        if (!(file instanceof TFile)) return

        const group = this.#log.group()
        group.debug('Listening changes on', file)

        group.debug('Listing affected files')
        const affected = await this.#affectedFiles(file, group)

        group.debug('Prepared affected files')
        await this.#refresher(affected, group)

        group.flush(`Listened changes on <${file.name}>`)
    }

    /**
     * Calculate all the files affected when a file changed
     */
    async #affectedFiles(changedFile: TFile, log: Logger): Promise<string[]> {
        const affectedFiles = [] as string[]
        const pendingFiles = [changedFile]

        // shared code
        const processDependencyTree = async (file: TFile) => {
            log.debug('Refreshing dependencies', file)
            await this.#indexDependencies(file, log)

            log.debug('Checking dependents', file)
            for (const dependent of this.#tracked.get(file.path)) {
                const dependentFile = this.#fs.resolveFile(dependent)
                if (dependentFile) pendingFiles.push(dependentFile)
                else log.warn('Not found', dependent)
            }
        }

        while (pendingFiles.length) {
            const file = pendingFiles.shift()
            // avoid circular dependencies
            if (!file || affectedFiles.includes(file.path)) continue

            // Template files
            if (['html', 'md'].includes(file.extension)) {
                // can be HotReloaded because it doesn't import
                log.debug('Affected Template', file)
                affectedFiles.push(file.path)
                continue
            }

            // CommonJS files
            if (file.extension === 'cjs') {
                // can be HotReloaded because the cache can be invalidated
                log.debug('Affected CommonJS', file)
                affectedFiles.push(file.path)

                log.debug('Deleting cache', file)
                // invalidate the CommonJS cache, to allow a fresh load
                const filepath = this.#fs.getAbsolutePath(file.path)
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete window.require.cache[window.require.resolve(filepath)]

                await processDependencyTree(file)
                continue
            }

            // the next formats require DesignMode to be HotReloaded
            if (!this.#plugin.isDesignModeEnabled) continue
            if (
                !this.#tracked.has(file.path) &&
                !file.path.startsWith(this.#plugin.settings.components_folder)
            ) {
                // ignore files not tracked outside of the `components_folder`
                continue
            }

            // ESModule files
            log.debug('Affected ESModule', file)
            affectedFiles.push(file.path)

            log.debug('Caching clone', file)
            const cachePath = await this.#cacheFile(file, log)
            this.#versions.prepend(file.path, cachePath)

            await processDependencyTree(file)
        }

        log.trace('Current cjs cache', { ...window.require.cache })
        return affectedFiles.unique()
    }

    /**
     * Creates a temporal copy of the file on the cache folder.
     * If the file already exists a clone is created.
     *
     * @returns the cached filepath.
     */
    async #cacheFile(file: TFile, log: Logger): Promise<string> {
        const cacheHash = await this.#fs.getFileHash(file)
        const cacheName = `${cacheHash}.${file.basename}.${file.extension}`
        const cachePath = this.#fs.getCachePath(cacheName)

        // first time cached
        if (await this.#fs.missing(cachePath)) {
            log.debug(`Caching <${file.name}> to <${cacheName}>`)
            await this.#fs.copy(file, cachePath, (content) => {
                return this.#replaceImports(file, content, log)
            })
            return cachePath
        }

        // n+1 time cached
        const timestamp = Date.now().toString()
        const cloneName = `${cacheHash}-${timestamp}.${file.basename}.${file.extension}`
        const clonePath = this.#fs.getCachePath(cloneName)

        log.debug(`Cloning <${cacheName}> to <${cloneName}>`)
        await this.#fs.copy(file, clonePath, (content) => {
            return this.#replaceImports(file, content, log)
        })
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
            return this.#fs.getAbsolutePath(latest)
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

        log.info('Indexing files')
        const pendingFiles = [componentsFolder] as TAbstractFile[]
        while (pendingFiles.length) {
            const file = pendingFiles.shift()
            if (file instanceof TFolder) {
                log.debug('Indexing folder', file)
                pendingFiles.push(...file.children)
                continue
            }

            // unexpected behavior
            if (!(file instanceof TFile)) continue

            // queue dependency files
            log.debug('Indexing file', file)
            for (const dependency of await this.#indexDependencies(file, log)) {
                const dependencyFile = this.#fs.resolveFile(dependency)
                if (dependencyFile) pendingFiles.push(dependencyFile)
                else log.warn('Not found', dependency)
            }
        }

        log.trace('Indexed files', {
            tracked: this.#tracked,
            versions: this.#versions,
        })
    }

    /**
     * Find all the imported/requested files in a file.
     */
    async #indexDependencies(file: TFile, log: Logger): Promise<string[]> {
        log.debug('Indexing dependencies', file)
        const parentPath = file.parent?.path ?? ''
        const content = await this.#fs.read(file.path)
        const dependencies: string[] = []

        for (const match of content.matchAll(importsRegex())) {
            const dependency = this.#fs.join(parentPath, match[0] || '')
            log.trace(`file <${file.name}> imports <${dependency}>`)
            this.#tracked.push(dependency, file.path)
            dependencies.push(dependency)
        }

        return dependencies
    }
}

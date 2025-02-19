import type { PluginSettings, PluginState } from './types'
import { App, Plugin, PluginManifest } from 'obsidian'
import { Logger, LogLevel } from '@luis.bs/obsidian-fnc'
import { prepareComponentMatchers, prepareComponentNames } from '@/utility'
import { SettingsTab } from './settings/SettingsTab'
import ComponentsAPI from './ComponentsAPI'
import CodeblockHandler from './codeblocks'

export const DEFAULT_SETTINGS: PluginSettings = {
    enable_codeblocks: false,
    enable_separators: false,
    usage_separator: '---',

    cache_folder: '__temp/',
    components_folder: '',
    components_config: [],
}

export default class ComponentsPlugin extends Plugin {
    public log = Logger.consoleLogger(ComponentsPlugin.name)

    public settings = {} as PluginSettings
    public state = {} as PluginState

    public api: ComponentsAPI
    #handler: CodeblockHandler

    constructor(app: App, manifest: PluginManifest) {
        super(app, manifest)

        // * always printing the first loadSettings()
        // * after that, the user-defined level is used
        this.log.setLevel(LogLevel.DEBUG)
        this.log.setFormat('[hh:mm:ss.ms] level:')

        this.api = new ComponentsAPI(this)
        this.#handler = new CodeblockHandler(this)

        // thrid-party API
        // @ts-expect-error non-standard API
        window.Components = this.api
    }

    async onload(): Promise<void> {
        await this.loadSettings()
        this.addSettingTab(new SettingsTab(this))
    }

    onunload(): void {
        const group = this.log.group('Clearing State')
        void this.#handler.clear(group)
        group.flush('Cleared State')
    }

    async loadSettings(): Promise<void> {
        const group = this.log.group('Loading Settings')
        const primitives = ((await this.loadData()) ||
            {}) as Partial<PluginSettings>

        // ensure a fallback value is present
        this.settings = Object.assign({}, DEFAULT_SETTINGS, primitives)
        group.debug('Loaded: ', this.settings)

        this.#prepareState(group)
        group.flush('Loaded Settings')
    }

    async saveSettings(): Promise<void> {
        const group = this.log.group('Saving Settings')
        const primitives = Object.assign({}, this.settings)
        // serialize special data types (Map, Set, etc)

        await this.saveData(primitives)
        group.debug('Saved: ', primitives)

        this.#prepareState(group)
        group.flush('Saved Settings')
    }

    #prepareState(log: Logger): void {
        log.info('Preparing state')

        const names = prepareComponentNames(this.settings)
        this.state = {
            components_enabled: names,
            components_matchers: prepareComponentMatchers(this.settings, names),
        }
        this.#handler.registerCodeblocks()
    }

    // Design Mode
    #designMode = false

    get isDesignModeEnabled(): boolean {
        return this.#designMode
    }

    /**
     * Controls when to enable the block file versioning.
     * > `Warning:` The versioning stores each edition of a file
     * > to provide a way to load the file changes on runtime
     * > this behavior will cause an increase on memory usage and
     * > storage usage, so it should be **disabled always**
     * > until the user enables it **manually**
     */
    public enableDesignMode(): void {
        if (this.#designMode) return
        this.#designMode = true
        void this.#handler.prepareDesignMode()
    }
}

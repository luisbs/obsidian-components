import type {
  PluginSettings,
  PluginState,
  PrimitivePluginSettings,
  RawPluginSettings,
} from './types'
import { App, Plugin, PluginManifest } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import { preparePluginState } from '@/utility'
import { FilesystemAdapter, VersionController } from './filesystem'
import { CodeblockHandler } from './codeblocks'
import { SettingsTab } from './settings/SettingsTab'
import ComponentAPI from './ComponentsAPI'

export const DEFAULT_SETTINGS: PrimitivePluginSettings = {
  enable_components: 'STRICT',
  enable_codeblocks: false,
  enable_separators: false,

  cache_folder: '__temp/',

  usage_method: 'INLINE',
  usage_naming: '__name',
  usage_separator: '---',

  components_naming: 'LONG',
  components_folder: '',
  components_found: {},
}

export default class ComponentsPlugin extends Plugin {
  #log = new Logger('ComponentsPlugin')

  public settings = {} as PluginSettings
  public state = {} as PluginState

  public api: ComponentAPI
  public fs: FilesystemAdapter
  public parser: CodeblockHandler
  public versions: VersionController

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest)

    this.api = new ComponentAPI(this)
    this.fs = new FilesystemAdapter(this)
    this.parser = new CodeblockHandler(this)
    this.versions = new VersionController(this)

    // thrid-party API
    // @ts-ignore non-standard API
    globalThis.Components = this.api
  }

  async onload(): Promise<void> {
    await this.loadSettings()
    this.addSettingTab(new SettingsTab(this))

    this.parser.registerCodeblocks()
  }

  async onunload(): Promise<void> {
    this.versions.clear()
    this.parser.clear()
  }

  async loadSettings(): Promise<void> {
    const log = this.#log.group('Loading Settings')
    const { enabled_formats, enabled_components, ...primitives } =
      (await this.loadData()) || {}

    this.settings = Object.assign({}, DEFAULT_SETTINGS, primitives)
    this.settings.enabled_formats = new Set(enabled_formats || [])
    this.settings.enabled_components = new Map(enabled_components || [])

    log.debug(this.settings)
    log.flush('Loaded Settings')

    // load runtime configuration
    preparePluginState(this)
  }

  async saveSettings(): Promise<void> {
    const log = this.#log.group('Saving Settings')
    log.debug(this.settings)

    const { enabled_formats, enabled_components, ...primitiveData } =
      this.settings

    const rawData = Object.assign({}, primitiveData) as RawPluginSettings
    rawData.enabled_formats = Array.from(enabled_formats)
    rawData.enabled_components = Array.from(enabled_components)

    await this.saveData(rawData)
    log.debug(rawData)
    log.flush('Saved Settings')

    preparePluginState(this)
    this.versions.clearCache()
    this.parser.registerCustomCodeblocks()
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
  public async enableDesignMode(): Promise<void> {
    if (this.#designMode) return
    this.#designMode = true

    await this.versions.clearCache()
    this.parser.refreshAll()
  }
}

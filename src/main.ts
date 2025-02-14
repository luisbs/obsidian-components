import type { PluginSettings, PluginState } from './types'
import { App, Plugin, PluginManifest } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import {
  parseStringList,
  prepareComponentMatchers,
  prepareComponentNames,
} from '@/utility'
import { SettingsTab } from './settings/SettingsTab'
import { FilesystemAdapter, VersionController } from './filesystem'
import { CodeblockHandler } from './codeblocks'
import { ComponentAPI } from './ComponentsAPI'


export const DEFAULT_SETTINGS: PluginSettings = {
  enable_codeblocks: false,
  enable_separators: false,

  cache_folder: '__temp/',

  usage_method: 'INLINE',
  usage_naming: '__name',
  usage_separator: '---',

  components_folder: '',
  components_config: [],
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
    // @ts-expect-error non-standard API
    window.Components = this.api
  }

  async onload(): Promise<void> {
    await this.loadSettings()
    this.parser.registerBaseCodeblock()
    this.addSettingTab(new SettingsTab(this))
  }

  async onunload(): Promise<void> {
    this.versions.clear()
    this.parser.clear()
  }

  async loadSettings(): Promise<void> {
    const log = this.#log.group('Loading Settings')
    const primitives = (await this.loadData()) || {}

    // ensure a fallback value is present
    this.settings = Object.assign({}, DEFAULT_SETTINGS, primitives)
    log.debug('Loaded: ', this.settings)
    log.flush('Loaded Settings')

    this.#prepareState()
  }

  async saveSettings(): Promise<void> {
    const log = this.#log.group('Saving Settings')
    const primitives = Object.assign({}, this.settings)
    // serialize special data types (Map, Set, etc)

    await this.saveData(primitives)
    log.debug('Saved: ', primitives)
    log.flush('Saved Settings')

    this.#prepareState()
  }

  #prepareState(): void {
    this.#log.info('Prepare state')
    const names = prepareComponentNames(this.settings)
    this.state = {
      name_params: parseStringList(this.settings.usage_naming),
      components_enabled: names,
      components_matchers: prepareComponentMatchers(this.settings, names),
    }

    //
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

    // clear so when components are re-render they start tracking
    // and the HotComponentReload works correctly
    await this.versions.clearCache()
    await this.versions.exploreComponentsFolder()
    this.parser.refreshAll()
  }
}

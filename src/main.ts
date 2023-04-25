import type {
  PluginSettings,
  PluginState,
  PrimitivePluginSettings,
  RawPluginSettings,
} from './types'
import { App, Plugin, PluginManifest } from 'obsidian'
import { CodeblockHandler } from './parsers'
import { SettingsTab } from './settings/SettingsTab'
import { preparePluginState } from './utility'
import { VersionController } from './filesystem/VersionController'
import FilesystemAdapter from './filesystem/FilesystemAdapter'

export const DEFAULT_SETTINGS: PrimitivePluginSettings = {
  enable_components: 'STRICT',
  enable_versioning: false,
  enable_codeblocks: false,

  naming_params: '__name',
  naming_method: 'INLINE',
  naming_strategy: 'LONG',

  components_folder: '',
  components_found: {},
}

export default class ComponentsPlugin extends Plugin {
  public settings = {} as PluginSettings
  public state = {} as PluginState

  public fs: FilesystemAdapter
  public parser: CodeblockHandler
  public versions: VersionController

  constructor(app: App, manifest: PluginManifest) {
    super(app, manifest)

    this.fs = new FilesystemAdapter(this)
    this.parser = new CodeblockHandler(this)
    this.versions = new VersionController(this)
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
    const rawData = (await this.loadData()) || {}

    console.debug('Loading Settings')
    console.debug(rawData)

    const {
      // prevent loading `enable_versioning`
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      enable_versioning,
      enabled_formats,
      enabled_components,
      ...primitiveData
    } = rawData

    // load primitives
    this.settings = Object.assign({}, DEFAULT_SETTINGS, primitiveData)

    // load non-primitives
    this.settings.enabled_formats = new Set(enabled_formats || [])
    this.settings.enabled_components = new Map(enabled_components || [])

    console.log('Loaded Settings')
    console.debug(this.settings)

    // load runtime configuration
    preparePluginState(this)
  }

  async saveSettings(): Promise<void> {
    console.debug('Saving Settings')
    console.debug(this.settings)

    const {
      // prevent storing `enable_versioning`
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      enable_versioning,
      enabled_formats,
      enabled_components,
      ...primitiveData
    } = this.settings

    // shallow copy primitives
    const rawData = Object.assign({}, primitiveData) as RawPluginSettings

    // convert non-primitives
    rawData.enabled_formats = Array.from(enabled_formats)
    rawData.enabled_components = Array.from(enabled_components)

    // store the data
    await this.saveData(rawData)

    console.log('Saved Settings')
    console.debug(rawData)

    // load runtime configuration
    preparePluginState(this)

    // register proccessors
    this.parser.registerCustomCodeblocks()
  }

  // external API
  public resolve(path: string): unknown {
    const resolvedPath = this.versions.resolveLastCachedVersion(path)
    console.debug(`Resolved "${resolvedPath}"`)
    return require(this.fs.getRealPath(resolvedPath))
  }
}

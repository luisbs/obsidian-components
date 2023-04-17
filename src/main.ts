import type {
  PluginSettings,
  PluginState,
  PrimitivePluginSettings,
  RawPluginSettings,
} from './types'
import path from 'path'
import { Plugin } from 'obsidian'
import { CodeblockHandler } from './parsers'
import { SettingsTab } from './settings/SettingsTab'
import { preparePluginState } from './utility'
import { CacheController } from './filesystem/CacheController'
import { VersionController } from './filesystem/VersionController'

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

  public cache: CacheController | null = null
  public versions: VersionController | null = null
  public parser: CodeblockHandler | null = null

  async onload(): Promise<void> {
    await this.loadSettings()
    this.addSettingTab(new SettingsTab(this))

    this.cache = new CacheController(this)
    this.versions = new VersionController(this)
    this.parser = new CodeblockHandler(this)
  }

  async onunload(): Promise<void> {
    this.cache?.clear()
    this.versions?.clear()
    this.parser?.clear()
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
    this.parser?.registerCustomCodeblocks()
  }

  /**
   * @returns the real path of the file on the os.
   */
  public getRealPath(filePath: string): string {
    //? simplier implementation
    //? not used cause `basePath` is not public/documentated
    //? so it may change as an internal implementation
    return path.resolve(this.app.vault.adapter.basePath, filePath)

    //! replaced by above, cause it make changes as URL
    //! like replaces ' ' (space) to '%20'
    //? `getResourcePath` adds a prefix and a postfix to identify file version
    //? it needs to be removed to be recognized as a real route
    return this.app.vault.adapter
      .getResourcePath(filePath)
      .replace(/app:\/\/local/i, '') // removes the prefix
      .replace(/^\/(?=[\w]+:)/i, '') // fix route for windows systems
      .replace(/\?\d+$/i, '') // removes the postfix
  }

  // external API
  public resolvePath(path: string): string {
    const resolvedPath = this.versions?.resolveLastCachedVersion(path) ?? path
    return this.getRealPath(resolvedPath)
  }
}

import type {
  PluginSettings,
  PluginState,
  PrimitivePluginSettings,
  RawPluginSettings,
} from './types'
import { Plugin } from 'obsidian'
import { CodeblockHandler } from './parsers'
import { SettingsTab } from './settings/SettingsTab'
import { preparePluginState } from './utility'

export const DEFAULT_SETTINGS: PrimitivePluginSettings = {
  enable_components: 'STRICT',
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

  protected parser: CodeblockHandler | null = null

  async onload() {
    await this.loadSettings()
    this.addSettingTab(new SettingsTab(this))
    this.parser = new CodeblockHandler(this)
  }

  async loadSettings() {
    const rawData = (await this.loadData()) || {}

    // console.debug('obsidian-components: Loading Data')
    // console.debug(rawData)

    const { enabled_formats, enabled_components, ...primitiveData } = rawData

    // load primitives
    this.settings = Object.assign({}, DEFAULT_SETTINGS, primitiveData)

    // load non-primitives
    this.settings.enabled_formats = new Set(enabled_formats || [])
    this.settings.enabled_components = new Map(enabled_components || [])

    console.debug('obsidian-components: Loaded Data')
    console.debug(this.settings)

    // load runtime configuration
    preparePluginState(this)
  }

  async saveSettings() {
    // console.debug('obsidian-components: Saving Data')
    // console.debug(this.settings)

    const { enabled_formats, enabled_components, ...primitiveData } =
      this.settings

    // shallow copy primitives
    const rawData = Object.assign({}, primitiveData) as RawPluginSettings

    // convert non-primitives
    rawData.enabled_formats = Array.from(enabled_formats)
    rawData.enabled_components = Array.from(enabled_components)

    // store the data
    await this.saveData(rawData)

    console.debug('obsidian-components: Saved Data')
    console.debug(rawData)

    // load runtime configuration
    preparePluginState(this)

    // register proccessors
    this.parser?.registerCustomCodeblocks()
  }
}

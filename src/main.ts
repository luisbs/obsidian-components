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
    const { formats_enabled, ...primitiveData } = (await this.loadData()) || {}

    // load primitives
    this.settings = Object.assign({}, DEFAULT_SETTINGS, primitiveData)

    // load non-primitives
    this.settings.formats_enabled = new Set(formats_enabled || [])

    // load runtime configuration
    preparePluginState(this)
  }

  async saveSettings() {
    const { formats_enabled, ...primitiveData } = this.settings

    // shallow copy primitives
    const rawData = Object.assign({}, primitiveData) as RawPluginSettings

    // convert non-primitives
    rawData.formats_enabled = Array.from(formats_enabled)

    // store the data
    await this.saveData(rawData)

    // load runtime configuration
    preparePluginState(this)

    // register proccessors
    this.parser?.registerCustomCodeblocks()
  }
}

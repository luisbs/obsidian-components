import type { PluginSettings, PluginState } from './types'
import { Plugin } from 'obsidian'
import { CodeblockHandler } from './parsers'
import { SettingsTab } from './settings/SettingsTab'
import { preparePluginState } from './utility'

export const DEFAULT_SETTINGS: PluginSettings = {
  enable_components: 'STRICT',
  enable_codeblocks: false,

  naming_params: '__name',
  naming_method: 'INLINE',
  naming_strategy: 'LONG',

  formats_enabled: [],

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
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
    preparePluginState(this)
  }

  async saveSettings() {
    await this.saveData(this.settings)

    // update procesors
    preparePluginState(this)
    this.parser?.registerCustomCodeblocks()
  }
}

import type { PluginSettings } from './types'
import { Plugin } from 'obsidian'
import { CodeblockHandler } from './parsers'
import { SettingsTab } from './settings/SettingsTab'

export const DEFAULT_SETTINGS: PluginSettings = {
  enable_fragments: 'STRICT',
  enable_codeblocks: false,

  naming_method: 'INLINE',
  naming_strategy: 'LONG',

  formats_enabled: [],

  fragments_folder: '',
  fragments_found: {},

  current_fragments: {},
  current_codeblocks: {},
}

export default class FragmentsPlugin extends Plugin {
  public settings = {} as PluginSettings
  protected parser: CodeblockHandler | null = null

  async onload() {
    await this.loadSettings()
    this.addSettingTab(new SettingsTab(this))
    this.parser = new CodeblockHandler(this)
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}

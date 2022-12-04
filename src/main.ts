import type { PluginSettings } from './types'
import { Plugin } from 'obsidian'
import { CodeblockHandler } from './parsers'
import { DEFAULT_SETTINGS, FragmentsSettingsTab } from './settings'

export default class FragmentsPlugin extends Plugin {
  public settings = {} as PluginSettings
  protected parser: CodeblockHandler | null = null

  async onload() {
    await this.loadSettings()
    this.addSettingTab(new FragmentsSettingsTab(this))

    this.parser = new CodeblockHandler(this)
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData())
  }

  async saveSettings() {
    await this.saveData(this.settings)
  }
}

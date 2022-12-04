import { PluginSettingTab, Setting } from 'obsidian'
import { FolderSuggester } from 'obsidian-fnc'
import type { FragmentsPlugin, PluginSettings } from '@/types'
import { loadFragmentsOnVault } from '@/utility/fragmentTools'
import { renderFormatsTable } from './renderFormatsTable'
import { renderFragmentsTable } from './renderFragmentsTable'
import { resolveFragmentsNames } from '@/utility'

export const DEFAULT_SETTINGS: PluginSettings = {
  // ! By default deny to keep security
  // ! of code execution
  default_behavior: 'DENY',
  naming_strategy: 'LONG',
  resolution_names: {},

  fragments_folder: '',
  fragments_found: {},
  fragments_enabled: [],

  formats_custom: [],
  formats_enabled: [],
}

export class FragmentsSettingsTab extends PluginSettingTab {
  #plugin: FragmentsPlugin
  settings: PluginSettings

  #tablesEl: HTMLDivElement

  constructor(plugin: FragmentsPlugin) {
    super(plugin.app, plugin)
    this.#plugin = plugin
    this.settings = plugin.settings
    this.#tablesEl = createDiv()
  }

  update(key: keyof PluginSettings, value: unknown) {
    // @ts-expect-error dynamic assignation
    this.settings[key] = value
    this.settings.resolution_names = resolveFragmentsNames(this.settings)
    this.#plugin.saveSettings()

    // refresh the settings view
    this.#displaySettingsTables()
  }

  display(): void {
    this.containerEl.empty()
    this.containerEl.addClass('fragments-settings')

    this.#displayGeneralSettings()
    this.#tablesEl = this.containerEl.createDiv()
    this.#displaySettingsTables()
  }

  #displayGeneralSettings(): void {
    this.#newSetting().setName('Plugin Settings').setHeading()

    this.#newSetting()
      .setName('Fragments templates folder.')
      .setDesc('Files in this directory will be taken as fragments.')
      .addText((text) => {
        new FolderSuggester(this.app, text.inputEl, this.containerEl)
        text
          .setPlaceholder('Example: folder1/folder2')
          .setValue(this.settings.fragments_folder)
          .onChange((value) => this.update('fragments_folder', value))
      })

    this.#newSetting()
      .setName('Plugin Behavior')
      .setDesc('Security behavior when runing the fragments.')
      .addDropdown((input) => {
        input
          .addOptions({
            DENY: 'Only fragments enabled by the user. (recomended)',
            ALLOW_ENABLED: 'Fragments and formats enabled by the user.',
            ALLOW_ALL: 'Allow all the fragments',
          })
          .setValue(this.settings.default_behavior)
          .onChange((value) => this.update('default_behavior', value))
      })

    this.#displayStrategySetting()
  }

  #displayStrategySetting(): void {
    const strategyDesc = createFragment()
    strategyDesc.appendText('Strategy used for using the fragments.')
    strategyDesc.createEl('br')
    // prettier-ignore
    strategyDesc.appendText('In cases of naming collition the names are going to be assigned incrementally in the next order.')
    // prettier-ignore
    strategyDesc.createEl('ul', undefined, (ul) => {
      ul.createEl('li', { text: 'Short names: like `book`.' })
      ul.createEl('li', { text: 'Long names: like `folder/book`.' })
      ul.createEl('li', { text: 'Full names: like `full/vault/path/book`.' })
    })

    this.#newSetting()
      .setName('Fragments naming strategy.')
      .setDesc(strategyDesc)
      .addDropdown((input) => {
        input
          .addOptions({
            SHORT: 'Only the shortest names.',
            LONG: 'Include the shortest and long names (recomended).',
            ALL: 'Include all names',
          })
          .setValue(this.settings.naming_strategy)
          .onChange((value) => this.update('naming_strategy', value))
      })
  }

  #displaySettingsTables(): void {
    this.#tablesEl.empty()

    new Setting(this.#tablesEl).setName('Fragments').setHeading()
    renderFragmentsTable(
      this.#tablesEl,
      this.settings,
      (value) => this.update('fragments_enabled', value),
      () => {
        const fragments = loadFragmentsOnVault(
          this.#plugin.app.vault,
          this.settings,
        )
        this.update('fragments_found', fragments)
      },
    )

    new Setting(this.#tablesEl).setName('Fragment Formats').setHeading()
    renderFormatsTable(this.#tablesEl, this.settings, (value) => {
      this.update('formats_enabled', value)
    })
  }

  #newSetting() {
    return new Setting(this.containerEl)
  }
}

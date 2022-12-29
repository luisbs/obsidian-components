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

  naming_method: 'INLINE',
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
    this.#displayParserSettings()
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
  }

  #displayParserSettings(): void {
    this.#newSetting().setName('Parser').setHeading()
    this.#displayMethodSetting()
    this.#displayStrategySetting()
  }

  #displayMethodSetting(): void {
    const methodDesc = createFragment()
    // prettier-ignore
    methodDesc.createEl('ul', undefined, (ul) => {
      ul.createEl('li', undefined, (li) => li.append('Inline names: like', createEl('code', { text: "'```use book```'" })))
      ul.createEl('li', undefined, (li) => li.append('Param names: like', createEl('code', { text: `'__name: "book"'` }), '(inside the codeblock)'))
    })

    /** Stores the naming method for the vault. */

    this.#newSetting()
      .setName('Codeblock fragment naming method')
      .setDesc(methodDesc)
      .addDropdown((input) => {
        input.addOptions({
          INLINE: 'Use inline names',
          PARAM: 'Use param names',
          BOTH: 'Use both methods',
        })
        input.setValue(this.settings.naming_method)
        input.onChange((value) => this.update('naming_method', value))
      })
  }

  #displayStrategySetting(): void {
    const strategyDesc = createFragment()
    strategyDesc.appendText('Strategy used for using the fragments.')
    strategyDesc.createEl('br')
    // prettier-ignore
    strategyDesc.appendText('In cases of naming collition the names are going to be assigned incrementally in the next order.')
    // prettier-ignore
    strategyDesc.createEl('ul', undefined, (ul) => {
      ul.createEl('li', undefined, (li) => li.append('Short names: like', createEl('code', { text: "'book'" })))
      ul.createEl('li', undefined, (li) => li.append('Long names: like', createEl('code', { text: "'folder/book'" })))
      ul.createEl('li', undefined, (li) => li.append('Full names: like', createEl('code', { text: "'full/vault/path/book'" })))
    })

    this.#newSetting()
      .setName('Fragments naming strategy.')
      .setDesc(strategyDesc)
      .addDropdown((input) => {
        input.addOptions({
          SHORT: 'Only the shortest names.',
          LONG: 'Include the short and long names (recomended).',
          ALL: 'Include all names',
        })
        input.setValue(this.settings.naming_strategy)
        input.onChange((value) => this.update('naming_strategy', value))
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

import type { FragmentsPlugin, PluginSettings } from '@/types'
import { PluginSettingTab, Setting } from 'obsidian'
import { FolderSuggester } from 'obsidian-fnc'
import { loadFragmentsOnVault, resolveFragmentsNames } from '@/utility'
import { FormatsTable, FragmentsTable } from './components'

export const DEFAULT_SETTINGS: PluginSettings = {
  // ! By default deny to keep security
  // ! of code execution
  default_behavior: 'DENY',

  naming_method: 'INLINE',
  naming_strategy: 'LONG',
  resolution_names: {},

  fragments_folder: '',
  fragments_found: {},

  formats_custom: [],
  formats_enabled: [],
}

export class FragmentsSettingsTab extends PluginSettingTab {
  #plugin: FragmentsPlugin
  settings: PluginSettings

  #fragmentsTable?: FragmentsTable
  #formatsTable?: FormatsTable

  constructor(plugin: FragmentsPlugin) {
    super(plugin.app, plugin)
    this.#plugin = plugin
    this.settings = plugin.settings
  }

  saveChanges(refresh = true): void {
    this.settings.resolution_names = resolveFragmentsNames(this.settings)
    this.#plugin.saveSettings()

    if (!refresh) return
    this.#fragmentsTable?.refresh()
    this.#formatsTable?.refresh()
  }

  update(key: keyof PluginSettings, value: unknown, refresh = true) {
    // @ts-expect-error dynamic assignation
    this.settings[key] = value
    this.saveChanges(refresh)
  }

  display(): void {
    this.containerEl.empty()
    this.containerEl.addClass('fragments-settings')

    this.#newSetting().setName('Plugin Settings').setHeading()
    this.#displayGeneralSettings()

    this.#newSetting().setName('Fragments Settings').setHeading()
    this.#displayFragmentsSettings()

    this.#fragmentsTable = new FragmentsTable(
      this.containerEl,
      this.settings,
      this.saveChanges.bind(this),
      () => {
        const fragments = loadFragmentsOnVault(
          this.#plugin.app.vault,
          this.settings,
        )
        this.update('fragments_found', fragments, false)
      },
    )

    this.#newSetting().setName('Formats Settings').setHeading()
    this.#formatsTable = new FormatsTable(
      this.containerEl, //
      this.settings,
      this.saveChanges.bind(this),
    )

    this.#fragmentsTable.render()
    this.#formatsTable.render()
  }

  #displayGeneralSettings(): void {
    this.#newSetting()
      .setName('Default execution behavior')
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

    //
    // Codeblock naming method
    const methodDesc = createFragment()
    // prettier-ignore
    methodDesc.createEl('ul', undefined, (ul) => {
      ul.createEl('li', undefined, (li) => li.append('Inline names: like', createEl('code', { text: "'```use book```'" })))
      ul.createEl('li', undefined, (li) => li.append('Param names: like', createEl('code', { text: `'__name: "book"'` }), '(inside the codeblock)'))
    })

    this.#newSetting()
      .setName('Codeblock naming method')
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

  #displayFragmentsSettings(): void {
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

    //
    // Naming strategy setting
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

  #newSetting() {
    return new Setting(this.containerEl)
  }
}

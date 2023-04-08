import type { ComponentsPlugin, PluginSettings } from '@/types'
import { PluginSettingTab, Setting } from 'obsidian'
import { FolderSuggester } from 'obsidian-fnc'
import { loadComponentsOnVault } from '@/utility'
import { FormatsTable, ComponentsTable } from './components'

export class SettingsTab extends PluginSettingTab {
  #plugin: ComponentsPlugin
  settings: PluginSettings

  #componentsTable?: ComponentsTable
  #formatsTable?: FormatsTable

  constructor(plugin: ComponentsPlugin) {
    super(plugin.app, plugin)
    this.#plugin = plugin
    this.settings = plugin.settings
  }

  async saveChanges(): Promise<void> {
    await this.#plugin.saveSettings()
    this.#componentsTable?.refresh()
    this.#formatsTable?.refresh()
  }

  update(key: keyof PluginSettings, value: unknown) {
    // @ts-expect-error dynamic assignation
    this.settings[key] = value
    this.saveChanges()
  }

  display(): void {
    this.containerEl.empty()
    this.containerEl.addClass('components-settings')

    this.#newSetting().setName('Plugin Settings').setHeading()
    this.#displayGeneralSettings()

    this.#newSetting().setName('Usage Settings').setHeading()
    this.#displayUsageSettings()

    this.#newSetting().setName('Components Settings').setHeading()
    this.#displayComponentsSettings()

    this.#componentsTable = new ComponentsTable(
      this.containerEl,
      this.#plugin,
      this.saveChanges.bind(this),
      () => {
        // is expected that this callback refreshes the ComponentsTable
        const components = loadComponentsOnVault(
          this.#plugin.app.vault,
          this.settings,
        )
        this.update('components_found', components)
      },
    )

    this.#newSetting().setName('Formats Settings').setHeading()
    this.#formatsTable = new FormatsTable(
      this.containerEl, //
      this.settings,
      this.saveChanges.bind(this),
    )

    this.#componentsTable.render()
    this.#formatsTable.render()
  }

  #displayGeneralSettings(): void {
    this.#newSetting()
      .setName('Default execution behavior')
      .setDesc('Security behavior when runing the components.')
      .addDropdown((input) => {
        input
          .addOptions({
            STRICT: 'Only components enabled by the user. (recomended)',
            FLEXIBLE: 'Components and formats enabled by the user.',
            ALL: 'Allow all the components',
          })
          .setValue(this.settings.enable_components)
          .onChange(this.update.bind(this, 'enable_components'))
      })
  }

  #displayUsageSettings(): void {
    const methodDesc = createFragment()
    methodDesc.createEl('ul', undefined, (ul) => {
      ul.createEl('li').append(
        'Inline names: like',
        createEl('code', { text: "'```use book```'" }),
      )
      ul.createEl('li').append(
        'Param names: like',
        createEl('code', { text: `'__name: "book"'` }),
        '(inside the codeblock)',
      )
    })

    this.#newSetting()
      .setName('Base Codeblock usage method')
      .setDesc(methodDesc)
      .addDropdown((input) => {
        input.addOptions({
          INLINE: 'Use inline names',
          PARAM: 'Use param names',
          BOTH: 'Use both methods',
        })
        input.setValue(this.settings.naming_method)
        input.onChange(this.update.bind(this, 'naming_method'))
      })

    this.#newSetting()
      .setName('Base Codeblock name parameters')
      .setDesc('Defines the parameters used to identify a component')
      .addTextArea((input) => {
        input.setValue(this.settings.naming_params)
        input.onChange(this.update.bind(this, 'naming_params'))
      })

    this.#newSetting()
      .setName('Enable custom Codeblocks?')
      .setDesc('Allows to use the components custom names as codeblocks')
      .addToggle((input) => {
        input
          .setValue(this.settings.enable_codeblocks)
          .onChange(this.update.bind(this, 'enable_codeblocks'))
      })
  }

  #displayComponentsSettings(): void {
    this.#newSetting()
      .setName('Components templates folder.')
      .setDesc('Files in this directory will be taken as components.')
      .addText((text) => {
        new FolderSuggester(this.app, text.inputEl, this.containerEl)
        text
          .setPlaceholder('Example: folder1/folder2')
          .setValue(this.settings.components_folder)
          .onChange(this.update.bind(this, 'components_folder'))
      })

    //
    // Naming strategy setting
    const strategyDesc = createFragment()
    strategyDesc.appendText('Strategy used for using the components.')
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
      .setName('Components naming strategy.')
      .setDesc(strategyDesc)
      .addDropdown((input) => {
        input.addOptions({
          SHORT: 'Only the shortest names.',
          LONG: 'Include the short and long names (recomended).',
          ALL: 'Include all names',
        })
        input.setValue(this.settings.naming_strategy)
        input.onChange(this.update.bind(this, 'naming_strategy'))
      })
  }

  #newSetting() {
    return new Setting(this.containerEl)
  }
}

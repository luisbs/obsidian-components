import type { ComponentsPlugin, PluginSettings } from '@/types'
import type { TextAreaComponent, TextComponent } from 'obsidian'
import { PluginSettingTab, Setting } from 'obsidian'
import { FolderSuggester } from 'obsidian-fnc'
import { loadComponentsOnVault } from '@/utility'
import { FormatsTable, ComponentsTable } from './components'

// prettier-ignore
function createDocsLink(id: string, text: string): HTMLAnchorElement {
  return createEl('a', { text, href: "https://github.com/luisbs/obsidian-components/blob/main/docs/settings.md#" + id })
}

export class SettingsTab extends PluginSettingTab {
  #plugin: ComponentsPlugin
  #settings: PluginSettings

  #componentsTable?: ComponentsTable
  #formatsTable?: FormatsTable

  constructor(plugin: ComponentsPlugin) {
    super(plugin.app, plugin)
    this.#plugin = plugin
    this.#settings = plugin.settings
  }

  async saveChanges(): Promise<void> {
    await this.#plugin.saveSettings()
    this.#componentsTable?.refresh()
    this.#formatsTable?.refresh()
  }

  update(key: keyof PluginSettings, value: unknown) {
    // @ts-expect-error dynamic assignation
    this.#settings[key] = value
    this.saveChanges()
  }

  display(): void {
    this.containerEl.empty()
    this.containerEl.addClass('components-settings')

    this.#newSetting().setName('Plugin Settings').setHeading()
    this.#displayGeneralSettings()

    this.#newSetting().setName('Codeblocks Settings').setHeading()
    this.#displayCodeblocksSettings()

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
          this.#settings,
        )
        this.update('components_found', components)
      },
    )

    this.#newSetting().setName('Formats Settings').setHeading()
    this.#formatsTable = new FormatsTable(
      this.containerEl, //
      this.#settings,
      this.saveChanges.bind(this),
    )

    this.#componentsTable.render()
    this.#formatsTable.render()
  }

  #displayGeneralSettings(): void {
    const behaviorDesc = createFragment((div) => {
      div.append(
        'Security behavior when runing the components.',
        createEl('br'),
        'For more details see ',
        createDocsLink('execution-behavior-setting', 'execution behavior'),
        '.',
      )
    })

    this.#newSetting()
      .setName('Execution behavior')
      .setDesc(behaviorDesc)
      .addDropdown((input) => {
        input.addOptions({
          STRICT: 'Only components enabled by the user. (recomended)',
          FLEXIBLE: 'Components and formats enabled by the user.',
          ALL: 'Allow all the components',
        })
        input.setValue(this.#settings.enable_components)
        input.onChange(this.update.bind(this, 'enable_components'))
      })

    //
    // Design mode setting
    const modeDesc = createFragment((div) => {
      div.append(
        "Enable design mode only if you're editing your components code.",
        createEl('br'),
        'It will not disabled until you close the app.',
        createEl('br'),
        'For more details see ',
        createDocsLink('design-mode-setting', 'design mode'),
        '.',
      )
    })

    this.#newSetting()
      .setName('Design mode')
      .setDesc(modeDesc)
      .addToggle((input) => {
        const enabled = this.#plugin.isDesignModeEnabled
        input.setDisabled(enabled)
        input.setValue(enabled)
        input.onChange((value) => {
          // allows only enable
          if (enabled) return
          input.setDisabled(true)
          this.#plugin.enableDesignMode()
        })
      })
  }

  #displayCodeblocksSettings(): void {
    // Custom codeblocks setting
    const codeblocksDesc = createFragment((div) => {
      div.append(
        'Allows the usage of the components custom names as codeblocks identifiers.',
        createEl('br'),
        'For more details see ',
        createDocsLink('custom-codeblocks-setting', 'custom codeblocks'),
        '.',
      )
    })

    this.#newSetting()
      .setName('Custom Codeblocks')
      .setDesc(codeblocksDesc)
      .addToggle((input) => {
        input.setValue(this.#settings.enable_codeblocks)
        input.onChange(this.update.bind(this, 'enable_codeblocks'))
      })

    //
    const isDisabled = (value: string): boolean => value === 'INLINE'
    let namingMethodInput: TextAreaComponent | null = null

    const methodDesc = createFragment((div) => {
      div.createEl('ul', undefined, (ul) => {
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
        input.setValue(this.#settings.usage_method)
        input.onChange((value) => {
          this.update('usage_method', value)
          namingMethodInput?.setDisabled(isDisabled(value))
        })
      })

    this.#newSetting()
      .setName('Base Codeblock name parameters')
      .setDesc('Defines the parameters used to identify a component.')
      .addTextArea((input) => {
        namingMethodInput = input
        input.setDisabled(isDisabled(this.#settings.usage_method))
        input.setValue(this.#settings.usage_naming)
        input.onChange(this.update.bind(this, 'usage_naming'))
      })

    //
    //
    //
    let usageSeparatorInput: TextComponent | null = null

    const separatorDesc = createFragment((div) => {
      div.append(
        'Allows the usage of separators inside codeblocks.',
        createEl('br'),
        'For more details see ',
        createDocsLink('codeblocks-separators-setting', 'codeblock separators'),
        '.',
      )
    })

    this.#newSetting()
      .setName('Enable Codeblocks Separators')
      .setDesc(separatorDesc)
      .addToggle((input) => {
        input.setValue(this.#settings.enable_separators)
        input.onChange((value) => {
          this.update('enable_separators', value)
          usageSeparatorInput?.setDisabled(!value)
        })
      })

    this.#newSetting()
      .setName('Codeblocks Separator')
      .setDesc('Separator to use inside codeblocks.')
      .addText((input) => {
        usageSeparatorInput = input
        input.setDisabled(!this.#settings.enable_separators)
        input.setValue(this.#settings.usage_separator)
        input.onChange(this.update.bind(this, 'usage_separator'))
      })
  }

  #displayComponentsSettings(): void {
    const attachPathHandler = (
      key: keyof PluginSettings,
      input: TextComponent,
      logs: HTMLElement,
    ) => {
      input.onChange(async (path: string) => {
        logs.empty()

        if (!path || path === '/' || (await this.#plugin.fs.missing(path))) {
          input.inputEl.classList.add('invalid-value')
          logs.appendText('Invalid path.')
          return
        }

        input.inputEl.classList.remove('invalid-value')
        this.update(key, path)
      })
    }

    //
    // Components folder setting
    const sourceDesc = createFragment()
    sourceDesc.append('Files in this directory will be taken as components.')
    const sourceLog = sourceDesc.createEl('p', 'invalid-value')

    this.#newSetting()
      .setName('Components templates folder')
      .setDesc(sourceDesc)
      .addText((input) => {
        new FolderSuggester(this.app, input.inputEl, this.containerEl)
        input.setPlaceholder('Example: folder1/folder2')
        input.setValue(this.#settings.components_folder)
        attachPathHandler('components_folder', input, sourceLog)
      })

    //
    // Cache folder setting
    const cacheDesc = createFragment()
    cacheDesc.append('Folder used to cache pre-processed components.')
    const cacheLog = cacheDesc.createEl('p', 'invalid-value')

    this.#newSetting()
      .setName('Components cache folder')
      .setDesc(cacheDesc)
      .addText((input) => {
        new FolderSuggester(this.app, input.inputEl, this.containerEl)
        input.setPlaceholder('Example: folder1/folder2')
        input.setValue(this.#settings.cache_folder)
        attachPathHandler('cache_folder', input, cacheLog)
      })

    //
    // Naming strategy setting
    const strategyDesc = createFragment((div) => {
      div.append(
        'Strategy used for using the components.',
        createEl('br'),
        'In cases of naming collition the names are going to be assigned incrementally in the next order.',
        // prettier-ignore
        createEl('ul', undefined, (ul) => {
          ul.createEl('li', undefined, (li) => li.append('Short names: like', createEl('code', { text: "'book'" })))
          ul.createEl('li', undefined, (li) => li.append('Long names: like', createEl('code', { text: "'folder/book'" })))
          ul.createEl('li', undefined, (li) => li.append('Full names: like', createEl('code', { text: "'full/vault/path/book'" })))
        }),
      )
    })

    this.#newSetting()
      .setName('Components naming strategy')
      .setDesc(strategyDesc)
      .addDropdown((input) => {
        input.addOptions({
          CUSTOM: 'Only use custom names.',
          SHORT: 'Only the shortest names.',
          LONG: 'Short and long names.',
          ALL: 'Include all names',
        })
        input.setValue(this.#settings.components_naming)
        input.onChange(this.update.bind(this, 'components_naming'))
      })
  }

  #newSetting() {
    return new Setting(this.containerEl)
  }
}

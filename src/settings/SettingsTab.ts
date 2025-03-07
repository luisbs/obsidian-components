import type { ComponentsPlugin, PluginSettings } from '@/types'
import { PluginSettingTab, Setting, TextComponent } from 'obsidian'
import { FolderSuggester } from '@luis.bs/obsidian-fnc'
import { FilesystemAdapter, prepareHash } from '@/utility'
import { SettingsTabComponents } from './SettingsTabComponents'
import { LEVEL_LABELS } from './values'

export function docs(name: string, desc: string): DocumentFragment {
    return createFragment((div) => {
        div.appendText(desc + '. Check the ')
        div.createEl('a', {
            text: 'Docs',
            href: `https://github.com/luisbs/obsidian-components/blob/main/docs/settings.md#${prepareHash(name)}`,
        })
        div.appendText('.')
    })
}

export class SettingsTab extends PluginSettingTab {
    #plugin: ComponentsPlugin
    #fs: FilesystemAdapter

    constructor(plugin: ComponentsPlugin) {
        super(plugin.app, plugin)
        this.#plugin = plugin
        this.#fs = new FilesystemAdapter(plugin)
    }

    async #update(key: keyof PluginSettings, value: unknown): Promise<void> {
        // @ts-expect-error dynamic assignation
        this.#plugin.settings[key] = value
        await this.#plugin.saveSettings()
    }

    display(): void {
        this.containerEl.empty()
        this.containerEl.addClass('components-settings')

        new Setting(this.containerEl).setName('Plugin Settings').setHeading()
        this.#displayGeneralSettings()

        new Setting(this.containerEl).setName('Codeblock Settings').setHeading()
        this.#displayCodeblocksSettings()

        new Setting(this.containerEl).setName('Component Settings').setHeading()
        this.#displayComponentsSettings()

        new SettingsTabComponents(this.#plugin, this.containerEl)
    }

    #displayGeneralSettings(): void {
        const levelSetting = new Setting(this.containerEl)
        levelSetting.setName('Plugging LogLevel')
        levelSetting.setDesc(
            docs('Plugging LogLevel', 'To check the plugin logs'),
        )
        levelSetting.addDropdown((dropdown) => {
            dropdown.addOptions(LEVEL_LABELS)
            dropdown.setValue(this.#plugin.settings.plugin_level)
            dropdown.onChange(this.#update.bind(this, 'plugin_level'))
        })

        const modeSetting = new Setting(this.containerEl)
        modeSetting.setName('Design mode')
        modeSetting.setDesc(
            docs(
                'Design mode',
                "Enable design mode only if you're editing your components code. It will not disabled until you close the app",
            ),
        )
        modeSetting.addToggle((input) => {
            const enabled = this.#plugin.isDesignModeEnabled
            input.setDisabled(enabled)
            input.setValue(enabled)
            input.onChange(() => {
                // allows only enable
                if (enabled) return
                input.setDisabled(true)
                this.#plugin.enableDesignMode()
            })
        })
    }

    #displayCodeblocksSettings(): void {
        const codeblockSettings = new Setting(this.containerEl)
        codeblockSettings.setName('Custom Codeblocks')
        codeblockSettings.setDesc(
            docs(
                'Custom Codeblocks',
                'Allows the usage of the components custom names as codeblocks identifiers',
            ),
        )
        codeblockSettings.addToggle((input) => {
            input.setValue(this.#plugin.settings.enable_codeblocks)
            input.onChange(this.#update.bind(this, 'enable_codeblocks'))
        })

        //
        let usageSeparatorInput: TextComponent | null = null
        const enableSeparatorSettings = new Setting(this.containerEl)
        enableSeparatorSettings.setName('Enable Codeblocks Separators')
        enableSeparatorSettings.setDesc(
            docs(
                'Enable Codeblocks Separators',
                'Allows the usage of separators inside codeblocks',
            ),
        )
        enableSeparatorSettings.addToggle((input) => {
            input.setValue(this.#plugin.settings.enable_separators)
            input.onChange((value) => {
                void this.#update('enable_separators', value)
                usageSeparatorInput?.setDisabled(!value)
            })
        })

        const separatorSetting = new Setting(this.containerEl)
        separatorSetting.setName('Codeblocks Separator')
        separatorSetting.setDesc('Separator to use inside codeblocks.')
        separatorSetting.addText((input) => {
            usageSeparatorInput = input
            input.setDisabled(!this.#plugin.settings.enable_separators)
            input.setValue(this.#plugin.settings.usage_separator)
            input.onChange(this.#update.bind(this, 'usage_separator'))
        })
    }

    #displayComponentsSettings(): void {
        const attachPathHandler = (
            key: keyof PluginSettings,
            input: TextComponent,
            logs: HTMLElement,
        ) => {
            input.onChange((path: string) => {
                logs.empty()

                if (!path || path === '/' || this.#fs.missing(path)) {
                    input.inputEl.classList.add('invalid-value')
                    logs.appendText('Invalid path.')
                    return
                }

                input.inputEl.classList.remove('invalid-value')
                void this.#update(key, path)
            })
        }

        //
        // Components folder setting
        const sourceDesc = createFragment()
        sourceDesc.append(
            'Files in this directory will be taken as components.',
        )
        const sourceLog = sourceDesc.createEl('p', 'invalid-value')

        const componentsfolderSetting = new Setting(this.containerEl)
        componentsfolderSetting.setName('Components templates folder')
        componentsfolderSetting.setDesc(sourceDesc)
        componentsfolderSetting.addText((input) => {
            new FolderSuggester(this.app, input.inputEl, this.containerEl)
            input.setPlaceholder('Example: folder1/folder2')
            input.setValue(this.#plugin.settings.components_folder)
            attachPathHandler('components_folder', input, sourceLog)
        })

        //
        // Cache folder setting
        const cacheDesc = createFragment()
        cacheDesc.append('Folder used to cache pre-processed components.')
        const cacheLog = cacheDesc.createEl('p', 'invalid-value')

        const cachefolderSetting = new Setting(this.containerEl)
        cachefolderSetting.setName('Components cache folder')
        cachefolderSetting.setDesc(cacheDesc)
        cachefolderSetting.addText((input) => {
            new FolderSuggester(this.app, input.inputEl, this.containerEl)
            input.setPlaceholder('Example: folder1/folder2')
            input.setValue(this.#plugin.settings.cache_folder)
            attachPathHandler('cache_folder', input, cacheLog)
        })
    }
}

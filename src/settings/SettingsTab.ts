import type { ComponentsPlugin, PluginSettings } from '@/types'
import type { TextAreaComponent, TextComponent } from 'obsidian'
import { PluginSettingTab, Setting } from 'obsidian'
import { FolderSuggester } from '@luis.bs/obsidian-fnc'
import { SettingsTabComponents } from './SettingsTabComponents'
import * as Tools from './SettingsTabTools'

export class SettingsTab extends PluginSettingTab {
    #plugin: ComponentsPlugin

    constructor(plugin: ComponentsPlugin) {
        super(plugin.app, plugin)
        this.#plugin = plugin
    }

    async #update(key: keyof PluginSettings, value: unknown): Promise<void> {
        // @ts-expect-error dynamic assignation
        this.#plugin.settings[key] = value
        await this.#plugin.saveSettings()
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

        new SettingsTabComponents(this.#plugin, this.containerEl)
    }

    #newSetting() {
        return this.#newSettingAt(this.containerEl)
    }

    #newSettingAt(container: HTMLElement) {
        return new Setting(container)
    }

    #displayGeneralSettings(): void {
        const modeDesc = createFragment((div) => {
            div.append(
                "Enable design mode only if you're editing your components code.",
                createEl('br'),
                'It will not disabled until you close the app.',
                createEl('br'),
                'For more details see ',
                Tools.docsLink('design-mode-setting', 'design mode'),
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
                input.onChange(() => {
                    // allows only enable
                    if (enabled) return
                    input.setDisabled(true)
                    this.#plugin.enableDesignMode()
                })
            })
    }

    #displayCodeblocksSettings(): void {
        // Custom codeblocks setting
        const codeblocksDesc = createFragment()
        codeblocksDesc.append(
            'Allows the usage of the components custom names as codeblocks identifiers.',
            createEl('br'),
            'For more details see ',
            Tools.docsLink('custom-codeblocks-setting', 'custom codeblocks'),
            '.',
        )

        this.#newSetting()
            .setName('Custom Codeblocks')
            .setDesc(codeblocksDesc)
            .addToggle((input) => {
                input.setValue(this.#plugin.settings.enable_codeblocks)
                input.onChange(this.#update.bind(this, 'enable_codeblocks'))
            })

        //
        let usageSeparatorInput: TextComponent | null = null
        const separatorDesc = createFragment((div) => {
            div.append(
                'Allows the usage of separators inside codeblocks.',
                createEl('br'),
                'For more details see ',
                Tools.docsLink(
                    'codeblocks-separators-setting',
                    'codeblock separators',
                ),
                '.',
            )
        })

        this.#newSetting()
            .setName('Enable Codeblocks Separators')
            .setDesc(separatorDesc)
            .addToggle((input) => {
                input.setValue(this.#plugin.settings.enable_separators)
                input.onChange((value) => {
                    void this.#update('enable_separators', value)
                    usageSeparatorInput?.setDisabled(!value)
                })
            })

        this.#newSetting()
            .setName('Codeblocks Separator')
            .setDesc('Separator to use inside codeblocks.')
            .addText((input) => {
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
            input.onChange(async (path: string) => {
                logs.empty()

                if (
                    !path ||
                    path === '/' ||
                    (await this.#plugin.fs.missing(path))
                ) {
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

        this.#newSetting()
            .setName('Components templates folder')
            .setDesc(sourceDesc)
            .addText((input) => {
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

        this.#newSetting()
            .setName('Components cache folder')
            .setDesc(cacheDesc)
            .addText((input) => {
                new FolderSuggester(this.app, input.inputEl, this.containerEl)
                input.setPlaceholder('Example: folder1/folder2')
                input.setValue(this.#plugin.settings.cache_folder)
                attachPathHandler('cache_folder', input, cacheLog)
            })
    }
}

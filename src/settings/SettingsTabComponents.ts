import type { ComponentConfig, ComponentsPlugin } from '@/types'
import { SearchComponent, Setting, TextAreaComponent } from 'obsidian'
import { loadComponentsOnVault } from '@/utility'
import * as Tools from './SettingsTabTools'

export class SettingsTabComponents {
    #plugin: ComponentsPlugin
    #componentsEl: HTMLDivElement

    /* Id's of currently shown components. */
    #filtered: string[] = []

    constructor(plugin: ComponentsPlugin, parentEl: HTMLElement) {
        this.#plugin = plugin

        this.#displayComponentsHeader(parentEl)
        this.#componentsEl = parentEl.createDiv('components-list')

        // refresh components list
        this.#searchComponentsOnVault()
        // this.#displayComponentsList() // called after components search
    }

    async #saveComponents(value: ComponentConfig[]): Promise<void> {
        this.#plugin.settings.components_config = value
        await this.#plugin.saveSettings()

        // re-render
        this.#displayComponentsList()
    }

    #toggleComponents(ids: string[], enabled: boolean): void {
        const components = this.#plugin.settings.components_config //
            .map((item) =>
                ids.includes(item.id) ? { ...item, enabled } : item,
            )
        void this.#saveComponents(components)
    }

    #changeComponent(id: string, k: keyof ComponentConfig, v: unknown): void {
        const components = this.#plugin.settings.components_config //
            .map((item) => (item.id === id ? { ...item, [k]: v } : item))
        void this.#saveComponents(components)
    }

    #searchComponentsOnVault(): void {
        const components = loadComponentsOnVault(
            this.#plugin.app.vault,
            this.#plugin.settings.components_folder,
            this.#plugin.settings.components_config,
        )

        // clear settings state & re-renders components list
        this.#filtered = components.map((component) => component.id)
        void this.#saveComponents(components)
    }

    #displayComponentsHeader(parentEl: HTMLElement): void {
        let componentsFilter: SearchComponent | null = null

        const el = new Setting(parentEl)
        el.setName('Vault Components')
        el.setDesc('The entries are components found on the vault.')
        el.addExtraButton((button) => {
            button.setIcon('reset').setTooltip('Refresh')
            button.onClick(() => {
                this.#searchComponentsOnVault()
                componentsFilter?.setValue('')
            })
        })

        // filter components
        el.addSearch((input) => {
            componentsFilter = input
            input.onChange((filter) => {
                let changed = false
                const filtered: string[] = []

                for (const component of this.#plugin.settings
                    .components_config) {
                    const isIncluded = filter
                        ? component.path.contains(filter)
                        : true
                    const wasIncluded = this.#filtered.includes(component.id)

                    if (isIncluded) {
                        filtered.push(component.id)
                        if (!wasIncluded) changed = true
                    } else if (wasIncluded) changed = true
                }

                if (!changed) return
                this.#filtered = filtered

                // re-render
                this.#displayComponentsList()
            })
        })

        // enable filtered components
        el.addExtraButton((button) => {
            button.setIcon('badge-check').setTooltip('Enable Listed Components')
            button.onClick(() => this.#toggleComponents(this.#filtered, true))
        })

        // disable filtered components
        el.addExtraButton((button) => {
            button.setIcon('badge-x').setTooltip('Disable Listed Components')
            button.onClick(() => this.#toggleComponents(this.#filtered, false))
        })
    }

    #displayComponentsList(): void {
        this.#componentsEl.empty()

        for (const c of this.#plugin.settings.components_config) {
            if (!this.#filtered.includes(c.id)) continue

            const el = new Setting(this.#componentsEl)
            el.setName(this.#componentName(c.id, c.enabled))
            el.setDesc(this.#componentDesc(c.id))
            el.addExtraButton((button) => {
                button.setTooltip('Edit names')
                button.setIcon('pencil')
                button.onClick(() => this.#componentForm(el, c))
            })
            el.addToggle((toggle) => {
                toggle.setTooltip('Is enabled?')
                toggle.setValue(c.enabled)
                toggle.onChange(this.#toggleComponents.bind(this, [c.id]))
            })
        }
    }

    #componentName(id: string, status: boolean): DocumentFragment {
        const div = createFragment()
        div.append(
            `${status ? 'Enabled' : 'Disabled'} component: `,
            Tools.el('code', id),
        )
        return div
    }

    #componentDesc(id: string): DocumentFragment {
        const frag = createFragment()
        const div = frag.createDiv('components-names')
        div.append('Usage: ')

        const names = this.#plugin.state.components_enabled.get(id)
        if (names.length === 0) {
            Tools.append(div, 'b', 'Not available')
            return frag
        }

        for (let i = 0; i < names.length; i++) {
            if (i > 0) div.appendText(' | ')
            Tools.append(div, 'code', names[i])
        }
        return frag
    }

    #activeForm: HTMLElement | null = null
    #componentForm(setting: Setting, c: ComponentConfig): void {
        this.#activeForm?.remove()
        this.#activeForm = setting.settingEl.createDiv('component-form')

        let formInput: TextAreaComponent | null = null
        const el = new Setting(this.#activeForm)
        el.addTextArea((textarea) => {
            formInput = textarea
            textarea.setValue(c.names)
        })
        el.addButton((button) => {
            button.setButtonText('Cancel')
            button.onClick(() => this.#activeForm?.remove())
        })
        el.addButton((button) => {
            button.setButtonText('Save')
            button.onClick(() => {
                this.#changeComponent(
                    c.id,
                    'names',
                    formInput?.getValue() ?? '',
                )
            })
        })
    }
}

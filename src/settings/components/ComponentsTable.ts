import type { ComponentFound, PluginSettings } from '@/types'
import type { SwitchState } from './TableRow'
import { isComponentEnabled, isComponentEnabledByFormat } from '@/utility'
import { SettingsTable } from './SettingsTable'
import { TableRow } from './TableRow'

export class ComponentsTable extends SettingsTable {
  protected components: PluginSettings['components_found']

  constructor(
    parentEl: HTMLElement,
    settings: PluginSettings,
    saveSettings: () => void,
    protected refreshSettings: () => void,
  ) {
    super(parentEl, settings, saveSettings)
    if (!settings.components_found) settings.components_found = {}
    this.components = settings.components_found
    this.initialItems()
  }

  protected initialItems(): void {
    this.filtered = Object.values(this.settings.components_found) //
      .map((item) => item.path)
  }

  protected filterItems(filter?: string): void {
    if (!filter) this.initialItems()
    else {
      this.filtered = Object.values(this.settings.components_found) //
        .reduce((colletion, frag) => {
          if (frag.path.contains(filter) || frag.format.contains(filter)) {
            colletion.push(frag.path)
          }
          return colletion
        }, [] as string[])
    }

    this.refresh()
  }

  #searchComponentOnVault(): void {
    this.refreshSettings()
    this.filterItems()
    this.refresh()
  }

  render(): void {
    this.headerSetting.clear()
    this.headerSetting.setName('Components filter')
    this.headerSetting.setDesc('The entries are components found on the vault.')

    // refresh the components
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('reset').setTooltip('Refresh')
      btn.onClick(this.#searchComponentOnVault.bind(this))
    })

    // filter input
    this.headerSetting.addSearch((input) => {
      input.onChange(this.filterItems.bind(this))
    })

    // disable all the filtered components
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('cross')
      btn.setTooltip('Disable All')
      btn.onClick(() => {
        this.filtered.forEach((id) => {
          if (!this.components[id]) return
          this.components[id].enabled = false
        })
        this.saveChanges()
      })
    })

    // return all the filtered components to the default state
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('trash')
      btn.setTooltip('Reset All')
      btn.onClick(() => {
        this.filtered.forEach((id) => {
          if (!this.components[id]) return
          this.components[id].enabled = null
        })
        this.saveChanges()
      })
    })

    // enable all the filtered components
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('checkmark')
      btn.setTooltip('Enable All')
      btn.onClick(() => {
        this.filtered.forEach((id) => {
          if (!this.components[id]) return
          this.components[id].enabled = true
        })
        this.saveChanges()
      })
    })

    //
    // thead
    this.theadEl.replaceChildren()
    const tr = this.theadEl.createEl('tr')
    tr.createEl('th', { text: 'Details' })
    // tr.createEl('th', { text: 'Custom Codeblocks' })
    tr.createEl('th', { text: 'Enabled by Context?' })
    tr.createEl('th', { text: 'Enabled by User?' })
    tr.createEl('th', { text: 'Is enabled?' })

    //
    // tbody
    this.refresh()
  }

  refresh(): void {
    this.tbodyEl.replaceChildren()

    for (const id of this.filtered) {
      const component = this.components[id]
      const names = this.settings.current_components[id] ?? []

      // construct the description of the component
      const desc = createComponent()
      desc.append(
        'Use it as: ',
        createEl('code', { text: names.map((v) => `'${v}'`).join(', ') }),
      )

      const row = new TableRow(this.tbodyEl)
      row.addInfo(id, desc)

      // check if enabled by parent
      const isEnabledByContext =
        this.settings.enable_components === 'ALL' ||
        isComponentEnabledByFormat(id, this.settings)

      row.addInput(
        component.raw_names,
        this.#updateComponentNames.bind(this, component),
      )
      row.add2waySwitch(isEnabledByContext)
      row.add3waySwitch(
        component.enabled,
        this.#updateEnabledComponents.bind(this, component),
      )
      row.add2waySwitch(isComponentEnabled(id, this.settings))
    }
  }

  #updateEnabledComponents(
    component: ComponentFound,
    state: SwitchState,
  ): void {
    component.enabled = state
    this.saveChanges()
  }

  #updateComponentNames(component: ComponentFound, source: string): void {
    component.raw_names = source

    component.names = []
    source.split(/(|;, )+/gi).forEach((name) => {
      name = name.replace(/\W*/gi, '')
      if (name.length > 0) component.names.push(name)
    })

    this.saveChanges()
  }
}

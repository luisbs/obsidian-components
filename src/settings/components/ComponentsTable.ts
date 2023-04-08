import type { ComponentFound, ComponentsPlugin, PluginSettings } from '@/types'
import {
  isComponentDisabledByUser,
  isComponentEnabled,
  isComponentEnabledByFormat,
  isComponentEnabledByUser,
} from '@/utility'
import { SettingsTable } from './SettingsTable'
import { TableRow } from './TableRow'

export class ComponentsTable extends SettingsTable<ComponentFound> {
  protected enabledComponents: PluginSettings['enabled_components']

  constructor(
    parentEl: HTMLElement,
    protected plugin: ComponentsPlugin,
    saveSettings: () => void,
    protected loadComponentsOnVault: () => void,
  ) {
    super(parentEl, plugin.settings, saveSettings)
    //* keep as a reference
    if (!plugin.settings.enabled_components)
      plugin.settings.enabled_components = new Map()
    this.enabledComponents = plugin.settings.enabled_components
  }

  protected loadInitialItems(): void {
    for (const [id, component] of Object.entries(
      this.settings.components_found,
    )) {
      this.items.set(id, component)
    }
  }

  protected renderHeader(): void {
    this.headerSetting.clear()
    this.headerSetting.setName('Components filter')
    this.headerSetting.setDesc('The entries are components found on the vault.')

    // refresh the components
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('reset').setTooltip('Refresh')
      btn.onClick(() => {
        // is spected that this function executes
        // the refresh method of this instance
        this.loadComponentsOnVault()
      })
    })

    // search input
    this.headerSetting.addSearch((input) => {
      input.onChange(this.renderItems.bind(this))
    })

    // disable all the filtered components
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('cross')
      btn.setTooltip('Disable All')
      btn.onClick(() => {
        this.forEachCurrentItem((id) => this.enabledComponents.set(id, false))
        this.saveChanges()
      })
    })

    // reset all the filtered components
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('trash')
      btn.setTooltip('Reset All')
      btn.onClick(() => {
        this.forEachCurrentItem((id) => this.enabledComponents.delete(id))
        this.saveChanges()
      })
    })

    // enable all the filtered components
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('checkmark')
      btn.setTooltip('Enable All')
      btn.onClick(() => {
        this.forEachCurrentItem((id) => this.enabledComponents.set(id, true))
        this.saveChanges()
      })
    })

    // table header
    this.theadEl.replaceChildren()
    const tr = this.theadEl.createEl('tr')
    tr.createEl('th', { text: 'Details' })
    tr.createEl('th', { text: 'Custom Codeblocks' })
    tr.createEl('th', { text: 'Enabled by Context?' })
    tr.createEl('th', { text: 'Enabled by User?' })
    tr.createEl('th', { text: 'Is enabled?' })
  }

  protected itemShouldBeIncluded(
    filter: string,
    item: ComponentFound,
  ): boolean {
    // on empty string, include all formats
    if (!filter) return true
    // otherwise check for matches on its path or format
    return item.path.contains(filter) || item.format.contains(filter)
  }

  protected updateRows(): void {
    console.debug('obsidian-components: updateRows executed')
    for (const [id, component] of this.items) {
      const trEl = this.cachedRows.get(id)
      if (!trEl) continue
      // force the update of the view
      this.populateRow(trEl, component, id)
    }
  }

  // prettier-ignore
  protected populateRow(
    trEl: HTMLTableRowElement,
    item: ComponentFound,
    id: string,
  ): void {

    trEl.replaceChildren()
    const row = new TableRow(trEl)

    // construct the description of the component
    const names = this.plugin.state.components[id] || []
    const desc = createFragment()
    desc.appendText('Use it as: ')
    desc.createEl('code', { text: names.map((v) => `'${v}'`).join(', ') })

    row.addInfo(id, desc)
    row.addTextarea(item.names, (value) => {
      item.names = value
      this.saveChanges()
    })

    // check if enabled by context
    const isEnabledByContext =
      this.settings.enable_components === 'ALL' ||
      isComponentEnabledByFormat(id, this.settings)

    let isEnabledByUser = null
    if (isComponentEnabledByUser(item, this.settings)) isEnabledByUser = true
    if (isComponentDisabledByUser(item, this.settings)) isEnabledByUser = false

    row.addSwitch(isEnabledByContext)
    row.addBehaviorSelector(isEnabledByUser, this.#updateComponentStatus.bind(this, id))
    row.addSwitch(isComponentEnabled(id, this.settings))
  }

  /**
   * Update a component status individually.
   */
  #updateComponentStatus(id: string, status: null | boolean): void {
    if (status === null) this.enabledComponents.delete(id)
    else if (status) this.enabledComponents.set(id, true)
    else this.enabledComponents.set(id, false)
    this.saveChanges()
  }
}

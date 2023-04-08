import type { ComponentFormat, PluginSettings } from '@/types'
import { isFormatEnabled, getSupportedFormats } from '@/utility'
import { SettingsTable } from './SettingsTable'
import { TableRow } from './TableRow'

export class FormatsTable extends SettingsTable<ComponentFormat> {
  protected enabledFormats: PluginSettings['enabled_formats']

  constructor(
    parentEl: HTMLElement,
    settings: PluginSettings,
    saveSettings: () => void,
  ) {
    super(parentEl, settings, saveSettings)
    //* keep as a reference
    if (!settings.enabled_formats) settings.enabled_formats = new Set()
    this.enabledFormats = settings.enabled_formats
  }

  protected loadInitialItems(): void {
    this.items = new Map()
    for (const format of getSupportedFormats()) {
      this.items.set(format.id, format)
    }
  }

  protected renderHeader() {
    this.headerSetting.clear()
    this.headerSetting.setName('Format filter')
    this.headerSetting.setDesc('The entries are the supported formats.')

    // search input
    this.headerSetting.addSearch((input) => {
      input.onChange(this.applyFilter.bind(this))
    })

    // disable all the filtered formats
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('cross')
      btn.setTooltip('Disable All')
      btn.onClick(() => {
        this.forEachCurrentItem((id) => this.enabledFormats.delete(id))
        this.saveChanges()
      })
    })

    // enable all the filtered formats
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('checkmark')
      btn.setTooltip('Enable All')
      btn.onClick(() => {
        this.forEachCurrentItem((id) => this.enabledFormats.add(id))
        this.saveChanges()
      })
    })

    // table header
    this.theadEl.replaceChildren()
    const tr = this.theadEl.createEl('tr')
    tr.createEl('th', { text: 'Format Id' })
    tr.createEl('th', { text: 'Type' })
    tr.createEl('th', { text: 'Regex' })
    tr.createEl('th', { text: 'Enabled by User?' })
  }

  protected itemShouldBeIncluded(
    filter: string,
    item: ComponentFormat,
  ): boolean {
    // on empty string, include all formats
    if (!filter) return true
    // otherwise check for matches on its id or type
    return item.id.contains(filter) || item.type.contains(filter)
  }

  protected updateRows(): void {
    for (const [id, format] of this.items) {
      const trEl = this.cachedRows.get(id)
      if (!trEl) continue
      // force the update of the view
      this.populateRow(trEl, format, id)
    }
  }

  protected populateRow(
    trEl: HTMLTableRowElement,
    format: ComponentFormat,
    id: string,
  ): void {
    trEl.replaceChildren()

    const isEnabled = isFormatEnabled(format, this.settings)
    const row = new TableRow(trEl)
    row.addInfo(id)
    row.addText(format.type)
    row.addText(format.ext.source)
    row.addSwitch(isEnabled, this.#updateFormatStatus.bind(this, id))
  }

  /**
   * Update a format behavior individually.
   */
  #updateFormatStatus(id: string, status: boolean): void {
    if (status) this.enabledFormats.add(id)
    else this.enabledFormats.delete(id)
    this.saveChanges()
  }
}

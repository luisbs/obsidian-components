import type { ComponentFormat, PluginSettings } from '@/types'
import { isFormatEnabled, getSupportedFormats } from '@/utility'
import { SettingsTable } from './SettingsTable'
import { TableRow } from './TableRow'

export class FormatsTable extends SettingsTable {
  protected formats: ComponentFormat[] = []
  protected enabled: PluginSettings['formats_enabled'] = []

  constructor(
    parentEl: HTMLElement,
    settings: PluginSettings,
    saveSettings: () => void,
  ) {
    super(parentEl, settings, saveSettings)
    if (!settings.formats_enabled) settings.formats_enabled = []
    this.enabled = settings.formats_enabled
    this.formats = getSupportedFormats()
    this.initialItems()
  }

  protected initialItems(): void {
    this.filtered = this.formats.map((item) => item.id)
  }

  protected filterItems(filter?: string): void {
    if (!filter) this.initialItems()
    else {
      this.filtered = this.formats.reduce((collection, format) => {
        if (format.id.contains(filter) || format.type.contains(filter)) {
          collection.push(format.id)
        }
        return collection
      }, [] as string[])
    }

    this.refresh()
  }

  render(): void {
    this.headerSetting.clear()
    this.headerSetting.setName('Format filter')
    this.headerSetting.setDesc('The entries are the supported formats.')

    // filter input
    this.headerSetting.addSearch((input) => {
      input.onChange(this.filterItems.bind(this))
    })

    // disable all the filtered formats
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('cross')
      btn.setTooltip('Disable All')
      btn.onClick(() => {
        this.filtered.forEach((id) => this.enabled.remove(id))
        this.saveChanges()
      })
    })

    // enable all the filtered formats
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('checkmark')
      btn.setTooltip('Enable All')
      btn.onClick(() => {
        this.filtered.forEach((id) => {
          if (this.enabled.includes(id)) return
          this.enabled.push(id)
        })
        this.saveChanges()
      })
    })

    //
    // thead
    this.theadEl.replaceChildren()
    const tr = this.theadEl.createEl('tr')
    tr.createEl('th', { text: 'Details' })
    tr.createEl('th', { text: 'Enabled by User?' })

    //
    // tbody
    this.refresh()
  }

  refresh(): void {
    this.tbodyEl.replaceChildren()

    for (const id of this.filtered) {
      const format = this.formats.find((format) => format.id === id)
      if (!format) continue

      // construct the description of the format
      const desc = createFragment()
      desc.append('Type:', createEl('code', { text: `'${format.type}'` }))
      // prettier-ignore
      desc.append('Extension:', createEl('code', { text: `'${format.ext.source}'` }))

      const row = new TableRow(this.tbodyEl)
      row.addInfo(id, desc)

      const isEnabled = isFormatEnabled(format, this.settings)
      row.add2waySwitch(isEnabled, this.#updateEnabledFormats.bind(this, id))
    }
  }

  #updateEnabledFormats(id: string, enable: boolean): void {
    if (enable) {
      // if should be enabled add it
      if (this.enabled.includes(id)) return
      this.enabled.push(id)
      this.saveChanges()
      return
    }

    // if should be disabled remove it
    if (!this.enabled.includes(id)) return
    this.enabled.remove(id)
    this.saveChanges()
  }
}

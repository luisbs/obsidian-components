import type { PluginSettings } from '@/types'
import { Setting } from 'obsidian'

export abstract class SettingsTable<T> {
  protected headerSetting: Setting
  protected tableEl: HTMLTableElement
  protected theadEl: HTMLTableSectionElement
  protected tbodyEl: HTMLTableSectionElement

  protected items: Map<string, T> = new Map()
  protected cachedRows: Map<string, HTMLTableRowElement> = new Map()

  protected filter = ''
  protected filteredItems: string[] = []

  constructor(
    protected parentEl: HTMLElement,
    protected settings: PluginSettings,
    protected saveSettings: () => void,
  ) {
    this.headerSetting = new Setting(parentEl)
    this.tableEl = parentEl.createEl('table', 'components-table')
    this.theadEl = this.tableEl.createEl('thead')
    this.tbodyEl = this.tableEl.createEl('tbody')
    this.loadInitialItems()
  }

  protected saveChanges(): void {
    this.saveSettings()
    this.updateRows()
  }

  /**
   * Loads the initial items.
   */
  protected abstract loadInitialItems(): void

  /**
   * Initial render of the component.
   */
  public render(): void {
    this.renderHeader()
    this.applyFilter()
  }

  /**
   * Refresh the data rendered on the component.
   */
  public refresh(): void {
    this.loadInitialItems()
    this.updateRows()
    this.applyFilter()
  }

  /**
   * Render the SettingsTable header.
   */
  protected renderHeader(): void {
    this.headerSetting.clear()
    this.headerSetting.setName('Items filter')
    this.headerSetting.addSearch((input) => {
      input.onChange(this.applyFilter.bind(this))
    })
  }

  /**
   * Check if an element should be included when filtering.
   */
  protected itemShouldBeIncluded(filter: string, item: T): boolean {
    return true
  }

  /**
   * Get an HTMLTableRowElement presenting the item data.
   */
  protected getRow(id: string, item: T): HTMLTableRowElement {
    let trEl = this.cachedRows.get(id)

    // if the related tr exists, return it
    if (trEl) return trEl

    // if is not found, create a new one
    trEl = createEl('tr')
    trEl.id = id
    this.populateRow(trEl, item, id)

    // store the element
    this.cachedRows.set(id, trEl)

    return trEl
  }

  /**
   * Propagates the changes of the items into the HTMLTableRowElement.
   */
  protected abstract updateRows(): void

  /**
   * Populates an HTMLTableRowElement with the data of an item.
   */
  protected abstract populateRow(
    trEl: HTMLTableRowElement,
    item: T,
    id: string,
  ): void

  /**
   * Apply the table filter, showing only the rows that match certain condition.
   */
  protected applyFilter(newFilter?: string): void {
    // update the existing filter
    if (newFilter) this.filter = newFilter

    // cleans the state
    this.filteredItems = []
    this.tbodyEl.replaceChildren()

    // include the matching items
    for (const [id, item] of this.items) {
      if (!this.itemShouldBeIncluded(this.filter, item)) continue
      this.filteredItems.push(id)
      this.tbodyEl.appendChild(this.getRow(id, item))
    }
  }

  /**
   * Runs a callback on each item currently shown on the table.
   */
  protected forEachCurrentItem(
    cb: (value: string, index: number, array: string[]) => void,
  ) {
    this.filteredItems.forEach(cb)
  }
}

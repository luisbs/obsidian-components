import type { PluginSettings } from '@/types'
import { Setting } from 'obsidian'

export abstract class SettingsTable<T> {
  protected headerSetting: Setting
  protected tableEl: HTMLTableElement
  protected theadEl: HTMLTableSectionElement
  protected tbodyEl: HTMLTableSectionElement

  protected items: Map<string, T> = new Map()
  protected cachedRows: Map<string, HTMLTableRowElement> = new Map()

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
    this.renderItems()
  }

  /**
   * Refresh the data rendered on the component.
   */
  public refresh(): void {
    this.updateRows()
  }

  /**
   * Render the SettingsTable header.
   */
  protected renderHeader(): void {
    this.headerSetting.clear()
    this.headerSetting.setName('Items filter')
    this.headerSetting.addSearch((input) => {
      input.onChange(this.renderItems.bind(this))
    })
  }

  /**
   * Render the items that meets certain condition.
   */
  protected renderItems(filter = ''): void {
    // clean the rows, before adding the filtered ones
    this.tbodyEl.replaceChildren()
    // check if each item should be included
    for (const [id, item] of this.items) {
      if (!this.itemShouldBeIncluded(filter, item)) continue
      this.tbodyEl.appendChild(this.getRow(id, item))
    }
  }

  /**
   * Check if an element should be included when filtering.
   */
  protected itemShouldBeIncluded(filter: string, item: T): boolean {
    return true
  }

  /**
   * Return the ids of the items that are currently been shown on the table.
   */
  protected getCurrentIds(): string[] {
    const ids = [] as string[]
    this.tbodyEl.childNodes.forEach((trEl) => {
      if (!(trEl instanceof HTMLTableRowElement)) return
      ids.push(trEl.id)
    })
    return ids
  }

  /**
   * Runs a callback on each item currently shown on the table.
   */
  protected forEachCurrentItem(
    cb: (value: string, index: number, array: string[]) => void,
  ) {
    this.getCurrentIds().forEach(cb)
  }

  /**
   * Get an HTMLTableRowElement presenting the item data.
   */
  protected getRow(id: string, item: T): HTMLTableRowElement {
    let trEl = this.cachedRows.get(id)

    // if the related tr exists, return it
    if (trEl) return trEl

    // if is not found, create a new one
    trEl = document.createEl('tr')
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
}

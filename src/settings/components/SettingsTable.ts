import type { PluginSettings } from '@/types'
import { Setting } from 'obsidian'

export abstract class SettingsTable {
  protected headerSetting: Setting
  protected tableEl: HTMLTableElement
  protected theadEl: HTMLTableSectionElement
  protected tbodyEl: HTMLTableSectionElement

  protected filtered: string[] = []

  constructor(
    protected parentEl: HTMLElement,
    protected settings: PluginSettings,
    protected saveSettings: () => void,
  ) {
    this.headerSetting = new Setting(parentEl)
    this.tableEl = parentEl.createEl('table', 'fragments-table')
    this.theadEl = this.tableEl.createEl('thead')
    this.tbodyEl = this.tableEl.createEl('tbody')
  }

  protected saveChanges(): void {
    this.saveSettings()
    this.refresh()
  }

  protected abstract initialItems(): void
  protected abstract filterItems(filter?: string): void

  public abstract render(): void
  public abstract refresh(): void
}

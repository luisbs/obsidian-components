import type { FoundFragment, FragmentsPlugin, PluginSettings } from '@/types'
import type { Vault } from 'obsidian'

export abstract class Render {
  protected settings: PluginSettings
  protected vault: Vault

  constructor(
    protected plugin: FragmentsPlugin,
    protected fragment: FoundFragment,
  ) {
    this.vault = plugin.app.vault
    this.settings = plugin.settings
  }

  abstract render(element: HTMLElement, data: unknown): Promise<void>
}
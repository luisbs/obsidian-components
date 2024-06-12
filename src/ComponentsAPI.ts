import type { ComponentsPlugin, PluginAPI } from '@/types'
import { TFile, Vault } from 'obsidian'
import { Logger } from './utility'
import { ComponentError } from './codeblocks/ComponentError'

export default class ComponentAPI implements PluginAPI {
  #log = Logger.make('ComponentAPI')
  #plugin: ComponentsPlugin
  #vault: Vault

  constructor(plugin: ComponentsPlugin) {
    this.#plugin = plugin
    this.#vault = plugin.app.vault
  }

  public source(file: TFile): Promise<unknown> {
    try {
      if (/\.js$/i.test(file.name)) {
        const resolved = this.#vault.getResourcePath(file)
        this.#log.debug(`source: import('${resolved}')`)
        return import(resolved)
      }
      if (/\.cjs$/i.test(file.name)) {
        const resolved = this.#plugin.fs.getRealPath(file.path)
        this.#log.debug(`source: require('${resolved}')`)
        return require(resolved)
      }

      throw new Error('unsupported javascript syntax, use CJS or ESM instead')
    } catch (error) {
      this.#log.error(error)
      throw new ComponentError('invalid-component-syntax', error)
    }
  }

  // external API
  public latest(filePath: string): Promise<unknown> {
    const versionName = this.#plugin.versions.resolveFile(filePath)
    const versionPath = versionName
      ? this.#plugin.fs.getCachePath(versionName)
      : filePath

    this.#log.debug(`resolve: <${filePath}> to <${versionPath}>`)
    const versionFile = this.#vault.getFileByPath(versionPath)
    if (!versionFile) throw new ComponentError('missing-component-file')

    return this.source(versionFile)
  }
}

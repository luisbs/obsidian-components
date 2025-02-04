import type { ComponentsPlugin, PluginAPI } from '@/types'
import { TFile, Vault } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import { ComponentError } from '@/codeblocks'

export class ComponentAPI implements PluginAPI {
  #log = Logger.consoleLogger(ComponentAPI.name)

  #plugin: ComponentsPlugin
  #vault: Vault

  constructor(plugin: ComponentsPlugin) {
    this.#plugin = plugin
    this.#vault = plugin.app.vault
  }

  public refresh(filepath: string): void {
    this.#plugin.parser.refresh(filepath)
  }

  public latest(filepath: string): TFile {
    const latestPath = this.#plugin.versions.resolveLatest(filepath)
    this.#log.debug(`Latest <${latestPath}>`)

    const latestFile = this.#vault.getFileByPath(latestPath)
    if (!latestFile) throw new ComponentError('missing-component-file')

    return latestFile
  }

  public async resolve(filepath: string): Promise<unknown> {
    this.#log.debug(`Resolving <${filepath}>`)

    const latestFile = this.latest(filepath)
    this.#log.debug(`Sourcing <${latestFile.path}>`)

    const module = await this.source(latestFile)
    this.#log.info(`Resolved <${latestFile.path}>`)
    this.#log.trace(`Resolved <${latestFile.path}>`, module)

    return module
  }

  public source(file: TFile): Promise<unknown> {
    try {
      if (/\.mjs$/i.test(file.name)) {
        const resolved = this.#vault.getResourcePath(file)
        this.#log.debug(`import('${resolved}')`)
        return import(resolved)
      }
      if (/\.cjs$/i.test(file.name)) {
        const resolved = this.#plugin.fs.getRealPath(file.path)
        this.#log.debug(`require('${resolved}')`)
        return require(resolved)
      }

      throw new Error('unsupported javascript syntax, use CJS or ESM instead')
    } catch (error) {
      this.#log.warn(error)
      throw new ComponentError('invalid-component-syntax', error)
    }
  }
}

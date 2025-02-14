import type { ComponentsPlugin } from '@/types'
import type { ComponentsPluginAPI } from '.'
import { TFile, Vault } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import { ComponentError } from '@/codeblocks'

export class ComponentAPI implements ComponentsPluginAPI {
  #log = new Logger('ComponentAPI')
  #plugin: ComponentsPlugin
  #vault: Vault

  constructor(plugin: ComponentsPlugin) {
    this.#plugin = plugin
    this.#vault = plugin.app.vault
  }

  public refresh(filepath: string, logger?: Logger): void {
    this.#plugin.parser.refresh(filepath)
  }

  public latest(filepath: string, logger?: Logger): TFile {
    const latestPath = this.#plugin.versions.resolveLatest(filepath)
    this.#log.on(logger).debug(`Latest <${latestPath}>`)

    const latestFile = this.#vault.getFileByPath(latestPath)
    if (!latestFile) throw new ComponentError('missing-component-file')

    return latestFile
  }

  public async resolve(filepath: string, logger?: Logger): Promise<unknown> {
    const log = logger || this.#log.group(`Resolving <${filepath}>`)

    const latestFile = this.latest(filepath, log)
    this.#log.on(log).debug(`Sourcing <${latestFile.path}>`)

    const module = await this.source(latestFile, log)
    this.#log.on(log).debug(`Resolved`, module)

    return module
  }

  public source(file: TFile, logger?: Logger): Promise<unknown> {
    try {
      if (/\.mjs$/i.test(file.name)) {
        const resolved = this.#vault.getResourcePath(file)
        this.#log.on(logger).debug(`import('${resolved}')`)
        return import(resolved)
      }
      if (/\.cjs$/i.test(file.name)) {
        const resolved = this.#plugin.fs.getRealPath(file.path)
        this.#log.on(logger).debug(`require('${resolved}')`)
        return require(resolved)
      }

      throw new Error('unsupported javascript syntax, use CJS or ESM instead')
    } catch (error) {
      this.#log.on(logger).error(error)
      throw new ComponentError('invalid-component-syntax', error)
    }
  }
}

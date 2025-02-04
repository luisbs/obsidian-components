import type { ComponentsPlugin } from '@/types'
import type { CodeblockContent, CodeblockParser } from './BaseParser'
import { Logger } from 'obsidian-fnc'
import { YamlParser } from './YamlParser'
import { JsonParser } from './JsonParser'
import { DataviewParser } from './DataviewParser'

export type * from './BaseParser'

export class ParserManager {
  #log = Logger.consoleLogger(ParserManager.name)
  #parsers: CodeblockParser[]

  constructor(private plugin: ComponentsPlugin) {
    this.#log.info('Starting ParserManager')
    this.#parsers = [
      new DataviewParser(plugin),
      new JsonParser(),
      new YamlParser(),
    ]
  }

  #separator(): RegExp | undefined {
    if (!this.plugin.settings.enable_separators) return

    // separator could change on runtime
    // escape regex special characters
    const escaped = this.plugin.settings.usage_separator //
      .replace(/[.+*?^${}()|[\]\\]/gi, '\\$&')
    return new RegExp(escaped, 'gi')
  }

  async parse(source: string, notepath: string): Promise<CodeblockContent> {
    this.#log.trace(`Parsing from '${notepath}' <${source}>`)
    const separator = this.#separator()

    try {
      if (separator?.test(source)) {
        for (const parser of this.#parsers) {
          if (!parser.test(source)) continue

          this.#log.debug(`Parsing as ${parser.id}`)
          return {
            syntax: parser.id,
            data: source.split(separator).map((i) => parser.parse(i, notepath)),
          }
        }
      }

      for (const parser of this.#parsers) {
        if (!parser.test(source)) continue

        this.#log.debug(`Parsing as ${parser.id}`)
        return { syntax: parser.id, data: parser.parse(source, notepath) }
      }
    } catch (err) {
      this.#log.warn(err)
    }

    this.#log.info(`Failed parsing of <${source}>`)
    return { syntax: 'unknown', data: source }
  }
}

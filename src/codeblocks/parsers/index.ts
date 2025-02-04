import type { ComponentsPlugin } from '@/types'
import type { CodeblockContent, CodeblockParser } from './BaseParser'
import { DataviewParser } from './DataviewParser'
import { JsonParser } from './JsonParser'
import { YamlParser } from './YamlParser'

export type * from './BaseParser'

export class ParserManager {
  #parsers: CodeblockParser[]

  constructor(private plugin: ComponentsPlugin) {
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
    const separator = this.#separator()

    try {
      if (separator?.test(source)) {
        for (const parser of this.#parsers) {
          if (!parser.test(source)) continue
          return {
            syntax: parser.id,
            data: source.split(separator).map((i) => parser.parse(i, notepath)),
          }
        }
      }

      for (const parser of this.#parsers) {
        if (!parser.test(source)) continue
        return { syntax: parser.id, data: parser.parse(source, notepath) }
      }
    } catch (err) {
      // TODO: change logging
      console.error(err)
    }

    return { syntax: 'unknown', data: source }
  }
}

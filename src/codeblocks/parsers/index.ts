import type { ComponentsPlugin } from '@/types'
import type { Logger } from '@luis.bs/obsidian-fnc'
import type { CodeblockContent, CodeblockParser } from './BaseParser'
import { YamlParser } from './YamlParser'
import { JsonParser } from './JsonParser'
import { DataviewParser } from './DataviewParser'

export type { CodeblockContent, CodeblockSyntax } from './BaseParser'

export default class ParserManager {
    #parsers: CodeblockParser[]

    constructor(private plugin: ComponentsPlugin) {
        // TODO: add support for parsing data with Dataview
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

    parse(source: string, notepath: string, log: Logger): CodeblockContent {
        log.trace(`Parsing from '${notepath}' <${source}>`)
        const separator = this.#separator()

        try {
            if (separator?.test(source)) {
                for (const parser of this.#parsers) {
                    if (parser.test(source)) {
                        log.debug(`Parsing as ${parser.id}`)
                        return {
                            syntax: parser.id,
                            data: source
                                .split(separator)
                                .map((i) => parser.parse(i, notepath)),
                        }
                    }
                }
            }

            for (const parser of this.#parsers) {
                if (parser.test(source)) {
                    log.debug(`Parsing as ${parser.id}`)
                    return {
                        syntax: parser.id,
                        data: parser.parse(source, notepath),
                    }
                }
            }
        } catch (err) {
            log.debug(err)
        }

        log.debug(`Failed parsing`, source)
        return { syntax: 'unknown', data: source }
    }
}

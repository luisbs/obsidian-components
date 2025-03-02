import type { CodeblockParser, CodeblockSyntax } from './BaseParser'
import { parseYaml } from 'obsidian'

export class YamlParser implements CodeblockParser {
    id: CodeblockSyntax = 'yaml'

    test(source: string): boolean {
        // Arrays, ex: `- value`
        if (source.startsWith('-')) return true
        // Objects: ex: `param: value`
        return /^\w+:/.test(source)
    }

    parse(source: string, _notepath: string): Promise<unknown> {
        return Promise.resolve(parseYaml(source))
    }
}

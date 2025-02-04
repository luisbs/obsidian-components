import type { CodeblockParser, CodeblockSyntax } from './BaseParser'
import { parseYaml } from 'obsidian'

export class YamlParser implements CodeblockParser {
  id: CodeblockSyntax = 'yaml'

  test(source: string): boolean {
    return /^\s*\w+:/.test(source)
  }

  parse(source: string, _notepath: string): Promise<unknown> {
    return parseYaml(source)
  }
}

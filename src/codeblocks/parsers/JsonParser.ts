import type { CodeblockParser, CodeblockSyntax } from './BaseParser'

export class JsonParser implements CodeblockParser {
  id: CodeblockSyntax = 'json'

  test(source: string): boolean {
    return /^\s*[[{]/gi.test(source)
  }

  parse(source: string, _notepath: string): Promise<unknown> {
    return JSON.parse(source)
  }
}

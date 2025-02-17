import type { CodeblockParser, CodeblockSyntax } from './BaseParser'

export class JsonParser implements CodeblockParser {
    id: CodeblockSyntax = 'json'

    test(source: string): boolean {
        return /^\s*[[{]/gi.test(source)
    }

    parse(source: string, _notepath: string): Promise<unknown> {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return JSON.parse(source)
    }
}

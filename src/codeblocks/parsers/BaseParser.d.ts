export type CodeblockSyntax = 'json' | 'yaml' | 'dataview' | 'unknown'

export interface CodeblockContent {
  /** Syntax of the **Codeblock**. */
  syntax: CodeblockSyntax
  /** **Codeblock** content parsed. */
  data: unknown
}

export interface CodeblockParser {
  /** Syntax parser been used. */
  id: CodeblockSyntax
  /** Checks if the source has a valid syntax. */
  test(source: string): boolean
  /** Tries to parse the content. */
  parse(source: string, notepath: string): Promise<unknown>
}

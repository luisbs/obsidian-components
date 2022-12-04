/**
 * Identifies a runtime codeblock.
 */
export interface Codeblock {
  /** Fragment to use on rendering. */
  name: string
  /** Hash result of the content. (used for cache) */
  hash: string
  /** Codeblock content text. */
  content: string
  /** Syntax of the codeblock. */
  syntax: 'json' | 'yaml'
  /** Parses the content into javascript types. */
  parseContent: () => any
}

/**
 * Identifies a runtime codeblock.
 */
export interface Codeblock {
  /** Fragment to use on rendering. */
  name: string
  /** Hash result of the content. (used for cache) */
  hash: string
  /** Syntax of the codeblock. */
  syntax: 'json' | 'yaml'
  /** Codeblock content text. */
  source: string
  /** Codeblock content parsed. */
  data: unknown
}

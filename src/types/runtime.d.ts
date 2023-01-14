export interface CodeblockContent {
  /** Hash result of the codeblock content. (used for cache) */
  hash: string
  /** Syntax of the codeblock. */
  syntax: 'json' | 'yaml'
  /** Codeblock content raw text. */
  source: string
  /** Codeblock content parsed. */
  data: unknown
}

export interface PluginState {
  /** Stores the currently parameters that can be used to define a component name. */
  params: string[]
  /** Stores the currently enabled component references. */
  components: Record<string, string[]>
  /** Stores the currently enabled codeblock references. */
  codeblocks: Record<string, string[]>
}

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

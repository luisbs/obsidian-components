import { MapStore } from './utility'

export { default as ComponentsPlugin } from './main'

//#region Runtime

export interface PluginState {
  /** Stores the currently parameters that can be used to define a component name. */
  params: string[]
  /** Stores the currently enabled component references. */
  components: MapStore<string>
  /** Stores the currently enabled codeblock references. */
  codeblocks: MapStore<string>
}

export interface CodeblockContent {
  /** Hash result of the codeblock content. (used for cache) */
  hash: string
  /** Syntax of the codeblock. */
  syntax: 'json' | 'yaml' | 'none'
  /** Codeblock content raw text. */
  source: string
  /** Codeblock content parsed. */
  data: unknown
}

//#endregion

//#region Settings

/**
 * Representation of the plugin settings on disk.
 */
export type RawPluginSettings = PrimitivePluginSettings & {
  enabled_formats: string[]
  enabled_components: [string, boolean][]
}

export type PrimitivePluginSettings = Omit<
  PluginSettings,
  'enabled_formats' | 'enabled_components'
>

/**
 * Representation of the plugin settings on memory.
 */
export interface PluginSettings {
  /**
   * Stores the plugin behavior about components discovery.
   * - `'STRICT'` allow only components enabled by the user.
   * - `'FLEXIBLE'` allow components by user input and format.
   * - `'ALL'` allow all the components.
   */
  enable_components: 'STRICT' | 'FLEXIBLE' | 'ALL'
  /** Stores the user desition to allow custom codeblocks. */
  enable_codeblocks: boolean
  /** Stores the user desition to allow separators on codeblocks. */
  enable_separators: boolean

  /**
   * Stores the component naming method for the vault.
   * - `'INLINE'` specify the name as an inline string (e.g. `use book`)
   * - `'PARAM'` specify the name as a param (e.g. `__name: 'book'`)
   * - `'BOTH'` use both methods
   */
  usage_method: 'INLINE' | 'PARAM' | 'BOTH'
  /** Store the user input about which params can be used to retrive a component name. */
  usage_naming: string
  /** Store the user input about the separator to use inside codeblocks. */
  usage_separator: string

  /**
   * Stores the components naming strategy.
   * - `'SHORT'` includes only the short names
   * - `'LONG'` includes the short and long names
   * - `'ALL'` includes all the possible names
   */
  components_naming: 'SHORT' | 'LONG' | 'ALL'
  /** Stores the route where the components are. */
  components_folder: string
  /** Stores the components found on the vault. */
  components_found: Record<string, ComponentFound>

  /**
   * Stores the component formats enabled by the user.
   * - **present** means the format is enabled.
   * - **missing** means the format is disabled.
   */
  enabled_formats: Set<string>
  /**
   * Stores the components enabled by the user.
   * - **missing** means the component has default behavior.
   * - `false` means the component is disabled.
   * - `true` means the component is enabled.
   */
  enabled_components: Map<string, boolean>
}

/**
 * Defines a component format.
 */
export interface ComponentFormat {
  /**
   * Unique Identifier for the format.
   */
  id: string
  /**
   * Defines the extension of the files
   * with this format.
   */
  ext: RegExp
  /**
   * Defines the type of behavior of the components
   * - `code` corresponds with formats that can handle the DOM a.k.a. **javascript**
   * - `html` the component return **HTML**
   * - `md` the component return **Markdown**
   */
  type: 'code' | 'html' | 'md'
}

/**
 * Defines a component found on the vault.
 */
export interface ComponentFound {
  /** Absolute path of the file on the vault. */
  path: string
  /** Component format identifier. */
  format: string
  /** User defined names */
  names: string
}

//#endregion

export interface PluginSettings {
  /**
   * Stores the plugin behavior about components discovery.
   * - `'STRICT'` allow only components enabled by the user.
   * - `'FLEXIBLE'` allow components by user input and format.
   * - `'ALL'` allow all the components.
   */
  enable_components: 'STRICT' | 'FLEXIBLE' | 'ALL'
  /** Stores the user desition to use custom codeblocks. */
  enable_codeblocks: boolean

  /**
   * Stores the component naming method for the vault.
   * - `'INLINE'` specify the name as an inline string (e.g. `use book`)
   * - `'PARAM'` specify the name as a param (e.g. `__name: 'book'`)
   * - `'BOTH'` use both methods
   */
  naming_method: 'INLINE' | 'PARAM' | 'BOTH'
  /**
   * Stores the components naming strategy.
   * - `'SHORT'` includes only the short names
   * - `'LONG'` includes the short and long names
   * - `'ALL'` includes all the possible names
   */
  naming_strategy: 'SHORT' | 'LONG' | 'ALL'

  /** Stores the component formats enabled by the user. */
  formats_enabled: string[]

  /** Stores the route where the components are. */
  components_folder: string
  /** Stores the components found on the vault. */
  components_found: Record<string, ComponentFound>

  /** Stores the currently enabled components. */
  current_components: Record<string, string[]>
  /** Stores the currently enabled codeblocks. */
  current_codeblocks: Record<string, string[]>
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
  /** Enforced state defined by the user. */
  enabled: boolean | null
  /** User defined names to use as Codeblocks */
  names: string[]
  /** User defined names */
  raw_names: string
}

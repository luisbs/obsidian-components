export type PrimitivePluginSettings = Omit<
  PluginSettings,
  'enabled_formats' | 'enabled_components'
>

export type RawPluginSettings = Omit<
  PrimitivePluginSettings,
  'versioning_enabled'
> & {
  enabled_formats: string[]
  enabled_components: [string, boolean][]
}

export interface PluginSettings {
  /**
   * Controls when to enable the block file versioning.
   * > `Warning:` The versioning stores each edition of a file
   * > to provide a way to load the file changes on runtime
   * > this behavior will cause an increase on memory usage and
   * > storage usage, so it should be **disabled always**
   * > until the user enables it **manually**
   */
  versioning_enabled: boolean

  /**
   * Stores the plugin behavior about components discovery.
   * - `'STRICT'` allow only components enabled by the user.
   * - `'FLEXIBLE'` allow components by user input and format.
   * - `'ALL'` allow all the components.
   */
  enable_components: 'STRICT' | 'FLEXIBLE' | 'ALL'
  /** Stores the user desition to use custom codeblocks. */
  enable_codeblocks: boolean

  /** Store the user input about which params can be used to retrive a component name. */
  naming_params: string
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

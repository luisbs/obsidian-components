export interface PluginSettings {
  /** Stores the plugin behavior about enabled fragments. */
  default_behavior: PluginBehavior
  /**
   * Stores the plugin naming strategy.
   * - `'short'` includes only the shortest names
   * - `'long'` includes the shortest and the long names
   * - `'all'` includes all the possible names
   */
  naming_strategy: 'SHORT' | 'LONG' | 'ALL'
  /** Stores the names to reference each enabled fragment. */
  resolution_names: Record<string, string[]>

  /** Stores the route where the fragments are. */
  fragments_folder: string
  /** Stores the fragments found on the vault. */
  fragments_found: Record<string, FoundFragment>
  /** Stores the fragments enabled by the user. */
  fragments_enabled: string[]

  /** Stores fragment formats defined by the user. */
  formats_custom: CustomFragmentFormat[]
  /** Stores the fragment formats enabled by the user. */
  formats_enabled: string[]
}

/**
 * Behavior of the plugin
 * about fragments discovery
 */
export type PluginBehavior =
  /**
   * Disable all fragments by default.
   * Allow the fragments enabled by the user.
   */
  | 'DENY'
  /**
   * Disable all fragments by default.
   * Allow the fragments enabled by the user.
   * Allow the fragments with formats enabled by the user.
   */
  | 'ALLOW_ENABLED'
  /**
   * Enable all the fragments.
   */
  | 'ALLOW_ALL'

/**
 * Defines a fragment format.
 */
export interface FragmentFormat {
  /**
   * Unique Identifier for the format.
   */
  id: string
  /**
   * Defines the extension of the files
   * with this format.
   */
  ext: string
  /**
   * Defines the type of behavior of the fragments
   * - `code` corresponds with formats that can handle the DOM a.k.a. **javascript**
   * - `html` the fragment return **HTML**
   * - `md` the fragment return **Markdown**
   */
  type: 'code' | 'html' | 'md'
}

/**
 * Defines a fragment format define by the user.
 */
export interface CustomFragmentFormat extends FragmentFormat {
  // TODO: define a CustomFragmentFormat
  // maybe things like call a cli command
  // Or things with
}

/**
 * Defines a fragment found on the vault.
 */
export interface FoundFragment {
  /** Absolute path of the file on the vault. */
  path: string
  /** Fragment format identifier. */
  format: string
}

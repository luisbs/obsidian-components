export interface PluginSettings {
  /**
   * Stores the plugin behavior about fragments discovery.
   * - `'DENY'` allow only fragments enabled by the user.
   * - `'ALLOW_ENABLED'` allow fragments by user input and format.
   * - `'ALLOW_ALL'` allow all the fragments.
   */
  default_behavior: 'DENY' | 'ALLOW_ENABLED' | 'ALLOW_ALL'

  /**
   * Stores the naming method for the vault.
   * - `'INLINE'` specify the name as an inline string (e.g. `use book`)
   * - `'PARAM'` specify the name as a param (e.g. `__name: 'book'`)
   * - `'BOTH'` use both methods
   */
  naming_method: 'INLINE' | 'PARAM' | 'BOTH'
  /**
   * Stores the plugin naming strategy.
   * - `'SHORT'` includes only the shortest names
   * - `'LONG'` includes the shortest and the long names
   * - `'ALL'` includes all the possible names
   */
  naming_strategy: 'SHORT' | 'LONG' | 'ALL'
  /** Stores the names to reference each enabled fragment. */
  resolution_names: Record<string, string[]>

  /** Stores the route where the fragments are. */
  fragments_folder: string
  /** Stores the fragments found on the vault. */
  fragments_found: Record<string, FragmentFound>

  /** Stores fragment formats defined by the user. */
  formats_custom: CustomFragmentFormat[]
  /** Stores the fragment formats enabled by the user. */
  formats_enabled: string[]
}

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
  ext: RegExp
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
export interface FragmentFound {
  /** Absolute path of the file on the vault. */
  path: string
  /** Fragment format identifier. */
  format: string
  /** Enforced state defined by the user. */
  enabled: boolean | null
}

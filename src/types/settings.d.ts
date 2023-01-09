export interface PluginSettings {
  /**
   * Stores the plugin behavior about fragments discovery.
   * - `'STRICT'` allow only fragments enabled by the user.
   * - `'FLEXIBLE'` allow fragments by user input and format.
   * - `'ALL'` allow all the fragments.
   */
  enable_fragments: 'STRICT' | 'FLEXIBLE' | 'ALL'
  /** Stores the user desition to use custom codeblocks. */
  enable_codeblocks: boolean

  /**
   * Stores the fragment naming method for the vault.
   * - `'INLINE'` specify the name as an inline string (e.g. `use book`)
   * - `'PARAM'` specify the name as a param (e.g. `__name: 'book'`)
   * - `'BOTH'` use both methods
   */
  naming_method: 'INLINE' | 'PARAM' | 'BOTH'
  /**
   * Stores the fragments naming strategy.
   * - `'SHORT'` includes only the short names
   * - `'LONG'` includes the short and long names
   * - `'ALL'` includes all the possible names
   */
  naming_strategy: 'SHORT' | 'LONG' | 'ALL'

  /** Stores the fragment formats enabled by the user. */
  formats_enabled: string[]

  /** Stores the route where the fragments are. */
  fragments_folder: string
  /** Stores the fragments found on the vault. */
  fragments_found: Record<string, FragmentFound>

  /** Stores the currently enabled fragments. */
  current_fragments: Record<string, string[]>
  /** Stores the currently enabled codeblocks. */
  current_codeblocks: Record<string, string[]>
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
 * Defines a fragment found on the vault.
 */
export interface FragmentFound {
  /** Absolute path of the file on the vault. */
  path: string
  /** Fragment format identifier. */
  format: string
  /** Enforced state defined by the user. */
  enabled: boolean | null
  /** User defined names to use as Codeblocks */
  names: string[]
}

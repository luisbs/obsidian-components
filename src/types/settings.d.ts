export interface PluginSettings {
  /**
   * Stores the root where the fragments are.
   */
  fragments_folder: string

  /**
   * Stores the plugin behavior about enabled fragments.
   */
  default_behavior: PluginBehavior
  /**
   * Stores the fragment formats enabled by the user.
   */
  formats_enabled: string[]
  /**
   * Stores the fragments enabled by the user.
   */
  fragments_enabled: string[]

  /**
   * Stores fragment formats defined by the user.
   */
  custom_formats: CustomFragmentFormat[]
}

/**
 * Behavior of the plugin
 * about fragments discovery
 */
export enum PluginBehavior {
  /**
   * Disable all fragments by default
   * except the ones enabled by the user.
   */
  DENY_ALL,
  /**
   * Disable all fragments by default
   * except the ones enabled by the user
   * and the ones with formats enabled by the user.
   */
  ALLOW_ENABLED,
  /**
   * Enable all the fragments.
   */
  ALLOW_ALL,
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
}

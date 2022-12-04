export { default as FragmentsPlugin } from '../main'

export type {
  PluginSettings,
  PluginBehavior,
  FragmentFormat,
  CustomFragmentFormat,
  FoundFragment,
} from './settings'

export type SupportedSyntax = 'js'

export interface FragmentHeader {
  source: string
  syntax: SupportedSyntax
  path: string
  fileFound: boolean
}

/**
 *
 */
export interface FragmentSettings {
  /**
   * Path of the fragment file.
   */
  path: string
  /**
   * Id of the FragmentFormat this Fragment matches.
   */
  format: string
  /**
   * Defines if the fragment has been enabled by the user.
   */
  enabled: boolean
}

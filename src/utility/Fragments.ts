import { PluginBehavior, PluginSettings } from '@/types/settings'

/**
 * Check if the fragment is enabled.
 */
export function isFragmentEnabled(
  fragment: string,
  settings: PluginSettings,
): boolean {
  if (settings.default_behavior === PluginBehavior.ALLOW_ALL) {
    return true
  }

  if (typeof fragment === 'string') {
    return settings.fragments_enabled.contains(fragment)
  }

  return false
}

/**
 * Generates an identifier for the fragment.
 */
export function getFragmentId(): string {
  // TODO: define a serialization algoritm
  return ''
}

export function serializeFragment(): {} {
  // TODO: define a serialization algoritm
  return {}
}

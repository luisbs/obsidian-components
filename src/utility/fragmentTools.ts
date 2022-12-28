import type { FoundFragment, PluginSettings } from '@/types/settings'
import { Vault } from 'obsidian'
import { getFilesOnFolder } from 'obsidian-fnc'
import { mergeFormats } from './formatTools'

/**
 * Load the valid fragments on the vault.
 */
export function loadFragmentsOnVault(
  vault: Vault,
  settings: PluginSettings,
): PluginSettings['fragments_found'] {
  const supported = mergeFormats(settings)

  const files = getFilesOnFolder(vault, settings.fragments_folder)

  const fragments: PluginSettings['fragments_found'] = {}
  for (const file of files) {
    const format = supported.find((format) => file.name.endsWith(format.ext))
    if (!format) continue

    fragments[file.path] = { path: file.path, format: format.id }
  }

  return fragments
}

export function getFragmentByName(
  name: string,
  settings: PluginSettings,
): FoundFragment | null {
  for (const fragmentId in settings.resolution_names) {
    if (settings.resolution_names[fragmentId].contains(name)) {
      return settings.fragments_found[fragmentId] || null
    }
  }

  return null
}

/**
 * Check if the fragment is enabled.
 */
export function isFragmentEnabled(
  fragment: string | FoundFragment,
  settings: PluginSettings,
): boolean {
  if (settings.default_behavior === 'ALLOW_ALL') {
    // if the behavior allows all the fragments
    return true
  }

  if (settings.default_behavior === 'ALLOW_ENABLED') {
    // if the behavior allows whitelisted fragments and formats
    return (
      isFragmentEnabledByUser(fragment, settings) ||
      isFragmentEnabledByFormat(fragment, settings)
    )
  }

  // if the behavior allows only whitelisted fragments
  return isFragmentEnabledByUser(fragment, settings)
}

/** Check if the fragment is enabled by the user. */
export function isFragmentEnabledByUser(
  fragment: string | FoundFragment,
  settings: PluginSettings,
): boolean {
  const fragmentId = typeof fragment === 'string' ? fragment : fragment.path

  // check if the fragment has been whitelisted
  return settings.fragments_enabled.contains(fragmentId)
}

/** Check if the fragment is enabled by an enabled format. */
export function isFragmentEnabledByFormat(
  fragment: string | FoundFragment,
  settings: PluginSettings,
): boolean {
  // if the behavior allows only whitelisted fragments
  if (settings.default_behavior === 'DENY') {
    return false
  }

  if (typeof fragment === 'string') {
    fragment = settings.fragments_found[fragment]
  }

  if (!fragment) return false

  // if the behavior allows the user whitelisted formats
  // check if the format has been whitelisted
  return settings.formats_enabled.contains(fragment.format)
}
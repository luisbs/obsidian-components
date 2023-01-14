import type { FragmentFound, PluginSettings } from '@/types/settings'
import { Vault } from 'obsidian'
import { getFilesOnFolder } from 'obsidian-fnc'
import { isRecord } from './common'
import { getSupportedFormats } from './formatTools'

/**
 * Load the valid fragments on the vault.
 */
export function loadFragmentsOnVault(
  vault: Vault,
  settings: PluginSettings,
): PluginSettings['fragments_found'] {
  const supported = getSupportedFormats()

  const files = getFilesOnFolder(vault, settings.fragments_folder)

  const fragments: PluginSettings['fragments_found'] = {}
  for (const file of files) {
    const format = supported.find((format) => format.ext.test(file.name))
    if (!format) continue

    const prev = settings.fragments_found[file.path] as
      | FragmentFound
      | undefined
    fragments[file.path] = {
      path: file.path,
      format: format.id,

      // keep the previous configuration
      enabled: prev?.enabled ?? null,
      raw_names: prev?.raw_names ?? '',
      names: prev?.names ?? [],
    }
  }

  return fragments
}

export function getFragmentById(
  fragmentId: string,
  settings: PluginSettings,
): FragmentFound | null {
  return settings.fragments_found[fragmentId] || null
}

export function getFragmentByName(
  name: string,
  settings: PluginSettings,
): FragmentFound | null {
  for (const fragmentId in settings.current_fragments) {
    if (settings.current_fragments[fragmentId].contains(name)) {
      return settings.fragments_found[fragmentId] || null
    }
  }

  return null
}

/**
 * Check if the fragment is enabled.
 */
export function isFragmentEnabled(
  fragment: string | FragmentFound,
  settings: PluginSettings,
): boolean {
  if (isFragmentDisabledByUser(fragment, settings)) {
    return false
  }

  if (settings.enable_fragments === 'ALL') {
    // if the behavior allows all the fragments
    return true
  }

  if (settings.enable_fragments === 'STRICT') {
    // if the behavior allows only whitelisted fragments
    return isFragmentEnabledByUser(fragment, settings)
  }

  // if the behavior allows whitelisted fragments and formats
  return (
    isFragmentEnabledByUser(fragment, settings) ||
    isFragmentEnabledByFormat(fragment, settings)
  )
}

/** Check if the fragment is enabled by an enabled format. */
export function isFragmentEnabledByFormat(
  fragment: string | FragmentFound,
  settings: PluginSettings,
): boolean {
  // if the behavior allows only whitelisted fragments
  if (settings.enable_fragments === 'STRICT') {
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

/** Check if the fragment is enabled by the user. */
export function isFragmentEnabledByUser(
  fragment: string | FragmentFound,
  settings: PluginSettings,
): boolean {
  if (typeof fragment === 'string') {
    fragment = settings.fragments_found[fragment]
  }

  // check if the fragment has been whitelisted
  return isRecord(fragment) && fragment.enabled === true
}

/** Check if the fragment is enabled by the user. */
export function isFragmentDisabledByUser(
  fragment: string | FragmentFound,
  settings: PluginSettings,
): boolean {
  if (typeof fragment === 'string') {
    fragment = settings.fragments_found[fragment]
  }

  // check if the fragment has been whitelisted
  return isRecord(fragment) && fragment.enabled === false
}

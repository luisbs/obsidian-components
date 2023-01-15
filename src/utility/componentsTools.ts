import type { ComponentFound, PluginSettings } from '@/types/settings'
import { Vault } from 'obsidian'
import { getFilesOnFolder } from 'obsidian-fnc'
import { isRecord } from './common'
import { getSupportedFormats } from './formatsTools'

/**
 * Load the valid components on the vault.
 */
export function loadComponentsOnVault(
  vault: Vault,
  settings: PluginSettings,
): PluginSettings['components_found'] {
  const supported = getSupportedFormats()

  const files = getFilesOnFolder(vault, settings.components_folder)

  const components: PluginSettings['components_found'] = {}
  for (const file of files) {
    const format = supported.find((format) => format.ext.test(file.name))
    if (!format) continue

    const prev = settings.components_found[file.path] as
      | ComponentFound
      | undefined
    components[file.path] = {
      path: file.path,
      format: format.id,

      // keep the previous configuration
      enabled: prev?.enabled ?? null,
      names: prev?.names ?? '',
    }
  }

  return components
}

export function getComponentById(
  componentId: string,
  settings: PluginSettings,
): ComponentFound | null {
  return settings.components_found[componentId] || null
}

/**
 * Check if the component is enabled.
 */
export function isComponentEnabled(
  component: string | ComponentFound,
  settings: PluginSettings,
): boolean {
  if (isComponentDisabledByUser(component, settings)) {
    return false
  }

  if (settings.enable_components === 'ALL') {
    // if the behavior allows all the components
    return true
  }

  if (settings.enable_components === 'STRICT') {
    // if the behavior allows only whitelisted components
    return isComponentEnabledByUser(component, settings)
  }

  // if the behavior allows whitelisted components and formats
  return (
    isComponentEnabledByUser(component, settings) ||
    isComponentEnabledByFormat(component, settings)
  )
}

/** Check if the component is enabled by an enabled format. */
export function isComponentEnabledByFormat(
  component: string | ComponentFound,
  settings: PluginSettings,
): boolean {
  // if the behavior allows only whitelisted components
  if (settings.enable_components === 'STRICT') {
    return false
  }

  if (typeof component === 'string') {
    component = settings.components_found[component]
  }

  if (!component) return false

  // if the behavior allows the user whitelisted formats
  // check if the format has been whitelisted
  return settings.formats_enabled.contains(component.format)
}

/** Check if the component is enabled by the user. */
export function isComponentEnabledByUser(
  component: string | ComponentFound,
  settings: PluginSettings,
): boolean {
  if (typeof component === 'string') {
    component = settings.components_found[component]
  }

  // check if the component has been whitelisted
  return isRecord(component) && component.enabled === true
}

/** Check if the component is enabled by the user. */
export function isComponentDisabledByUser(
  component: string | ComponentFound,
  settings: PluginSettings,
): boolean {
  if (typeof component === 'string') {
    component = settings.components_found[component]
  }

  // check if the component has been whitelisted
  return isRecord(component) && component.enabled === false
}

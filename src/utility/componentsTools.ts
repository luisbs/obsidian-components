import type { ComponentFound, PluginSettings } from '@/types'
import type { Vault } from 'obsidian'
import { getFilesOnFolder } from 'obsidian-fnc'
import { getSupportedFormats, isFormatEnabled } from './formatsTools'

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
      names: prev?.names ?? '',
    }
  }

  // TODO: modify
  console.log('obsidian-components: Found components on vault')
  console.debug(components)
  return components
}

/**
 * Get a component definition from its id.
 */
export function getComponentById(
  componentId: string,
  settings: PluginSettings,
): ComponentFound | undefined {
  return settings.components_found[componentId]
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

  // if the behavior allows all the components
  if (settings.enable_components === 'ALL') {
    return true
  }

  // if the behavior allows only whitelisted components
  if (settings.enable_components === 'STRICT') {
    return isComponentEnabledByUser(component, settings)
  }

  // if the behavior allows whitelisted components and formats
  return (
    isComponentEnabledByUser(component, settings) ||
    isComponentEnabledByFormat(component, settings)
  )
}

/**
 * Check if the component is enabled by an enabled format.
 */
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
  return isFormatEnabled(component.format, settings)
}

/**
 * Check if the component is enabled by the user.
 */
export function isComponentEnabledByUser(
  component: string | ComponentFound,
  settings: PluginSettings,
): boolean {
  const componentId = typeof component === 'string' ? component : component.path

  // check if the component has been whitelisted
  return settings.enabled_components.get(componentId) === true
}

/**
 * Check if the component is disabled by the user.
 */
export function isComponentDisabledByUser(
  component: string | ComponentFound,
  settings: PluginSettings,
): boolean {
  const componentId = typeof component === 'string' ? component : component.path

  // check if the component has been blacklisted
  return settings.enabled_components.get(componentId) === false
}

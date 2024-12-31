import type {
  ComponentConfig,
  ComponentMatcher,
  FormatMatcher,
  PluginSettings,
} from '@/types'
import type { TFile, Vault } from 'obsidian'
import { getFilesOnFolder } from 'obsidian-fnc'
import { compareFormats, getFormatByPath } from './formats'
import { parseStringList } from './common'
import { MapStore } from './MapStore'

export function loadComponentsOnVault(
  vault: Vault,
  componentsFolder: string,
  previousComponents: ComponentConfig[],
): ComponentConfig[] {
  // filter valid component files
  const files = [] as Array<{ file: TFile; format: FormatMatcher }>
  for (const file of getFilesOnFolder(vault, componentsFolder)) {
    const format = getFormatByPath(file.name)
    if (format) files.push({ file, format })
  }

  // sort components by format and path
  files.sort((a, b) => {
    const comparison = compareFormats(a.format.tags, b.format.tags)
    if (comparison !== 0) return comparison
    // on same format, sort by path
    return a.file.path.localeCompare(b.file.path, 'en')
  })

  // keep previous configuration
  return files.map(({ file }) => {
    const prev = previousComponents.find((c) => c.id === file.name)
    return {
      id: file.name,
      path: file.path,
      names: prev?.names || file.basename.replaceAll('.', '_'),
      enabled: prev?.enabled || false,
    } as ComponentConfig
  })
}

export function prepareComponentNames(
  settings: PluginSettings,
): MapStore<string> {
  const result = new MapStore<string>()

  for (const component of settings.components_config) {
    if (!component.enabled) continue
    for (const name of parseStringList(component.names)) {
      // only uses free-names
      if (result.hasValue(name)) continue
      result.push(component.id, name)
    }
  }

  return result
}

export function prepareComponentMatchers(
  settings: PluginSettings,
  componentsEnabled: MapStore<string>,
): ComponentMatcher[] {
  return settings.components_config.reduce((arr, component) => {
    const format = getFormatByPath(component.path)
    if (format && component.enabled) {
      arr.push({
        id: component.id,
        path: component.path,
        test: [].contains.bind(componentsEnabled.get(component.id)),
        getTags: () => format.tags,
      })
    }
    return arr
  }, [] as ComponentMatcher[])
}

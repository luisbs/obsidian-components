import type { ComponentConfig, ComponentMatcher, PluginSettings } from '@/types'
import type { Vault } from 'obsidian'
import { getFilesOnFolder } from '@luis.bs/obsidian-fnc'
import { parseStringList } from './common'
import { MapStore } from './MapStore'

export function loadComponentsOnVault(
    vault: Vault,
    componentsFolder: string,
    previousComponents: ComponentConfig[],
): ComponentConfig[] {
    const files = getFilesOnFolder(vault, componentsFolder)
    files.sort((a, b) => a.path.localeCompare(b.path, 'en'))

    // keep previous configuration
    return files.map((file) => {
        const prev = previousComponents.find((c) => c.id === file.name)
        return {
            id: file.name,
            path: file.path,
            names: prev?.names ?? file.basename.replaceAll('.', '_'),
            enabled: prev?.enabled ?? false,
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
    const result: ComponentMatcher[] = []
    for (const component of settings.components_config) {
        if (!component.enabled) continue
        result.push({
            id: component.id,
            path: component.path,
            test: [].contains.bind(componentsEnabled.get(component.id)),
        })
    }
    return result
}

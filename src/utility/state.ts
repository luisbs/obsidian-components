import type {
    ComponentMatcher,
    ComponentsPlugin,
    PluginSettings,
    PluginState,
} from '@/types'
import { MapStore } from './MapStore'

export function prepareState(plugin: ComponentsPlugin): PluginState {
    const names = prepareComponentNames(plugin.settings)
    return {
        components_enabled: names,
        components_matchers: prepareComponentMatchers(plugin.settings, names),
    }
}

export function parseStringList(source: string): string[] {
    return source.split(/[|;,\s]+/gi).reduce<string[]>((arr, str) => {
        // keep only basic values [A-Za-z0-9_]
        str = str.replace(/\W*/gi, '')
        // add values only onces
        if (str.length > 0 && !arr.includes(str)) arr.push(str)
        return arr
    }, [])
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

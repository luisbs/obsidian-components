import { MapStore } from './utility'
import ComponentsPlugin from './main'

export { ComponentsPlugin }

//#region Plugin State

export interface PluginState {
    /** Stores the currently enabled **Component** name references. */
    components_enabled: MapStore<string>
    /** Stores the currently active **Component**. */
    components_matchers: ComponentMatcher[]
}

export interface ComponentMatcher {
    /** Identifier for the **Component**. */
    id: string
    /** Vault-path of the **Component**. */
    path: string
    /** Checks if the `customName` matches the user-defined names. */
    test(customName: string): boolean
    /** Obtains the related format tags. */
    getTags(): string[]
}

export interface FormatMatcher {
    /** Defines the behavior of the **Component**. */
    tags: string[]
    /** Checks if the `componentPath` matches the expected extension. */
    test(componentPath: string): boolean
}

//#endregion

//#region Plugin Settings

export interface PluginSettings {
    /** Stores the user desition to allow custom codeblocks. */
    enable_codeblocks: boolean
    /** Stores the user desition to allow separators on codeblocks. */
    enable_separators: boolean
    /** Separator to use inside codeblocks. */
    usage_separator: string

    /** Stores the route where the components versions should be cached. */
    cache_folder: string
    /** Vault-path where the components are located. */
    components_folder: string
    /** The Components found on the vault. */
    components_config: ComponentConfig[]
}

export interface ComponentConfig {
    /** Identifier of the **Component**. */
    id: string
    /** Vault-path of the file. */
    path: string
    /** User custom names. */
    names: string
    /** Whether the **Component** should run. */
    enabled: boolean
}

//#endregion

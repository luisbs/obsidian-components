import { TFile } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import { MapStore } from './utility'
import ComponentsPlugin from './main'
import { RendererFormat } from './codeblocks/renderers/BaseRenderer'

export { ComponentsPlugin }

//#region Plugin State

export interface PluginState {
    /** Stores the currently parameters that can be used to define a **Component** name. */
    name_params: string[]
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
    getTags(): RendererFormat[]
}

export interface FormatMatcher {
    /**
     * Defines the behavior of the **Component**:
     * - `md` the **Component** returns **Markdown**
     * - `html` the **Component** returns **HTML**
     * - `code` the **Component** handles the **DOM** (**javascript**)
     * - `esm` the **Component** uses **ESModules** syntax
     * - `cjs` the **Component** uses **CommonJS** syntax
     */
    tags: RendererFormat[]
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

    /** Stores the route where the components versions should be cached. */
    cache_folder: string

    /**
     * The **Component** naming method.
     * - `'INLINE'` specify the name as an inline string (e.g. `use book`)
     * - `'PARAM'` specify the name as a param (e.g. `__name: 'book'`)
     * - `'BOTH'` use both methods
     * @deprecated
     */
    usage_method: 'INLINE' | 'PARAM' | 'BOTH'
    /** Which params can be used to retrive a **Component** name. */
    usage_naming: string
    /** Separator to use inside codeblocks. */
    usage_separator: string

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

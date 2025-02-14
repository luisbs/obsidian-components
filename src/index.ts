// Idea taken from obsidian-dataview
import type { App, TFile } from 'obsidian'

/** Public API for third-party integration. */
export interface ComponentsPluginAPI {
    /** Tries to refresh the components rendered instances. */
    refresh(filepath: string): void
    /** Maps a file to its more recent version. */
    latest(filePath: string): TFile
    /** Tries to import/request the latest version of a file. */
    resolve(filePath: string): Promise<unknown>
    /** Tries to import/request a file. */
    source(file: TFile): Promise<unknown>
}

///////////////////////
// Utility Functions //
///////////////////////

/** Determine if Dataview is enabled in the given application. */
export const isPluginEnabled = (app: App) => {
    // @ts-expect-error non-standard API
    // eslint-disable-next-line
    app.plugins.enabledPlugins.has('components')
}

/**
 * Get the current Components API from the app if provided;
 * otherwise it is inferred from the global API object installed
 * on the window.
 */
export const getAPI = (app?: App): ComponentsPluginAPI | undefined => {
    // @ts-expect-error non-standard API
    // eslint-disable-next-line
    if (app) return app.plugins.plugins['components']?.api
    // @ts-expect-error non-standard API
    // eslint-disable-next-line
    return window.Components
}

import type { LogLevel } from '@luis.bs/obsidian-fnc'

//#region LogLevel
export type PluginLevel = keyof typeof LogLevel
export const LEVEL_LABELS: Record<PluginLevel, string> = {
    ERROR: 'ERROR',
    WARN: ' WARN',
    INFO: ' INFO',
    DEBUG: 'DEBUG',
    TRACE: 'TRACE',
}
//#endregion LogLevel

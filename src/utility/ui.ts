import { FragmentsPluginSettings } from '@/types'
import { createContext } from 'preact'

export { default as PreactRenderer } from '@ui/PreactRenderer'

export interface PluginContext {
  settings: FragmentsPluginSettings
  containerEl: HTMLElement
}

export const SettingsContext = createContext<PluginContext>(undefined!)

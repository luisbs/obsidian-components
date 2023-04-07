import type { ComponentFormat, PluginSettings } from '@/types'

/** Get a list of the default formats. */
function SupportedFormats(): ComponentFormat[] {
  return [
    // html/markdown
    { id: 'html', ext: /\.html$/i, type: 'html' },
    { id: 'markdown', ext: /\.md$/i, type: 'md' },

    // javascript
    { id: 'javascript_html', ext: /\.html\.c?js$/i, type: 'html' },
    { id: 'javascript_markdown', ext: /\.md\.c?js$/i, type: 'md' },
    { id: 'javascript_code', ext: /\.c?js$/i, type: 'code' },
  ]
}

export function getSupportedFormats(): Array<ComponentFormat> {
  return SupportedFormats()
}

export function getFormatById(
  formatId: string,
  settings: PluginSettings,
): ComponentFormat | undefined {
  return getSupportedFormats().find((format) => format.id === formatId)
}

/**
 * Check if the format is enabled.
 */
export function isFormatEnabled(
  format: string | ComponentFormat,
  settings: PluginSettings,
): boolean {
  // if the behavior is to allow all the components by default
  if (settings.enable_components === 'ALL') {
    return true
  }

  const formatId = typeof format === 'string' ? format : format.id

  // check if the format has been whitelisted
  return settings.enabled_formats.has(formatId)
}

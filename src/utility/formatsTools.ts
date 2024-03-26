import type { ComponentFormat, PluginSettings } from '@/types'

/**
 * Get a list of the default formats.
 */
export function getSupportedFormats(): ComponentFormat[] {
  // as function to prevent any values mixin on the regex
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

/**
 * Get a format definition from its id.
 */
export function getFormatById(formatId: string): ComponentFormat | undefined {
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
  if (settings.enable_components === 'ALL') return true

  // check if the format has been whitelisted
  const formatId = typeof format === 'string' ? format : format.id
  return settings.enabled_formats.has(formatId)
}

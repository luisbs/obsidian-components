import type { FragmentFormat, PluginSettings } from '@/types'

/** Get a list of the default formats. */
function SupportedFormats(): FragmentFormat[] {
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

export function getSupportedFormats(): Array<FragmentFormat> {
  return SupportedFormats()
}

export function getFormat(
  formatId: string,
  settings: PluginSettings,
): FragmentFormat | undefined {
  return getSupportedFormats().find((format) => format.id === formatId)
}

/**
 * Check if the format is enabled.
 */
export function isFormatEnabled(
  format: string | FragmentFormat,
  settings: PluginSettings,
): boolean {
  // if the behavior is to allow all the fragments by default
  if (settings.enable_fragments === 'ALL') {
    return true
  }

  const formatId = typeof format === 'string' ? format : format.id

  // if the format has been whitelisted
  return settings.formats_enabled.contains(formatId)
}

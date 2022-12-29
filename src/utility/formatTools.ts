import type {
  CustomFragmentFormat,
  FragmentFormat,
  PluginSettings,
} from '@/types'

/** Get a list of the default formats. */
const SupportedFormats: FragmentFormat[] = [
  // html/markdown
  { id: 'html', ext: /\.html$/i, type: 'html' },
  { id: 'markdown', ext: /\.md$/i, type: 'md' },

  // javascript
  { id: 'javascript_html', ext: /\.html\.c?js$/i, type: 'html' },
  { id: 'javascript_markdown', ext: /\.md\.c?js$/i, type: 'md' },
  { id: 'javascript_code', ext: /\.c?js$/i, type: 'code' },
]

export function mergeFormats(
  settings: PluginSettings,
): Array<FragmentFormat | CustomFragmentFormat> {
  return [...SupportedFormats, ...settings.formats_custom]
}

export function getFormat(
  formatId: string,
  settings: PluginSettings,
): FragmentFormat | CustomFragmentFormat | undefined {
  return mergeFormats(settings).find((format) => format.id === formatId)
}

/**
 * Check if the format is enabled.
 */
export function isFormatEnabled(
  format: string | FragmentFormat,
  settings: PluginSettings,
): boolean {
  // if the behavior is to allow all the fragments by default
  if (settings.default_behavior === 'ALLOW_ALL') {
    return true
  }

  const formatId = typeof format === 'string' ? format : format.id

  // if the format has been whitelisted
  return settings.formats_enabled.contains(formatId)
}

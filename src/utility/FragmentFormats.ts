import {
  CustomFragmentFormat,
  FragmentFormat,
  PluginBehavior,
  PluginSettings,
} from '@/types/settings'

/**
 * Get a list of the default formats.
 */
export function SupportedFormats(): FragmentFormat[] {
  return [
    { id: 'javascript_md', ext: '.md.js', type: 'md' },
    { id: 'javascript_html', ext: '.html.js', type: 'html' },
    { id: 'javascript_code', ext: '.js', type: 'code' },
    //
  ]
}

/**
 * Check if the format is enabled.
 */
export function isFormatEnabled(
  format: string | FragmentFormat,
  settings: PluginSettings,
): boolean {
  if (settings.default_behavior === PluginBehavior.DENY_ALL) {
    return false
  }

  if (settings.default_behavior === PluginBehavior.ALLOW_ALL) {
    return true
  }

  if (typeof format === 'string') {
    return settings.formats_enabled.contains(format)
  }

  if (typeof format === 'object') {
    return !!format.id && settings.formats_enabled.contains(format.id)
  }

  return false
}

export function mergeFormats(
  settings: PluginSettings,
): Array<FragmentFormat | CustomFragmentFormat> {
  return SupportedFormats().concat(settings.custom_formats)
}

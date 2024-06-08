import type { ComponentFormat, PluginSettings } from '@/types'

/**
 * Get a list of the default formats.
 */
export function getSupportedFormats(): ComponentFormat[] {
  // as function to prevent any values mixin on the regex
  // prettier-ignore
  return [
    // html/markdown
    { id: 'html', ext: /\.html$/i, type: 'html', tags: ['html'] },
    { id: 'markdown', ext: /\.md$/i, type: 'md', tags: ['md'] },

    // CommonJS
    { id: 'commonjs_html', ext: /\.html\.cjs$/i, type: 'html', tags: ['commonjs', 'html'] },
    { id: 'commonjs_markdown', ext: /\.md\.cjs$/i, type: 'md', tags: ['commonjs', 'md'] },
    { id: 'commonjs_code', ext: /\.cjs$/i, type: 'code', tags: ['commonjs', 'code'] },

    // ESModules
    { id: 'esmodules_html', ext: /\.html\.js$/i, type: 'html', tags: ['esmodules', 'html',] },
    { id: 'esmodules_markdown', ext: /\.md\.js$/i, type: 'md', tags: ['esmodules', 'md',] },
    { id: 'esmodules_code', ext: /\.js$/i, type: 'code', tags: ['esmodules', 'code',] },
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

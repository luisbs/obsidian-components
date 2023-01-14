import type { FragmentFound, FragmentsPlugin } from '@/types'
import { getFormatById, isFragmentEnabled } from '@/utility'
import { CodeblockError } from '../CodeblockError'

import type { Renderer } from './Renderer'
export { Renderer }

import {
  HTMLRenderer,
  JavascriptCodeRenderer,
  JavascriptHTMLRenderer,
  JavascriptMarkdownRenderer,
  MarkdownRenderer,
} from './BasicRenderers'

export function getRenderer(
  plugin: FragmentsPlugin,
  fragment: FragmentFound | null,
): Renderer {
  if (!fragment) {
    throw new CodeblockError('unknown-fragment')
  }

  if (!isFragmentEnabled(fragment, plugin.settings)) {
    throw new CodeblockError('disabled-fragment')
  }

  const format = getFormatById(fragment.format, plugin.settings)
  if (!format) throw new CodeblockError('missing-fragment-renderer')

  switch (format.id) {
    case 'html':
      return new HTMLRenderer(plugin, fragment)
    case 'markdown':
      return new MarkdownRenderer(plugin, fragment)

    case 'javascript_html':
      return new JavascriptHTMLRenderer(plugin, fragment)
    case 'javascript_markdown':
      return new JavascriptMarkdownRenderer(plugin, fragment)
    case 'javascript_code':
      return new JavascriptCodeRenderer(plugin, fragment)
  }

  throw new CodeblockError('missing-fragment-renderer')
}

import type { ComponentFound, ComponentsPlugin } from '@/types'
import { getFormatById, isComponentEnabled } from '@/utility'
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
  plugin: ComponentsPlugin,
  component: ComponentFound | null,
): Renderer {
  if (!component) {
    throw new CodeblockError('unknown-component')
  }

  if (!isComponentEnabled(component, plugin.settings)) {
    throw new CodeblockError('disabled-component')
  }

  const format = getFormatById(component.format, plugin.settings)
  if (!format) throw new CodeblockError('missing-component-renderer')

  switch (format.id) {
    case 'html':
      return new HTMLRenderer(plugin, component)
    case 'markdown':
      return new MarkdownRenderer(plugin, component)

    case 'javascript_html':
      return new JavascriptHTMLRenderer(plugin, component)
    case 'javascript_markdown':
      return new JavascriptMarkdownRenderer(plugin, component)
    case 'javascript_code':
      return new JavascriptCodeRenderer(plugin, component)
  }

  throw new CodeblockError('missing-component-renderer')
}

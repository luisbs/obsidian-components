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
  element: HTMLElement,
  plugin: ComponentsPlugin,
  component: ComponentFound,
  data: unknown,
): Renderer {
  if (!isComponentEnabled(component, plugin.settings)) {
    throw new CodeblockError('disabled-component')
  }

  const format = getFormatById(component.format, plugin.settings)
  if (!format) throw new CodeblockError('missing-component-renderer')

  switch (format.id) {
    case 'html':
      return new HTMLRenderer(element, plugin, component, data)
    case 'markdown':
      return new MarkdownRenderer(element, plugin, component, data)

    case 'javascript_html':
      return new JavascriptHTMLRenderer(element, plugin, component, data)
    case 'javascript_markdown':
      return new JavascriptMarkdownRenderer(element, plugin, component, data)
    case 'javascript_code':
      return new JavascriptCodeRenderer(element, plugin, component, data)
  }

  throw new CodeblockError('missing-component-renderer')
}

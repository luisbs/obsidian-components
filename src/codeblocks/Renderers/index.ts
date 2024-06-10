import type { ComponentFound, ComponentsPlugin } from '@/types'
import { getFormatById, isComponentEnabled } from '@/utility'
import { ComponentError } from '../ComponentError'
import { Renderer } from './Renderer'
import { HTMLRenderer, MarkdownRenderer } from './TextRenderers'
import {
  JavascriptCodeRenderer,
  JavascriptHTMLRenderer,
  JavascriptMarkdownRenderer,
} from './JavascriptRenderers'

export { Renderer } from './Renderer'

export function getRenderer(
  element: HTMLElement,
  plugin: ComponentsPlugin,
  component: ComponentFound,
  data: unknown,
): Renderer {
  if (!isComponentEnabled(component, plugin.settings)) {
    throw new ComponentError('disabled-component')
  }

  const f = getFormatById(component.format)
  if (!f) throw new ComponentError('missing-component-renderer')

  switch (f.id) {
    case 'html':
      return new HTMLRenderer(element, plugin, f, component, data)
    case 'markdown':
      return new MarkdownRenderer(element, plugin, f, component, data)

    case 'commonjs_html':
    case 'esmodules_html':
      return new JavascriptHTMLRenderer(element, plugin, f, component, data)
    case 'commonjs_markdown':
    case 'esmodules_markdown':
      return new JavascriptMarkdownRenderer(element, plugin, f, component, data)
    case 'commonjs_code':
    case 'esmodules_code':
      return new JavascriptCodeRenderer(element, plugin, f, component, data)
  }

  throw new ComponentError('missing-component-renderer')
}

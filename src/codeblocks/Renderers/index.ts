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
  notepath: string,
  data: unknown,
): Renderer {
  if (!isComponentEnabled(component, plugin.settings)) {
    throw new ComponentError('disabled-component')
  }

  const f = getFormatById(component.format)
  if (!f) throw new ComponentError('missing-component-renderer')

  // prettier-ignore
  switch (f.id) {
    case 'html':
      return new HTMLRenderer(element, plugin, notepath, f, component, data)
    case 'markdown':
      return new MarkdownRenderer(element, plugin, notepath, f, component, data)

    case 'commonjs_html':
    case 'esmodules_html':
      return new JavascriptHTMLRenderer(element, plugin, notepath, f, component, data)
    case 'commonjs_markdown':
    case 'esmodules_markdown':
      return new JavascriptMarkdownRenderer(element, plugin, notepath, f, component, data)
    case 'commonjs_code':
    case 'esmodules_code':
      return new JavascriptCodeRenderer(element, plugin, notepath, f, component, data)
  }

  throw new ComponentError('missing-component-renderer')
}

import type { ComponentsPlugin, RendererParams } from '@/types'
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
  plugin: ComponentsPlugin,
  params: RendererParams,
): Renderer {
  const tags = params.matcher.getTags()
  if (tags.length === 1) {
    if (tags.includes('html')) return new HTMLRenderer(plugin, params)
    return new MarkdownRenderer(plugin, params)
  }

  // prettier-ignore
  if (tags.includes('cjs') || tags.includes('esm')) {
    if (tags.includes('code')) return new JavascriptCodeRenderer(plugin, params)
    if (tags.includes('html')) return new JavascriptHTMLRenderer(plugin, params)
    return new JavascriptMarkdownRenderer(plugin, params)
  }

  throw new ComponentError('missing-component-renderer')
}

import type { ComponentsPlugin, FormatMatcher, RendererParams } from '@/types'
import { Logger } from 'obsidian-fnc'
import { ComponentError } from '../ComponentError'
import { BaseRenderer } from './BaseRenderer'
import * as TextRenderers from './TextRenderers'
import * as JsRenderers from './JavascriptRenderers'

export default class RenderManager {
  #log = Logger.consoleLogger(RenderManager.name)

  #textHtmlRenderer: TextRenderers.HTMLRenderer
  #textMdRenderer: TextRenderers.MarkdownRenderer

  // CommonJS & ESModules
  #jsCodeRenderer: JsRenderers.JavascriptCodeRenderer
  #jsHTMLRenderer: JsRenderers.JavascriptHTMLRenderer
  #jsMdRenderer: JsRenderers.JavascriptMarkdownRenderer

  constructor(private plugin: ComponentsPlugin) {
    this.#textHtmlRenderer = new TextRenderers.HTMLRenderer(plugin)
    this.#textMdRenderer = new TextRenderers.MarkdownRenderer(plugin)

    // CommonJS & ESModules
    this.#jsCodeRenderer = new JsRenderers.JavascriptCodeRenderer(plugin)
    this.#jsHTMLRenderer = new JsRenderers.JavascriptHTMLRenderer(plugin)
    this.#jsMdRenderer = new JsRenderers.JavascriptMarkdownRenderer(plugin)
  }

  /** @throws {ComponentError} */
  #getRenderer(tags: FormatMatcher['tags']): BaseRenderer {
    if (tags.length === 1) {
      if (tags.includes('html')) return this.#textHtmlRenderer
      return this.#textMdRenderer
    }

    if (tags.includes('cjs') || tags.includes('esm')) {
      if (tags.includes('code')) return this.#jsCodeRenderer
      if (tags.includes('html')) return this.#jsHTMLRenderer
      return this.#jsMdRenderer
    }

    throw new ComponentError('missing-component-renderer')
  }

  /** @throws {ComponentError} */
  public async render(params: RendererParams): Promise<void> {
    this.#log.debug('Rendering')

    // prettier-ignore
    const renderer = this.#getRenderer(params.matcher.getTags())
    const component = this.plugin.api.latest(params.matcher.path)

    // clear the element
    params.element.empty()
    await renderer.render(
      component,
      params.element,
      params.context,
      params.data,
    )
  }
}

import type { ComponentFound, ComponentsPlugin } from '@/types'
import { getFormatById, isComponentEnabled } from '@/utility'
import { ComponentError } from './ComponentError'
import { Renderer } from './Renderer'

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

type MayPromise<T> = T | Promise<T>
type TextRenderer = (data: unknown) => MayPromise<string>
type CodeRenderer = (container: HTMLElement, data: unknown) => MayPromise<void>

export class HTMLRenderer extends Renderer {
  async runRenderer(): Promise<void> {
    const content = await this.getFileContent()
    const html = this.replaceData(content, this.data)
    this.renderHTMLContent(this.element, html)
  }
}

export class MarkdownRenderer extends Renderer {
  async runRenderer(): Promise<void> {
    const content = await this.getFileContent()
    const markdown = this.replaceData(content, this.data)
    this.renderMarkdownContent(this.element, markdown)
  }
}

export class JavascriptHTMLRenderer extends Renderer {
  async runRenderer(): Promise<void> {
    const render = (await this.requireRenderFn()) as TextRenderer
    const html = await render(this.data)
    this.renderHTMLContent(this.element, html)
  }
}

export class JavascriptMarkdownRenderer extends Renderer {
  async runRenderer(): Promise<void> {
    const render = (await this.requireRenderFn()) as TextRenderer
    const markdown = await render(this.data)
    this.renderMarkdownContent(this.element, markdown)
  }
}

export class JavascriptCodeRenderer extends Renderer {
  async runRenderer(): Promise<void> {
    const render = (await this.requireRenderFn()) as CodeRenderer
    await render(this.element, this.data)
  }
}

import { Renderer } from './Renderer'

type TextRenderer = (data: unknown) => string
type CodeRenderer = (container: HTMLElement, data: unknown) => void

export class HTMLRenderer extends Renderer {
  async render(element: HTMLElement, data: unknown): Promise<void> {
    const content = await this.getFileContent()
    const html = this.replaceData(content, data)
    this.renderHTMLContent(element, html)
  }
}

export class MarkdownRenderer extends Renderer {
  async render(element: HTMLElement, data: unknown): Promise<void> {
    const content = await this.getFileContent()
    const markdown = this.replaceData(content, data)
    this.renderMarkdownContent(element, markdown)
  }
}

export class JavascriptHTMLRenderer extends Renderer {
  async render(element: HTMLElement, data: unknown): Promise<void> {
    const render = (await this.requireRenderFn()) as TextRenderer
    const html = render(data)
    this.renderMarkdownContent(element, html)
  }
}

export class JavascriptMarkdownRenderer extends Renderer {
  async render(element: HTMLElement, data: unknown): Promise<void> {
    const render = (await this.requireRenderFn()) as TextRenderer
    const markdown = render(data)
    this.renderMarkdownContent(element, markdown)
  }
}

export class JavascriptCodeRenderer extends Renderer {
  async render(element: HTMLElement, data: unknown): Promise<void> {
    const render = (await this.requireRenderFn()) as CodeRenderer
    render(element, data)
  }
}

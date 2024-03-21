import { Renderer } from './Renderer'

type TextRenderer = (data: unknown) => string
type CodeRenderer = (container: HTMLElement, data: unknown) => void

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
    const html = render(this.data)
    this.renderHTMLContent(this.element, html)
  }
}

export class JavascriptMarkdownRenderer extends Renderer {
  async runRenderer(): Promise<void> {
    const render = (await this.requireRenderFn()) as TextRenderer
    const markdown = render(this.data)
    this.renderMarkdownContent(this.element, markdown)
  }
}

export class JavascriptCodeRenderer extends Renderer {
  async runRenderer(): Promise<void> {
    const render = (await this.requireRenderFn()) as CodeRenderer
    render(this.element, this.data)
  }
}

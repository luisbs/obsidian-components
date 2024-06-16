import { TFile } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import { isRecord } from '@/utility'
import { Renderer } from './Renderer'
import { ComponentError } from '../ComponentError'

export abstract class CodeRenderer extends Renderer {
  #log = new Logger('CodeRenderer')

  protected async getRenderFunction(componentFile: TFile): Promise<Function> {
    const module = await this.plugin.api.source(componentFile, this.logger)
    this.#log.on(this.logger).debug('getRenderFunction', module)

    // default export on cjs
    if (typeof module === 'function') return module
    if (!isRecord(module)) {
      throw new ComponentError('missing-component-render-function')
    }

    // default export on esm
    if (typeof module.default === 'function') return module.default
    // named export on cjs & esm
    if (typeof module.render === 'function') return module.render

    throw new ComponentError('missing-component-render-function')
  }
}

export type ITextRenderer = (data: unknown) => Promise<string>
export type ICodeRenderer = (root: HTMLElement, data: unknown) => Promise<void>

export class JavascriptHTMLRenderer extends CodeRenderer {
  async renderingSequence(componentFile: TFile): Promise<void> {
    const render = await this.getRenderFunction(componentFile)
    const html = await (render as ITextRenderer)(this.data)
    this.renderHTML(html)
  }
}

export class JavascriptMarkdownRenderer extends CodeRenderer {
  async renderingSequence(componentFile: TFile): Promise<void> {
    const render = await this.getRenderFunction(componentFile)
    const markdown = await (render as ITextRenderer)(this.data)
    this.renderMarkdown(markdown)
  }
}

export class JavascriptCodeRenderer extends CodeRenderer {
  async renderingSequence(componentFile: TFile): Promise<void> {
    const render = await this.getRenderFunction(componentFile)
    await (render as ICodeRenderer)(this.element, this.data)
  }
}

import type { CodeblockContext } from '@/types'
import type { TFile } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import { isRecord } from '@/utility'
import { ComponentError } from '../ComponentError'
import { ComponentRenderer } from './ComponentRenderer'

export abstract class CodeRenderer extends ComponentRenderer {
  #log = new Logger('CodeRenderer')

  protected async getRenderFunction(
    logger: Logger,
    component: TFile,
  ): Promise<Function> {
    this.#log.on(logger).debug('getRenderFunction')
    const module = await this.plugin.api.source(component, logger)

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

export type ITextRenderer = (
  data: unknown,
  context: CodeblockContext,
) => Promise<string>
export type ICodeRenderer = (
  root: HTMLElement,
  data: unknown,
  context: CodeblockContext,
) => Promise<void>

export class JavascriptHTMLRenderer extends CodeRenderer {
  #log = new Logger('JavascriptHTMLRenderer')

  async render(
    logger: Logger,
    component: TFile,
    element: HTMLElement,
    context: CodeblockContext,
    data: unknown,
  ): Promise<void> {
    this.#log.on(logger).debug('render')

    const render = await this.getRenderFunction(logger, component)
    const html = await (render as ITextRenderer)(data, context)
    this.renderHTML(logger, element, html)
  }
}

export class JavascriptMarkdownRenderer extends CodeRenderer {
  #log = new Logger('JavascriptMarkdownRenderer')

  async render(
    logger: Logger,
    component: TFile,
    element: HTMLElement,
    context: CodeblockContext,
    data: unknown,
  ): Promise<void> {
    this.#log.on(logger).debug('render')

    const render = await this.getRenderFunction(logger, component)
    const markdown = await (render as ITextRenderer)(data, context)
    this.renderMarkdown(logger, element, markdown, context.notepath)
  }
}

export class JavascriptCodeRenderer extends CodeRenderer {
  #log = new Logger('JavascriptCodeRenderer')

  async render(
    logger: Logger,
    component: TFile,
    element: HTMLElement,
    context: CodeblockContext,
    data: unknown,
  ): Promise<void> {
    this.#log.on(logger).debug('render')

    element.empty() // clear element eagerly
    const render = await this.getRenderFunction(logger, component)
    await (render as ICodeRenderer)(element, data, context)
  }
}

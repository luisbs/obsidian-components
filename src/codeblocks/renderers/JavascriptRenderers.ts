import type { CodeblockContext } from '@/types'
import type { TFile } from 'obsidian'
import { Logger } from 'obsidian-fnc'
import { isRecord } from '@/utility'
import { BaseRenderer } from './BaseRenderer'
import { ComponentError } from '../ComponentError'

export type ITextRenderer = (
  data: unknown,
  context: CodeblockContext,
) => Promise<string>
export type ICodeRenderer = (
  root: HTMLElement,
  data: unknown,
  context: CodeblockContext,
) => Promise<void>

export abstract class CodeRenderer extends BaseRenderer {
  #log = Logger.consoleLogger(CodeRenderer.name)

  protected async getRenderFunction<T extends ITextRenderer | ICodeRenderer>(
    component: TFile,
  ): Promise<T> {
    this.#log.debug('getRenderFunction')
    const module = await this.plugin.api.source(component)

    // default export on cjs
    if (typeof module === 'function') {
      // @ts-ignore
      return module
    }

    if (!isRecord(module)) {
      throw new ComponentError('missing-component-render-function')
    }

    // default export on esm
    if (typeof module.default === 'function') {
      // @ts-ignore
      return module.default
    }
    // named export on cjs & esm
    if (typeof module.render === 'function') {
      // @ts-ignore
      return module.render
    }

    throw new ComponentError('missing-component-render-function')
  }
}

export class JavascriptHTMLRenderer extends CodeRenderer {
  #log = Logger.consoleLogger(JavascriptHTMLRenderer.name)

  async render(
    component: TFile,
    element: HTMLElement,
    context: CodeblockContext,
    data: unknown,
  ): Promise<void> {
    this.#log.debug('render')

    const render = await this.getRenderFunction(component)
    const html = await (render as ITextRenderer)(data, context)
    this.renderHTML(element, html)
  }
}

export class JavascriptMarkdownRenderer extends CodeRenderer {
  #log = Logger.consoleLogger(JavascriptMarkdownRenderer.name)

  async render(
    component: TFile,
    element: HTMLElement,
    context: CodeblockContext,
    data: unknown,
  ): Promise<void> {
    this.#log.debug('render')

    const render = await this.getRenderFunction(component)
    const markdown = await (render as ITextRenderer)(data, context)
    this.renderMarkdown(element, markdown, context.notepath)
  }
}

export class JavascriptCodeRenderer extends CodeRenderer {
  #log = Logger.consoleLogger(JavascriptCodeRenderer.name)

  async render(
    component: TFile,
    element: HTMLElement,
    context: CodeblockContext,
    data: unknown,
  ): Promise<void> {
    this.#log.debug('render')

    element.empty() // clear element eagerly
    const render = await this.getRenderFunction(component)
    await (render as ICodeRenderer)(element, data, context)
  }
}

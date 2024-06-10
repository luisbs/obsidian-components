import { TFile } from 'obsidian'
import { isRecord } from '@/utility'
import { Renderer } from './Renderer'
import { ComponentError } from '../ComponentError'

export abstract class CodeRenderer extends Renderer {
  protected async getRenderFunction(componentFile: TFile): Promise<Function> {
    this.log.debug('getRenderFunction')

    const module = await this.getFileModule(componentFile)
    this.log.debug({ module })

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

  protected async getFileModule(componentFile: TFile): Promise<unknown> {
    this.log.debug('getFileModule')

    try {
      if (this.format.tags.contains('commonjs')) {
        return this.requireModule(componentFile)
      } else if (this.format.tags.contains('esmodules')) {
        return this.importModule(componentFile)
      }

      throw new Error('unsupported javascript syntax, use CJS or ESM instead')
    } catch (error) {
      this.log.error(error)
      throw new ComponentError('invalid-component-syntax', error)
    }
  }

  protected requireModule(componentFile: TFile): Promise<unknown> {
    const resolved = this.plugin.fs.getRealPath(componentFile.path)
    this.log.info(`require('${resolved}')`)
    return require(resolved)
  }

  protected importModule(componentFile: TFile): Promise<unknown> {
    const resolved = this.vault.getResourcePath(componentFile)
    this.log.info(`import('${resolved}')`)
    return import(resolved)
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

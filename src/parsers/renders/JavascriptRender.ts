import { isRecord } from '@/utility'
import { MarkdownRenderer } from 'obsidian'
import { CodeblockError } from '../CodeblockError'
import { Render } from './Render'

type MDRender = (data: unknown) => string
type JSRender = (container: HTMLElement, data: unknown) => void

abstract class JavascriptRender extends Render {
  protected getRenderer(): unknown {
    const module = this.requireModule()
    if (typeof module === 'function') return module
    if (!isRecord(module) || typeof module.render !== 'function') {
      throw new CodeblockError('invalid-fragment-syntax')
    }
    return module.render
  }

  // TODO test in windows system
  protected requireModule(): unknown {
    try {
      const modulePath = this.vault.adapter
        .getResourcePath(this.fragment.path)
        .replace('app://local', '')
        .replace(/\?\d+$/i, '')

      // console.log({ modulePath, module: require(modulePath), basePath: this.vault.adapter.basePath })
      return require(modulePath)
    } catch (error) {
      throw new CodeblockError('invalid-fragment-syntax', error)
    }
  }
}

export class JavascriptCodeRender extends JavascriptRender {
  async render(element: HTMLElement, data: unknown): Promise<void> {
    const render = this.getRenderer() as JSRender
    render(element, data)
  }
}

export class JavascriptMdRender extends JavascriptRender {
  async render(element: HTMLElement, data: unknown): Promise<void> {
    const render = this.getRenderer() as MDRender
    const markdown = render(data)

    // @ts-expect-error unknown parameter
    MarkdownRenderer.renderMarkdown(markdown, element, this.fragment.path, null)
  }
}

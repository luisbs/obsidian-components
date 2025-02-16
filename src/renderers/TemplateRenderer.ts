import type { CodeblockContext } from '@/types'
import type { Logger } from '@luis.bs/obsidian-fnc'
import type { TFile } from 'obsidian'
import { isRecord } from '@/utility'
import BaseRenderer from './BaseRenderer'

export default class TemplateRenderer extends BaseRenderer {
    public test(component: TFile): boolean {
        return /\.(md|html)$/i.test(component.name)
    }

    public async render(
        component: TFile,
        context: CodeblockContext,
        element: HTMLElement,
        data: unknown,
        log: Logger,
    ): Promise<void> {
        log.debug('Rendering from Template')
        // TODO: implement caching

        const template = await this.#getTemplate(component, log)
        const replaced = this.#replacePlaceholders(template, data, log)

        if (component.name.endsWith('md')) {
            this.renderMarkdown(element, replaced, context.notepath, log)
        } else this.renderHTML(element, replaced, log)
    }

    #getTemplate(component: TFile, log: Logger): Promise<string> {
        log.debug('Retrieving Template')
        return this.plugin.app.vault.read(component)
    }

    #replacePlaceholders(source: string, data: unknown, log: Logger): string {
        log.debug('Replacing Placeholders')
        if (!data) return source

        if (!isRecord(data) && !Array.isArray(data)) {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            return source.replace(/\{\{ *(\w+) *\}\}/gi, String(data))
        }

        // replace only truethy values
        return source.replace(/\{\{ *(\w+) *\}\}/gi, (_, key) => {
            // @ts-expect-error runtime dynamic replacement
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            return data[key] ? String(data[key]) : `{{ ${key} }}`
        })
    }
}

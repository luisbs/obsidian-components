import type { ComponentsPlugin } from '@/types'
import type { CodeblockParser, CodeblockSyntax } from './BaseParser'
import { getAPI, isPluginEnabled } from 'obsidian-dataview'

export class DataviewParser implements CodeblockParser {
  id: CodeblockSyntax = 'dataview'

  constructor(private plugin: ComponentsPlugin) {}

  test(source: string): boolean {
    return /^\s*(TABLE|LIST|TASK|CALENDAR)/.test(source)
  }

  async parse(source: string, notepath: string): Promise<unknown> {
    if (!isPluginEnabled(this.plugin.app)) return
    // see: https://github.com/blacksmithgu/obsidian-dataview/blob/6d9030ef1df9c3f310f42e3502149dc71792dc4d/src/api/plugin-api.ts#L265
    return getAPI(this.plugin.app).query(source, notepath)
  }
}

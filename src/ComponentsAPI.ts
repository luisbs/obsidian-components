/* eslint-disable no-unused-private-class-members */
import type { ComponentsPlugin } from '@/types'
import type { ComponentsPluginAPI } from '@/index'
import type { Logger } from '@luis.bs/obsidian-fnc'

export default class ComponentsAPI implements ComponentsPluginAPI {
    #log: Logger
    #plugin: ComponentsPlugin

    constructor(plugin: ComponentsPlugin) {
        this.#log = plugin.log.make(ComponentsAPI.name)
        this.#plugin = plugin
    }
}

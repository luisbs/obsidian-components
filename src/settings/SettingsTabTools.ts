import type { ComponentConfig } from '@/types'
import type { Vault } from 'obsidian'
import { getFilesOnFolder } from '@luis.bs/obsidian-fnc'

export function loadComponentsOnVault(
    vault: Vault,
    componentsFolder: string,
    previousComponents: ComponentConfig[],
): ComponentConfig[] {
    const files = getFilesOnFolder(vault, componentsFolder)
    files.sort((a, b) => a.path.localeCompare(b.path, 'en'))

    // keep previous configuration
    return files.map((file) => {
        const prev = previousComponents.find((c) => c.id === file.name)
        return {
            id: file.name,
            path: file.path,
            names: prev?.names ?? file.basename.replaceAll('.', '_'),
            enabled: prev?.enabled ?? false,
        } as ComponentConfig
    })
}

export function join(names: string[]): string {
    return names.map((v) => `'${v}'`).join(', ')
}

export function el<K extends keyof HTMLElementTagNameMap>(
    tag: K,
    content: string,
): HTMLElementTagNameMap[K] {
    return createEl(tag, undefined, (el) => el.append(content))
}

export function append<K extends keyof HTMLElementTagNameMap>(
    parent: HTMLElement | DocumentFragment,
    tag: K,
    content: string,
): HTMLElementTagNameMap[K] {
    return parent.createEl(tag, undefined, (el) => el.append(content))
}

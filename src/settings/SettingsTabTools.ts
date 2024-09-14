export function join(names: string[]): string {
  return names.map((v) => `'${v}'`).join(', ')
}

export function docsLink(id: string, text: string): HTMLAnchorElement {
  // prettier-ignore
  return createEl('a', {
    text,
    href: "https://github.com/luisbs/obsidian-components/blob/main/docs/settings.md#" + id
  })
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

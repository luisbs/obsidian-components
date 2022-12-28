import type { Codeblock, FoundFragment } from '@/types'
import type { Vault } from 'obsidian'

export abstract class Render {
  constructor(
    protected vault: Vault,
    protected codeblock: Codeblock,
    protected fragment: FoundFragment,
  ) {}

  abstract render(element: HTMLElement, data: unknown): Promise<void>
}

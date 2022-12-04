import { Codeblock } from '@/types'
import { TFile, Vault } from 'obsidian'

export abstract class Render {
  constructor(protected vault: Vault) {}

  abstract render(
    element: HTMLElement,
    codeblock: Codeblock,
    file: TFile,
  ): Promise<void>
}

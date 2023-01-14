import type { FragmentFound, PluginSettings } from '@/types'
import type { SwitchState } from './TableRow'
import { isFragmentEnabled, isFragmentEnabledByFormat } from '@/utility'
import { SettingsTable } from './SettingsTable'
import { TableRow } from './TableRow'

export class FragmentsTable extends SettingsTable {
  protected fragments: PluginSettings['fragments_found']

  constructor(
    parentEl: HTMLElement,
    settings: PluginSettings,
    saveSettings: () => void,
    protected refreshSettings: () => void,
  ) {
    super(parentEl, settings, saveSettings)
    if (!settings.fragments_found) settings.fragments_found = {}
    this.fragments = settings.fragments_found
    this.initialItems()
  }

  protected initialItems(): void {
    this.filtered = Object.values(this.settings.fragments_found) //
      .map((item) => item.path)
  }

  protected filterItems(filter?: string): void {
    if (!filter) this.initialItems()
    else {
      this.filtered = Object.values(this.settings.fragments_found) //
        .reduce((colletion, frag) => {
          if (frag.path.contains(filter) || frag.format.contains(filter)) {
            colletion.push(frag.path)
          }
          return colletion
        }, [] as string[])
    }

    this.refresh()
  }

  #searchFragmentOnVault(): void {
    this.refreshSettings()
    this.filterItems()
    this.refresh()
  }

  render(): void {
    this.headerSetting.clear()
    this.headerSetting.setName('Fragments filter')
    this.headerSetting.setDesc('The entries are fragments found on the vault.')

    // refresh the fragments
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('reset').setTooltip('Refresh')
      btn.onClick(this.#searchFragmentOnVault.bind(this))
    })

    // filter input
    this.headerSetting.addSearch((input) => {
      input.onChange(this.filterItems.bind(this))
    })

    // disable all the filtered fragments
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('cross')
      btn.setTooltip('Disable All')
      btn.onClick(() => {
        this.filtered.forEach((id) => {
          if (!this.fragments[id]) return
          this.fragments[id].enabled = false
        })
        this.saveChanges()
      })
    })

    // return all the filtered fragments to the default state
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('trash')
      btn.setTooltip('Reset All')
      btn.onClick(() => {
        this.filtered.forEach((id) => {
          if (!this.fragments[id]) return
          this.fragments[id].enabled = null
        })
        this.saveChanges()
      })
    })

    // enable all the filtered fragments
    this.headerSetting.addExtraButton((btn) => {
      btn.setIcon('checkmark')
      btn.setTooltip('Enable All')
      btn.onClick(() => {
        this.filtered.forEach((id) => {
          if (!this.fragments[id]) return
          this.fragments[id].enabled = true
        })
        this.saveChanges()
      })
    })

    //
    // thead
    this.theadEl.replaceChildren()
    const tr = this.theadEl.createEl('tr')
    tr.createEl('th', { text: 'Details' })
    // tr.createEl('th', { text: 'Custom Codeblocks' })
    tr.createEl('th', { text: 'Enabled by Context?' })
    tr.createEl('th', { text: 'Enabled by User?' })
    tr.createEl('th', { text: 'Is enabled?' })

    //
    // tbody
    this.refresh()
  }

  refresh(): void {
    this.tbodyEl.replaceChildren()

    for (const id of this.filtered) {
      const fragment = this.fragments[id]
      const names = this.settings.current_fragments[id] ?? []

      // construct the description of the fragment
      const desc = createFragment()
      desc.append(
        'Use it as: ',
        createEl('code', { text: names.map((v) => `'${v}'`).join(', ') }),
      )

      const row = new TableRow(this.tbodyEl)
      row.addInfo(id, desc)

      // check if enabled by parent
      const isEnabledByContext =
        this.settings.enable_fragments === 'ALL' ||
        isFragmentEnabledByFormat(id, this.settings)

      row.addInput(
        fragment.raw_names,
        this.#updateFragmentNames.bind(this, fragment),
      )
      row.add2waySwitch(isEnabledByContext)
      row.add3waySwitch(
        fragment.enabled,
        this.#updateEnabledFragments.bind(this, fragment),
      )
      row.add2waySwitch(isFragmentEnabled(id, this.settings))
    }
  }

  #updateEnabledFragments(fragment: FragmentFound, state: SwitchState): void {
    fragment.enabled = state
    this.saveChanges()
  }

  #updateFragmentNames(fragment: FragmentFound, source: string): void {
    fragment.raw_names = source

    fragment.names = []
    source.split(/(|;, )+/gi).forEach((name) => {
      name = name.replace(/\W*/gi, '')
      if (name.length > 0) fragment.names.push(name)
    })

    this.saveChanges()
  }
}

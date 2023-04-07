export type SwitchState = boolean | null

export class TableRow {
  constructor(protected trEl: HTMLTableRowElement) {}

  addInfo(title: string, desc?: string | DocumentFragment): void {
    const td = this.trEl.createEl('td')
    td.createEl('div', 'setting-item-name').append(title)
    if (desc) {
      td.createEl('div', 'setting-item-description').append(desc)
    }
  }

  addText(text: string | HTMLElement | DocumentFragment): void {
    const td = this.trEl.createEl('td')
    td.append(text)
  }

  addTextarea(value: string, update?: (value: string) => void): void {
    const td = this.trEl.createEl('td', 'text-center')
    const textarea = td.createEl('textarea')
    textarea.value = value

    if (!update) {
      textarea.tabIndex = -1
      textarea.disabled = true
    } else {
      textarea.tabIndex = 0
      textarea.addEventListener('change', (ev) => {
        if (!(ev.target instanceof HTMLTextAreaElement)) return
        update(ev.target.value)
      })
    }
  }

  addSwitch(value: boolean, update?: (state: boolean) => void): void {
    const td = this.trEl.createEl('td', 'text-center')
    const label = td.createEl('label', 'checkbox-container')
    const input = label.createEl('input')
    input.type = 'checkbox'
    input.checked = value

    if (value) label.classList.add('is-enabled')
    if (!update) {
      input.tabIndex = -1
      input.disabled = true
    } else {
      input.tabIndex = 0
      input.addEventListener('change', (ev) => {
        if (!(ev.target instanceof HTMLInputElement)) return
        const value = ev.target.checked
        label.classList.remove('is-enabled')
        if (value) label.classList.add('is-enabled')
        update(value)
      })
    }
  }

  addBehaviorSelector(
    value: SwitchState,
    update?: (state: SwitchState) => void,
  ): void {
    const td = this.trEl.createEl('td', 'text-center')
    const select = td.createEl('select', 'dropdown')

    // prettier-ignore
    const optNone = select.createEl('option', { text: 'Inherit', value: 'none' })
    const optOff = select.createEl('option', { text: 'Disabled', value: 'off' })
    const optOn = select.createEl('option', { text: 'Enabled', value: 'on' })

    // assign base state
    if (value === false) optOff.selected = true
    else if (value === true) optOn.selected = true
    else optNone.selected = true

    if (!update) {
      select.tabIndex = -1
      select.disabled = true
    } else {
      select.tabIndex = 0
      select.addEventListener('change', (ev) => {
        const t = ev.target
        if (!(t instanceof HTMLSelectElement)) return

        // propagate the new state
        if (t.value === 'on') update(true)
        else if (t.value === 'off') update(false)
        else update(null)
      })
    }
  }
}

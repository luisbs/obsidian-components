export type SwitchState = boolean | null

export class TableRow {
  #trEl: HTMLElement

  constructor(protected parentEl: HTMLTableElement | HTMLTableSectionElement) {
    this.#trEl = parentEl.createEl('tr')
  }

  addInfo(title: string, desc: string | DocumentFragment): void {
    const td = this.#trEl.createEl('td')
    td.createEl('div', 'setting-item-name').append(title)
    td.createEl('div', 'setting-item-description').append(desc)
  }

  addInput(
    value: string,
    enabled = true,
    update?: (value: string) => void,
  ): void {
    const td = this.#trEl.createEl('td')
    const input = td.createEl('input')
    if (enabled) input.tabIndex = 0
    else {
      input.tabIndex = -1
      input.disabled = true
    }
  }

  add2waySwitch(value: boolean, update?: (state: boolean) => void): void {
    const td = this.#trEl.createEl('td')
    const label = td.createEl('label', 'checkbox-container')
    const input = label.createEl('input')
    input.type = 'checkbox'
    input.checked = value

    if (value) label.classList.add('is-enabled')
    if (update) {
      input.addEventListener('change', (ev) => {
        if (!(ev.target instanceof HTMLInputElement)) return
        const value = ev.target.checked
        label.classList.remove('is-enabled')
        if (value) label.classList.add('is-enabled')
        update(value)
      })
    }
  }

  add3waySwitch(
    value: SwitchState,
    update?: (state: SwitchState) => void,
  ): void {
    const td = this.#trEl.createEl('td', '')
    const input = td.createEl('input', 'plugin-fragments-3wayswitch')
    input.type = 'range'
    input.step = '1'
    input.min = String(this.#sliderMin)
    input.max = String(this.#sliderMax)

    this.#updateState(
      input,
      value === null ? 0 : value ? this.#sliderMax : this.#sliderMin,
    )

    if (!update) {
      input.tabIndex = -1
      input.disabled = true
    } else {
      input.tabIndex = 0
      input.addEventListener('change', (ev) => {
        if (!(ev.target instanceof HTMLInputElement)) return
        const value = this.#updateState(input, Number(ev.target.value))
        update(value)
      })
    }
  }

  #sliderMin = -10
  #sliderMinBreak = -3
  #sliderMax = 10
  #sliderMaxBreak = 3

  #updateState(input: HTMLInputElement, value: number): SwitchState {
    if (value < this.#sliderMinBreak) {
      input.value = String(this.#sliderMin)
      input.classList.remove('is-enabled')
      input.classList.add('is-disabled')
      return false
    }

    if (value > this.#sliderMaxBreak) {
      input.value = String(this.#sliderMax)
      input.classList.remove('is-disabled')
      input.classList.add('is-enabled')
      return true
    }

    input.value = '0'
    input.classList.remove('is-enabled')
    input.classList.remove('is-disabled')
    return null
  }
}

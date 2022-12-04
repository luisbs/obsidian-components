import type { FoundFragment, PluginSettings } from '@/types'
import { Setting } from 'obsidian'
import {
  isFragmentEnabled,
  isFragmentEnabledByFormat,
  isFragmentEnabledByUser,
} from '@/utility'

export function renderFragmentsTable(
  parentEl: HTMLElement,
  settings: PluginSettings,
  updateEnabledFragments: (enabled: string[]) => void,
  updateFragmentsList: () => void,
) {
  const rootSetting = new Setting(parentEl)
  rootSetting.setName('Fragments filter')
  rootSetting.setDesc('The next entries are fragments enabled for execution.')

  const fragmentsList = parentEl.createDiv('fragments-list')

  let filtered = [] as string[]
  let rows = [] as FoundFragment[]

  // keep the formats updated
  const updateRender = (filter?: string) => {
    rows = !filter
      ? Object.values(settings.fragments_found)
      : Object.values(settings.fragments_found).filter((value) => {
          return (
            value.path.contains(filter) || //
            value.format.contains(filter)
          )
        })

    filtered = rows.map((row) => row.path)
    renderOptions()
  }

  const renderOptions = () => {
    fragmentsList.replaceChildren()
    for (const row of rows) {
      filtered.push(row.path)

      const setting = new Setting(fragmentsList)
      let addExtraToggle = false

      if (settings.default_behavior === 'ALLOW_ALL') {
        setting.setName(row.path + ' (enabled by behavior)')
        addExtraToggle = true
      } else if (isFragmentEnabledByFormat(row, settings)) {
        setting.setName(row.path + ' (enabled by format)')
        addExtraToggle = true
        // } else if (isFragmentEnabledByUser(row, settings)) {
        //   setting.setName(row.path + ' (enabled by user)')
      } else {
        setting.setName(row.path)
      }

      const names = settings.resolution_names[row.path] ?? []
      setting.setDesc(`Use it as: ` + names.map((v) => `'${v}'`).join(', '))

      if (addExtraToggle) {
        setting.addToggle((input) => input.setValue(true).setDisabled(true))
      }

      const isEnabled = isFragmentEnabled(row, settings)
      setting.addToggle((input) => {
        input.setValue(isEnabled)
        input.onChange((enable) => {
          if (enable) {
            if (settings.fragments_enabled.indexOf(row.path) >= 0) return
            updateEnabledFragments([...settings.fragments_enabled, row.path])
          } else {
            if (settings.fragments_enabled.indexOf(row.path) < 0) return
            updateEnabledFragments(
              settings.fragments_enabled.filter((value) => value !== row.path),
            )
          }
        })
      })
    }
  }

  // refresh the fragments list
  rootSetting.addExtraButton((btn) => {
    btn.setIcon('reset')
    btn.setTooltip('Refresh')
    btn.onClick(() => updateFragmentsList())
  })

  // add a filter input
  rootSetting.addSearch((input) => {
    input.onChange((filter) => updateRender(filter))
  })

  // enable on the enabled formats
  // all the filtered formats
  rootSetting.addExtraButton((btn) => {
    btn.setIcon('checkmark')
    btn.setTooltip('Enable All')
    btn.onClick(() => {
      updateEnabledFragments(
        [...settings.fragments_enabled, ...filtered].unique(),
      )
    })
  })

  // disable from the enabled formats
  // all the filtered formats
  rootSetting.addExtraButton((btn) => {
    btn.setIcon('cross')
    btn.setTooltip('Disable All')
    btn.onClick(() => {
      updateEnabledFragments(
        settings.fragments_enabled.filter(
          (format) => !filtered.includes(format),
        ),
      )
    })
  })

  // initial render
  updateRender()
}

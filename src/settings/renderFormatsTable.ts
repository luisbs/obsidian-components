import type { FragmentFormat, PluginSettings } from '@/types'
import { Setting } from 'obsidian'
import { mergeFormats } from '@/utility'

export function renderFormatsTable(
  parentEl: HTMLElement,
  settings: PluginSettings,
  updateEnabledFormats: (enabled: string[]) => void,
) {
  const rootSetting = new Setting(parentEl)
  rootSetting.setName('Format filter')
  rootSetting.setDesc('The next entries are formats enabled for execution.')

  const formatsList = parentEl.createDiv('format-list')

  const formats = mergeFormats(settings)
  let filtered = [] as string[]
  let rows = [] as FragmentFormat[]

  // keep the formats updated
  const updateRender = (filter?: string) => {
    rows = !filter
      ? formats
      : formats.filter((value) => {
          return (
            value.id.contains(filter) ||
            value.ext.contains(filter) ||
            value.type.contains(filter)
          )
        })

    filtered = rows.map((row) => row.id)
    renderOptions()
  }

  const renderOptions = () => {
    formatsList.replaceChildren()
    for (const row of rows) {
      filtered.push(row.id)

      new Setting(formatsList)
        .setName(row.id)
        .setDesc(`File extension: '${row.ext}'. Type: ${row.type}`)
        .addToggle((input) => {
          input.setValue(settings.formats_enabled.includes(row.id))
          input.onChange((enable) => {
            if (enable) {
              if (settings.formats_enabled.indexOf(row.id) >= 0) return
              updateEnabledFormats([...settings.formats_enabled, row.id])
            } else {
              if (settings.formats_enabled.indexOf(row.id) < 0) return
              updateEnabledFormats(
                settings.formats_enabled.filter((value) => value !== row.id),
              )
            }
          })
        })
    }
  }

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
      updateEnabledFormats([...settings.formats_enabled, ...filtered].unique())
      renderOptions()
    })
  })

  // disable from the enabled formats
  // all the filtered formats
  rootSetting.addExtraButton((btn) => {
    btn.setIcon('cross')
    btn.setTooltip('Disable All')
    btn.onClick(() => {
      updateEnabledFormats(
        settings.formats_enabled.filter((format) => !filtered.includes(format)),
      )
      renderOptions()
    })
  })

  // initial render
  updateRender()
}

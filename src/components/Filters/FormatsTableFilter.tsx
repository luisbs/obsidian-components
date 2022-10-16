import { h } from 'preact'
import { useState } from 'preact/hooks'
import { FragmentFormat } from '@/types/settings'
import { mergeFormats } from '@/utility/FragmentFormats'
import { PluginContext, PreactRenderer } from '@/utility/ui'
import TableFilter from './TableFilter'
import ObsidianCheckbox from '../common/ObsidianCheckbox'

export function createFormatsTableFilter(
  context: PluginContext,
  onChange: (enabled: string[]) => void,
) {
  return new PreactRenderer(
    context,
    (
      <FormatsTableFilter
        values={mergeFormats(context.settings)}
        onChange={onChange}
      />
    ),
  )
}

export function FormatsTableFilter({
  values,
  onChange,
}: {
  values: FragmentFormat[]
  onChange: (enabled: string[]) => void
}) {
  const [filtered, setFiltered] = useState<FragmentFormat[]>(values)
  const [enabled, setEnabled] = useState<string[]>([])

  const onSearch = (filter: string) => {
    if (filter.length == 0) {
      setFiltered(values)
      return
    }

    setFiltered(
      values.filter((value) => {
        return (
          value.id.contains(filter) ||
          value.ext.contains(filter) ||
          value.type.contains(filter)
        )
      }),
    )
  }

  const setValue = (id: string, state: boolean) => {
    let newValues = enabled
    if (!state) {
      if (enabled.indexOf(id) < 0) return
      newValues = enabled.filter((value) => value !== id)
    } else {
      if (enabled.indexOf(id) >= 0) return
      newValues = [...enabled, id]
    }

    setEnabled(newValues)
    onChange(newValues)
  }

  return (
    <TableFilter
      onSearch={onSearch}
      headings={['Id', 'Extension', 'Type', '']}
      actionsEl={
        <div>
          <button type="button">Enable filtered</button>
          <button type="button">Disable filtered</button>
        </div>
      }
    >
      {filtered.map((value) => {
        return (
          <tr>
            <td>{value.id}</td>
            <td>{value.ext}</td>
            <td>{value.type}</td>
            <td>
              <ObsidianCheckbox
                checked={true}
                onChange={(state) => setValue(value.id, state)}
              />
            </td>
          </tr>
        )
      })}
    </TableFilter>
  )
}

import { FragmentFormat } from '@/types/settings'
import { h } from 'preact'
import { useState } from 'preact/compat'
import ObsidianCheckbox from '../common/ObsidianCheckbox'
import TableFilter from './TableFilter'

export default function FragmentsTableFilter({
  values,
  update,
}: {
  values: FragmentFormat[]
  update: (enabled: string[]) => void
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
    update(newValues)
  }

  return (
    <TableFilter
      onSearch={onSearch}
      actionsEl={
        <div>
          <button type="button">Enable filtered</button>
          <button type="button">Disable filtered</button>
        </div>
      }
      captionsEl={
        <tr>
          <th>Id</th>
          <th>Extension</th>
          <th>Type</th>
        </tr>
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

import { h, RenderableProps, VNode } from 'preact'
import { useState } from 'preact/compat'

export default function TableFilter(
  props: RenderableProps<{
    actionsEl: VNode<HTMLDivElement>
    headings: string[]
    onSearch: (filter: string) => void
  }>,
) {
  const [filter, setFilter] = useState('')

  const handleSearch = (value: string) => {
    setFilter(value)
    props.onSearch(value.trim())
  }

  const captionsEl = (
    <tr>
      {props.headings.map((heading) => {
        return <th>{heading}</th>
      })}
    </tr>
  )

  return (
    <div class="table-filter">
      <div>
        <input
          value={filter}
          onInput={(ev) => handleSearch(ev.currentTarget.value)}
        />
        {props.actionsEl}
      </div>

      <table>
        <thead>{captionsEl}</thead>
        <tbody>{props.children}</tbody>
        <tfoot>{captionsEl}</tfoot>
      </table>
    </div>
  )
}

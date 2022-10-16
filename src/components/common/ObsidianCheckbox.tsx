import { h } from 'preact'

export default function ObsidianCheckbox({
  checked,
  onChange,
}: {
  checked: boolean
  onChange?: (state: boolean) => void
}) {
  return (
    <div className="checkbox-container" class={checked ? 'is-enabled' : ''}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(ev) => onChange?.(ev.currentTarget.checked)}
      />
    </div>
  )
}

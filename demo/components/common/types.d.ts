//

type VaultFolder = { type: 'folder', realpath: string }
type VaultFile = { type: 'file', realpath: string, size: number, ctime: number, mtime: number }
type VaultFiles = Record<string, VaultFile | VaultFolder>

// custom

type ComponentData = Record<string, unknown>
type SimpleAppender = (str: string) => void

type Column = {
  tag?: string
  text?: string
  fallback?: string
}

type ContentRow = {
  // header
  label?: string|string[]
  title?: string|string[]
  alias?: string|string[]
  tags?: string|string[]
  cover?: string
  gallery?: GalleryRow[]

  // metadata
  art?: string|string[]
  story?: string|string[]
  mangaka?: string|string[]
  author?: string|string[]
  studio?: string|string[]
  magazine?: string|string[]

  // opinion
  rating?: string
  comment?: string
  comments?: string

  // progress
  day?: string
  volumes?: number
  chapters?: number
  episodes?: number

  // links
  ap?: string|string[]
  mal?: string|string[]
  mangadex?: string|string[]

  read?: string|string[]
  watch?: string|string[]
  sources?: string|string[]
  download?: string|string[]
}

type MusicRow = {
  // header
  label?: string|string[]
  title?: string|string[]
  author?: string|string[]

  // links
  spotify?: string|string[]
  youtube?: string|string[]
  iframe?: string
  links?: string[]
  link?: string
}

type GalleryRow = {
  url?: string
  title?: string
  width?: '1' | '2' | '3'
}

import type { FormatMatcher } from '@/types'

/** List of the supported component formats. */
export const SUPPORTED_FORMATS: FormatMatcher[] = [
  { tags: ['md'], test: (path) => /\.md$/i.test(path) },
  { tags: ['html'], test: (path) => /\.html$/i.test(path) },

  // CommonJS
  { tags: ['md', 'cjs'], test: (path) => /\.md\.cjs$/i.test(path) },
  { tags: ['html', 'cjs'], test: (path) => /\.html\.cjs$/i.test(path) },
  { tags: ['code', 'cjs'], test: (path) => /\.cjs$/i.test(path) },

  // ESModules
  { tags: ['md', 'esm'], test: (path) => /\.md\.mjs$/i.test(path) },
  { tags: ['html', 'esm'], test: (path) => /\.html\.mjs$/i.test(path) },
  { tags: ['code', 'esm'], test: (path) => /\.mjs$/i.test(path) },
]

// prettier-ignore
export function getFormatByPath(componentPath: string): FormatMatcher | undefined {
  return SUPPORTED_FORMATS.find((format) => format.test(componentPath))
}

export function compareFormats(
  a: FormatMatcher['tags'],
  b: FormatMatcher['tags'],
): -1 | 0 | 1 {
  // the no-code formats, take presedence
  if (a.length === 1 && b.length === 1) return compareBaseFormats(a, b)
  if (a.length === 1) return -1
  if (b.length === 1) return 1

  if (a.contains('cjs') && b.contains('cjs')) return compareBaseFormats(a, b)
  if (a.contains('cjs')) return -1
  if (b.contains('cjs')) return 1

  if (a.contains('esm') && b.contains('esm')) return compareBaseFormats(a, b)
  if (a.contains('esm')) return -1
  if (b.contains('esm')) return 1

  return 0
}

export function compareBaseFormats(
  a: FormatMatcher['tags'],
  b: FormatMatcher['tags'],
): -1 | 0 | 1 {
  if (a.contains('html')) return b.contains('html') ? 0 : -1
  return b.contains('html') ? 1 : 0
}

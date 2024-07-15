import type { FormatMatcher } from '@/types'

/** List of the supported component formats. */
export const SUPPORTED_FORMATS: FormatMatcher[] = [
  { tags: ['md'], test: /\.md$/i.test },
  { tags: ['html'], test: /\.html$/i.test },

  // CommonJS
  { tags: ['md', 'cjs'], test: /\.md\.cjs$/i.test },
  { tags: ['html', 'cjs'], test: /\.html\.cjs$/i.test },
  { tags: ['code', 'cjs'], test: /\.cjs$/i.test },

  // ESModules
  { tags: ['md', 'esm'], test: /\.md\.m?js$/i.test },
  { tags: ['html', 'esm'], test: /\.html\.m?js$/i.test },
  { tags: ['code', 'esm'], test: /\.m?js$/i.test },
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

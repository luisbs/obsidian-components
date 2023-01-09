import type { FragmentFound, FragmentFormat, PluginSettings } from '@/types'
import path from 'path'
import { arrayToObject, reverseObject } from './common'
import { getSupportedFormats } from './formatTools'
import { isFragmentEnabled } from './fragmentTools'

/**
 * Pre-process the plugin settings to calculate the enabled fragments.
 *
 * It can be costly if the user has a lot of fragments,
 * but is expected to not be run frequently,
 * and it pre-calculates other settings useful on runtime
 */
export function prepareFragmentsAndCodeblocks(settings: PluginSettings): void {
  const formats = arrayToObject(getSupportedFormats(), 'id')

  // filter and sort the fragments
  const source = Object.values(settings.fragments_found)
    // removes the entries with missing data
    .filter((fragment) => {
      if (!isFragmentEnabled(fragment, settings)) return false
      return fragment && formats[fragment.format]
    })
    // sorts the fragments based on custom rules
    .sort((fragment1, fragment2) => {
      return sortFragments(
        fragment1,
        formats[fragment1.format],
        fragment2,
        formats[fragment2.format],
      )
    })

  const includeLongNames = settings.naming_strategy !== 'SHORT'
  const includeAllNames = settings.naming_strategy === 'ALL'

  const codeblocks = {} as Record<string, string>
  const fragments = {} as Record<string, string>

  // prettier-ignore
  for (const fragment of source) {
    const fragmentId = fragment.path
    const format = formats[fragment.format]

    // add the user defined names as codeblocks and fragments
    if (!settings.enable_codeblocks) {
      fragment.names.forEach((name) => (fragments[name] = fragmentId))
    } else {
      fragment.names.forEach((name) => {
        fragments[name] = fragmentId
        codeblocks[name] = fragmentId
      })
    }

    const names = constructNames(fragment, format)

    // allways try to include the shortest names
    const collitionInShortest = names.shortest in fragments
    const collitionInShorter = names.shorter in fragments
    const collitionInShort = names.short in fragments

    if (!collitionInShortest) fragments[names.shortest] = fragmentId
    if (!collitionInShorter) fragments[names.shorter] = fragmentId
    if (!collitionInShort) fragments[names.short] = fragmentId

    // if there is a collition or the user requires longer names include them
    if (
      !(collitionInShortest && collitionInShorter && collitionInShort) &&
      !includeLongNames
    ) {
      continue
    }

    // include the long names if required
    const collitionInLong = names.long in fragments
    if (!collitionInLong) fragments[names.long] = fragmentId
    if (!(names.longer in fragments)) fragments[names.longer] = fragmentId
    if (!(names.longest in fragments)) fragments[names.longest] = fragmentId

    // if there is a collition or the user requires longer names include them
    if (!collitionInLong && !includeAllNames) continue

    // is expected that the full names are collition free
    if (!(names.full in fragments)) fragments[names.full] = fragmentId
    fragments[names.fullPath] = fragmentId
  }

  settings.current_fragments = reverseObject(fragments)
  settings.current_codeblocks = reverseObject(codeblocks)
}

/**
 * It gives priority to the simplier format
 * `'html' > 'md' > 'code'` in that order
 * But if they have the same type,
 * it give priority to the one with less deep level
 * `'a/file.md' > 'a/b/file.md'` in that order
 *
 * - `-1` if fragment1 is less than fragment2
 * - `0` if fragment1 is equal to fragment2
 * - `1` if fragment1 is more than fragment2
 */
function sortFragments(
  fragment1: FragmentFound,
  format1: FragmentFormat,
  fragment2: FragmentFound,
  format2: FragmentFormat,
): -1 | 0 | 1 {
  // the no-code formats, take presedence
  if (format1.id === 'html') return -1
  if (format2.id === 'html') return 1
  if (format1.id === 'markdown') return -1
  if (format2.id === 'markdown') return 1

  if (format1.type === format2.type) {
    // if they have the same formats,
    // sort by the deepnes of the fragment
    return fragment1.path.split('/').length < fragment2.path.split('/').length
      ? -1
      : 1
  }

  // if they have diferent formats, give priority to the simplier
  if (format1.type === 'html') return -1
  if (format2.type === 'html') return 1
  if (format1.type === 'md') return -1
  if (format2.type === 'md') return 1
  return 0
}

/**
 * Construct the names used on runtime.
 */
function constructNames(fragment: FragmentFound, format: FragmentFormat) {
  const basename = path.basename(fragment.path)
  const dir = path.dirname(fragment.path) + '/'
  const ext = format.type === 'code' ? path.extname(fragment.path) : format.type

  const shortest = path.basename(fragment.path).replace(/\..*$/i, '')
  const shorter = shortest + '_' + ext.replace('.', '')

  return {
    /**
     * @example
     * // Doesn't allows fragments with same name in any case
     * 'a/b/book.js'    => 'book'
     * 'a/b/book.md.js' => 'book'
     * 'a/cccc/book.js' => 'book'
     */
    shortest,
    /**
     * @example
     * // Allows siblings with same name but different types
     * // except when type is 'md' or 'html'
     * 'a/b/book.js'     => 'book_js'
     * 'a/b/book.md.js'  => 'book_md'
     * 'a/b/book.md.php' => 'book_md'
     *
     * // Doesn't allows on sibling directories with same name and type
     * 'a/b/book.js'     => 'book_js'
     * 'a/cccc/book.js'  => 'book_js'
     */
    shorter,
    /**
     * @example
     * // Allows siblings with same name but different types
     * 'a/b/book.js'    => 'book.js'
     * 'a/b/book.md.js' => 'book.md.js'
     *
     * // Doesn't allows on sibling directories with same name and type
     * 'a/b/book.js'    => 'book.js'
     * 'a/cccc/book.js' => 'book.js'
     */
    short: basename,

    /**
     * @example
     * // Doesn't allows siblings with same name but different types
     * 'a/b/book.js'       => 'b/book'
     * 'a/b/book.md.js'    => 'b/book'
     *
     * // Allows fragments on sibling directories with same name and type
     * 'a/b/book.js'       => 'b/book'
     * 'a/cccc/book.md.js' => 'cccc/book'
     */
    long: dir + shortest,
    /**
     * @example
     * // Allows siblings with same name but different types
     * // except when type is 'md' or 'html'
     * 'a/b/book.js'     => 'b/book_js'
     * 'a/b/book.md.js'  => 'b/book_md'
     * 'a/b/book.md.php' => 'b/book_md'
     *
     * // Allows fragments on sibling directories with same name and type
     * 'a/b/book.js'     => 'b/book_js'
     * 'a/cccc/book.js'  => 'cccc/book_js'
     */
    longer: dir + shorter,
    /**
     * @example
     * // Allows siblings with same name but different types
     * 'a/b/book.js'    => 'b/book.js'
     * 'a/b/book.md.js' => 'b/book.md.js'
     *
     * // Allows fragments on sibling directories with same name and type
     * 'a/b/book.js'    => 'b/book.js'
     * 'a/cccc/book.js' => 'cccc/book.js'
     */
    longest: dir + basename,

    /**
     * @example
     * 'a/b/book.md.js' => 'a/b/book'
     */
    full: fragment.path.replace(format.ext, ''),
    /**
     * @example
     * 'a/b/book.md.js' => 'a/b/book.md.js'
     * 'a/cccc/book.md.js' => 'a/cccc/book.md.js'
     */
    fullPath: fragment.path,
  }
}

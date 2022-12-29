import type { FoundFragment, FragmentFormat, PluginSettings } from '@/types'
import path from 'path'
import { arrayToObject, reverseObject } from './common'
import { mergeFormats } from './formatTools'

/**
 * Pre-process the plugin settings to calculate the enabled fragments.
 *
 * It can be costly if the user has a lot of fragments,
 * but is expected to not be run frequently,
 * and it pre-calculates other settings useful on runtime
 */
export function resolveFragmentsNames(
  settings: PluginSettings,
): PluginSettings['resolution_names'] {
  const formats = arrayToObject(mergeFormats(settings), 'id')

  // filter and sort the fragments
  const fragments = settings.fragments_enabled
    // removes the entries with missing data
    .filter((fragmentId) => {
      const fragment = settings.fragments_found[fragmentId]
      return fragment && formats[fragment.format]
    })
    // sorts the fragments based on custom rules
    .sort((fragmentId1, fragmentId2) => {
      const fragment1 = settings.fragments_found[fragmentId1]
      const fragment2 = settings.fragments_found[fragmentId2]
      return sortFragments(
        fragment1,
        formats[fragment1.format],
        fragment2,
        formats[fragment2.format],
      )
    })

  // calculates names
  const names = {} as Record<string, string>
  const includeLongNames = settings.naming_strategy !== 'SHORT'
  const includeAllNames = settings.naming_strategy === 'ALL'

  for (const fragmentId of fragments) {
    const fragment = settings.fragments_found[fragmentId]
    if (!fragment) continue

    const format = formats[fragment.format]
    if (!format) continue

    const name = constructNames(fragment, format)

    // allways try to include the shortest names
    const collitionInShortest = name.shortest in names
    const collitionInShorter = name.shorter in names
    const collitionInShort = name.short in names

    if (!collitionInShortest) names[name.shortest] = fragmentId
    if (!collitionInShorter) names[name.shorter] = fragmentId
    if (!collitionInShort) names[name.short] = fragmentId

    // if there is a collition or the user requires longer names include them
    if (
      !(collitionInShortest && collitionInShorter && collitionInShort) &&
      !includeLongNames
    ) {
      continue
    }

    // include the long names if required
    const collitionInLong = name.long in names
    if (!collitionInLong) names[name.long] = fragmentId
    if (!(name.longer in names)) names[name.longer] = fragmentId
    if (!(name.longest in names)) names[name.longest] = fragmentId

    // if there is a collition or the user requires longer names include them
    if (!collitionInLong && !includeAllNames) continue

    // is expected that the full names are collition free
    if (!(name.full in names)) names[name.full] = fragmentId
    names[name.fullPath] = fragmentId
  }

  return reverseObject(names)
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
  fragment1: FoundFragment,
  format1: FragmentFormat,
  fragment2: FoundFragment,
  format2: FragmentFormat,
): number {
  if (format1.id === 'html') return -1
  if (format2.id === 'html') return 1
  if (format1.id === 'markdown') return -1
  if (format2.id === 'markdown') return 1

  if (format1.type === format2.type) {
    // if they have the same formats, sort by the deepnes
    return fragment1.path.split('/').length - fragment2.path.split('/').length
  }

  // if they have diferent formats, give priority to the simplier
  if (format1.type === 'html') return -1
  if (format2.type === 'html') return 1
  if (format1.type === 'md') return -1

  // if the format1 is not 'md', it means it is code
  // and since they cant be both 'code', format2 is 'md'
  return 1
}

/**
 * Construct the names used on runtime.
 */
function constructNames(fragment: FoundFragment, format: FragmentFormat) {
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

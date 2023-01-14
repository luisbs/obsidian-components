import type { ComponentFound, ComponentFormat, PluginSettings } from '@/types'
import path from 'path'
import { arrayToObject, reverseObject } from './common'
import { getSupportedFormats } from './formatsTools'
import { isComponentEnabled } from './componentsTools'

/**
 * Pre-process the plugin settings to calculate the enabled components.
 *
 * It can be costly if the user has a lot of components,
 * but is expected to not be run frequently,
 * and it pre-calculates other settings useful on runtime
 */
export function prepareComponentsAndCodeblocks(settings: PluginSettings): void {
  const formats = arrayToObject(getSupportedFormats(), 'id')

  // filter and sort the components
  const source = Object.values(settings.components_found)
    // removes the entries with missing data
    .filter((component) => {
      if (!isComponentEnabled(component, settings)) return false
      return component && formats[component.format]
    })
    // sorts the components based on custom rules
    .sort((component1, component2) => {
      return sortComponents(
        component1,
        formats[component1.format],
        component2,
        formats[component2.format],
      )
    })

  const includeLongNames = settings.naming_strategy !== 'SHORT'
  const includeAllNames = settings.naming_strategy === 'ALL'

  const codeblocks = {} as Record<string, string>
  const components = {} as Record<string, string>

  // prettier-ignore
  for (const component of source) {
    const componentId = component.path
    const format = formats[component.format]

    // add the user defined names as codeblocks and components
    if (!settings.enable_codeblocks) {
      component.names.forEach((name) => (components[name] = componentId))
    } else {
      component.names.forEach((name) => {
        components[name] = componentId
        codeblocks[name] = componentId
      })
    }

    const names = constructNames(component, format)

    // allways try to include the shortest names
    const collitionInShortest = names.shortest in components
    const collitionInShorter = names.shorter in components
    const collitionInShort = names.short in components

    if (!collitionInShortest) components[names.shortest] = componentId
    if (!collitionInShorter) components[names.shorter] = componentId
    if (!collitionInShort) components[names.short] = componentId

    // if there is a collition or the user requires longer names include them
    if (
      !(collitionInShortest && collitionInShorter && collitionInShort) &&
      !includeLongNames
    ) {
      continue
    }

    // include the long names if required
    const collitionInLong = names.long in components
    if (!collitionInLong) components[names.long] = componentId
    if (!(names.longer in components)) components[names.longer] = componentId
    if (!(names.longest in components)) components[names.longest] = componentId

    // if there is a collition or the user requires longer names include them
    if (!collitionInLong && !includeAllNames) continue

    // is expected that the full names are collition free
    if (!(names.full in components)) components[names.full] = componentId
    components[names.fullPath] = componentId
  }

  settings.current_components = reverseObject(components)
  settings.current_codeblocks = reverseObject(codeblocks)
}

/**
 * It gives priority to the simplier format
 * `'html' > 'md' > 'code'` in that order
 * But if they have the same type,
 * it give priority to the one with less deep level
 * `'a/file.md' > 'a/b/file.md'` in that order
 *
 * - `-1` if component1 is less than component2
 * - `0` if component1 is equal to component2
 * - `1` if component1 is more than component2
 */
function sortComponents(
  component1: ComponentFound,
  format1: ComponentFormat,
  component2: ComponentFound,
  format2: ComponentFormat,
): -1 | 0 | 1 {
  // the no-code formats, take presedence
  if (format1.id === 'html') return -1
  if (format2.id === 'html') return 1
  if (format1.id === 'markdown') return -1
  if (format2.id === 'markdown') return 1

  if (format1.type === format2.type) {
    // if they have the same formats,
    // sort by the deepnes of the component
    return component1.path.split('/').length < component2.path.split('/').length
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
function constructNames(component: ComponentFound, format: ComponentFormat) {
  const basename = path.basename(component.path)
  const dir = path.dirname(component.path) + '/'
  const ext =
    format.type === 'code' ? path.extname(component.path) : format.type

  const shortest = path.basename(component.path).replace(/\..*$/i, '')
  const shorter = shortest + '_' + ext.replace('.', '')

  return {
    /**
     * @example
     * // Doesn't allows components with same name in any case
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
     * // Allows components on sibling directories with same name and type
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
     * // Allows components on sibling directories with same name and type
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
     * // Allows components on sibling directories with same name and type
     * 'a/b/book.js'    => 'b/book.js'
     * 'a/cccc/book.js' => 'cccc/book.js'
     */
    longest: dir + basename,

    /**
     * @example
     * 'a/b/book.md.js' => 'a/b/book'
     */
    full: component.path.replace(format.ext, ''),
    /**
     * @example
     * 'a/b/book.md.js' => 'a/b/book.md.js'
     * 'a/cccc/book.md.js' => 'a/cccc/book.md.js'
     */
    fullPath: component.path,
  }
}

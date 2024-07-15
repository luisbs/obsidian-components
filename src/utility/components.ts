import type {
  ComponentConfig,
  ComponentMatcher,
  FormatMatcher,
  PluginSettings,
} from '@/types'
import type { TFile, Vault } from 'obsidian'
import { URI, getFilesOnFolder } from 'obsidian-fnc'
import { compareFormats, getFormatByPath } from './formats'
import { parseStringList } from './common'
import { MapStore } from './MapStore'

export function loadComponentsOnVault(
  vault: Vault,
  componentsFolder: string,
  previousComponents: ComponentConfig[],
): ComponentConfig[] {
  return (
    getFilesOnFolder(vault, componentsFolder)
      // ensure the file is a valid component
      .reduce((arr, file) => {
        const format = getFormatByPath(file.name)
        if (format) arr.push({ file, format })
        return arr
      }, [] as Array<{ file: TFile; format: FormatMatcher }>)
      // sort by format and deepness
      .sort((a, b) => {
        const comparison = compareFormats(a.format.tags, b.format.tags)
        if (comparison !== 0) return comparison
        // on same format, sort by path deepness
        return a.file.path.localeCompare(b.file.path, 'en')
      })
      // keep previous configuration
      .map(({ file }) => {
        const prev = previousComponents.find((c) => c.id === file.basename)
        return {
          id: file.basename,
          path: file.path,
          names: prev?.names || '',
          enabled: prev?.enabled || false,
        } as ComponentConfig
      })
  )
}

export function prepareComponentMatchers(
  settings: PluginSettings,
  componentsEnabled: MapStore<string>,
): ComponentMatcher[] {
  return settings.components_config.reduce((arr, component) => {
    const format = getFormatByPath(component.path)
    if (format && component.enabled) {
      arr.push({
        id: component.id,
        path: component.path,
        test: componentsEnabled.get(component.id).contains,
        getTags: () => format.tags,
      })
    }
    return arr
  }, [] as ComponentMatcher[])
}

export function prepareCodeblockNames(
  settings: PluginSettings,
): MapStore<string> {
  if (!settings.enable_codeblocks) return new MapStore<string>()

  const codeblockNames = new MapStore<string>()
  for (const component of settings.components_config) {
    for (const name of parseStringList(component.names)) {
      if (codeblockNames.hasValue(name)) codeblockNames.push(component.id, name)
    }
  }
  return codeblockNames
}

export function prepareComponentNames(
  settings: PluginSettings,
): MapStore<string> {
  const allNames = settings.components_naming === 'ALL'
  const longNames = settings.components_naming === 'LONG' || allNames
  const shortNames = settings.components_naming !== 'CUSTOM'

  const result = new MapStore<string>()
  const tryInclude = (id: string, name: string) => {
    if (result.hasValue(name)) return false
    result.push(id, name)
    return true
  }

  for (const component of settings.components_config) {
    for (const name of parseStringList(component.names)) {
      result.push(component.id, name)
    }

    if (!shortNames) continue // only customNames
    const names = constructNames(component.path)

    // include short names
    const collInShortest = tryInclude(component.id, names.shortest)
    const collInShorter = tryInclude(component.id, names.shorter)
    const collInShort = tryInclude(component.id, names.short)

    // is required to always include atleast 1 name
    // if all the short names collition, include longer names
    if (!longNames && !(collInShortest && collInShorter && collInShort)) {
      continue
    }

    // include long names
    const collInLong = tryInclude(component.id, names.long)
    const collInLonger = tryInclude(component.id, names.longer)
    const collInLongest = tryInclude(component.id, names.longest)

    // is required to always include atleast 1 name
    // if all the long names collition, include full names
    if (!allNames && !(collInLong && collInLonger && collInLongest)) {
      continue
    }

    tryInclude(component.id, names.full)
    tryInclude(component.id, names.fullPath)
  }

  return result
}

/** Construct the names used on runtime. */
function constructNames(componentPath: string) {
  const ext = URI.getExt(componentPath)
  const name = URI.getName(componentPath) || ''
  const dir = URI.getParent(componentPath)

  const shortest = URI.getBasename(componentPath) || ''
  const shorter = shortest + '_' + (ext || '').replace(/^[^\.]*\./i, '')

  // TODO: check names generation
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
     * 'a/b/book.md.js'  => 'book_md' // TODO: failed
     * 'a/b/book.md.php' => 'book_md' // TODO: failed
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
    short: name,

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
    longest: dir + name,

    /**
     * @example
     * 'a/b/book.md.js' => 'a/b/book'
     */
    full: URI.removeExt(componentPath),
    /**
     * @example
     * 'a/b/book.md.js' => 'a/b/book.md.js'
     * 'a/cccc/book.md.js' => 'a/cccc/book.md.js'
     */
    fullPath: componentPath,
  }
}

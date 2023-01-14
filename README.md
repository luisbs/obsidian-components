# obsidian-fragments

## Tests

- [ ] Test in windows system the resolution on `JavascriptRender.ts@require`

## Support

- [x] Add support for `'html'` fragments.
- [x] Add support for `'markdown'` fragments.
- [x] Add support for `'javascript_html'` fragments.
- [x] Add support for `'javascript_markdown'` fragments.
- [x] Add support for `'javascript_code'` fragments.

## Features for v1.0.0

- [ ] Add a real documentation.
- [x] Add settings page to control all the plugin variables.
- [x] Add granular control over which fragments are allow to run.
  - [x] Isolate the user-enabled fragments
- [x] Print error messages
- [x] Add alternative to inline fragment name method.
- [x] Reload the fragments when the file is updated
  - Since the codeblock processor is re-run on file changes, it updates automatically
- [x] Add support for custom codeblocks name like
- [x] Isolate the html related fragment formats to custom renders.
- [ ] Change all the references of the name **fragment** to **component** for better naming
- [ ] Add a setting to allow the user to set the the parameters to use on names

  > ```use
  >   __name: 'fragment-name'
  >   __frag: 'fragment-name'
  >   component: 'fragment-name'
  > ```

- [x] Fragment Formats
  - [x] Manage (enable, disable)
  - [ ] Manage Cache
  - [ ] Custom names
  - [ ] Usage as Codeblock

## Ideas

- [ ] Add syntax highlight on _edit mode_.
- [ ] Add cache of `'html' | 'md'` fragment types.
- [ ] Add support for other codeblock content syntax (e.g. **TOML**)

<!--  -->

- [ ] Add support for custom formats, defined by the user.
- [ ] Custom Fragment Formats
  - [ ] Manage (add, edit, delete)
  - [ ] Manage (enable, disable)
  - [ ] Manage Cache

---

## Documentation

Custom names can be separated by `|;, ` (includes spaces)

### On javascript files

- Should be a **CommonJS Module**
- Should return a method as default export or a method named `render`
- The method will recive:
  - On `code` type fragments: the container element (`HTMLElement`) and the data
  - On `html` or `md` type fragments: only the data

### Renderers behavior

- `html` renderers inject the content directly to the element.
- `md` renderers inject the content using the obsidian `MarkdownRenderer.renderMarkdown` method.
- `code` renderers gives total control over the element.

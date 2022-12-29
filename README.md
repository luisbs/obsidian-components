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
- [ ] Add granular control over which fragments are allow to run.
  - [ ] Isolate the user-enabled fragments
- [x] Print error messages
- [x] Add alternative to inline fragment name method.
- [ ] Isolate the html related fragment formats to custom renders.
- [x] Reload the fragments when the file is updated
  - Since the codeblock processor is re-run on file changes, it updates automatically
- [ ] Add support for custom block name like

  > ```book
  > {}
  > ```
  >
  > instead of
  >
  > ```use book
  > {}
  > ```

- [x] Fragment Formats
  - [x] Manage (enable, disable)
  - [ ] Manage Cache

<!--  -->

- [ ] Custom Fragment Formats
  - [ ] Manage (add, edit, delete)
  - [ ] Manage (enable, disable)
  - [ ] Manage Cache

## Ideas

- [ ] Add syntax highlight on _edit mode_.
- [ ] Add cache of `'html' | 'md'` fragment types.
- [ ] Add support for other codeblock content syntax (e.g. **TOML**)

# obsidian-component

## Features for v1.0

- [x] Documentation.
- [x] SettingsTab to control the plugin.
- [x] Granular control over which component are allow to run.
- [x] Multiple methods to name and identify a component.
- [x] Support for **custom codeblocks name**.
- [x] Error output handling.
- [x] Reload the component when the **component file** is modified (**design mode** only).

## Things to do before v1.0

- [ ] Add a showcase video.
- [ ] Add the plugin to the obsidian plugins repository.

### Support

- [x] Add support for `'html'` component.
- [x] Add support for `'markdown'` component.
- [x] Add support for `'javascript_html'` component.
- [x] Add support for `'javascript_markdown'` component.
- [x] Add support for `'javascript_code'` component.

<!-- -->

- [x] Support on Linux
- [x] Support on Windows

## Ideas for the future

- [ ] Add **API** to allow integration with other plugins.
  - For example use **Dataview** to collect data and **Components** to render the output.
- [ ] Add cache of `'html' | 'md'` component types.
- [ ] Add support for other codeblock content syntax (e.g. **JS objects**)
- [ ] Add support for other codeblock content syntax (e.g. **TOML**)
- [ ] Add support for custom formats, defined by the user.

## Discarted Ideas

> Add syntax highlight on _edit mode_.<br>
> R/ It seems the syntax highlight can not easily be activated for custom codeblocks.

> Add the posibility to use a separator inside `yaml`
> to make easier the use of objects arrays.<br>
> R/ Is better to keep a valid syntax
> Example:
>
> ```yaml
> var1: a
> var2: b
> ---
> var1: c
> var2: d
> ---
> var1: e
> var2: f
> ```

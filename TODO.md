# obsidian-component

## Features for v1.0

- [x] Documentation.
- [x] SettingsTab to control the plugin.
- [x] Granular control over which component are allow to run.
- [x] Multiple methods to name and identify a component.
- [x] Support for **custom codeblocks name**.
- [x] Error output handling.
- [x] Reload the component when the **component file** is modified (**design mode** only).
- [x] Allow usage of **Codeblock Separators**
- [ ] Listen changes on imported files, although they aren't inside components folder. Example:

Right now a config like the next one works:

```yaml
# config
components-folder: code/components/

# vault
paths:
  - code/components/
  - code/components/example.js (imports commons.js)
  - code/components/commons.js
```

But the next example will not work since `commons.js` is outside of `code/components/` and the plugin only listens to changes inside the `components-folder` path.

```yaml
# config
components-folder: code/components/

# vault
paths:
  - code/components/
  - code/components/example.js (imports commons.js)
  - code/commons.js
```

The change is to keep a list of referenced files, inside the **components** files and listen to changes on those files too.

## Things to do before v1.0

- [x] Add a showcase video.
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

- [x] Add **API** to allow integration with other plugins.
  - [ ] For example use **Dataview** to collect data and **Components** to render the output.
  - [ ] For example allow a **Component** to run a render-method on an external plugin, the external plugin should notify **Components** is able to handle integration.
- [ ] Add cache of `'html' | 'md'` component types.
- [ ] Add support for other codeblock content syntax (e.g. **JS objects**)
- [ ] Add support for other codeblock content syntax (e.g. **TOML**)
- [ ] Add support for custom formats, defined by the user.

## Discarted Ideas

> Add syntax highlight on _edit mode_.<br>
> R/ It seems the syntax highlight can not easily be activated for custom codeblocks.

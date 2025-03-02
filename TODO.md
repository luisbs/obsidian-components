# obsidian-component

## Features for v1.0

- [x] Documentation.
- [x] SettingsTab to control the plugin.
- [x] Granular control over which component are allow to run.
- [x] Multiple methods to name and identify a component.
- [x] Error output handling.
- [x] Supported integration with **Dataview**.
- [x] Support for **custom Codeblocks name**.
- [x] Allow usage of **Codeblock Separators**
- [x] Reload the component when the **component file** is modified (**design mode** only).
- [x] Listen changes on imported files, although they aren't inside components folder. Dependants are now pre-explored.

## Things to do before v1.0

- [x] Add a showcase video.
- [ ] Add the plugin to the obsidian plugins repository.
- [ ] Add a method to inline **Components** like **Dataview** `\`= this.file.name\``

### Support

- [x] Support on **Linux**
- [x] Support on **Windows**
- [x] Support of **Dataview**
<!-- -->
- [x] Add support for `'html'` component.
- [x] Add support for `'markdown'` component.
- [x] Add support for `'javascript_html'` component.
- [x] Add support for `'javascript_markdown'` component.
- [x] Add support for `'javascript_code'` component.

## Ideas for the future

- [ ] Add cache of `'html' | 'md'` component types.
- [x] Add **API** to allow integration with other plugins.
  - [ ] For example allow a **Component** to run a render-method on an external plugin, the external plugin should notify **Components** is able to handle integration.

## Discarted Ideas

> Add support for other codeblock content syntax (e.g. **JS objects**)
> R/ **YAML** and **JSON** is better suited

> Add support for other codeblock content syntax (e.g. **TOML**)
> R/ syntax is equivalent to **YAML**

> Add syntax highlight on _edit mode_.<br>
> R/ It seems the syntax highlight can not easily be activated for custom codeblocks.

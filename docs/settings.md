# Settings

The next entries are settings that can be configured on the _SettingsTab_ of the plugin.

## Design Mode Setting

> Will be removed on some future update.

> **TL;DR** activate the _design mode_ when you're designing/editing the code of your **components** and want to see the result of those changes on Obsidian instantly.

The **components** are run directly from the file you write, not as sandboxed scripts, using `require( ... )` for `*.cjs` files and `import( ... )` for `*.mjs` files.

But, this situation loads your file in memory, and the next time the component is required it will return the already loaded module, and will ignore any modifications you make to the code.

This behavior is ideal on normal execution since it reduces resources usage, but when you're editing/designing your **components** is not ideal since you would need to fully reload Obsidian each time you change some **component file**.

To bypass these behavior the _Design Mode Setting_ actives a modifications tracker, that listen to changes on the **components files**, stores a copy of each iteration, and when changes are made refreshes the rendered element inside Obsidian.

The bad thing about this is that it will generate a higher memory and storage usage meanwhile the app is open; thats why it is disabled by default.

## Custom Codeblocks Setting

By default to identify a **Codeblocks** that should run a **component**, the `use <component-name>` sentence is used as the header of the **Codeblock**. Example:

````yaml
```use book
param1: value1
```
````

This settings instead allows the usage of the **components custom names** defined by the user as **Codeblocks** identifiers, so instead of `use book` you can use `book` in the first line of the **Codeblock**. Example:

````yaml
```book
param1: value1
```
````

## Codeblocks Separators Setting

By default the content inside a **Codeblock** is parsed as detailed at [Supported Codeblocks Syntax](./usage.md#supported-codeblocks-syntax). But in the case of `YAML` that will force arrays to be indented. Example:

````yaml
```use component
- param1: value1
  param2: value2

- param1: value3
  param2: value4

- param1: value5
  param2: value6
```
````

This setting makes possible to avoid that situation and instead use a _user-defined_ separator. Example:

````yaml
```use component
param1: value1
param2: value2
---
param1: value3
param2: value4
---
param1: value5
param2: value6
```
````

This feature can also be used with `JSON`.

````json
```use component
{ "param1": "value1", "param2": "value2" }
---
{ "param1": "value3", "param2": "value4" }
---
{ "param1": "value5", "param2": "value6" }
```
````

## Dataview Integration

When a **Codeblock** content starts with some of the **Dataview** [Query Types](https://blacksmithgu.github.io/obsidian-dataview/queries/query-types). Ex: `TABLE`, `LIST`, `TASK` or `CALENDAR`

````md
```books
LIST SORT title
```
````

- The content of the **Codeblock** will be considered a **Dataview** query.
- The query will be executed using the **Dataview** API.
- The result will be piped into the **Component** as the data.

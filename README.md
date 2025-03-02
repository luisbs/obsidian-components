# [obsidian-components](https://github.com/luisbs/obsidian-components)

![example on the test-vault](./docs/example.gif)

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/luisbs)

## Features

- Custom render elements created by the user.
- Granular control over which component are allow to run.
- Support for [**custom codeblocks name**](./docs/usage.md#about-the-components-custom-names).
- [Design Mode (Hot-Module-Reload)](./docs/settings.md#design-mode-setting)
- [Full User Styling](./docs/usage.md#styling)

---

## Instalation

### From source

You can activate this plugin, building from source by doing the following:

- Clone the repository
- Install the dependencies
- Run `pnpm build` or `npm run build` from a cli
- Copy the content of the repository `dist` folder to your vault, the path should look like `your-vault/.obsidian/plugins/obsidian-components`
- Open your vault in _Obsidian_ and activate the newly installed plugin

### From within Obsidian

> I'm working ⚒️ on making this posible.

<!-- From Obsidian v1.1+, you can activate this plugin within Obsidian by doing the following:

- Open Settings > Third-party plugin
- Make sure Safe mode is **off**
- Click Browse community plugins
- Search for "Components"
- Click Install
- Once installed, close the community plugins window and activate the newly installed plugin -->

---

## Usage

### Codeblock syntax

All the **Codeblocks** support the use of `YAML` and `JSON`. So the next two **Codeblocks** will generate the same output.

````md
```use book
title: Lord of the rings
author: J. R. Tolkien
```
````

````md
```use book
{
	"title": "Lord of the rings",
	"author": "J. R. Tolkien"
}
```
````

If [Dataview](https://github.com/blacksmithgu/obsidian-dataview) is installed and enabled the obsidian syntax can also bee used

````md
```use books
TABLE title, author FROM "books"
```
````

### Custom Codeblocks

> **This behavior is disabled by default** and can be enabled with the [Custom Codeblocks Setting](./docs/settings.md#custom-codeblocks-setting).

The **custom Codeblocks** allow a user to use **components** avoiding the `use` word. It uses the **components** custom names defined by the user instead. Example:

````md
```book
title: 'Cien años de Soledad'
author: 'Gabriel García Márquez'
```
````

## Supported Components Syntax

Each supported syntax can be enabled as a `format` on the settings. The formats defines how each **component file** is handled.

- **HTML Components** are defined using _HTML_.
- **Markdown Components** are defined using _Markdown_.
- **Javascript_HTML Components** are defined using _Javascript_ and should return a _HTML_ string.
- **Javascript_Markdown Components** are defined using _Javascript_ and should return a _Markdown_ string.
- **Javascript_code Components** are defined using _Javascript_ and works over the runtime elements.

### Dataview Support

When a **Dataview** query is identified, it is queried against **Dataview** Plugin and the result is piped into the **Component**.

The piped values can be checked with the `successful` flag, when something fails something similar to the next object is passed.

```js
{ successful: false, value: undefined }
```

For details on the passed data structure, check [documentation](https://blacksmithgu.github.io/obsidian-dataview/resources/develop-against-dataview/) of Dataview.

---

## Pricing

This plugin is provided to everyone for free, however if you would like to
say thanks or help support continued development, feel free to send a little
through the following method:

[<img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="BuyMeACoffee" width="100">](https://www.buymeacoffee.com/luisbs)

## Notes

The plugin is not on active development, new features or changes are developed when there is an oportunity. But issues and bugs will have especial priority.

### Obsidian Mobile

There is no current support for Obsidian mobile.

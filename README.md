# [obsidian-components](https://github.com/luisbs/obsidian-components)

## Usage

### Codeblock syntas

All the **Codeblocks** support the use of `YAML` and `JSON`. So the next to **Codeblocks** will generate the same output.

```use book
title: Lord of the rings
author: J. R. Tolkien
```

```use book
{
	"title": "Lord of the rings",
	"author": "J. R. Tolkien"
}
```

### Inline names

Allows the user to use a **component** placing the name after the word `use` in the **Codeblock** first line (e.g. `use book`). Example:

```use book
title: 'Lord of the rings'
author: 'J. R. Tolkien'
```

### In params

> **This behavior is disabled by default** and can be enabled by changing the _Codeblock usage method_ setting.

Allows the user to use a **component** placing the name as a value inside the **Codeblock**, by default with the `__name` param, but can be changed. Example:

```use
__name: book
title: 'The Great Gatsby'
author: 'F. Scott Fitzgerald'
```

### As custom Codeblocks

> **This behavior is disabled by default** and can be enabled with the [Custom Codeblocks Setting](#custom-codeblocks-setting).

The **custom Codeblocks** allow a user to use **components** avoiding the `use` word. It uses the **components** custom names defined by the user instead. Example:

```book
title: 'Cien años de Soledad'
author: 'Gabriel García Márquez'
```

---

## Supported Syntax

Each supported syntax can be enabled as a `format` on the settings. The formats defines how each **component file** is handled.

### HTML Components

The `html` components:

1. Reads the **content of the file as plain text**.
2. Replaces the placeholders like `{{ key_name_1 }}` _(allows only alphanumeric and underscores)_ with the correspending parameter on the **Codeblock**.
3. Injects the replaced string as the `innerHTML` of the element.

### Markdown Components

The `markdown` components:

1. Reads the **content of the file as plain text**.
2. Replaces the placeholders like `{{ key_name_1 }}` _(allows only alphanumeric and underscores)_ with the correspending parameter on the **Codeblock**.
3. Injects the replaced string into the **Codeblock** using the obsidian `MarkdownRenderer.renderMarkdown()` method.

### Javascript Components

The javascript-based components use the **content of the file as CommonJS Modules**. They check if _default export_ is a **function** to use; if not it checks if the module contains a `render` function to use.

#### Javascript_HTML Components

The `javascript_html` components:

1. Calls the `render` function waiting for a string to be returned (the `render` function will recive a _javascript object_ parsed from the content of the **Codeblock**).
2. Injects the returned string as the `innerHTML` of the element.

#### Javascript_Markdown Components

The `javascript_markdown` components:

1. Calls the `render` function waiting for a string to be returned (the `render` function will recive a _javascript object_ parsed from the content of the **Codeblock**).
2. Injects the returned string into the **Codeblock** using the obsidian `MarkdownRenderer.renderMarkdown()` method.

#### Javascript_code Components

The `javascript_code` components:

1. Calls the `render` funcion with:
   - A `HTMLElement` as first param.
   - A `javascript object` as second param (parsed from the content of the **Codeblock**).

Example:

```use book.cjs
title: 'Lord of the rings'
author: 'J. R. Tolkien'
```

---

## Settings

The next entries are settings that can be configured on the _SettingsTab_ of the plugin.

### Execution Behavior Setting

The **components** are run directly, they are not isolated in any way, this allows them to use _network connections_, _import/export modules_, but at the same time any malicious code will run without limitations.

To prevent dangerious situations this setting can be used to only allow the execution of **components** you enable, or **components** enabled by the **component formats** you enable.

### Design Mode Setting

> **TL;DR** activate the _design mode_ when you're designing/editing the code of your **components** and want to see the result of those changes on the app on runtime.

The **components** are run directly from the file you write, using the native `require( ... )`, this allows them to run as normal code, and not like scripts.

But, this situation loads your file in memory, and the next time `require( ... )` is run it will return the already loaded output, and will ignore any modifications you make to the code.

This behavior is perfect to reduce resources usage, but when you're editing/designing your **components** is not ideal since you would need to re-open the app each time you change something.

To bypass these behavior the _Design Mode Setting_ actives a modifications tracker, that listen to changes on the **components files**, stores a copy of each iteration, and when changes are made refreshes the render element inside the app.

The bad thing about this is that it will generate a higher memory and storage usage; thats will it is disabled by default.

### Custom Codeblocks Setting

By default to identify a Codeblocks that should run a **component**, the `use <component-name>` sentence is used as the header of the Codeblock.

This settings allows the usage of the **components custom names** defined by the user as Codeblocks identifiers, so instead of `use book` you can use `book` in the first line of the Codeblock.

---

## Styling

Each component/codeblock is assigned two classes `component` and `<component-name>-component` (the component-name is the word you are using to reference the component)

> This examples are should be checked on _edit-mode_.

Example:

```use book

```

And

```use
__name: 'book'
```

And

```book

```

will all use `.component.book-component`

### About the components custom names

- Any character not alphanumeric nor underscore is going to be ignored, so the input `%%b$l-u.e+` is going to allow the word `blue` to reference that component.
- The characters on the regex `|;,\s` (whitespaces are included) can be use as separators, so the input `red|||green; blue    gray|,cyan` is a valid input, that will allow the words `red`, `green`, `blue`, `gray`, and `cyan` to reference that component.

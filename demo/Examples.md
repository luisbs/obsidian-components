## Usage

### Inline names

Allows the user to use a **component** placing the name after the word `use` in the **Codeblock** first line (e.g. `use book`). Example using `YAML`:

```use book
title: Lord of the rings
author: J. R. Tolkien
```

All the **Codeblocks** support the use of `JSON` too. Example:

```use book
{
	"title": "Lord of the rings",
	"author": "J. R. Tolkien"
}
```

### As custom Codeblocks

> **This behavior is disabled by default** and can be enabled with the _'Enable custom Codeblocks'_ setting.

The **custom Codeblocks** allow a user to use **components** avoiding the `use` word.
It uses the **components** custom names defined by the user instead. Example:

```book
title: Cien años de Soledad
author: Gabriel García Márquez
```

## Codeblocks Separators

> **This behavior is disabled by default** and can be enabled by changing the _'Enable Codeblock Separators'_ setting.

First-level array items can be written as:

```book_cjs
title: The Great Gatsby
author: F. Scott Fitzgerald
---
title: Cien años de Soledad
author: Gabriel García Márquez
---
title: Lord of the rings
author: J. R. Tolkien
```

That will give the same result as:

```book_cjs
- title: The Great Gatsby
  author: F. Scott Fitzgerald

- title: Cien años de Soledad
  author: Gabriel García Márquez

- title: Lord of the rings
  author: J. R. Tolkien
```

## Non standard content

Maybe `YAML` nor `JSON` are adequate, in that case the content of the codeblock is handled as string.

On `HTML` and `Markdown` **components** the placeholder `{{ __ }}` can be used. Example:

```video
https://www.youtube-nocookie.com/embed/h8t1cSSudVQ
```

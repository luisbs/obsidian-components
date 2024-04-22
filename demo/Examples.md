## Usage

### Inline names

Allows the user to use a **component** placing the name after the word `use` in the **Codeblock** first line (e.g. `use book`). Example:

```use book
title: 'Lord of the rings'
author: 'J. R. Tolkien'
```

### In params

> **This behavior is disabled by default** and can be enabled by changing the _'Codeblock usage method'_ setting.

Allows the user to use a **component** placing the name as a value inside the **Codeblock**, by default with the `__name` param, but can be changed. Example:

```use
__component: book
title: 'The Great Gatsby'
author: 'F. Scott Fitzgerald'
```

### As custom Codeblocks

> **This behavior is disabled by default** and can be enabled with the _'Enable custom Codeblocks'_ setting.

The **custom Codeblocks** allow a user to use **components** avoiding the `use` word.
It uses the **components** custom names defined by the user instead. Example:

```book
title: 'Cien años de Soledad'
author: 'Gabriel García Márquez'
```

---

## Settings and other details

All the **Codeblocks** support the use of `JSON` too. Example:

```book
{
	"title": "Lord of the rings",
	"author": "J. R. Tolkien"
}
```

--

## Codeblocks Separators

First-level array items can be written as:

```book_cjs
title: 'The Great Gatsby'
author: 'F. Scott Fitzgerald'
---
title: 'Cien años de Soledad'
author: 'Gabriel García Márquez'
---
title: 'Lord of the rings'
author: 'J. R. Tolkien'
```

That will give the same result as:

```book_cjs
- title: 'The Great Gatsby'
  author: 'F. Scott Fitzgerald'

- title: 'Cien años de Soledad'
  author: 'Gabriel García Márquez'

- title: 'Lord of the rings'
  author: 'J. R. Tolkien'
```


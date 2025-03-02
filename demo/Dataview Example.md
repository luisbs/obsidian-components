
Table rendered by **Dataview**.

```dataview
TABLE title, author FROM "books"
```

With the data shown above, we may want present it in a _**fancy**_ way like the next.

```dataview
LIST WITHOUT ID "Book «" + title + "» was wrote by " + author FROM "books"
```

But with the **Components** plugin, we can throw the "dirty" part of the formatting to a separate file and have the next result with even more fancy styles.

```books
TABLE title, author FROM "books"
```

This example is a bit simple, in a real use case,  the data may be more complex and it will require knowledge over Javascript but it opens a realm of possibilities.

For a more visually appealing usage the [[Complex Examples]] and [[Image Galleries]] can be seen. All of that can be styling could be done with Dataview returned data.
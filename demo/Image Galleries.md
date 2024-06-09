> For locally stored images a plugin like [Obsidian Image Gallery](https://github.com/lucaorio/obsidian-image-gallery) can be more adequate.
> ![Obsidian Image Gallery](https://raw.githubusercontent.com/lucaorio/obsidian-image-gallery/main/assets/obsidian-image-gallery-header.jpg)

---

By default image attachments take all space available.

![v8cover](https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/f/fe/Komi_San_Volume_8.jpg)

To avoid this situation, styles can be used (the next images have a `max-width: 220px`), but the images still need to be written together on a single line, making them harder to read on editor mode.

![v8cover|w220](https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/f/fe/Komi_San_Volume_8.jpg)![v9cover|w220](https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/1/17/Komi_San_Volume_9.png)![v10cover|w220](https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/2/23/Komi_San_Volume_10.png)

This demo includes 2 image-gallery implementations to give an idea of what is possible.

### Image sources

The used images are only limited to what the user implements on the **Component**:

- External images can be used directly like `https://cdn.myanimelist.net/images/anime/5/44560l.jpg`
- Local images are resolved in this examples using the object `app.fileManager.vault.adapter` (Note: this object may change in the future, is not standard) but other implementations can be achieved probably.

---

## Examples

### Slide gallery

The example **Component** `content.html.cjs` includes a `gallery` section which renders the images on a single row that can be swiped horizontally.

```content
label: Anime
title: Shingeki no Kyojin
gallery:
- https://cdn.myanimelist.net/images/anime/5/44560l.jpg
- https://cdn.myanimelist.net/images/anime/9/59221l.jpg
- https://cdn.myanimelist.net/images/anime/8/69497l.jpg
- https://cdn.myanimelist.net/images/anime/4/84177l.jpg
- https://cdn.myanimelist.net/images/anime/1039/91943l.jpg
- https://cdn.myanimelist.net/images/anime/1173/92110l.jpg
- https://cdn.myanimelist.net/images/anime/1159/95649l.jpg
```

### Catalogue

The example **Catalogue** `catalogue.js` renders the images as thumbnail giving priority to a selected image.

```catalogue
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/e/e2/Komi_San_Volume_1.png?v1cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/d/d3/Volume_1_Special_Edition.png?v1scover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/2/2f/Volume_2.png?v2cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/c/c3/Volume_2_Special_Edition.png?v2scover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/c/c3/Komi_San_Volume_3.png?v3cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/3/3d/M_Volume_4.jpg?v4cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/f/f4/M_Volume_5.jpg?v5cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/a/a1/M_Volume_6.jpg?v6cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/b/bd/M_Volume_7.jpeg?v7cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/f/fe/Komi_San_Volume_8.jpg?v8cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/1/17/Komi_San_Volume_9.png?v9cover
```

### Masonry-ish gallery

The example **Component** `gallery.html.js` renders the images on a grid adding rows when necessary.

```gallery
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/e/e2/Komi_San_Volume_1.png?v1cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/d/d3/Volume_1_Special_Edition.png?v1scover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/2/2f/Volume_2.png?v2cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/c/c3/Volume_2_Special_Edition.png?v2scover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/c/c3/Komi_San_Volume_3.png?v3cover
```

#### Grouped images

The example **Component** `gallery.html.js` can group the images and add group titles.

```gallery
- label: Covers of volumes 01 - 09
  images:
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/e/e2/Komi_San_Volume_1.png?v1cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/d/d3/Volume_1_Special_Edition.png?v1scover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/2/2f/Volume_2.png?v2cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/c/c3/Volume_2_Special_Edition.png?v2scover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/c/c3/Komi_San_Volume_3.png?v3cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/3/3d/M_Volume_4.jpg?v4cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/f/f4/M_Volume_5.jpg?v5cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/a/a1/M_Volume_6.jpg?v6cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/b/bd/M_Volume_7.jpeg?v7cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/f/fe/Komi_San_Volume_8.jpg?v8cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/1/17/Komi_San_Volume_9.png?v9cover

- label: Covers of volumes 10 - 19
  images:
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/2/23/Komi_San_Volume_10.png?v10cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/6/65/Komi_San_Volume_11.png?v11cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/f/f9/Komi-san_Volume_12.jpg?v12cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/b/b6/Volume_13.png?v13cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/a/a3/Volume_14.jpg?v14cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/7/7c/Volume_15.jpg?v15cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/4/45/Volume_16.png?v16cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/6/64/Volume_17.png?v17cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/a/a2/Volume_18.png?v18cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/c/c9/Volume_19.png?v19cover

- label: Covers of volumes 20 - 29
  images:
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/3/32/Volume_20.png?v20cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/a/a6/Volume_21.png?v21cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/5/5e/Volume_22.png?v22cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/5/5d/Volume_23.png?v23cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/6/6a/Volume_24.png?v24cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/e/ef/Volume_25.png?v25cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/0/00/Volume_26.png?v26cover
  - https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/5/54/Volume_27.jpeg?v27cover
```

## Joined gallery

The example **Component** `gallery.html.js` can also spawn an extended list of images.

```gallery
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/e/e2/Komi_San_Volume_1.png?v1cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/d/d3/Volume_1_Special_Edition.png?v1scover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/2/2f/Volume_2.png?v2cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/c/c3/Volume_2_Special_Edition.png?v2scover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/c/c3/Komi_San_Volume_3.png?v3cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/3/3d/M_Volume_4.jpg?v4cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/f/f4/M_Volume_5.jpg?v5cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/a/a1/M_Volume_6.jpg?v6cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/b/bd/M_Volume_7.jpeg?v7cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/f/fe/Komi_San_Volume_8.jpg?v8cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/1/17/Komi_San_Volume_9.png?v9cover

- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/2/23/Komi_San_Volume_10.png?v10cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/6/65/Komi_San_Volume_11.png?v11cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/f/f9/Komi-san_Volume_12.jpg?v12cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/b/b6/Volume_13.png?v13cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/a/a3/Volume_14.jpg?v14cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/7/7c/Volume_15.jpg?v15cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/4/45/Volume_16.png?v16cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/6/64/Volume_17.png?v17cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/a/a2/Volume_18.png?v18cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/c/c9/Volume_19.png?v19cover

- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/3/32/Volume_20.png?v20cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/a/a6/Volume_21.png?v21cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/5/5e/Volume_22.png?v22cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/5/5d/Volume_23.png?v23cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/6/6a/Volume_24.png?v24cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/e/ef/Volume_25.png?v25cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/0/00/Volume_26.png?v26cover
- https://static.wikia.nocookie.net/komisan-wa-komyushou-desu/images/5/54/Volume_27.jpeg?v27cover
```

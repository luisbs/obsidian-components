interface CodeblockContext {
    /** Vault-path of the note containing the **Codeblock**. */
    notepath: string;
    /** Component name used on the **Codeblock**. */
    used_name: string;
    /** Syntax of the **Codeblock**. */
    syntax: 'json' | 'yaml' | 'unknown';
    /** Hash result of the **Codeblock** content. */
    hash: string;
}

type ItemsGroup<L extends string, T> = Record<L, NonNullable<T>[]>;

interface URIMetadata {
    type: 'url' | 'md' | 'vault';
    uri: string;
    params: RegExpMatchArray[];

    ext: string;
    src: string;
    size: string;
    label: string;
    isVideo: boolean;
}

interface MetadataField {
    tag?: keyof HTMLElementTagNameMap;
    text?: string;
    fallback?: string;
}

//#region Components

interface ImageGroupMetadata extends ItemsGroup<'images', URIMetadata> {
    label?: string | string[];
    link?: string;
}

interface MusicMetadata {
    // header
    label?: string | string[];
    title?: string | string[];
    author?: string | string[];
    artist?: string | string[];

    // links
    spotify?: string | string[];
    youtube?: string | string[];
    iframe?: string;
    links?: string[];
    link?: string;
}

//

type ComponentData = Record<string, unknown>;

type ContentMetadata = {
    alias?: string | string[];
    label?: string | string[];
    title?: string | string[];
    tags?: string | string[];
    cover?: string;

    // chapters
    volumes?: number;
    chapters?: number;
    episodes?: number;

    // links
    ap?: string | string[];
    mal?: string | string[];
};

//#endregion

type ItemsGroup<L extends string, T> = Record<L, NonNullable<T>[]>;

interface URIMetadata {
  type: 'url' | 'md' | 'vault';
  uri: string;
  params: RegExpMatchArray[];

  ext: string;
  isVideo: boolean;

  src: string;
  size: string;
  label: string;
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

interface CharacterMetadata {
  url?: URIMetadata;
  link?: URIMetadata;
  name?: string | string[];
  alias?: string | string[];
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

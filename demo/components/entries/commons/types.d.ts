interface MetadataField {
  tag?: keyof HTMLElementTagNameMap;
  text?: string;
  fallback?: string;
}

interface CharacterMetadata {
  url?: URIMetadata;
  link?: URIMetadata;
  name?: string | string[];
  alias?: string | string[];
}

interface ImageGroupMetadata {
  title?: string | string[];
  artist?: string;
  images: URIMetadata[];
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
  // header
  label?: string | string[];
  title?: string | string[];
  alias?: string | string[];
  tags?: string | string[];
  cover?: string;
  gallery?: unknown;

  // metadata
  art?: string | string[];
  story?: string | string[];
  artist?: string | string[];
  mangaka?: string | string[];
  author?: string | string[];
  studio?: string | string[];
  magazine?: string | string[];

  // opinion
  rating?: string;
  comment?: string;
  comments?: string;
  summary?: string;

  // progress
  day?: string;
  volumes?: number;
  chapters?: number;
  episodes?: number;

  // links
  ap?: string | string[];
  mal?: string | string[];
  fandom?: string | string[];
  website?: string | string[];
  mangadex?: string | string[];

  read?: string | string[];
  watch?: string | string[];
  sources?: string | string[];
  download?: string | string[];
};

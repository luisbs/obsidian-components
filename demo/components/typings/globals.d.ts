type SerializedGroup<T, L extends string> = { label?: string } & Record<L, NonNullable<T>[]>;

interface URIMetadata {
  mode: 'unknown' | 'internal' | 'external' | 'url';
  path: string;
  ext: string;
  label: string;
  params: string[];

  isVideo: () => boolean;
  getSize: () => string | undefined;
  hasLabel: () => boolean;
  getLabel: () => string;
  getSrc: (notepath: string) => Promise<string>;
}

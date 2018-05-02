export interface SongTags {
  title?: string;
  artist?: string;
  album?: string;
}

export interface Song extends SongTags {
  readonly id: string;
  readonly filename: string;
  readonly type: string;
  readonly size: number;
}

export interface SongData {
  readonly id: string;
  readonly data: Buffer;
}

export interface Playback extends Song {
  readonly playingSince: Date;
}

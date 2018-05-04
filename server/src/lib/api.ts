export interface SongTags {
  title?: string;
  artist?: string;
  album?: string;
}

export interface Song extends SongTags {
  readonly tokenId: string;
  readonly file: string;
  readonly filename: string;
  readonly type: string;
  readonly size: number;
  readonly plays?: number;
  readonly lastPlayedAt?: string;
}

export interface Playback extends Song {
  readonly playingSince: Date;
}

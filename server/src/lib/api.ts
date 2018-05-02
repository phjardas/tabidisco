export interface SongTags {
  readonly title?: string;
  readonly artist?: string;
  readonly album?: string;
}

export interface SongStats {
  readonly plays: number;
  readonly lastPlayedAt?: string;
}

export interface Song extends SongTags, SongStats {
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

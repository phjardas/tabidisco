export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export interface Song {
  tokenId: string;
  filename: string;
}

export interface Playback extends Song {
  playingSince: Date;
}

export interface Library {
  songs: Promise<Song[]>;
  getSong(tokenId: string): Promise<Playback | null>;
  setSong(song: Song): Promise<any>;
  removeSong(tokenId: string): Promise<any>;
}

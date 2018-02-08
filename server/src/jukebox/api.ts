export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error';

export interface Song {
  tokenId: string;
  file: string;
  filename: string;
  type: string;
  size: number;
}

export interface Playback extends Song {
  playingSince: Date;
}

export interface Library {
  songs: Promise<Song[]>;
  getSong(tokenId: string): Promise<Song | null>;
  setSong(song: Song): Promise<any>;
  removeSong(tokenId: string): Promise<any>;
}
